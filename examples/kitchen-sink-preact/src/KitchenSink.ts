import {attribute, element, Element} from '@lume/element'
import type {ReactElementAttributes} from '@lume/element/dist/framework-types/react.js'
import {onCleanup} from 'solid-js'
import html from 'solid-js/html'

type KitchenSinkAttributes = 'count' | 'name' | 'color' | 'doingSomething' | 'onawesomeness'

// We're using the non-decorator way of defining elements here to avoid the
// hassle of having to add decorator support to the default Preact Vite compiler
// setup.
export const KitchenSink = element('kitchen-sink')(
	class extends Element {
		static observedAttributeHandlers = {
			count: attribute.number(),
			name: attribute.string(),
			color: attribute.string(),
			doingSomething: attribute.boolean(),
			onawesomeness: attribute.event(),
		}

		count = 0
		name = 'Baby Yoda'
		color: 'red' | 'green' | 'blue' = 'red'

		// Defines a reactive property "doingSomething" that corresponds to a
		// same-name but dashed-cased attribute "doing-something".
		doingSomething = false

		onawesomeness: EventListener | null = null

		connectedCallback() {
			super.connectedCallback()

			// Dispatch an 'awesomeness' event after 1 second.
			setTimeout(() => {
				this.dispatchEvent(new Event('awesomeness'))
			}, 1000)

			this.createEffect(() => {
				// Re-runs any time any of the attributes/properties change.
				console.log('values inside the element: ', this.count, this.name, this.doingSomething)
			})

			this.createEffect(() => {
				const interval = setInterval(() => this.count++, 1000)

				onCleanup(() => clearInterval(interval))
			})

			this.createEffect(() => {
				const timeout = setTimeout(() => {
					this.removeAttribute('count')
					console.log(' ------------------------ JS prop after attribute removed:', this.count)
				}, 5000)

				onCleanup(() => clearTimeout(timeout))
			})
		}

		// We're writing the template with Solid `html` to avoid the hassle of
		// setting up Solid JSX for certain files alongside Preact JSX.
		// The best thing to do would be to write the element definitions in a
		// separate location compiled with Solid JSX rules (f.e. a separate
		// package altogether), and to have the Preact app import the elements.
		template = () => html`
			<div>
				<h1>Count: ${() => this.count}</h1>
				<h1 style=${() => `color: ${this.color};`}>Name: ${() => this.name}</h1>
				<h1>Doing something? ${() => (this.doingSomething ? 'true' : 'false')}</h1>
				<slot>
					<!-- This is the default location where children of the element
					are slotted to by default if a slot is not specified. -->

					<!-- This is fallback content if there are no default nodes to distribute. -->
					<p>default slot's default content</p>
				</slot>
				<hr />
				<slot name="foo">
					<!-- This is a named slot where children of this element are
					slotted to if those children have a slot="foo" attribute
					specifying the slot to slotted to. -->

					<!-- This is fallback content if there are no nodes to distribute to this particular slot. -->
					<p>"foo" slot's default content</p>
				</slot>
			</div>
		`

		/**
		 * Static styles get instantiated once per DOM root (Document or ShadowRoot)
		 * for all instances of the element. Interpoalting instance variables here
		 * won't work, but this is more performant than the css instance property.
		 */
		static css = /*css*/ `
			:host {
				margin: 20px;
			}

			div {
				border: 3px solid deeppink;
			}
		`

		bgColor = 'skyblue'

		/**
		 * This style is on the instances, instantiated once per instance and
		 * instance properties can be interpolated for unique styles per instance,
		 * but is less performant than the css property.
		 */
		css = /*css*/ `
			div {
				border-radius: 10px;
				background: ${this.bgColor};
				padding: 10px 20px;
			}
		`
	},
)

export type KitchenSink = InstanceType<typeof KitchenSink>

// Hook up the type for use in DOM APIs
declare global {
	interface HTMLElementTagNameMap {
		'kitchen-sink': KitchenSink
	}
}

// Hook up the type for use in React JSX
declare module 'react' {
	namespace JSX {
		interface IntrinsicElements {
			'kitchen-sink': ReactElementAttributes<KitchenSink, KitchenSinkAttributes>
		}
	}
}
