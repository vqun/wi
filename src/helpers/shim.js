if (typeof Array.prototype.find !== 'function') {
  /* Array.prototype.find = */function ArrayFind(fn, thisArg) {
    for (var k = 0, l = this.length; k < l; k++) {
      if (thisArg ? fn.call(thisArg, this[k], k, this) : fn(this[k], k, this)){
        return this[k]
      }
    }
    return void(0)
  }
  Object.defineProperty(Array.prototype, 'find', {
    get() {
      return ArrayFind
    }
  })
}
if (typeof Object.keys !== 'function') {
  /* Object.keys = */function ObjectKeys(o) {
    const keys = []
    for (const k in o) {
      if (o.hasOwnProperty(k)) {
        keys.push(k)
      }
    }
    return keys
  }

  Object.defineProperty(Object, 'keys', {
    get() {
      return ObjectKeys
    }
  })
}