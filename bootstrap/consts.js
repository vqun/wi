const path = require('path')

// only index.js will be recognized as an entry
const ACCEPT_FILE_TYPES = ['.js']
const PAGE_ENTRY_NAME = ['index']
const MAX_ENTRY_DEPTH = 2

const ASSETS_JS_PUBLICK_PATH = '/'
const ASSETS_CSS_PUBLICK_PATH = '/'
const ASSETS_RESOURCES_PUBLICK_PATH = '/'

const ASSETS_JS_PUBLICK_PROD_PATH = '/'
const ASSETS_RESOURCES_PUBLICK_PROD_PATH = '/'

const ROOT = path.resolve(__dirname, '../')
const SRC = path.resolve(ROOT, 'src')
const PAGES = path.resolve(SRC, 'pages')
const DIST = path.resolve(ROOT, 'dist')
const LOCAL_DEV = path.resolve(ROOT, 'local')
const BUSINESS_CONFIG = path.resolve(SRC, 'config')

module.exports = {
  ACCEPT_FILE_TYPES,
  PAGE_ENTRY_NAME,
  MAX_ENTRY_DEPTH,
  ASSETS_JS_PUBLICK_PATH,
  ASSETS_JS_PUBLICK_PROD_PATH,
  ASSETS_CSS_PUBLICK_PATH,
  ASSETS_RESOURCES_PUBLICK_PATH,
  ASSETS_RESOURCES_PUBLICK_PROD_PATH,
  ROOT,
  SRC,
  PAGES,
  DIST,
  LOCAL_DEV,
  BUSINESS_CONFIG
}