import {
	element,
	numberAttribute,
	stringAttribute,
	booleanAttribute,
	Element,
	eventAttribute,
	type ElementAttributes,
} from '@lume/element'
import {onCleanup} from 'solid-js'

// See examples/kitchen-sink-svelte/src/lib/KitchenSink.ts for a fully
// documented version of KitchenSink.

type KitchenSinkAttributes = 'count' | 'name' | 'color' | 'doingSomething' | 'onawesomeness'

export
@element('kitchen-sink')
class KitchenSink extends Element {
	@numberAttribute count = 0
	@stringAttribute name = 'Baby Yoda'
	@stringAttribute color: 'red' | 'green' | 'blue' = 'red'
	@booleanAttribute doingSomething = false
	@eventAttribute onawesomeness: EventListener | null = null

	connectedCallback() {
		super.connectedCallback()

		setTimeout(() => {
			this.dispatchEvent(new Event('awesomeness'))
		}, 1000)

		this.createEffect(() => {
			console.log('values inside the element: ', this.count, this.name, this.doingSomething)
		})

		this.createEffect(() => {
			const interval = setInterval(() => this.count++, 1000)

			onCleanup(() => clearInterval(interval))
		})

		this.createEffect(() => {
			const timeout = setTimeout(() => {
				this.removeAttribute('count')
				console.log(' ---- JS prop after attribute removed:', this.count)
			}, 5000)

			onCleanup(() => clearTimeout(timeout))
		})
	}

	template = () => (
		<div>
			<h1>Count: {this.count}</h1>

			<h1 style={`color: ${this.color};`}>Name: {this.name}</h1>

			<h1>Doing something? {this.doingSomething ? 'true' : 'false'}</h1>

			<slot>
				<p>default slot's default content</p>
			</slot>

			<hr />

			<slot name="foo">
				<p>"foo" slot's default content</p>
			</slot>
		</div>
	)

	static css = /*css*/ `
		:host {
			margin: 20px;
		}

		div {
			border: 3px solid deeppink;
		}
	`

	bgColor = 'skyblue'

	css = /*css*/ `
		div {
			border-radius: 10px;
			background: ${this.bgColor};
			padding: 10px 20px;
		}
	`
}

// Hook up the type for use in DOM APIs
declare global {
	interface HTMLElementTagNameMap {
		'kitchen-sink': KitchenSink
	}
}

// Hook up the type for use in Solid JSX
declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements {
			'kitchen-sink': ElementAttributes<KitchenSink, KitchenSinkAttributes>
		}
	}
}
