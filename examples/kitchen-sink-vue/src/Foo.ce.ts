import Foo from './Foo.vue'
import {defineCustomElement /*, type HTMLAttributes*/, type Component} from 'vue'

export const FooCE = defineCustomElement(Foo)

declare module 'vue' {
	interface GlobalComponents {
		Foo: typeof Foo
	}
}
