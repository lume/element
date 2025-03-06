import {Config} from '@stencil/core'
import {nodeResolve} from '@rollup/plugin-node-resolve'

// https://stenciljs.com/docs/config

export const config: Config = {
	globalStyle: 'src/global/app.css',
	globalScript: 'src/global/app.ts',
	taskQueue: 'async',
	outputTargets: [
		{
			type: 'www',
			// comment the following line to disable service workers in production
			serviceWorker: null,
			baseUrl: 'https://myapp.local/',
		},
	],

	// Use an updated version of nodeResolve otherwise Stencil's version of
	// nodeResolve will be used which will not be able to resolve Lume Element
	// dependencies correctly.
	rollupPlugins: {
		before: [nodeResolve()],
	},
}
