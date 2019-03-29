const path = require('path')
const config = require('config')
const webpack = require('webpack')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const InlineManifestHtmlWebpackPlugin = require('./inline-manifest-html-webpack-plugin')

const {
  configOutput,
  configMiniCss,
  configCssLoader,
  configAssetsLoader,
  configMinimizer,
  configEntry,
  configAlias
} = require('./config.utils')
const { ROOT, PAGES, BUSINESS_CONFIG } = require('./consts')

const { PAGE_ASSETS_CONFIG } = require(path.resolve(BUSINESS_CONFIG, 'global.json'))
// const CopyWebpackPlugin = require('copy-webpack-plugin')

function stringifyConfig(config) {
  const ret = {}
  for(const k in config) {
    ret[k] = JSON.stringify(config[k])
  }
  return ret
}

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development'
  const miniCssExtract = configMiniCss(isDev)

  return {
    context: ROOT,
    entry: configEntry(PAGES),
    output: configOutput(isDev),
    plugins: [
      miniCssExtract.plugin,
      new webpack.DefinePlugin({
        __config__: stringifyConfig(config),
        __global__: 'window'
      }),
      new HTMLWebpackPlugin({
        filename: 'index.html',
        template: './src/index.ejs',
        xhtml: true
      }),
      new InlineManifestHtmlWebpackPlugin({
        manifestVariable: PAGE_ASSETS_CONFIG
      })
    ],
    module: {
      rules: [
        {
          test: /\.page\.(?:j|t)s?$/,
          use: ['./bootstrap/core-shim-loader', './bootstrap/page-loader'],
          enforce: 'pre',
          include: [PAGES]
        },
        {
          test: /\.(?:j|t)s?$/,
          use: [
            {
              loader: 'c-loader',
              options: {
                css: '[path][name]',
                postfix: 'less'
              }
            }
          ],
          enforce: 'pre',
          exclude: [/node_modules/]
        },
        { test: /\.(?:j|t)s?$/, use: ['babel-loader'] },
        {
          test: /\.(?:le|c)ss$/,
          use: [
            miniCssExtract.loader,
            ...configCssLoader(isDev)
          ]
        },
        {
          test: /\.(?:png|jpg|jpeg|gif|webp)$/,
          use: [configAssetsLoader(isDev)]
        }
      ]
    },
    resolve: {
      alias: configAlias()
    },
    optimization: {
      minimizer: configMinimizer(isDev),
      splitChunks: {
        automaticNameDelimiter: '-',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            reuseExistingChunk: true
          },
          core: {
            test: /[\\/](core|helpers|shared)[\\/]/,
            name: 'core',
            chunks: 'all',
            enforce: true,
            reuseExistingChunk: true
          },
          styles: {
            name: 'all',
            test: /\.less$/,
            chunks: 'all',
            enforce: true
          }
        }
      }
    },
    devtool: isDev && 'cheap-module-eval-source-map',
  }
}
