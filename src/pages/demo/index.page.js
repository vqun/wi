import Pageit from '@core/pageit'
import History from '@core/history'
import DemoComponent from '@components/demo-component'

export default class DemoPage extends Pageit {
  // [MIGRATE]: 参数不再有pageTemplate
  constructor(path/*, pageTemplate*/, pageId) {
    super(path/*, pageTemplate*/, pageId)

    this.data = {
      title: 'DemoPage'
    }
  }
  onStateReceived(nextHistory, previousHistory) {
    console.log(nextHistory, previousHistory)
  }

  // [MIGRATE]: render函数必须写，以下方为例，不再支持index.page.art模式
  // 1. 必须是一个包裹元素，否则，只会展示第一个元素
  // 2. 如果没有写id，会自动加(id="[pageId]")
  render() {
    // [MIGRATE]: 资源引入，先前在art里，使用的是{{require('@assets/demo/demo.png')}}
    // 在render里，需要改写成：${require('@assets/demo/demo.png')}
    return `
      <div>
        <h1>{{title}}</h1>
        <div tabindex="1" on-enter="onChangeTitle">Change Title to "Hello Wi"</div>
        <div on-focus="onParentFocus">
          <div href="/demo-1" id="demo-a" tabindex="2" on-enter="onJumpToDemo1" on-focus="onSubFocus">Demo-1</div>
        </div>
        <x-demo />
        <img src="${require('@assets/demo/demo.png')}" />
      </div>
    `
  }

  didMount() {}
  onShow() {}
  onBack() {}
  // [MIGRATE]: didUnmount已被onHide替代
  // didUnmount() {} // 已被onHide替代
  onHide() {}

  // <Self-definedMethod>
  onChangeTitle() {
    this.setData({
      title: 'Hello Wi'
    })
  }
  onJumpToDemo1(evt) {
    evt.preventDefault()
    History.push(evt.target.getAttribute('href'))
  }
  onParentFocus(evt, el) {
    console.log('Demo@onParentFocus')
    evt.preventDefault()
    el.style.border = "1px solid red"
  }
  onSubFocus(evt) {
    evt.stopPropagation()
    console.log('Demo@onSubFocus')
  }
  // </Self-definedMethod>
}

DemoPage.components = {
  demo: DemoComponent
}
