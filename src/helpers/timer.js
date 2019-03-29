if (!window.__TimerRepo__) {
  unset()
}

export function setTimer(callback, duration, ...args) {
  if (typeof callback !== 'function') {
    return void(0)
  } else if (duration <= 0) {
    callback()
    return void(0)
  } else {
    return push(callback, duration, args)
  }
}

export function clearTimer(id) {
  id && clear(id)
}

function push(callback, duration, args) {
  const id = g()
  insert({
    id,
    created: new Date().getTime(),
    duration,
    callback,
    args
  })
  return id
}

function clear() {}

function insert(timer) {
  const repo = window.__TimerRepo__
  repo.map[timer.id] = timer

  const { duration, created } = window.__OngoingTimer__
  const now = new Date().getTime()
  const bypass = now - (created || now) // 从上次的timer到现在，经过了多长时间

  let legacy = duration - bypass // 还剩余多少时间timer会触发

  // 插入的timer，与当前timer，谁先到; 若大于0，表示当前timer到达后，插入的timer剩下多长时间
  const timerLegacy = timer.duration - legacy
  if (timerLegacy === 0) {
    // 1. 同时到达
    return waitingTimer(timer)
  }
  if (timerLegacy < 0) {
    runTimer(timer.duration)
    // 2. 插入的timer先到，则恢复将每个timer.duration恢复-timerLegacy时长
    // 并将waitiing队列里的都移到pending中
    // 重置定时器
    restore(-timerLegacy)
    return waitingTimer(timer)
  }
  // 3. 将timer插入到合适的位置
  pendingTimer(timer, timerLegacy)
}

function waitingTimer(timer) {
  timer.duration = 0
  window.__TimerRepo__.waiting.push(timer)
}

function pendingTimer(timer, durationRevised) {
  timer.duration = durationRevised // 修正duration
  const { map: timerMap, pending } = window.__TimerRepo__
  const L = pending.length

  const { duration: timerDuration, id: timerId } = timer
  start: {
    for (let k = 0; k < L; k++) {
      const it = timerMap[pending[k]]
      if (!it) continue;
      if (it.duration >= timerDuration) {
        // 插入
        pending.splice(k, 0, timerId)
        break start;
      }
    }
    pending.push(timerId)
  }
}

function restore(delta) {
  const { pending, waiting, map } = window.__TimerRepo__
  for (let k = pending.length; k--;) {
    const id = pending[k]
    if (map[id]) {
      map[id].duration += delta
    }
  }
  let id
  while(id = waiting.pop()) {
    const m = map[id]
    if (!!m) {
      m.duration += delta
      pending.unshift(m)
    }
  }
}

function unset() {
  window.__OngoingTimer__ = {
    timerId: -1,
    duration: Infinity,
    created: 0
  }
  window.__TimerRepo__ = {
    waiting: [],
    pending: [],
    map: {}
  }
}

function runTimer(duration) {
  clearTimeout(ongoing.timerId)
  const ongoing = window.__OngoingTimer__
  ongoing.created = new Date().getTime()
  ongoing.timerId = setTimeout(onTimerEnd, ongoing.duration = duration)
}

function onTimerEnd() {
  const { pending, waiting, map } = window.__TimerRepo__
  let w
  while(w = waiting.shift()) {
    const timer = map[w]
    delete map[w]
    timer.callback(...timer.args)
  }
  if (!pending.length) {
    return unset()
  }
  // 将pending的第一个拿出来，再设置timer
  let p, nextWaiting, nextDuration
  while (true) {
    if((p = pending.shift()) && (nextWaiting = map[p])) { 
      nextDuration = nextWaiting.duration
      waitingTimer(nextWaiting)
      break
    }
  }
  const nextPending = []
  for (let k = pending.length; k--;) {
    const p = pending[k]
    const timer = map[p]
    if (!timer) continue;
    if (0 === (timer.duration -= nextDuration)) {
      waitingTimer(timer)
    } else {
      nextPending.unshift(p)
    }
  }
  delete window.__TimerRepo__.pending
  window.__TimerRepo__.pending = nextPending
  runTimer(nextDuration)
}

function g() {
  return Math.random().toString(36).slice(2) + '_' + (new Date().getTime()).toString(36).slice(2)
}