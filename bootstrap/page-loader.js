const path = require('path')
const RouterConfig = require('../src/config/router.json')
const Consts = require('./consts')

const IMPORTS = `
import __App__ from '@core/app'
`
// import __render__ from './index.page.art'
const postpend = (path, Page, PageId, init) => `
__App__.register('${path}', ${Page}, '${PageId}');${init ? `__App__.start('${path}')` : ''}
`
const PageRegexp = /class\s+(\S+)\s+extends\s+Pageit/gm

module.exports = function(content, sourceMap) {
	if(this.cacheable) this.cacheable();
	
	PageRegexp.lastIndex = 0
	const PageName = PageRegexp.exec(content)[1]
	if (!PageName) throw 'Error: invalid entry page. Page as an entry must be a CLASS extends Pageit.';
	const dir = path.relative(Consts.PAGES, this.context)
	const pageConfig = findPageConfig(dir)
	const post = postpend(pageConfig.path, PageName, pageConfig.config.id, !!pageConfig.config.init)
	return IMPORTS + content + post
}

function findPageConfig(page) {
	for (const k in RouterConfig) {
		const config = RouterConfig[k]
		if (config.page === page) {
			return {
				path: k,
				config
			}
		}
	}
	return null
}