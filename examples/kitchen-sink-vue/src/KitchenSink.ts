import {type EmitFn, type HTMLAttributes, type PublicProps} from 'vue'

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

type KitchenSinkEvents = {
	'some-event': SomeEvent
}

customElements.define('kitchen-sink', KitchenSink)

declare module 'vue' {
	interface GlobalComponents {
		// Use the helper to add any custom element to GlobalComponents.
		'kitchen-sink': DefineCustomElement<KitchenSink, KitchenSinkEvents, KitchenSinkAttributes>
	}
}

// helper for Vue type definitions /////////////////////////////////////////////////////////

type DefineCustomElement<
	ElementType extends HTMLElement,
	Events extends EventMap = {},
	SelectedAttributes extends keyof ElementType = keyof ElementType,
> = new () => ElementType & {
	// Use $props to define the properties exposed to template type checking. Vue
	// specifically reads prop definitions from the `$props` type. Note that we
	// combine the element's props with the global HTML props and Vue's special
	// props.
	/** @deprecated Do not use the $props property on a Custom Element ref, this is for template prop types only. */
	$props: HTMLAttributes & Partial<Pick<ElementType, SelectedAttributes>> & PublicProps

	// Use $emit to specifically define event types. Vue specifically reads event
	// types from the `$emit` type. Note that `$emit` expects a particular format
	// that we map `Events` to.
	/** @deprecated Do not use the $emit property on a Custom Element ref, this is for template prop types only. */
	$emit: VueEmit<Events>
}

type EventMap = {
	[event: string]: Event
}

// This maps an EventMap to the format that Vue's $emit type expects.
type VueEmit<T extends EventMap> = EmitFn<{
	[K in keyof T]: (event: T[K]) => void
}>
