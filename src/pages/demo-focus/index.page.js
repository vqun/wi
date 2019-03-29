import Pageit from '@core/pageit'
import History from '@core/history'
import FocusGraph from '@helpers/focus-graph'
import { VK_NAME_TO_KEYCODE } from '@core/VK-Keys'

export default class TestFocus extends Pageit {
  constructor(path, pageId) {
    super(path, pageId)

    this.data = {
      name: 'TEST-FOCUS'
    }
  }
  // 页面路由切换时候会调用，从其他页面切换到该页面时候调用，或者，本页面切换本页面
  onStateReceived(nextHistory, previousHistory) {
    // TODO: 目前不能在这里调用setData
    console.log(nextHistory, previousHistory)
  }
  // 当前页按back退出时调用，从其他页面返回的，不会调用
  onBack() {}
  onShow() {
    this.FG && this.FG.focus()
  }
  render() {
    return `
      <div>
        <h1>{{name}}</h1>
        <div class="group" data-group="0" data-auto-focus="true" data-entry="true">
          <div class="focusable col left" tabindex="-1" data-v="0,1,2,3" data-h="0">A</div>
          <ul class="right col">
            <li class="line"><span class="focusable col" tabindex="-1" data-v="0" data-h="1">B</span><span class="focusable col" tabindex="-1" data-v="0" data-h="2">C</span></li>
            <li class="line"><span class="focusable col" tabindex="-1" data-v="1" data-h="1">D</span><span class="focusable col" tabindex="-1" data-v="1" data-h="2">E</span></li>
            <li class="line"><span class="focusable col" tabindex="-1" data-v="2" data-h="1,2">F</span></li>
            <li class="line"><span class="focusable col" tabindex="-1" data-v="3" data-h="1">G</span><span class="focusable col" tabindex="-1" data-v="3" data-h="2">H</span></li>
          </ul>
        </div>
        <div class="group" data-group="2">
          <div class="focusable col" tabindex="-1" on-focus="testFocus" data-v="0,1,2" data-h="0">I</div>
          <div class="col">
            <div class="focusable" tabindex="-1" data-v="0" data-h="1">J</div>
            <div class="focusable row-2" tabindex="-1" data-v="1,2" data-h="1">K</div>
          </div>
          <div class="col">
            <div class="focusable" tabindex="-1" data-v="0" data-h="2">L</div>
            <div class="focusable" tabindex="-1" data-v="1" data-h="2">M</div>
            <div class="focusable" tabindex="-1" data-v="2" data-h="2">N</div>
          </div>
          <div class="col">
            <div class="focusable row-2" tabindex="-1" data-v="0,1" data-h="3">O</div>
            <div class="focusable" tabindex="-1" data-v="2" data-h="3">P</div>
          </div>
        </div>
        <div class="group" data-group="3">
          <button tabindex="-1" data-v="0" data-h="0" class="focusable">ADD MORE</button>
        </div>
      </div>
    `
  }
  didMount() {
    this.FG = new FocusGraph(this.el).subscribe(
      FocusGraph.RIGHT,
      () => History.push('/demo')
    )
  }
  onKeydown(evt) {
    evt.preventDefault()
    evt.stopPropagation()
    switch(evt.keyCode) {
      case VK_NAME_TO_KEYCODE.LEFT:
        this.FG.moveFocus(FocusGraph.LEFT)
        break;
      case VK_NAME_TO_KEYCODE.RIGHT:
        this.FG.moveFocus(FocusGraph.RIGHT)
        break;
      case VK_NAME_TO_KEYCODE.UP:
        this.FG.moveFocus(FocusGraph.UP)
        break;
      case VK_NAME_TO_KEYCODE.DOWN:
        this.FG.moveFocus(FocusGraph.DOWN)
        break;
      default:
        break;
    }
  }
  testFocus(evt) {
    evt.preventDefault()
    evt.stopPropagation()
  }
}