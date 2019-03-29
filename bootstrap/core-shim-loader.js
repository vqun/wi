// const loaderUtils = require('loader-utils')
// const SourceNode = require("source-map").SourceNode;
// const SourceMapConsumer = require("source-map").SourceMapConsumer;

const IMPORTS = `
import "es5-shim"
import "es5-shim/es5-sham"
import "es6-promise/auto"
import "json3"
import "@helpers/shim"
`
module.exports = function(content, sourceMap) {
  if(this.cacheable) this.cacheable();
	// if(sourceMap) {
	// 	const currentRequest = loaderUtils.getCurrentRequest(this);
	// 	const node = SourceNode.fromStringWithSourceMap(content, new SourceMapConsumer(sourceMap));
	// 	node.prepend(IMPORTS);
	// 	const result = node.toStringWithSourceMap({
	// 		file: currentRequest
	// 	});
	// 	this.callback(null, result.code, result.map.toJSON());
	// 	return;
	// }
	return IMPORTS + content
}