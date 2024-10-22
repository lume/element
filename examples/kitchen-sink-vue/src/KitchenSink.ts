export class KitchenSink extends HTMLElement {
	foo = 123
}
customElements.define('kitchen-sink', KitchenSink)

import type {Component} from 'vue'

declare module 'vue' {
	interface GlobalComponents {
		// Try toggling between these two lines
		'kitchen-sink': typeof KitchenSink // not working (except ref works)
		// 'kitchen-sink': Component<{foo: number}> // works (except ref not working)
	}

	interface IntrinsicElementAttributes {
		'kitchen-sink': {foo: number}
	}
}
