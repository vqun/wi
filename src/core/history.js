import { g, parseQuery, clearPathname, isFunction, isArray } from './utils'

const BACK = '__back__', PUSH = '__push__', REPLACE = '__replace__'
const GlobalLocation = window.location

class Location {
  constructor() {
    this.__PROXIER__ = document.createElement('a')
    this.parse()
  }
  parse() {
    this.href = GlobalLocation.href
    const hash = GlobalLocation.hash.slice(1)
    this.__PROXIER__.href = decodeURIComponent(hash)
    const { pathname, search } = this.__PROXIER__
    // path: 去除了filename，如http://www.fake.com/test/index.html，则：path = /test/，pathname = /test/index.html
    this.path = clearPathname(this.pathname = pathname)
    this.query = parseQuery(search.replace('?', ''))
  }
  get() {
    const { pathname, path, query } = this
    return { pathname, path, query }
  }
}
export const location = new Location

class HistoryItem {
  constructor(url = location.path, state = null, title = '') {
    this.id = g('__history-item__')
    this.init(url, state, title)
  }
  init(url, state, title) {
    this.url = url || this.url
    this.state = state
    this.title = title
  }
  replaceState(...args) {
    const oldHistory = this.toHistory()
    this.init(...args)
    return oldHistory
  }
  resetState(state) {
    this.state = state
  }
  destroy() {
    delete this.id
    delete this.url
    delete this.state
    delete this.title
  }
  get() {
    return {
      url: this.url,
      state: this.state,
      title: this.title
    }
  }
  toHistory() {
    return {
      ...this.get(),
      ...location.get()
    }
  }
}

// i: 没有用H5的history，因为没有服务端路由支持
// 旧版opera（12以下），修改hash，无法增加history，故全部用replace
const history = {
  replace(url) {
    GlobalLocation.replace(`#${encodeURIComponent(url)}`)
    location.parse()
  },
  go(historyInfo) {
    this.replace(historyInfo.url)
  },
  replaceState(state, title, url) {
    this.replace(url)
  },
  pushState(state, title, url) {
    this.replace(url)
  }
}

const DEFAULT_HOMEPAGE = '/'
class History {
  constructor(homepage = DEFAULT_HOMEPAGE) {
    this.homepage = homepage
    this.length = 0
    this.stateChangeStacks = []
    // historyStack: 历史记录栈，注意，是个栈
    this.historyStack = []

    this.init()
  }
  init() {
    const currentHistoryItem = new HistoryItem
    this.length = this.historyStack.unshift(currentHistoryItem)
    if (currentHistoryItem.toHistory().path !== this.homepage) { // 如果当前页面不是首页，把首页推入栈底
      this.length = this.historyStack.push(new HistoryItem(this.homepage))
    }
  }
  go(step = -1) {
    // TODO: |step|如果超过历史记录栈的长度，则需要触发一次back到document（Philips上退出homepage）
    if (step >= 0) return false; // 暂不支持forward，无此场景

    const next = -step
    if (next < this.historyStack.length) {
      const previous = this.historyStack.shift().toHistory()
      this.historyStack.splice(0, next - 1)
      this.length = this.historyStack.length
      history.go(this.historyStack[0].get())
      this.dispatchState(previous, BACK)
      return true // 还有历史记录
    } else {
      // todo: 发送back事件，看业务是否有场景
    }
    return false
  }
  back() {
    return this.go(-1)
  }
  // TODO: 是否有需要，看场景
  // forward() {}
  pushState(state, title = '', url = '') {
    const previous = this.get(), previousHistory = previous && previous.toHistory()
    this.length = this.historyStack.unshift(new HistoryItem(url || previous.url, state, title))
    history.pushState(state, title, url)
    this.dispatchState(previousHistory, PUSH)
  }
  // push: 兼容过去的history
  push(url, state) {
    this.pushState(state, '', url)
  }
  replaceState(state, title = '', url = '') {
    const currentHistory = this.historyStack[0]
    if (currentHistory) {
      const previousHistory = currentHistory.replaceState(url, state, title)
      history.replaceState(state, title, url)
      this.dispatchState(previousHistory, REPLACE)
    } else {
      this.pushState(state, title, url)
    }
  }
  // replace: 兼容过去的history
  replace(url, state) {
    this.replaceState(state, '', url)
  }
  onStateChange(fn) {
    isFunction(fn) && this.stateChangeStacks.push(fn)
    return this
  }
  dispatchState(previousHistory, action) {
    this.handleStack(this.stateChangeStacks, previousHistory, action)
  }
  handleStack(stack, previousHistory, action) {
    if (isArray(stack)) {
      const currentHistory = this.toHistory()
      stack.forEach(fn => fn(currentHistory, previousHistory, action))
    }
  }
  get() {
    return this.historyStack[0] || null
  }
  toHistory() {
    return this.get().toHistory()
  }
}

export const HistoryActions = History.actions = { BACK, PUSH, REPLACE }
export default __global__.__History__ || (__global__.__History__ = new History)