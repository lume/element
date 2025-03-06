import {sveltekit} from '@sveltejs/kit/vite'
import {defineConfig} from 'vite'

// Make sure to set target, or decorators will currently not work (syntax errors).
const target = 'es2023'

export default defineConfig({
	plugins: [sveltekit()],

	build: {
		target,
	},
	esbuild: {
		target,
	},
	optimizeDeps: {
		esbuildOptions: {
			target,
		},
	},
})
