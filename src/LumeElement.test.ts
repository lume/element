import {Element, element, reactive, autorun} from './index'
import {html as _html} from './html'
import {attribute} from './attribute'

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

		// TODO Test hyphenated attributes when upgraded to Solid 0.20+.
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

	it('same as previous test, but @reactive is required if @element is not used', () => {
		@reactive
		class MyEl extends Element {
			@reactive message = 'hello'
			@reactive count = 0
			template = () => html`<div count=${() => this.count}>${() => this.message}</div>`
		}

		customElements.define('html-template2', MyEl)

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
	it('initializes pre-upgrade properties by deleting them and re-assigning them after construction in a microtask', async () => {
		const fooEl = document.createElement('foo-element') as FooElement

		// fooEl is instanceof HTMLElement (not FooElement) at this point (ignore the type cast)
		expect(fooEl).toBeInstanceOf(HTMLElement)

		document.body.append(fooEl)

		fooEl.foo = 1
		fooEl.bar = 2
		fooEl.setAttribute('baz', '3')
		fooEl.lorem = 4
		fooEl.ipsum = 5
		fooEl.ping = '456'
		fooEl.setAttribute('ping', 'ping')
		fooEl.pong = '456'
		fooEl.setAttribute('pong', 'pong')
		fooEl.bop = 'beep'

		let initialValuesHandled = false
		let attributeChangedCalled = false

		// This triggers the Custom Element upgrade process for fooEl.
		@element('foo-element')
		// @ts-ignore, ignore type error for testing
		class FooElement extends Element {
			// @ts-ignore, in case TS complains about overiding an accessor (valid JS)
			root = this

			static readonly hasShadow = false

			// Use both decorators so that we ensure both features surive the element upgrade.
			@reactive @attribute foo = 3
			@reactive bar = 4
			@reactive @attribute baz: string | number = 5
			@reactive lorem = 6
			ipsum = 7
			@attribute ping = '123'
			@reactive @attribute pong = '123'
			@reactive @attribute beep = 'beep'
			@reactive boop = 'boop'
			@reactive bop = 'bop'

			__handleInitialPropertyValuesIfAny() {
				initialValuesHandled = true
				// @ts-ignore, private access
				super.__handleInitialPropertyValuesIfAny()
			}

			attributeChangedCallback(a: string, o: string | null, n: string | null) {
				attributeChangedCalled = true
				super.attributeChangedCallback && super.attributeChangedCallback(a, o, n)
			}
		}

		expect(initialValuesHandled).toBe(true)
		expect(attributeChangedCalled).toBe(true)

		// At this point, fooEl is now instanceof FooElement due to the Custom
		// Element upgrade process.
		expect(fooEl).toBeInstanceOf(FooElement)

		// Pre-upgrade values are in place thanks to the @element class decorator.
		// TODO make tests for pre-upgrade values without use of the @element class decorator.
		expect(fooEl.foo).toBe(1)
		expect(fooEl.bar).toBe(2)
		expect(fooEl.baz).toBe('3')
		expect(fooEl.lorem).toBe(4)
		expect(fooEl.ipsum).toBe(5, 'non decorated properties should get pre-upgrade values too')
		expect(fooEl.getAttribute('baz')).toBe('3')
		expect(fooEl.ping).toBe('ping')
		expect(fooEl.getAttribute('ping')).toBe('ping')
		expect(fooEl.pong).toBe('pong')
		expect(fooEl.getAttribute('pong')).toBe('pong')
		expect(fooEl.beep).toBe('beep')
		// We haven't explicitly set the attribute, and props don't map back to
		// attributes (for performance). Use `setAttribute` if you intend to set
		// an attribute.
		expect(fooEl.getAttribute('beep')).toBe(null)
		expect(fooEl.boop).toBe('boop')
		expect(fooEl.getAttribute('boop')).toBe(null)

		expect(fooEl.root).toBe(fooEl)

		let count = 0
		autorun(() => {
			fooEl.foo
			fooEl.bar
			fooEl.baz
			fooEl.lorem
			fooEl.ipsum // Not tracked.
			fooEl.beep
			fooEl.boop // Not tracked.
			count++
		})
		expect(count).toBe(1)

		fooEl.foo = 10
		fooEl.bar = 20
		fooEl.lorem = 30
		fooEl.ipsum = 40 // Does not trigger autorun.
		// Sets the prop via attributeChangedCallback, hence triggers an autorun.
		fooEl.setAttribute('beep', 'bop')
		expect(count).toBe(5)

		expect(fooEl.foo).toBe(10)
		expect(fooEl.bar).toBe(20)
		expect(fooEl.lorem).toBe(30)
		expect(fooEl.ipsum).toBe(40)
		expect(fooEl.beep).toBe('bop')
		expect(fooEl.getAttribute('beep')).toBe('bop')
		expect(fooEl.bop).toBe('beep') // pre-upgrade value

		// defer to the next microtask
		await null

		// TODO: Test these without use of the @element decorator.
		expect(fooEl.foo).toBe(10)
		expect(fooEl.bar).toBe(20)
		expect(fooEl.baz).toBe('3')
		expect(fooEl.lorem).toBe(30)
		expect(fooEl.ipsum).toBe(40)
		expect(fooEl.ping).toBe('ping')
		expect(fooEl.pong).toBe('pong')
		expect(fooEl.beep).toBe('bop')
		expect(fooEl.getAttribute('beep')).toBe('bop')
		expect(fooEl.boop).toBe('boop')
		expect(fooEl.getAttribute('boop')).toBe(null)
		// TODO test reactive var that wasn't set before the await
		expect(fooEl.bop).toBe(
			'beep',
			"reactive var that wasn't set before the await should have the pre-upgrade value",
		)

		// Regression fix: The initial prop handling process should not mess with the private
		// variables defined in the LumeElement class, and thus this expectation
		// should still hold after deferral.
		expect(fooEl.root).toBe(fooEl)

		// TODO also test that unshadowing of pre-upgrade properties works in
		// subclasses of a direct subclass of LumeElement.
	})
})
