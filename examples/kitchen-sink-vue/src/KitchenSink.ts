import type {EmitFn, HTMLAttributes, ObjectEmitsOptions, PublicProps} from 'vue'

// Select the properties to expose to template type checking.
type KitchenSinkAttributes = 'foo' | 'bar'

export class KitchenSink extends HTMLElement {
	foo = 123
	bar = false

	// This is not exposed to template types.
	someMethod() {
		/* ... */
	}
}

export class SomeEvent extends Event {
	foo = 123
	constructor() {
		super('some-event')
	}
}

type DefineCustomElement<
	T extends HTMLElement,
	Attributes extends keyof T = keyof T,
	Events extends ObjectEmitsOptions = {},
> = new () => T & {
	// Use this to define the properties exposed to template type checking.
	/** @deprecated Do not use the $props property on a Custom Element ref, this is for template prop types only. */
	$props: HTMLAttributes & Partial<Pick<T, Attributes>> & PublicProps

	// Use this to define specifically the event properties exposed to template type checking.
	/** @deprecated Do not use the $emit property on a Custom Element ref, this is for template prop types only. */
	$emit: EmitFn<Events>

	// /** @deprecated Do not use the $attrs property on an element ref, this is for template prop types only. */
	// $attrs: {[x: string]: string}
}

customElements.define('kitchen-sink', KitchenSink)

declare module 'vue' {
	interface GlobalComponents {
		// Use the helper to add any custom element to GlobalComponents.
		'kitchen-sink': DefineCustomElement<KitchenSink, KitchenSinkAttributes, {'some-event': (e: SomeEvent) => void}>
	}
}
