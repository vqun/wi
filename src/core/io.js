import $ from 'jquery'

const BASE_URL = location.origin

export function get(url, params) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      url,
      dataType: isCrossOrigin(url) ? 'jsonp' : 'json',
      method: 'GET',
      data: params,
      success: resolve || noop,
      error: reject || noop
    })
  })
}

export function post(url, params) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      url,
      dataType: isCrossOrigin(url) ? 'jsonp' : 'json',
      method: isCrossOrigin(url) ? 'GET' : 'POST',
      data: params,
      success: resolve || noop,
      error: reject || noop
    })
  })
}

function isCrossOrigin(url) {
  return url.indexOf('http') === 0 ? url.indexOf(BASE_URL) === -1 : url.indexOf('//') === 0 ? isCrossOrigin(`${window.location.protocol}${url}`) : false
}

function noop() {}