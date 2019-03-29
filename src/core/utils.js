// Utils
export function is(o) { return Object.prototype.toString.call(o).slice(8, -1).toLowerCase() }
export function isArray(a) { return is(a) === 'array' }
export function isFunction(fn) { return is(fn) === 'function' }

export function lazyScript(path, callback) {
  if (!path) return;
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = path;
  if (isFunction(callback)) {
    script.onload = callback;
  }
  // TODO: 出错处理
  script.onerror = function () {};
  document.getElementsByTagName('head')[0].appendChild(script);
}
export function lazyStyle(path, callback = noop) {
  if (!path) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = path;
  if (isFunction(callback)) {
    link.onload = callback;
  }
  // TODO: 出错处理
  link.onerror = function () {};
  document.getElementsByTagName('head')[0].appendChild(link);
}

export function parseQuery(query) {
  query = `${query}`; // conver to string
  const KEY_VALUE_REG = /([^&=]+)(?:\=([^&=]*))?/gm;
  const obj = {};
  let m;
  while (m = KEY_VALUE_REG.exec(query)) {
    obj[m[1]] = m[2] || '';
  }
  return obj;
}

export function clearPathname(pathname) {
  // e.g. /test/index.html => /test/
  return pathname.replace(/\w+\.\w+$/, '')
}

export function getBody() {
  return document.body || document.getElementsByTagName('body')[0] || null
}

export function noop() {}

export function g(salt = 'SALT') {
  return `${Math.random().toString(32).slice(2)}.${salt}`
}