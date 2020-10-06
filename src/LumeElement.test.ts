import {Element, element, reactive, autorun} from './index'
import {html as _html} from './html'

const html = _html as any

// TODO test reactify just to double check (it is already tested in @lume/variable)
// import {reactify} from './variable'

describe('LumeElement', () => {
	it('can be extended by custom element classes', () => {
		let count = 0

		@element('my-el')
		class MyEl extends Element {
			connectedCallback() {
				super.connectedCallback()
				count++
			}
		}

		document.body.append(new MyEl())
		expect(count).toBe(1)
	})

	it('creates an open shadow root by default (once connected)', () => {
		@element('has-shadow')
		class MyEl extends Element {}

		const el = new MyEl()
		expect(el.shadowRoot).toBe(null)
		document.body.append(el)
		expect(el.shadowRoot).toBeInstanceOf(ShadowRoot)
	})

	it("allows opting out of a shadow root by defining the 'root' property", () => {
		const attachShadow = Element.prototype.attachShadow
		let calls = 0

		Element.prototype.attachShadow = function (...args) {
			calls++
			return attachShadow.apply(this, args)
		}

		let div

		@element('no-shadow')
		class MyEl extends Element {
			get root() {
				return this
			}
			template = () => {
				div = document.createElement('div')
				div.id = 'div'
				return div
			}
		}

		const el = new MyEl()
		document.body.append(el)
		expect(el.shadowRoot).toBe(null)
		expect(calls).toBe(0)
		// @ts-ignore
		expect(el.querySelector('#div')).toBe(div)
	})

	it('it appends anything returned from template() to a ShadowRoot by default', () => {
		@element('append-template')
		class MyEl extends Element {
			template = () => {
				const div = document.createElement('div')
				div.innerText = 'hello'
				return div
			}
		}

		const el = new MyEl() as any
		document.body.append(el)

		expect(el.root.children.length).toBe(2)
		// The first element is the style element that LumeElement creates
		expect(el.root.firstElementChild.tagName.toLowerCase()).toBe('style')
		// The DOM element returned from template()
		expect(el.root.lastElementChild.outerHTML).toBe('<div>hello</div>')
	})

	it('templates with reactivity (no JSX here, but we assume that that is tested in Solid.js)', () => {
		@element('html-template')
		// TODO remove this reactive class decorator, and see if we can throw a
		// meaningful error instead of the error that happens due to not using
		// the class decorator (i.e. forgeting to use it).
		@reactive
		class MyEl extends Element {
			@reactive message = 'hello'
			@reactive count = 0
			template = () => html`<div count=${() => this.count}>${() => this.message}</div>`
		}

		const el = new MyEl() as any
		document.body.append(el)

		expect(el.root.children.length).toBe(2)
		// The first element is the style element that LumeElement creates
		expect(el.root.firstElementChild.tagName.toLowerCase()).toBe('style')
		// The DOM element returned from template()
		expect(el.root.lastElementChild.outerHTML).toBe('<div>hello</div>')

		el.message = 'goodbye'
		el.count++

		expect(el.root.lastElementChild.outerHTML).toBe('<div>goodbye</div>')
		// The html template sets a property, not an attribute (when an interpolation is used).
		expect(el.root.lastElementChild.count).toBe(1)
		expect(el.root.lastElementChild.getAttribute('count')).toBe(null)

		// TODO Test hyphenated attributes when upgraded to SOlid 0.20+.
		// expect(el.root.lastElementChild.getAttribute('the-count')).toBe('1')

		/**
		 * Simulate a click event.
		 * @public
		 * @param {Element} elem  the element to simulate a click on
		 */
		// var simulateClick = function (elem) {
		// 	// Create our event (with options)
		// 	var evt = new MouseEvent('click', {
		// 		bubbles: true,
		// 		cancelable: true,
		// 		view: window
		// 	});
		// 	// If cancelled, don't dispatch our event
		// 	var canceled = !elem.dispatchEvent(evt);
		// };
	})

	// TODO
	// test('attribute passing in templates')
	// test('prop passing in templates')
	// test('css prop')
	// test('static css prop')

	// This sort of thing doesn't usually happen in end-user code, but moreso
	// during custom element upgrade processes during HTML parsing. Generally
	// speaking, an end user won't define a custom element class between
	// creating and using an element. Namely this ensures that frameworks (like
	// Solid which uses cloneNode to create nodes based on JSX templates) will
	// work because they set properties on elements before they are upgraded due
	// to the fact that cloneNode skips upgrade (the cloned node must
	// subsequently be connected to the DOM to get upgraded).
	it('initializes pre-upgrade properties by deleting them and re-assigning them after construction', async () => {
		const fooEl = document.createElement('foo-element') as FooElement

		// fooEl is instanceof HTMLElement (not FooElement) at this point (ignore the type cast)
		expect(fooEl).toBeInstanceOf(HTMLElement)

		document.body.append(fooEl)

		fooEl.foo = 1
		fooEl.bar = 2

		let handled = false

		// This triggers the Custom Element upgrade process for fooEl.
		@element('foo-element')
		@reactive
		// @ts-ignore, funky stuff for testing
		class FooElement extends Element {
			@reactive foo = 3
			@reactive bar = 4

			__handleInitialPropertyValuesIfAny() {
				handled = true
				// @ts-ignore, private access
				super.__handleInitialPropertyValuesIfAny()
			}
		}

		expect(handled).toBe(true)

		// At this point, fooEl is now instanceof FooElement due to the Custom
		// Element upgrade process.
		expect(fooEl).toBeInstanceOf(FooElement)

		// The pre-upgrade values are not set until the next microtask, so at
		// this point the values are the ones from the class definition.
		expect(fooEl.foo).toBe(3)
		expect(fooEl.bar).toBe(4)

		// We normally do not want to use any elements when they are in this
		// state, but this autorun is for asserting that things are in the
		// awkwards state that they currently are at this point.
		let count = 0
		autorun(() => {
			fooEl.foo
			fooEl.bar
			count++
		})
		expect(count).toBe(1)
		fooEl.foo = 10
		fooEl.bar = 20
		expect(count).toBe(3)
		expect(fooEl.foo).toBe(10)
		expect(fooEl.bar).toBe(20)

		// defer to the next microtask
		await null

		// After the end of the macrotask, the pre-upgrade values will have been
		// set by code deferred in LumeElement's constructor.
		expect(fooEl.foo).toBe(1)
		expect(fooEl.bar).toBe(2)
	})
})
