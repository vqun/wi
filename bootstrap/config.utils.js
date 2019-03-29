const path = require('path')
const fs = require('fs')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetssPlugin = require('optimize-css-assets-webpack-plugin')

const {
  ASSETS_JS_PUBLICK_PATH,
  ASSETS_JS_PUBLICK_PROD_PATH,
  ASSETS_CSS_PUBLICK_PATH,
  ASSETS_RESOURCES_PUBLICK_PATH,
  ASSETS_RESOURCES_PUBLICK_PROD_PATH,
  DIST,
  LOCAL_DEV,
  SRC,
  PAGES,
  BUSINESS_CONFIG
} = require('./consts')
const Router = require(path.resolve(BUSINESS_CONFIG, 'router.json'))

module.exports.configOutput = (isDev) => ({
  path: isDev ? LOCAL_DEV : DIST,
  // filename: isDev ? 'pages/[name].js' : 'pages/[name]-[hash].js',
  filename: 'pages/[name].js',
  // 这里如果不改的话html的src路径就不会变了？
  publicPath: isDev ? ASSETS_JS_PUBLICK_PATH : ASSETS_JS_PUBLICK_PROD_PATH
})

module.exports.configMiniCss = (isDev) => ({
  plugin: new MiniCssExtractPlugin({
    // filename: isDev ? 'styles/[name].css' : 'styles/[name]-[contenthash:6].css',
    // chunkFilename: isDev ? 'styles/[name].css' : 'styles/[name]-[contenthash:6].css',
    filename: 'styles/[name].css',
    chunkFilename: 'styles/[name].css',
  }),
  loader: {
    loader: MiniCssExtractPlugin.loader,
    options: {
      publicPath: `${ASSETS_CSS_PUBLICK_PATH}`
    }
  }
})

module.exports.configCssLoader = (isDev) => ([
  {
    loader: 'css-loader',
    options: {
      sourceMap: isDev
    }
  },
  {
    loader: 'less-loader',
    options: {
      sourceMap: isDev
    }
  },
])

module.exports.configAssetsLoader = (isDev) => ({
  loader: 'file-loader',
  options: {
    context: SRC,
    // name: isDev ? '[path][name].[ext]' : '[path][name]-[hash].[ext]',
    name: '[path][name].[ext]',
    publicPath: isDev ? ASSETS_RESOURCES_PUBLICK_PATH : ASSETS_RESOURCES_PUBLICK_PROD_PATH
  }
})

module.exports.configMinimizer = (isDev) => [
  new UglifyJsPlugin({
    uglifyOptions: {
      compress: {
        properties: false,
        warnings: false,
        drop_debugger: !isDev,
        drop_console: !isDev
      },
      output: {
        beautify: false,
        quote_keys: true,
        keep_quoted_props: true
      },
      ie8: true
    },
    sourceMap: isDev
  }),
  new OptimizeCssAssetssPlugin()
]

module.exports.configEntry = function() {
  const entries = {}
  for (const k in Router) {
    const config = Router[k]
    entries[config.id] = path.resolve(PAGES, `${config.page}/index.page.js`)
  }
  return entries
}

module.exports.configAlias = () => {
  const dirs = fs.readdirSync(SRC)
  return dirs.reduce((prev, current) => {
    const dirPath = path.resolve(SRC, current)
    const stat = fs.statSync(dirPath)
    if (stat.isDirectory()) {
      // Eslint不支持
      // return {
      //   ...prev,
      //   [`@${current}`]: dirPath
      // }
      return Object.assign(prev, { [`@${current}`]: dirPath })
    }
    return prev
  }, {})
}
