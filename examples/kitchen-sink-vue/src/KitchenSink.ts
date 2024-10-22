export class KitchenSink extends HTMLElement {
	foo = 123
}
customElements.define('kitchen-sink', KitchenSink)

import type {Component} from 'vue'

declare module 'vue' {
	interface GlobalComponents {
		// 'kitchen-sink': typeof KitchenSink // not working
		'kitchen-sink': Component<{foo: number}> // works
	}

	interface IntrinsicElementAttributes {
		'kitchen-sink': {foo: number}
	}
}
