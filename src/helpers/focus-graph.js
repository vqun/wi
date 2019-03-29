import { callFnProxy } from './toolkit.js'
import { VK_NAME_TO_KEYCODE } from '@core/VK-Keys'

const OP = {
  lte(a, b) { return a <= b },
  gte(a, b) { return a >= b },
  plusplus(a) { return a + 1 },
  minusminus(a) { return a - 1 }
}

const [LEFT, RIGHT, UP, DOWN, MID] = [0, 1, 2, 3, 4]

export const KEYCODE_TO_DIRECTION = {
  [VK_NAME_TO_KEYCODE.UP]: UP,
  [VK_NAME_TO_KEYCODE.DOWN]: DOWN,
  [VK_NAME_TO_KEYCODE.LEFT]: LEFT,
  [VK_NAME_TO_KEYCODE.RIGHT]: RIGHT
}


class FocusGraphCell {
  constructor(el) {
    this.el = el

    this.h = toNumbers(data(el, 'h'))
    this.v = toNumbers(data(el, 'v'))
    this.isEntry = data(el, 'entry') === 'true'
    if (!(this.h.length && this.v.length)) {
      return null
    }
  }
  focus() {
    this.el.focus()
    return this
  }
  blur() {
    this.el.blur()
    return this
  }
  getIt() {
    return this.el
  }
}

class FocusGraphGroup {
  constructor(el) {
    this.el = el

    this.graph = [] // 图元关系矩阵，一级下标是h，二级下标是v
    this.group = toNumbers(data(el, 'group'))[0]
    this.entry = [0, 0]
    if (this.group === undefined) return null;
    this.hBoundary = 0
    this.vBoundary = 0
    this.isAutoFocus = data(el, 'auto-focus') === 'true'
    this.isEntry = data(el, 'entry') === 'true'
    this.__generate__()
  }
  isEmpty() {
    return this.graph.length === 0
  }
  __generate__() {
    const el = this.el, graph = this.graph
    const cells = domQuery(el, '[tabindex="-1"]')
    for (let k = cells.length; k--;) {
      const cell = new FocusGraphCell(cells[k])
      if (cell) {
        const { h, v, isEntry } = cell
        if (isEntry) {
          this.entry = [h[0], v[0]]
        }
        for (let k = h.length; k--;) {
          const ch = h[k]
          for (let j = v.length; j--;) {
            (graph[ch] || (graph[ch] = []))[v[j]] = cell
          }
          this.vBoundary = Math.max(this.vBoundary, graph[ch].length - 1)
        }
      }
    }
    this.hBoundary = graph.length - 1
    return this
  }
  focus() {
    const [h, v] = this.entry, graph = this.graph
    if (!graph[h]) return null;
    let cell = graph[h][v]
    if (cell) {
      cell.focus()
    } else {
      // 消失了，找到第一个可focus的
      let newH = h, newV = v
      SEARCH_FOCUS: {
        do {
          // 再纵向往回找
          do {
            // 先横向往回找
            if (cell = graph[newH][newV]) {
              cell.focus()
              break SEARCH_FOCUS
            }
          } while(newH--)
          // 往回后，就从hBoundary开始找起
          newH = this.hBoundary
        } while (newV--)
        return null
      }
    }
    return this
  }
  blur() {
    const [h, v] = this.entry
    this.graph[h][v].blur()
    return this
  }
  moveFocus(orientation) {
    switch(orientation) {
      case LEFT:
        return this.__moveLeft__()
      case RIGHT:
        return this.__moveRight__()
      case UP:
        return this.__moveUp__()
      case DOWN:
        return this.__moveDown__()
      default:
        return MID
    }
  }
  setEntry([h = 0, v = 0]) {
    this.entry = [h, v]
    return this.focus()
  }
  getEntry() {
    return this.entry
  }
  nearby(orientation, step) {
    let [h, v] = this.entry
    let base = this.entry, info = null
    switch(orientation) {
      case LEFT:
        while(step--) {
          info = this.__left__(base)
          if (info) {
            base = info.coordinate
          } else {
            break;
          }
        }
        return info
      case RIGHT:
        while(step--) {
          info = this.__right__(base)
          if (info) {
            base = info.coordinate
          } else {
            break;
          }
        }
        return info
      case UP:
        while(step--) {
          info = this.__up__(base)
          if (info) {
            base = info.coordinate
          } else {
            break;
          }
        }
        return info
      case DOWN:
        while(step--) {
          info = this.__down__(base)
          if (info) {
            base = info.coordinate
          } else {
            break;
          }
        }
        return info
      default:
        break;
    }
    return {
      entry: [h, v],
      el: this.graph[h] ? this.graph[h][v] || null : null
    }
  }
  __left__([h, v] = this.entry) {
    const entryEl = this.getFocused()
    while(--h >= 0) {
      if (this.graph[h]) {
        const el = this.graph[h][v]
        if (el && (el !== entryEl)) {
          return {
            coordinate: [h, v],
            el
          }
        }
      }
    }
    return null
  }
  __right__([h, v] = this.entry) {
    const entryEl = this.getFocused()
    while(++h <= this.hBoundary) {
      if (this.graph[h]) {
        const el = this.graph[h][v]
        if (el && (el !== entryEl)) {
          return {
            coordinate: [h, v],
            el
          }
        }
      }
    }
    return null
  }
  __up__([h, v] = this.entry) {
    const entryEl = this.getFocused()
    while(--v >= 0) {
      if (this.graph[h]) {
        let el = this.graph[h][v]
        while(!el && --h >= 0) {
          el = this.graph[h][v]
        }
        if (h < 0) {
          break;
        }
        if (el && (el !== entryEl)) {
          return {
            coordinate: [h, v],
            el
          }
        }
      }
    }
    return null
  }
  __down__([h, v] = this.entry) {
    const entryEl = this.getFocused()
    while(++v <= this.vBoundary) {
      if (this.graph[h]) {
        let el = this.graph[h][v]
        while(!el && --h >= 0) {
          el = this.graph[h][v]
        }
        if (h < 0) {
          break;
        }
        if (el && (el !== entryEl)) {
          return {
            coordinate: [h, v],
            el
          }
        }
      }
    }
    return null
  }
  __moveLeft__() {
    // TODO: 记忆功能
    const [h, v] = this.entry, boundary = 0
    let newH = h
    while (--newH >= boundary) {
      if (this.__moveTo__(newH, v)) {
        return MID
      }
    }
    return LEFT
  }
  __moveRight__() {
    // TODO: 记忆功能
    const [h, v] = this.entry, boundary = this.graph.length - 1
    let newH = h
    while (++newH <= boundary) {
      if (this.__moveTo__(newH, v)) {
        return MID
      }
    }
    return RIGHT
  }
  __moveUp__() {
    // TODO: 记忆功能
    const [h, v] = this.entry, boundary = 0
    let newV = v
    while (--newV >= boundary) {
      if (this.__vMoveTo__(h, newV)) {
        return MID
      }
    }
    return UP
  }
  __moveDown__() {
    // TODO: 记忆功能
    const [h, v] = this.entry, boundary = this.vBoundary // this.graph[h].length - 1
    let newV = v
    while(++newV <= boundary) {
      if (this.__vMoveTo__(h, newV)) {
        return MID
      }
    }
    return DOWN
  }
  __moveTo__(h, v) {
    const [ch, cv] = this.entry, currentCell = this.graph[ch][cv]
    const cell = this.graph[h][v]
    if (cell === currentCell) { 
      return 0
    } else if (cell && cell !== currentCell) {
      this.entry = [h, v]
      cell.focus()
      return 1
    }
    return 2
  }
  __vMoveTo__(h, v) {
    let rh = h
    while (rh >= 0) {
      const flag = this.__moveTo__(rh, v)
      if (flag === 2) {
        --rh
        continue
      }
      return !!flag
    }
    return false
  }
  getFocused() {
    const [h, v] = this.entry
    return this.graph[h][v].getIt()
  }
  getIt() {
    return this.el
  }
}

export class FocusGraph {
  constructor(el) {
    this.__EVENTS__ = []
    this.graphContainer = el

    this.entry = 0
    const groups = this.groups = []
    const allGroupEl = domQuery(el, '[data-group]')
    for (let k = allGroupEl.length; k--;) {
      const fgGroup = this.insert(allGroupEl[k])
      if (fgGroup && fgGroup.isEntry) {
        this.entry = fgGroup.group
      }
    }

    if (groups[this.entry].isAutoFocus) {
      groups[this.entry].focus()
    }
  }
  focus() {
    if (!this.groups[this.entry] || !this.groups[this.entry].focus()) {
      // 没找到focus的
      this.entry = 0
      this.findFocus()
    }
    return this
  }
  findFocus() {
    if (!this.groups[this.entry].focus()) {
      if (++this.entry < this.groups.length) {
        this.findFocus()
      } else {
        // ERROR
      }
    }
  }
  blur() {
    this.groups[this.entry].blur()
    return this
  }
  insert(groupEl) {
    const fgGroup = new FocusGraphGroup(groupEl)
    return fgGroup.isEmpty() ? void(0) : (this.groups[fgGroup.group] = fgGroup)
  }
  remove(groupId) {
    this.groups[groupId] = null
  }
  keycodeMove(keycode) {
    this.moveFocus(KEYCODE_TO_DIRECTION[keycode])
  }
  nearby(orientation, step = 1) {
    return {
      group: this.entry,
      ...this.groups[this.entry].nearby(orientation, step)
    }
  }
  moveFocus(orientation, fn) {
    if (!this.groups[this.entry]) {
      this.focus()
    } else {
      const status = this.groups[this.entry].moveFocus(orientation)
      switch (status) {
        case LEFT:
        case RIGHT:
          return this.__publish__(status)
        case UP:
          return this.__move__(status, OP.gte, OP.minusminus, 0)
        case DOWN:
          return this.__move__(status, OP.lte, OP.plusplus, this.groups.length - 1);
        default:
          break;
      }
    }
    callFnProxy(fn)
  }
  setEntry(groupId, entry) {
    const g = this.groups[groupId]
    if (g) {
      this.entry = groupId
      if (!g.setEntry(entry)) {
        this.entry = 0
        this.findFocus()
      }
    }
  }
  getEntry() {
    return {
      group: this.entry,
      entry: this.groups[this.entry].getEntry()
    }
  }
  __publish__(orientation) {
    const events = this.__EVENTS__[orientation]
    if (events) {
      const L = events.length, el = this.getFocused()
      for(let k = 0; k < L; k++) {
        events[k](el)
      }
    }
    return this
  }
  subscribe(orientation, fn) {
    if (typeof fn === 'function') {
      (
        this.__EVENTS__[orientation] ||
        (this.__EVENTS__[orientation] = [])
      ).push(fn)
    }
    return this
  }
  getFocused() {
    return this.groups[this.entry].getFocused()
  }
  getGroup(groupId) {
    return this.groups[groupId] || null
  }
  __move__(status, validOp, stepOp, boundary) {
    let entry = this.entry
    const groups = this.groups
    while (validOp(entry = stepOp(entry), boundary)) {
      const group = groups[entry]
      if (group) {
        this.entry = entry
        return group.focus()
      }
    }
    // 到最上/下
    this.__publish__(status)
  }
}
FocusGraph.LEFT = LEFT
FocusGraph.RIGHT = RIGHT
FocusGraph.UP = UP
FocusGraph.DOWN = DOWN

export default FocusGraph

function data(el, name) {
  if ('dataset' in el) {
    return el.dataset[kebabToCamel(name)]
  }
  return el.getAttribute(`data-${name}`)
}

function kebabToCamel(s) {
  return s.replace(/\-(\w)?/g, (m, n) => n.toUpperCase())
}

const NumberRegExp = /\b\d+\b/gm
function toNumbers(n) {
  NumberRegExp.lastIndex = 0
  const numbers = []
  let r
  while (r = NumberRegExp.exec(n)) {
    numbers.push(r[0] - 0)
  }
  return numbers
}

function domQuery(el, selector) {
  if ('querySelectorAll' in el) {
    return el.querySelectorAll(selector)
  }
  // TODO: 兼容性处理
}