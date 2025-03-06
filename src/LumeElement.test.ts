import {createEffect} from 'solid-js'
import html from 'solid-js/html'
import {reactive, signal, signalify} from 'classy-solid'
import {Element, element, type AttributeHandlerMap} from './index.js'
import {attribute, numberAttribute} from './decorators/attribute.js'

// TODO move type def to @lume/cli, map @types/jest's `expect` type into the
// global env.
declare global {
	function expect(...args: any[]): any
}

describe('LumeElement', () => {
	let els: HTMLElement[] = []

	afterEach(() => {
		for (const el of els) el.remove()
		els.length = 0
	})

	it('can be extended by custom element classes', () => {
		let count = 0

		@element('my-el')
		class MyEl extends Element {
			override connectedCallback() {
				super.connectedCallback()
				count++
			}
		}

		const el = new MyEl()
		els.push(el)

		document.body.append(el)
		expect(count).toBe(1)
	})

	it('creates an open shadow root by default (once connected)', () => {
		@element('has-shadow')
		class MyEl extends Element {}

		const el = new MyEl()
		els.push(el)
		expect(el.shadowRoot).toBe(null)
		document.body.append(el)
		expect(el.shadowRoot).toBeInstanceOf(ShadowRoot)
	})

	it('it appends anything returned from template() to a ShadowRoot by default', () => {
		@element('append-template')
		class MyEl extends Element {
			override template = () => {
				const div = document.createElement('div')
				div.innerText = 'hello'
				return div
			}
		}

		const el = new MyEl() as any
		els.push(el)
		document.body.append(el)

		expect(el.root.children.length).toBe(2)
		// The DOM element returned from template()
		expect(el.root.firstElementChild.outerHTML).toBe('<div>hello</div>')
		// The style element that LumeElement creates
		expect(el.root.lastElementChild.tagName.toLowerCase()).toBe('style')
	})

	it("allows opting out of a shadow root by defining the 'templateRoot' property", () => {
		const attachShadow = Element.prototype.attachShadow
		let calls = 0

		Element.prototype.attachShadow = function (...args) {
			calls++
			return attachShadow.apply(this, args)
		}

		let div

		@element('no-shadow')
		class MyEl extends Element {
			override get templateRoot() {
				return this
			}
			override template = () => {
				div = document.createElement('div')
				div.id = 'div'
				return div
			}
		}

		const el = new MyEl()
		els.push(el)
		document.body.append(el)
		expect(el.shadowRoot).toBe(null)
		expect(calls).toBe(0)
		// @ts-ignore
		expect(el.querySelector('#div')).toBe(div)

		Element.prototype.attachShadow = attachShadow
	})

	it('supports disabling the use of a ShadowRoot via hasShadow=false', () => {
		let div

		// opt out with hasShadow = false
		@element('no-shadow2')
		class NoShadow extends Element {
			override readonly hasShadow = false
			override template = () => {
				div = html`<div></div>`
				return div
			}
		}

		const el = new NoShadow()
		els.push(el)
		expect(el.shadowRoot).toBe(null)
		document.body.append(el)
		expect(el.shadowRoot).toBe(null)
		// @ts-expect-error protected
		expect(el.templateRoot).toBe(el)
		expect(el.root).toBe(el)
		// @ts-ignore
		expect(el.querySelector('div')).toBe(div)
	})

	it('allows options to be passed to attachShadow() via .shadowOptions', () => {
		const attachShadow = Element.prototype.attachShadow

		let options

		Element.prototype.attachShadow = function (opts, ...args) {
			return attachShadow.call(this, (options = opts), ...args)
		}

		let count = 0

		@element('shadow-options')
		class ShadowOptions extends Element {
			override shadowOptions: ShadowRootInit = {
				get mode() {
					count++
					return 'open' as ShadowRootMode
				},
				delegatesFocus: true,
				slotAssignment: 'manual',
				serializable: true,
			}
		}

		const el = new ShadowOptions()
		els.push(el)

		document.body.append(el)

		expect(count).toBe(1)
		expect(String(el.shadowRoot)).not.toBe('null')
		expect(options).toEqual({mode: 'open', delegatesFocus: true, slotAssignment: 'manual', serializable: true})

		el.remove()

		@element('shadow-options2')
		class ShadowOptions2 extends Element {
			override shadowOptions: ShadowRootInit = {
				get mode() {
					count++
					return 'closed' as ShadowRootMode
				},
				delegatesFocus: false,
				slotAssignment: 'named',
				serializable: false,
			}
		}

		const el2 = new ShadowOptions2()
		els.push(el2)

		document.body.append(el2)

		expect(count).toBe(2)
		expect(String(el2.shadowRoot)).toBe('null')
		expect(options).toEqual({mode: 'closed', delegatesFocus: false, slotAssignment: 'named', serializable: false})

		el2.remove()
	})

	// TODO: JSX support, a .tsx file should be compiled to .js, but currently
	// it is compiled to .jsx without JSX untouched.
	// it('templates with reactivity (with JSX syntax)', () => {
	// 	@element('jsx-template')
	// 	class MyEl extends Element {
	// 		@signal message = 'hello'
	// 		@signal count = 0
	// 		// @ts-expect-error we did not enable Solid JSX types in the test files, so it complains about a React JSX type
	// 		template = () => <div count={this.count}>{this.message}</div>
	// 	}

	// 	const el = new MyEl() as any
	// els.push(el)
	// 	document.body.append(el)

	// 	expect(el.root.children.length).toBe(2)
	// 	// The first element is the style element that LumeElement creates
	// 	expect(el.root.firstElementChild.tagName.toLowerCase()).toBe('style')
	// 	// The DOM element returned from template()
	// 	expect(el.root.lastElementChild.outerHTML).toBe('<div count="0">hello</div>')

	// 	el.message = 'goodbye'
	// 	el.count++

	// 	expect(el.root.lastElementChild.outerHTML).toBe('<div count="1">goodbye</div>')
	// 	// By default the template sets attributes on builtin elements, so the same-name prop is undefined.
	// 	expect(el.root.lastElementChild.count).toBe(undefined)
	// 	// The attribute has the value.
	// 	expect(el.root.lastElementChild.getAttribute('count')).toBe('1')
	// })

	it('templates with reactivity (with the html template string tag)', () => {
		@element('html-template')
		class MyEl extends Element {
			@signal message = 'hello'
			@signal count = 0
			override template = () => html`<div count=${() => this.count}>${() => this.message}</div>`
			// TODO test prop:theCount once `html` supports the prop: namespace prefix.
			// html`<div count=${() => this.count} prop:theCount=${() => this.count}>${() => this.message}</div>`
		}

		const el = new MyEl() as any
		els.push(el)
		document.body.append(el)

		expect(el.root.children.length).toBe(2)
		// The DOM element returned from template()
		expect(el.root.firstElementChild.outerHTML).toBe('<div count="0">hello</div>')
		// The style element that LumeElement creates
		expect(el.root.lastElementChild.tagName.toLowerCase()).toBe('style')

		el.message = 'goodbye'
		el.count++

		expect(el.root.firstElementChild.outerHTML).toBe('<div count="1">goodbye</div>')
		// By default the template sets attributes on builtin elements, so the same-name prop is undefined.
		expect(el.root.firstElementChild.count).toBe(undefined)
		// The attribute has the value.
		expect(el.root.firstElementChild.getAttribute('count')).toBe('1')
		// TODO If the prop: prefix was used, then the template sets the JS property on the element. `html` doesn't have namespace prefixes yet.
		// expect(el.root.firstElementChild.theCount).toBe(1)

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
			@signal message = 'hello'
			@signal count = 0
			override template = () => html`<div count=${() => this.count}>${() => this.message}</div>`
		}

		customElements.define('html-template2', MyEl)

		const el = new MyEl() as any
		els.push(el)
		document.body.append(el)

		expect(el.root.children.length).toBe(2)
		expect(el.root.firstElementChild.outerHTML).toBe('<div count="0">hello</div>')
		expect(el.root.lastElementChild.tagName.toLowerCase()).toBe('style')

		el.message = 'goodbye'
		el.count++

		expect(el.root.firstElementChild.outerHTML).toBe('<div count="1">goodbye</div>')
		expect(el.root.firstElementChild.count).toBe(undefined)
		expect(el.root.firstElementChild.getAttribute('count')).toBe('1')
	})

	it('same as previous test, but using signalify() instead of @reactive', () => {
		class MyEl extends Element {
			message = 'hello'
			count = 0
			constructor() {
				super()
				signalify(this, 'message', 'count')
			}
			override template = () => html`<div count=${() => this.count}>${() => this.message}</div>`
		}

		customElements.define('html-template2.5', MyEl)

		const el = new MyEl() as any
		els.push(el)
		document.body.append(el)

		expect(el.root.children.length).toBe(2)
		expect(el.root.firstElementChild.outerHTML).toBe('<div count="0">hello</div>')
		expect(el.root.lastElementChild.tagName.toLowerCase()).toBe('style')

		el.message = 'goodbye'
		el.count++

		expect(el.root.firstElementChild.outerHTML).toBe('<div count="1">goodbye</div>')
		expect(el.root.firstElementChild.count).toBe(undefined)
		expect(el.root.firstElementChild.getAttribute('count')).toBe('1')
	})

	it('forgetting to use @reactive, @element, or signalify() causes a runtime error', () => {
		// @reactive <---- user forgets to use the class decorator, or forgets to use `signalify()`
		class MyEl extends Element {
			@signal message = 'hello'
			@signal count = 0
			override template = () => html`<div count=${() => this.count}>${() => this.message}</div>`
		}

		customElements.define('html-template3', MyEl)

		// This class will throw when it detects an extraneous property due to
		// the previous class missing @reactive.
		expect(() => {
			@reactive
			class OtherClass {
				@signal foo = 123
			}

			new OtherClass()
		}).toThrow('Did you forget to use the `@reactive` decorator')

		const el = new MyEl() as any
		els.push(el)
		document.body.append(el)

		expect(el.root.children.length).toBe(2)
		expect(el.root.firstElementChild.outerHTML).toBe('<div count="0">hello</div>')
		expect(el.root.lastElementChild.tagName.toLowerCase()).toBe('style')

		const expectation = expect(() => {
			// Error writing to these properties
			el.message = 'goodbye'
			el.count++
		})

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
	it('initializes pre-upgrade properties by deleting them and re-assigning them after construction in a microtask, with decorator syntax', async () => {
		const fooEl = document.createElement('foo-element') as FooElement
		els.push(fooEl)

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

		let fooDescriptor = Object.getOwnPropertyDescriptor(fooEl, 'foo')
		let initialValuesHandled = !('value' in fooDescriptor!)
		let attributeChangedCalled = false

		// This triggers the Custom Element upgrade process for fooEl.
		@element('foo-element')
		class FooElement extends Element {
			// @ts-ignore, in case TS complains about overiding an accessor (valid JS)
			templateRoot = this

			// Use both types of decorators so that we ensure both features surive the element upgrade.
			@numberAttribute foo = 3
			@attribute foo2 = 3.5
			@attribute({default: true}) foo3: boolean | number = 3.6
			@signal bar = 4
			@attribute baz: string | number = 5
			@signal lorem = 6
			ipsum = 7
			@attribute ping = '123'
			@attribute pong = '123'
			@attribute beep = 'beep'
			@signal boop = 'boop'
			@signal bop = 'bop'

			override attributeChangedCallback(a: string, o: string | null, n: string | null) {
				attributeChangedCalled = true
				super.attributeChangedCallback?.(a, o, n)
			}
		}

		fooDescriptor = Object.getOwnPropertyDescriptor(fooEl, 'foo')
		initialValuesHandled = !('value' in fooDescriptor!)

		expect(initialValuesHandled).toBe(true, 'should have handled pre-upgrade values (they have accessor descriptors)')
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

		expect(fooEl.templateRoot).toBe(fooEl)

		fooEl.setAttribute('foo', '456')
		expect(fooEl.foo).toBe(456)
		fooEl.removeAttribute('foo')
		expect(fooEl.foo).toBe(3)

		expect(fooEl.foo2).toBe(3.5)
		fooEl.setAttribute('foo2', '456')
		expect(fooEl.foo2).toBe('456')
		fooEl.removeAttribute('foo2')
		expect(fooEl.foo2).toBe(3.5)

		expect(fooEl.foo3).toBe(3.6)
		fooEl.setAttribute('foo3', '456')
		expect(fooEl.foo3).toBe('456')
		fooEl.removeAttribute('foo3')
		expect(fooEl.foo3).toBe(true)

		let count = 0
		createEffect(() => {
			fooEl.foo // reactive
			fooEl.bar // reactive
			fooEl.baz // reactive
			fooEl.lorem // reactive
			fooEl.ipsum // Not tracked.
			fooEl.beep // reactive
			fooEl.boop // Not tracked.
			count++
		}) // run 1
		expect(count).toBe(1)

		fooEl.foo = 10 // run 2
		expect(count).toBe(2)
		fooEl.bar = 20 // run 3
		expect(count).toBe(3)
		fooEl.lorem = 30 // run 4
		expect(count).toBe(4)
		fooEl.ipsum = 40 // Does not trigger effects.
		expect(count).toBe(4)
		// Sets the prop via attributeChangedCallback, hence triggers effects.
		fooEl.setAttribute('beep', 'bop') // run 5

		// Reactivity with classy-solid currently triggers immediately (not a microtask).
		// If this expectation fails, check to make sure there are not duplicate solid-js libs.
		// TODO we want effects to run async in the next microtask (use this:
		// https://github.com/solidjs/solid/discussions/943#discussioncomment-6654607)).
		// But we can update this separately in a next step.
		//
		// await null
		expect(count).toBe(5, 'reactivity should be triggered')

		expect(fooEl.foo).toBe(10)
		expect(fooEl.bar).toBe(20)
		expect(fooEl.lorem).toBe(30)
		expect(fooEl.ipsum).toBe(40)
		expect(fooEl.beep).toBe('bop')
		expect(fooEl.getAttribute('beep')).toBe('bop')
		expect(fooEl.bop).toBe('beep') // pre-upgrade value

		// defer to the next microtask
		await null

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
		expect(fooEl.bop).toBe('beep', "reactive var that wasn't set before the await should have the pre-upgrade value")

		// Regression fix: The initial prop handling process should not mess with the private
		// variables defined in the LumeElement class, and thus this expectation
		// should still hold after deferral.
		expect(fooEl.templateRoot).toBe(fooEl)

		// TODO also test that unshadowing of pre-upgrade properties works in
		// subclasses of a direct subclass of LumeElement.
	})

	// This test is equivalent to the previous one, but not using decorators.
	// This is what plain JS users would need to do.
	it('initializes pre-upgrade properties by deleting them and re-assigning them after construction in a microtask, no decorator syntax', async () => {
		const fooEl = document.createElement('foo-elemento') as FooElemento
		els.push(fooEl)

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

		let fooDescriptor = Object.getOwnPropertyDescriptor(fooEl, 'foo')
		let initialValuesHandled = !('value' in fooDescriptor!)
		let attributeChangedCalled = false

		expect(initialValuesHandled).toBe(false, 'pre-upgrade properties are plain properties')

		type FooElemento = InstanceType<typeof FooElemento>

		// const FooElemento = element(
		const FooElemento = element('foo-elemento')(
			class FooElemento extends Element {
				// @ts-ignore, in case TS complains about overiding an accessor (valid JS)
				templateRoot = this

				// When not using decorators, we can define the reactive attributes like this instead.
				static override observedAttributeHandlers: AttributeHandlerMap = {
					foo: attribute.string(),
					baz: attribute.string(),
					ping: attribute.string(),
					pong: attribute.string(),
					beep: attribute.string(),
				}

				foo = 3
				bar = 4 //
				baz: string | number = 5
				lorem = 6 //
				ipsum = 7
				ping = '123'
				pong = '123'
				beep = 'beep'
				boop = 'boop' //
				bop = 'bop' //

				constructor() {
					super()

					// When not using decorators, we have to do the following for non-attribute properties.
					signalify(this, 'bar', 'lorem', 'boop', 'bop')
				}

				override attributeChangedCallback(attr: string, oldVal: string | null, newVal: string | null) {
					super.attributeChangedCallback?.(attr, oldVal, newVal)
					attributeChangedCalled = true
				}
			},
		)

		// We need this in non-decorator usage mode because the element in that
		// case is defined in the next microtask.
		await customElements.whenDefined('foo-elemento')

		// This triggers the Custom Element upgrade process for fooEl.
		// customElements.define('foo-elemento', FooElemento)

		fooDescriptor = Object.getOwnPropertyDescriptor(fooEl, 'foo')
		initialValuesHandled = !('value' in fooDescriptor!)

		expect(initialValuesHandled).toBe(true, 'should have handled pre-upgrade values (they have accessor descriptors)')
		expect(attributeChangedCalled).toBe(true, 'should have handled initial attributes')

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

		expect(fooEl.templateRoot).toBe(fooEl)

		let count = 0
		createEffect(() => {
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

		fooEl.foo = 10 // run 2
		expect(count).toBe(2)
		fooEl.bar = 20 // run 3
		expect(count).toBe(3)
		fooEl.lorem = 30 // run 4
		expect(count).toBe(4)
		fooEl.ipsum = 40 // Does not trigger effects.
		expect(count).toBe(4)
		// Sets the prop via attributeChangedCallback, hence triggers effects.
		fooEl.setAttribute('beep', 'bop') // run 5

		// Reactivity with classy-solid currently triggers immediately (not a microtask).
		// If this expectation fails, check to make sure there are not duplicate solid-js libs.
		// TODO we want effects to run async in the next microtask (use this:
		// https://github.com/solidjs/solid/discussions/943#discussioncomment-6654607)).
		// But we can update this separately in a next step.
		//
		// await null
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
		expect(fooEl.bop).toBe('beep', "reactive var that wasn't set before the await should have the pre-upgrade value")

		// Regression fix: The initial prop handling process should not mess with the private
		// variables defined in the LumeElement class, and thus this expectation
		// should still hold after deferral.
		expect(fooEl.templateRoot).toBe(fooEl, 'LumeElement base class properties should be intact after upgrade')
	})

	xit(
		'TODO similar to the previous test, but instead of using @reactive + @element, using signalify() with customElements.define() for plain JS environments.',
	)

	it('ensure wrapped @reactive decorator still automatically does not track reactivity in constructors', () => {
		@element
		class Foo extends Element {
			@attribute amount = 3
		}

		// previously caused an infinite constructor loop
		@element('no-loop')
		class Bar extends Foo {
			@attribute double = 0

			constructor() {
				super()
				this.double = this.amount * 2 // this read of .amount should not be tracked
			}
		}

		let b: Bar
		let count = 0

		function noLoop() {
			createEffect(() => {
				b = new Bar() // this should not track
				els.push(b)
				count++
			})
		}

		expect(noLoop).not.toThrow()
		expect(count).toBe(1)

		const b2 = b!

		b!.amount = 4 // hence this should not trigger

		// If the effect ran only once initially, not when setting b.colors,
		// then both variables should reference the same instance
		expect(b!).toBe(b2)
		expect(count).toBe(1)
	})

	it('ensure wrapped @reactive decorator still automatically does not track reactivity in constructors even when not the root most decorator', () => {
		@element
		class Foo extends Element {
			@attribute amount = 3
		}

		function someOtherDecorator(Class: any, _context: any): any {
			return class Foo extends Class {}
		}

		@someOtherDecorator
		@element
		class Bar extends Foo {
			@attribute double = 0

			constructor() {
				super()
				this.double = this.amount * 2 // this read of .amount should not be tracked
			}
		}

		customElements.define('no-loop2', Bar)

		let b: Bar
		let count = 0

		function noLoop() {
			createEffect(() => {
				b = new Bar() // this should not track
				els.push(b)
				count++
			})
		}

		expect(noLoop).not.toThrow()

		const b2 = b!

		b!.amount = 4 // hence this should not trigger

		// If the effect ran only once initially, not when setting b.colors,
		// then both variables should reference the same instance
		expect(b!).toBe(b2)
		expect(count).toBe(1)
	})

	it('allows manually calling defineElement on a class to define it a name or its default name, or to give it multiple names', () => {
		const name1 = 'manual-el'
		@element(name1, false)
		class ManualEl extends Element {}

		const el = document.createElement(name1)
		els.push(el)
		document.body.append(el)

		expect(el).not.toBeInstanceOf(ManualEl)

		ManualEl.defineElement()
		ManualEl.defineElement() // no error

		expect(el).toBeInstanceOf(ManualEl)
		expect(el.tagName.toLowerCase()).toBe(ManualEl.elementName)
		expect(el.tagName.toLowerCase()).toBe(name1)

		const name2 = 'manual-el2'
		const el2 = document.createElement(name2)
		els.push(el2)
		document.body.append(el2)

		const ManualEl2 = ManualEl.defineElement(name2) as typeof ManualEl
		ManualEl.defineElement(name2) // no error
		ManualEl2.defineElement(name2) // no error

		expect(el2).toBeInstanceOf(ManualEl)
		expect(el2).toBeInstanceOf(ManualEl2)
		expect(el2.tagName.toLowerCase()).toBe(ManualEl2.elementName)
		expect(el2.tagName.toLowerCase()).toBe((el2.constructor as typeof Element).elementName)
		expect(el2.tagName.toLowerCase()).toBe(name2)

		// TODO test scoped registries once those are out in browsers.
		// const registry = new CustomElementRegistry()
	})

	it('cleans up its root instance and shared styles when no ShadowRoot is used', () => {
		@element('style-cleanup')
		class StyleCleanup extends Element {
			override readonly hasShadow = false
			override template = () => html`<div></div>`
			static override css = `div {color: red}`
			override css = `div {color: blue}`
		}

		const el = new StyleCleanup()
		const el2 = new StyleCleanup()
		els.push(el, el2)

		expect(document.querySelectorAll('style').length).toBe(0)

		document.body.append(el)

		// There is one static style shared between all elements of the same
		// class, and one instance style for each element.
		expect(document.querySelectorAll('style').length).toBe(2)

		document.body.append(el2)

		// Added one style for the element instance.
		expect(document.querySelectorAll('style').length).toBe(3)

		el.remove()

		// Removed one style for the removed element instance.
		expect(document.querySelectorAll('style').length).toBe(2)

		el2.remove()

		// Removed a style for the removed element instance, and the shared
		// static style is removed because there are no more instances of the
		// element.
		expect(document.querySelectorAll('style').length).toBe(0)
	})
})
