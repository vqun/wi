import { ArkDOM } from 'ark'
import { PAGE_ASSETS_CONFIG } from '@config/global.json'
import { VK_BACK } from './VK-Keys'
import { lazyScript, lazyStyle, getBody } from './utils'
import History, { HistoryActions } from './history'

class App {
  constructor() {
    this.pages = {}
    this.path = null
    this.handleKeyevent = this.handleKeyevent.bind(this)
    this.onHistoryChange = this.onHistoryChange.bind(this)
  }
  run() {
    getBody().addEventListener('keydown', this.handleKeyevent, false)
    History.onStateChange(this.onHistoryChange)
  }
  start() {
    this.onHistoryChange(History.toHistory(), null, '')
  }
  register(path, Page, pageId, containerId) {
    if (!!this.pages[path]) {
      throw `Page with router equals [${path}] is already registered`
    }
    this.pages[path] = {
      pageId,
      Page,
      page: new Page(path, pageId, {}), // 第三个参数预留
      container: containerId ? document.getElementById(containerId) : getBody()
    }
  }
  handleKeyevent(evt) {
    if(evt.keyCode === VK_BACK) {
      if(History.back()) {
        evt.preventDefault()
        evt.stopPropagation()
      }
    }
  }
  onHistoryChange(nextHistory, previousHistory, action) {
    const isBack = action === HistoryActions.BACK
    if (previousHistory) {
      const previousPageConfig = this.pages[previousHistory.path]
      if (!!previousPageConfig) {
        isBack && previousPageConfig.page.onBack(nextHistory, previousHistory)
        previousPageConfig && previousPageConfig.page.__hide__()
      }
    }
    const path = this.path = nextHistory.path
    const pageConfig = this.pages[path]
    if (!pageConfig) {
      this.loadPage(path, nextHistory, previousHistory)
    } else {
      this.launchPage(pageConfig, nextHistory, previousHistory)
    }
  }
  loadPage(path, nextHistory, previousHistory) {
    const assets = window[PAGE_ASSETS_CONFIG][path]
    if (!assets) {
      // TODO: error, jumpTo 404 page
      return
    }
    lazyStyle(assets.css)
    lazyScript(
      assets.js,
      () => this.path === path && this.launchPage(this.pages[path], nextHistory, previousHistory)
    )
  }
  launchPage(pageConfig, nextHistory, previousHistory) {
    if (!!pageConfig) {
      pageConfig.page.onStateReceived(nextHistory, previousHistory)
      if (!pageConfig.launched) {
        ArkDOM.render(pageConfig.page, pageConfig.container, () => pageConfig.page.__show__())
        pageConfig.launched = true
      } else {
        pageConfig.page.__show__()
      }
    }
  }
}

if (!__global__.CoreApp) {
  __global__.CoreApp = new App()
  CoreApp.run()
}

export default __global__.CoreApp