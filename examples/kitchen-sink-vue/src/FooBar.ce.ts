import _FooBar from './FooBar.vue'
import {defineCustomElement, type HTMLAttributes, type Component} from 'vue'

export const FooBar = defineCustomElement(_FooBar)

declare module 'vue' {
	interface GlobalComponents {
		FooBar: typeof _FooBar
		// FooBar: typeof FooBar
		// FooBar: Component<InstanceType<typeof FooBar>>
	}
	interface IntrinsicElementAttributes {
		'foo-bar': InstanceType<typeof FooBar>
		// 'foo-bar': Pick<InstanceType<typeof FooBar>, 'foo'> & HTMLAttributes
		// divv: {blah: string} & HTMLAttributes
	}
}
