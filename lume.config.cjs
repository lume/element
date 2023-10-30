module.exports = {
	testWithAllTSAndBabelDecoratorBuildConfigurations: true,

	importMap: {
		imports: {
			'@lume/variable': '/node_modules/@lume/variable/dist/index.js',
			lowclass: '/node_modules/lowclass/dist/index.js',
			'solid-js': '/node_modules/solid-js/dist/solid.js',
			'solid-js/web': '/node_modules/solid-js/web/dist/web.js',
			'solid-js/html': '/node_modules/solid-js/html/dist/html.js',
			'solid-js/store': '/node_modules/solid-js/store/dist/store.js',
		},
	},
}
