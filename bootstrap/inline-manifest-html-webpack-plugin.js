"use strict";
const path = require('path')
const { BUSINESS_CONFIG } = require('./consts')
const router = require(path.resolve(BUSINESS_CONFIG, 'router.json'))

const RouterPaths = Object.keys(router)

class InlineManifestHtmlWebpackPlugin {
  constructor(options) {
    options = options || {};

    this.manifestVariable = options.manifestVariable || "webpackManifest";
  }

  apply(compiler) {

    const manifestVariable = this.manifestVariable;

    compiler.hooks.compilation.tap(
      "InlineChunkManifestHtmlWebpackPlugin",
      compilation => {
        compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration.tapAsync(
          "InlineChunkManifestHtmlWebpackPlugin",
          (htmlPluginData, callback) => {
            const assets = {}
            const js = htmlPluginData.assets.js, css = htmlPluginData.assets.css
            console.log(css)
            for (let k = js.length; k--;) {
              const jsPath = js[k]
              const id = /([\w\-\$]+)\.js$/.exec(jsPath)[1]
              if (id) {
                const routerInfo = this.getRouterById(id)
                if (routerInfo && !routerInfo.config.init) {
                  assets[routerInfo.path] = {
                    js: jsPath
                  }
                  js.splice(k, 1)

                  for (let j = css.length; j--;) {
                    const cssPath = css[j]
                    if (cssPath.lastIndexOf(`/${id}.css`) > -1) {
                      assets[routerInfo.path].css = cssPath
                      css.splice(j, 1)
                      break;
                    }
                  }
                }
              }
            }
            htmlPluginData.assets[
              manifestVariable
            ] = `<script type="text/javascript">window.${manifestVariable}=${JSON.stringify(assets)}</script>`;
            htmlPluginData.assets.manifestConfigName = manifestVariable

            callback(null, htmlPluginData);
          }
        );
      }
    );
  }

  getRouterById(id) {
    for (let k = 0, l = RouterPaths.length; k < l; k++) {
      const path = RouterPaths[k], config = router[path]
      if (config && config.id === id) {
        return {
          path,
          config: config
        }
      }
    }
    return null
  }
}

module.exports = InlineManifestHtmlWebpackPlugin