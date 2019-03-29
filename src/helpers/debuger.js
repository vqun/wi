const Slice = Array.prototype.slice
const logger = '<div id="__log__" style="position:fixed;top:0;left:0;right:0;min-height:2em;line-height:1.5;z-index:10000000;color:white;font-size:20px;"></div>'
let console = console;
if (!console) {
  const proxyEl = document.createElement('div')
  proxyEl.innerHTML = logger
  const logEl = proxyEl.firstChild

  document.body.appendChild(logEl)

  console = __global__.console = {
    log() {
      logEl.innerHTML += Slice.call(arguments, 0).join(' ') + '<br />'
      return this
    },
    error() {},
    clear() {
      logEl.html('')
    }
  }
}

export default console