import { Component } from 'ark'

export default class DemoComponent extends Component {
  constructor(props) {
    super(props)
    this.data = {
      title: 'Demo Component'
    }
  }
  render() {
    return `
      <div>
        <h4>Component title: {{title}}</h4>
        <div tabindex="3" on-enter="onChangeTitle">Press enter to change title</div>
      </div>
    `
  }
  willReceiveProps(nextProps) {
    console.log('=======next props: ', nextProps)
  }
  onChangeTitle(evt, el) {
    evt.stopPropagation()
    this.setData({
      title: 'Hello, I am title'
    })
  }
}