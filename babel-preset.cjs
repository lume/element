module.exports = function (context, options = {}) {
	options.moduleName = options.moduleName || '@lume/element'
	return require('babel-preset-solid')(context, options)
}
