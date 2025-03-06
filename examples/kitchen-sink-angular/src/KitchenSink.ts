import {element, numberAttribute, stringAttribute, booleanAttribute, Element, eventAttribute} from '@lume/element'
import {onCleanup} from 'solid-js'
import html from 'solid-js/html'

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
	@eventAttribute onawesomeness!: ((event: MouseEvent) => void) | null

	override connectedCallback() {
		super.connectedCallback()

		setTimeout(() => {
			this.dispatchEvent(new MouseEvent('awesomeness'))
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

	// We're writing the template with Solid `html` to avoid having the hassle
	// of adding Solid JSX support in the Angular project.
	// The best thing to do would be to write the element definitions in a
	// separate location compiled with Solid JSX rules (f.e. a separate package
	// altogether), and to have the Angular app import the elements.
	override template = () => html`
		<div>
			<h1>Count: ${() => this.count}</h1>

			<h1 style=${() => `color: ${this.color};`}>Name: ${() => this.name}</h1>

			<h1>Doing something? ${() => (this.doingSomething ? 'true' : 'false')}</h1>

			<slot>
				<p>default slot's default content</p>
			</slot>

			<hr />

			<slot name="foo">
				<p>"foo" slot's default content</p>
			</slot>
		</div>
	`

	static override css = /*css*/ `
		:host {
			margin: 20px;
		}

		div {
			border: 3px solid deeppink;
		}
	`

	bgColor = 'skyblue'

	override css = /*css*/ `
		div {
			border-radius: 10px;
			background: ${this.bgColor};
			padding: 10px 20px;
		}
	`
}

// Type checking in angular is limited to only knowing the custom element tag
// names (from HTMLElementTagNameMap), but there is no way to provide types of
// template props for type checking. For now, this is the best we can do.
// https://github.com/angular/angular/issues/58483
declare global {
	interface HTMLElementTagNameMap {
		'kitchen-sink': KitchenSink
	}
}
