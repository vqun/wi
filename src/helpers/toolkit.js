import { isFunction } from '@core/utils'

export function group(source, base = 6, call = o => o) {
  const groups = [], L = source.length
  let k = 0 // 当前分割位置
  while(L > k) {
    const j = ~~(k / base)
    if (!groups[j]) {
      groups[j] = []
    }
    const s = source[k++]
    s.uniqueId = g()
    groups[j].push(call(s))
  }
  return groups
}

export function callFnProxy(fn, params) {
  return isFunction(fn) ? fn(params) : null;
}