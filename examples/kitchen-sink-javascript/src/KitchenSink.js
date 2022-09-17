// @ts-check
import {element, numberAttribute, stringAttribute, booleanAttribute, Element} from '@lume/element'
import html from 'solid-js/html'
import {createEffect} from 'solid-js'

// This example works (after the build script) in the latest version of all
// browsers (namely Safari 16.4+).

@element('kitchen-sink')
class KitchenSink extends Element {
	@numberAttribute count = 0
	@stringAttribute name = 'Baby Yoda'

	// Defines a reactive property "doingSomething" that corresponds to a
	// same-name but dashed-cased attribute "doing-something".
	@booleanAttribute doingSomething = false

	connectedCallback() {
		super.connectedCallback()

		this.countInterval = setInterval(() => this.count++, 1000)
		this.logValues()

		setTimeout(() => {
			this.removeAttribute('count')
			console.log(' ------------------------ JS prop after attribute removed:', this.count)
		}, 5000)
	}

	disconnectedCallback() {
		super.disconnectedCallback()
		clearInterval(this.countInterval)
	}

	logValues() {
		createEffect(() => {
			// Re-runs any time any of the attributes/properties change.
			console.log('values inside the element: ', this.count, this.name, this.doingSomething)
		})
	}

	template = () => html`
		<div>
			<h1>Count: ${() => this.count}</h1>
			<h1>Name: ${() => this.name}</h1>
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
}

export {KitchenSink}
