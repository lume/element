import {Element, element, reactive, autorun} from './index.js'
import html from './html.js'
import {attribute, AttributeHandler} from './attribute.js'

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

	it('templates with reactivity (with the html template string tag)', () => {
		@element('html-template')
		class MyEl extends Element {
			@reactive message = 'hello'
			@reactive count = 0
			template = () => html`<div count=${() => this.count}>${() => this.message}</div>`
			// TODO test prop:theCount once `html` supports the prop: namespace prefix.
			// html`<div count=${() => this.count} prop:theCount=${() => this.count}>${() => this.message}</div>`
		}

		const el = new MyEl() as any
		document.body.append(el)

		expect(el.root.children.length).toBe(2)
		// The first element is the style element that LumeElement creates
		expect(el.root.firstElementChild.tagName.toLowerCase()).toBe('style')
		// The DOM element returned from template()
		expect(el.root.lastElementChild.outerHTML).toBe('<div count="0">hello</div>')

		el.message = 'goodbye'
		el.count++

		expect(el.root.lastElementChild.outerHTML).toBe('<div count="1">goodbye</div>')
		// By default the template sets attributes on builtin elements, so the same-name prop is undefined.
		expect(el.root.lastElementChild.count).toBe(undefined)
		// The attribute has the value.
		expect(el.root.lastElementChild.getAttribute('count')).toBe('1')
		// TODO If the prop: prefix was used, then the template sets the JS property on the element. `html` doesn't have namespace prefixes yet.
		// expect(el.root.lastElementChild.theCount).toBe(1)

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
		expect(el.root.firstElementChild.tagName.toLowerCase()).toBe('style')
		expect(el.root.lastElementChild.outerHTML).toBe('<div count="0">hello</div>')

		el.message = 'goodbye'
		el.count++

		expect(el.root.lastElementChild.outerHTML).toBe('<div count="1">goodbye</div>')
		expect(el.root.lastElementChild.count).toBe(undefined)
		expect(el.root.lastElementChild.getAttribute('count')).toBe('1')
	})

	// TODO
	xit('TODO same as previous test, but using reactify() instead of @reactive')

	it('forgetting to use the @reactive, @element, or reactify() class decorator would cause a runtime error', () => {
		// This error is caused due to an issue with Babel's legacy decorators
		// making descriptors non-writable:
		// https://github.com/babel/babel/issues/12419
		//
		// Without the class decorators (or reactify), then the descriptors on
		// `this` will not be deleted (the reactive accessors will not be
		// unshadowed) and the properties that Babel placed on `this` are
		// non-writable.

		// @reactive <---- user forgets to use the class decorator, or forgets to use `reactify()`
		class MyEl extends Element {
			@reactive message = 'hello'
			@reactive count = 0
			template = () => html`<div count=${() => this.count}>${() => this.message}</div>`
		}

		customElements.define('html-template3', MyEl)

		const el = new MyEl() as any
		document.body.append(el)

		expect(el.root.children.length).toBe(2)
		expect(el.root.firstElementChild.tagName.toLowerCase()).toBe('style')
		expect(el.root.lastElementChild.outerHTML).toBe('<div count="0">hello</div>')

		const expectation = expect(() => {
			// Error writing to these properties
			el.message = 'goodbye'
			el.count++
		})

		// No longer the case because @lume/variable no longer sets descriptors
		// on prototypes, and requires a class decoraator to finalize the
		// reactivity implementation.
		// if (process.env.DECORATOR_CAUSES_NONWRITABLE_ERROR) expectation.toThrow()
		// else expectation.not.toThrow()

		expectation.not.toThrow()
	})

	// TODO
	xit('TODO attribute passing in templates')
	xit('TODO prop passing in templates')
	xit('TODO css prop')
	xit('TODO static css prop')

	// This sort of thing doesn't usually happen in end-user code, but moreso
	// during custom element upgrade processes during HTML parsing. Generally
	// speaking, an end user won't define a custom element class between
	// creating and using an element. Namely this ensures that frameworks (like
	// Solid which uses cloneNode to create nodes based on JSX templates) will
	// work because they set properties on elements before they are upgraded due
	// to the fact that cloneNode skips upgrade (the cloned node must
	// subsequently be connected to the DOM to get upgraded).
	it('initializes pre-upgrade properties by deleting them and re-assigning them after construction in a microtask, using @reactive', async () => {
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

			// TODO static readonly hasShadow = false

			// Use both decorators so that we ensure both features surive the element upgrade.
			@attribute foo = 3
			@reactive bar = 4
			@attribute baz: string | number = 5
			@reactive lorem = 6
			ipsum = 7
			@attribute ping = '123'
			@attribute pong = '123'
			@attribute beep = 'beep'
			@reactive boop = 'boop'
			@reactive bop = 'bop'

			__handleInitialPropertyValuesIfAny() {
				initialValuesHandled = true
				// @ts-ignore, private access
				super.__handleInitialPropertyValuesIfAny()
			}

			attributeChangedCallback(a: string, o: string | null, n: string | null) {
				attributeChangedCalled = true
				super.attributeChangedCallback?.(a, o, n)
			}
		}

		expect(initialValuesHandled).toBe(true)
		expect(attributeChangedCalled).toBe(true)

		// At this point, fooEl is now instanceof FooElement due to the Custom
		// Element upgrade process.
		expect(fooEl).toBeInstanceOf(FooElement)

		// Pre-upgrade values are in place thanks to the @element class decorator.
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

	// This test is equivalent to the previous one, but not using decorators.
	// This is what plain JS users would need to do.
	it('initializes pre-upgrade properties by deleting them and re-assigning them after construction in a microtask, no decorator syntax', async () => {
		const fooEl = document.createElement('foo-elemento') as FooElemento

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

		type FooElemento = InstanceType<typeof FooElemento>

		// const FooElemento = element(
		const FooElemento = element('foo-elemento')(
			// @ts-expect-error, overrides private base class method
			class FooElemento extends Element {
				// @ts-ignore, in case TS complains about overiding an accessor (valid JS)
				root = this

				// TODO static readonly hasShadow = false

				// When not using decorators, we have to do the following.
				static reactiveProperties: string[] = ['bar', 'lorem', 'boop', 'bop']

				// When not using decorators, we have to do the following.
				static observedAttributes: Record<string, AttributeHandler> = {
					foo: attribute.string(),
					baz: attribute.string(),
					ping: attribute.string(),
					pong: attribute.string(),
					beep: attribute.string(),
				}

				foo = 3
				bar = 4
				baz: string | number = 5
				lorem = 6
				ipsum = 7
				ping = '123'
				pong = '123'
				beep = 'beep'
				boop = 'boop'
				bop = 'bop'

				__handleInitialPropertyValuesIfAny() {
					initialValuesHandled = true
					// @ts-ignore, private access
					super.__handleInitialPropertyValuesIfAny()
				}

				attributeChangedCallback(attr: string, oldVal: string | null, newVal: string | null) {
					super.attributeChangedCallback?.(attr, oldVal, newVal)
					attributeChangedCalled = true
				}
			},
		)

		// This triggers the Custom Element upgrade process for fooEl.
		// customElements.define('foo-elemento', FooElemento)

		expect(initialValuesHandled).toBe(true, 'should have handled initial values (pre-deferral)')
		expect(attributeChangedCalled).toBe(true, 'should have handled initial attributes (pre-deferral)')

		// At this point, fooEl is now instanceof FooElement due to the Custom
		// Element upgrade process.
		expect(fooEl).toBeInstanceOf(FooElemento)

		// Pre-upgrade values are in place thanks to the @element class decorator.
		expect(fooEl.foo).toBe(1, 'pre-upgrade values should be in place 1')
		expect(fooEl.bar).toBe(2, 'pre-upgrade values should be in place 2')
		expect(fooEl.baz).toBe('3', 'pre-upgrade values should be in place 3')
		expect(fooEl.lorem).toBe(4, 'pre-upgrade values should be in place 4')
		expect(fooEl.ipsum).toBe(5, 'pre-upgrade values should be in place 5')
		expect(fooEl.getAttribute('baz')).toBe('3', 'pre-upgrade values should be in place 6')
		expect(fooEl.ping).toBe('ping', 'pre-upgrade values should be in place 7')
		expect(fooEl.getAttribute('ping')).toBe('ping', 'pre-upgrade values should be in place 8')
		expect(fooEl.pong).toBe('pong', 'pre-upgrade values should be in place 9')
		expect(fooEl.getAttribute('pong')).toBe('pong', 'pre-upgrade values should be in place 10')
		expect(fooEl.beep).toBe('beep', 'pre-upgrade values should be in place 11')
		// We haven't explicitly set the attribute, and props don't map back to
		// attributes (for performance). Use `setAttribute` if you intend to set
		// an attribute.
		expect(fooEl.getAttribute('beep')).toBe(null, 'pre-upgrade values should be in place 12')
		expect(fooEl.boop).toBe('boop', 'pre-upgrade values should be in place 13')
		expect(fooEl.getAttribute('boop')).toBe(null, 'pre-upgrade values should be in place 14')

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
		expect(count).toBe(5, 'reactivity should be triggered')

		expect(fooEl.foo).toBe(10, 'reactivity check 1')
		expect(fooEl.bar).toBe(20, 'reactivity check 2')
		expect(fooEl.lorem).toBe(30, 'reactivity check 3')
		expect(fooEl.ipsum).toBe(40, 'reactivity check 4')
		expect(fooEl.beep).toBe('bop', 'reactivity check 5')
		expect(fooEl.getAttribute('beep')).toBe('bop', 'reactivity check 6')
		expect(fooEl.bop).toBe('beep', 'reactivity check 7') // pre-upgrade value

		// defer to the next microtask
		await null

		expect(fooEl.foo).toBe(10, 'post-deferral check')
		expect(fooEl.bar).toBe(20, 'post-deferral check')
		expect(fooEl.baz).toBe('3', 'post-deferral check')
		expect(fooEl.lorem).toBe(30, 'post-deferral check')
		expect(fooEl.ipsum).toBe(40, 'post-deferral check')
		expect(fooEl.ping).toBe('ping', 'post-deferral check')
		expect(fooEl.pong).toBe('pong', 'post-deferral check')
		expect(fooEl.beep).toBe('bop', 'post-deferral check')
		expect(fooEl.getAttribute('beep')).toBe('bop', 'post-deferral check')
		expect(fooEl.boop).toBe('boop', 'post-deferral check')
		expect(fooEl.getAttribute('boop')).toBe(null, 'post-deferral check')
		// TODO test reactive var that wasn't set before the await
		expect(fooEl.bop).toBe(
			'beep',
			"reactive var that wasn't set before the await should have the pre-upgrade value",
		)

		// Regression fix: The initial prop handling process should not mess with the private
		// variables defined in the LumeElement class, and thus this expectation
		// should still hold after deferral.
		expect(fooEl.root).toBe(fooEl, 'LumeElement base class properties should be intact after upgrade')
	})

	xit(
		'TODO similar to the previous test, but instead of using @reactive + @element, using reactify() with customElements.define() for plain JS environments.',
	)
})
