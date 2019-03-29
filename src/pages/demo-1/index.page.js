import Pageit from '@core/pageit'
import History from '@core/history'

export default class DemoPage extends Pageit {
  constructor(path, pageId) {
    super(path, pageId)
    this.data = {
      name: 'DEMOPAGE - 1'
    }
  }
  onStateReceived(nextHistory, previousHistory) {
    // TODO: 目前不能在这里调用setData
    console.log(nextHistory, previousHistory)
  }
  render() {
    return `
      <div>
        <h1>{{name}}</h1>
        <div tabindex="1" on-enter="onEnter">Back</div>
      </div>
    `
  }
  didMount() {}
  onBack() {}
  onHide() {}
  onEnter() {
    History.back()
  }
}
