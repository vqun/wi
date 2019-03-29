import { Component } from 'ark'

export default class Pageit extends Component {
  constructor(path, pageId, props) {
    super(props)
    if (!this.__checkParams__(path, pageId)) {
      throw 'Pageit needs [path]/[pageId] as the parameters. Please review the Pageit invoke.'
    } else {
      this.__shown__ = false
      this.path = path
      this.caseId = pageId
    }
  }
  // <ExtendAPI>
  // 查看@ark/ArkComponent.js
  // </ExtendAPI>
  // <InterfaceAPI>
  // 页面路由切换时候会调用，从其他页面切换到该页面时候调用，或者，本页面切换本页面
  onStateReceived(nextHistory, previousHistory) {
    // TODO: 目前不能在这里调用setData
  }
  onBack() {}
  onShow() {}
  onHide() {}
  // </InterfaceAPI>

  // <PublicAPI>
  isShown() {
    return this.__shown__
  }
  // </PublicAPI>

  // <PrivateAPI>
  __hide__() {
    this.__insureContainer__()
    this.el.style.display = 'none'
    this.onHide()
    this.__shown__ = false
  }
  __show__() {
    this.__insureContainer__()
    this.el.style.display = 'block'
    this.onShow()
    this.__shown__ = true
  }
  __insureContainer__() {
    const kase = this.el
    if (!kase.id) {
      kase.id = this.caseId;
      kase.setAttribute('tabindex', '-100000')
    }
  }
  __checkParams__(path, pageId) {
    return path && pageId
  }
  // </PrivateAPI>
}