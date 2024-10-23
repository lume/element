import type {DefineComponent} from 'vue'

// Select the properties to expose to template type checking.
type KitchenSinkAttributes = 'foo' | 'bar'

export class KitchenSink extends HTMLElement {
	foo = 123
	bar = false

	// This is not exposed to template type checking.
	someMethod() {
		/* ... */
	}
}

customElements.define('kitchen-sink', KitchenSink)

type VueElementAttribtues<T extends HTMLElement, Attributes extends keyof T> =
	// This is the type that is exposed to template type checking.
	DefineComponent<Partial<Pick<T, Attributes>>> &
		// Additionally intersect with a constructor type that returns the element type, for refs to work properly.
		(new () => T)

declare module 'vue' {
	interface GlobalComponents {
		// Use the helper to add any custom element to GlobalComponents.
		'kitchen-sink': VueElementAttribtues<KitchenSink, KitchenSinkAttributes>
	}
}
