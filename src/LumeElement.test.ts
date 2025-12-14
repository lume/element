import {createEffect} from 'solid-js'
import html from 'solid-js/html'
import {effect, memo, signal, signalify} from 'classy-solid'
import {Element, element, type AttributeHandlerMap} from './index.js'
import {attribute, classFinishers__, numberAttribute} from './decorators/attribute.js'

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
			override template = () =>
				html`<div count=${() => this.count} prop:theCount=${() => this.count}>${() => this.message}</div>`
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
		expect(el.root.firstElementChild.theCount).toBe(1)
	})

	it('same as previous test, but @reactive is (no longer) required if @element is not used', () => {
		// @reactive // no longer required in latest classy-solid
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

	it('same as previous test, but using signalify() instead of @signal', () => {
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

	describe('invalid usages', () => {
		it('throws when forgetting to use @element on a single class', () => {
			expect(() => {
				// @element <---- user forgets to use the class decorator
				class ElWithoutDeco extends Element {
					@attribute money = 1_000_000
				}

				customElements.define('el-without-deco', ElWithoutDeco)

				// document.createElement('el-without-deco') // this catches and emits the error, prevents regular try-catch from working (i.e. the test will not see the error)
				new ElWithoutDeco() // so we test with direct construction instead
			}).toThrowError('Make sure the @element decorator is used on any class that also uses @attribute decorators.')

			classFinishers__.length = 0 // reset class finishers to avoid polluting other tests
		})

		it('throws when forgetting to use @element on a base class', () => {
			expect(() => {
				// @element <---- user does not use the class decorator
				class MyEl extends Element {
					@attribute money = 1_000_000
				}

				@element
				class SubEl extends MyEl {
					@attribute moreMoney = 2_000_000
				}

				SubEl

				document.createElement('sub-el')
			}).toThrowError('Make sure the @element decorator is used on any class that also uses @attribute decorators.')

			classFinishers__.length = 0 // reset class finishers to avoid polluting other tests
		})

		it('throws when forgetting to use @element on a leaf class', () => {
			expect(() => {
				@element
				class BaseEl extends Element {
					@attribute money = 1_000_000
				}

				// @element <---- user does not use the class decorator
				class SubEl2 extends BaseEl {
					@attribute moreMoney = 2_000_000
				}

				customElements.define('sub-el2', SubEl2)

				// document.createElement('sub-el2') // this catches and emits the error, prevents regular try-catch from working (i.e. the test will not see the error)
				new SubEl2() // so we test with direct construction instead
			}).toThrowError('Make sure the @element decorator is used on any class that also uses @attribute decorators.')

			classFinishers__.length = 0 // reset class finishers to avoid polluting other tests
		})

		it('(no longer) causes runtime errors when forgetting to use @element', () => {
			// @element <---- user does not use the class decorator
			class MyEl extends Element {
				@signal message = 'hello'
				@signal count = 0
				override template = () => html`<div count=${() => this.count}>${() => this.message}</div>`
			}

			customElements.define('html-template3', MyEl)

			// This class used to throw due to the previous class missing @element
			// (which was composed with classy-solid's no-longer-needed @reactive decorator).
			expect(() => {
				// @reactive // no longer required in latest classy-solid
				class OtherClass {
					@signal foo = 123
				}

				new OtherClass()
			}).not.toThrow()

			const el = new MyEl() as any
			els.push(el)
			document.body.append(el)

			expect(el.root.children.length).toBe(2)
			expect(el.root.firstElementChild.outerHTML).toBe('<div count="0">hello</div>')
			expect(el.root.lastElementChild.tagName.toLowerCase()).toBe('style')
		})
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
	it('initializes pre-upgrade properties by deleting them and re-assigning them after construction, with decorator syntax', async () => {
		const el = document.createElement('foo-element') as FooElement
		els.push(el)

		expect(customElements.get('foo-element') === undefined).toBe(true)
		// fooEl is instanceof HTMLElement (not FooElement) at this point (ignore the above type cast)
		expect(el).toBeInstanceOf(HTMLElement)

		document.body.append(el)

		el.foo = 1
		el.bar = 2
		el.setAttribute('baz', '3')
		el.lorem = 4
		el.ipsum = 5
		el.ping = '456'
		el.setAttribute('ping', 'ping')
		el.pong = '456'
		el.setAttribute('pong', 'pong')
		el.bop = 'beep'

		let fooDescriptor = Object.getOwnPropertyDescriptor(el, 'foo')
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

		fooDescriptor = Object.getOwnPropertyDescriptor(el, 'foo')
		initialValuesHandled = !('value' in fooDescriptor!)

		expect(initialValuesHandled).toBe(true, 'should have handled pre-upgrade values (they have accessor descriptors)')
		expect(attributeChangedCalled).toBe(true)

		expect(customElements.get('foo-element')).toBe(FooElement)
		// At this point, fooEl is now instanceof FooElement due to the Custom
		// Element upgrade process.
		expect(el).toBeInstanceOf(FooElement)

		// Pre-upgrade values are in place thanks to the @element class decorator.
		expect(el.foo).toBe(1)
		expect(el.bar).toBe(2)
		expect(el.baz).toBe('3')
		expect(el.lorem).toBe(4)
		expect(el.ipsum).toBe(5, 'non decorated properties should get pre-upgrade values too')
		expect(el.getAttribute('baz')).toBe('3')
		expect(el.ping).toBe('ping')
		expect(el.getAttribute('ping')).toBe('ping')
		expect(el.pong).toBe('pong')
		expect(el.getAttribute('pong')).toBe('pong')
		expect(el.beep).toBe('beep')
		// We haven't explicitly set the attribute, and props don't map back to
		// attributes (for performance). Use `setAttribute` if you intend to set
		// an attribute.
		expect(el.getAttribute('beep')).toBe(null)
		expect(el.boop).toBe('boop')
		expect(el.getAttribute('boop')).toBe(null)

		expect(el.templateRoot).toBe(el)

		el.setAttribute('foo', '456')
		expect(el.foo).toBe(456)
		el.removeAttribute('foo')
		expect(el.foo).toBe(3)

		expect(el.foo2).toBe(3.5)
		el.setAttribute('foo2', '456')
		expect(el.foo2).toBe('456')
		el.removeAttribute('foo2')
		expect(el.foo2).toBe(3.5)

		expect(el.foo3).toBe(3.6)
		el.setAttribute('foo3', '456')
		expect(el.foo3).toBe('456')
		el.removeAttribute('foo3')
		expect(el.foo3).toBe(true)

		let count = 0
		createEffect(() => {
			el.foo // reactive
			el.bar // reactive
			el.baz // reactive
			el.lorem // reactive
			el.ipsum // Not tracked.
			el.beep // reactive
			el.boop // Not tracked.
			count++
		}) // run 1
		expect(count).toBe(1)

		el.foo = 10 // run 2
		expect(count).toBe(2)
		el.bar = 20 // run 3
		expect(count).toBe(3)
		el.lorem = 30 // run 4
		expect(count).toBe(4)
		el.ipsum = 40 // Does not trigger effects.
		expect(count).toBe(4)
		// Sets the prop via attributeChangedCallback, hence triggers effects.
		el.setAttribute('beep', 'bop') // run 5

		expect(count).toBe(5, 'reactivity should be triggered')

		expect(el.foo).toBe(10)
		expect(el.bar).toBe(20)
		expect(el.lorem).toBe(30)
		expect(el.ipsum).toBe(40)
		expect(el.beep).toBe('bop')
		expect(el.getAttribute('beep')).toBe('bop')
		expect(el.bop).toBe('beep') // pre-upgrade value

		// previously pre-upgrade worked with a microtask, but that is no longer
		// needed, ensure things still work.
		await null
		expect(el.foo).toBe(10)
		expect(el.bar).toBe(20)
		expect(el.baz).toBe('3')
		expect(el.lorem).toBe(30)
		expect(el.ipsum).toBe(40)
		expect(el.ping).toBe('ping')
		expect(el.pong).toBe('pong')
		expect(el.beep).toBe('bop')
		expect(el.getAttribute('beep')).toBe('bop')
		expect(el.boop).toBe('boop')
		expect(el.getAttribute('boop')).toBe(null)
		// TODO test reactive var that wasn't set before the await
		expect(el.bop).toBe('beep', "reactive var that wasn't set before the await should have the pre-upgrade value")

		// Regression fix: The initial prop handling process should not mess with the private
		// variables defined in the LumeElement class, and thus this expectation
		// should still hold after deferral.
		expect(el.templateRoot).toBe(el)

		////////////////
		// Basic test that unshadowing of pre-upgrade properties works in
		// subclasses of a direct subclass of LumeElement.
		const subEl = document.createElement('foo-element-subclass') as FooElementSubclass

		expect(customElements.get('foo-element-subclass') === undefined).toBe(true)
		expect(subEl).toBeInstanceOf(HTMLElement)

		document.body.append(subEl)
		els.push(subEl)

		subEl.subProp = 'pre-upgrade'

		@element('foo-element-subclass')
		class FooElementSubclass extends FooElement {
			@attribute subProp = 'initializer'

			constructor() {
				super()
				expect(subEl.subProp).toBe(
					'initializer',
					'subProp should still be the initializer value in the subclass constructor',
				)
			}
		}

		expect(customElements.get('foo-element-subclass')).toBe(FooElementSubclass)
		expect(subEl).toBeInstanceOf(FooElementSubclass)
		expect(subEl.subProp).toBe('pre-upgrade', 'should have the pre-upgrade value in the subclass instance')
	})

	// This test is equivalent to the previous one, but not using decorators.
	// This is what plain JS users would need to do.
	it('initializes pre-upgrade properties by deleting them and re-assigning them after construction, no decorator syntax', async () => {
		const el = document.createElement('foo-elemento') as FooElemento
		els.push(el)

		expect(customElements.get('foo-elemento') === undefined).toBe(true)
		// fooEl is instanceof HTMLElement (not FooElement) at this point (ignore the type cast)
		expect(el).toBeInstanceOf(HTMLElement)

		document.body.append(el)

		el.foo = 1
		el.bar = 2
		el.setAttribute('baz', '3')
		el.lorem = 4
		el.ipsum = 5
		el.ping = '456'
		el.setAttribute('ping', 'ping')
		el.pong = '456'
		el.setAttribute('pong', 'pong')
		el.bop = 'beep'

		let fooDescriptor = Object.getOwnPropertyDescriptor(el, 'foo')
		let initialValuesHandled = !('value' in fooDescriptor!)
		let attributeChangedCalled = false

		expect(initialValuesHandled).toBe(false, 'pre-upgrade properties are plain properties')

		type FooElemento = InstanceType<typeof FooElemento>

		const FooElemento = element(
			class FooElemento extends Element {
				// @ts-expect-error, TS complains about overiding an accessor (totally valid in plain JS)
				override templateRoot = this

				// When not using decorators, we can define the reactive attributes like this instead.
				static override observedAttributeHandlers: AttributeHandlerMap = {
					foo: attribute.string,
					baz: attribute.string,
					ping: attribute.string,
					pong: attribute.string,
					beep: attribute.string,
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

		fooDescriptor = Object.getOwnPropertyDescriptor(el, 'foo')
		initialValuesHandled = !('value' in fooDescriptor!)

		expect(initialValuesHandled).toBe(true, 'should have handled pre-upgrade values (they have accessor descriptors)')
		expect(attributeChangedCalled).toBe(true, 'should have handled initial attributes')

		expect(customElements.get('foo-elemento')).toBe(FooElemento)
		// At this point, fooEl is now instanceof FooElement due to the Custom
		// Element upgrade process.
		expect(el).toBeInstanceOf(FooElemento)

		// Pre-upgrade values are in place thanks to the @element class decorator.
		expect(el.foo).toBe(1, 'pre-upgrade values should be in place 1')
		expect(el.bar).toBe(2, 'pre-upgrade values should be in place 2')
		expect(el.baz).toBe('3', 'pre-upgrade values should be in place 3')
		expect(el.lorem).toBe(4, 'pre-upgrade values should be in place 4')
		expect(el.ipsum).toBe(5, 'pre-upgrade values should be in place 5')
		expect(el.getAttribute('baz')).toBe('3', 'pre-upgrade values should be in place 6')
		expect(el.ping).toBe('ping', 'pre-upgrade values should be in place 7')
		expect(el.getAttribute('ping')).toBe('ping', 'pre-upgrade values should be in place 8')
		expect(el.pong).toBe('pong', 'pre-upgrade values should be in place 9')
		expect(el.getAttribute('pong')).toBe('pong', 'pre-upgrade values should be in place 10')
		expect(el.beep).toBe('beep', 'pre-upgrade values should be in place 11')
		// We haven't explicitly set the attribute, and props don't map back to
		// attributes (for performance). Use `setAttribute` if you intend to set
		// an attribute.
		expect(el.getAttribute('beep')).toBe(null, 'pre-upgrade values should be in place 12')
		expect(el.boop).toBe('boop', 'pre-upgrade values should be in place 13')
		expect(el.getAttribute('boop')).toBe(null, 'pre-upgrade values should be in place 14')

		expect(el.templateRoot).toBe(el)

		let count = 0
		createEffect(() => {
			el.foo
			el.bar
			el.baz
			el.lorem
			el.ipsum // Not tracked.
			el.beep
			el.boop // Not tracked.
			count++
		})
		expect(count).toBe(1)

		el.foo = 10 // run 2
		expect(count).toBe(2)
		el.bar = 20 // run 3
		expect(count).toBe(3)
		el.lorem = 30 // run 4
		expect(count).toBe(4)
		el.ipsum = 40 // Does not trigger effects.
		expect(count).toBe(4)
		// Sets the prop via attributeChangedCallback, hence triggers effects.
		el.setAttribute('beep', 'bop') // run 5

		expect(count).toBe(5, 'reactivity should be triggered')

		expect(el.foo).toBe(10, 'reactivity check 1')
		expect(el.bar).toBe(20, 'reactivity check 2')
		expect(el.lorem).toBe(30, 'reactivity check 3')
		expect(el.ipsum).toBe(40, 'reactivity check 4')
		expect(el.beep).toBe('bop', 'reactivity check 5')
		expect(el.getAttribute('beep')).toBe('bop', 'reactivity check 6')
		expect(el.bop).toBe('beep', 'reactivity check 7') // pre-upgrade value

		// previously pre-upgrade worked with a microtask, but that is no longer
		// needed, ensure things still work.
		await null

		expect(el.foo).toBe(10, 'post-deferral check')
		expect(el.bar).toBe(20, 'post-deferral check')
		expect(el.baz).toBe('3', 'post-deferral check')
		expect(el.lorem).toBe(30, 'post-deferral check')
		expect(el.ipsum).toBe(40, 'post-deferral check')
		expect(el.ping).toBe('ping', 'post-deferral check')
		expect(el.pong).toBe('pong', 'post-deferral check')
		expect(el.beep).toBe('bop', 'post-deferral check')
		expect(el.getAttribute('beep')).toBe('bop', 'post-deferral check')
		expect(el.boop).toBe('boop', 'post-deferral check')
		expect(el.getAttribute('boop')).toBe(null, 'post-deferral check')
		// TODO test reactive var that wasn't set before the await
		expect(el.bop).toBe('beep', "reactive var that wasn't set before the await should have the pre-upgrade value")

		// Regression fix: The initial prop handling process should not mess with the private
		// variables defined in the LumeElement class, and thus this expectation
		// should still hold after deferral.
		expect(el.templateRoot).toBe(el, 'LumeElement base class properties should be intact after upgrade')

		////////////////
		// Basic test that unshadowing of pre-upgrade properties works in
		// subclasses of a direct subclass of LumeElement.
		const subEl = document.createElement('foo-elemento-subclass') as InstanceType<typeof FooElementoSubclass>

		expect(customElements.get('foo-elemento-subclass') === undefined).toBe(true)
		expect(subEl).toBeInstanceOf(HTMLElement)

		document.body.append(subEl)
		els.push(subEl)

		subEl.subProp = 'pre-upgrade'

		const FooElementoSubclass = element('foo-elemento-subclass')(
			class FooElementoSubclass extends FooElemento {
				static override observedAttributeHandlers: AttributeHandlerMap = {
					subProp: attribute.string,
				}

				subProp = 'initializer'

				constructor() {
					super()
					expect(subEl.subProp).toBe(
						'initializer',
						'subProp should still be the initializer value in the subclass constructor',
					)
				}
			},
		)

		expect(customElements.get('foo-elemento-subclass')).toBe(FooElementoSubclass)
		expect(subEl).toBeInstanceOf(FooElementoSubclass)
		expect(subEl.subProp).toBe('pre-upgrade', 'should have the pre-upgrade value in the subclass instance')
	})

	it('ensure wrapped @untracked decorator still automatically does not track reactivity in constructors', () => {
		@element
		class FooEl extends Element {
			@attribute amount = 3
		}

		// previously caused an infinite constructor loop
		@element
		class NoLoop extends FooEl {
			static override elementName = 'no-loop'

			@attribute double = 0

			constructor() {
				super()
				this.double = this.amount * 2 // this read of .amount should not be tracked
			}
		}

		let b: NoLoop
		let count = 0

		function noLoop() {
			createEffect(() => {
				b = new NoLoop() // this should not track
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

	it('ensure wrapped @untracked decorator still automatically does not track reactivity in constructors even when not the root most decorator', () => {
		@element
		class FooEl2 extends Element {
			@attribute amount = 3
		}

		function someOtherDecorator(Class: any, _context: any): any {
			const Sub = class Sub extends Class {}
			Object.defineProperty(Sub, 'name', {value: Class.name, configurable: true})
			return Sub
		}

		@element
		@someOtherDecorator
		class NoLoop2 extends FooEl2 {
			static override elementName = 'no-loop2'

			@attribute double = 0

			constructor() {
				super()
				this.double = this.amount * 2 // this read of .amount should not be tracked
			}
		}

		let b: NoLoop2
		let count = 0

		function noLoop() {
			createEffect(() => {
				b = new NoLoop2() // this should not track
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

		// The element is not upgraded yet.
		expect(el).not.toBeInstanceOf(ManualEl)

		ManualEl.defineElement()
		expect(() => ManualEl.defineElement()).toThrow() // already defined

		expect(el).toBeInstanceOf(ManualEl)
		expect(el.tagName.toLowerCase()).toBe(ManualEl.elementName)
		expect(el.tagName.toLowerCase()).toBe(name1)

		const name2 = 'manual-el2'
		const el2 = document.createElement(name2)
		els.push(el2)
		document.body.append(el2)

		const ManualEl2 = ManualEl.defineElement(name2) as typeof ManualEl
		expect(() => ManualEl.defineElement(name2)).toThrow() // already defined
		expect(() => ManualEl2.defineElement()).toThrow() // already defined
		expect(() => ManualEl2.defineElement(name2)).toThrow() // already defined

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

	it('stops effects on disconnect, starts effects on reconnect, with new-style effects and memos', () => {
		@element('effect-reconnect-test')
		class EffectReconnectTest extends Element {
			effectCount = 0
			effectCount2 = 0

			@signal count = 0

			@signal n = 0

			@memo get sum() {
				return this.count + this.n
			}

			override template = () => html`<div>${() => this.count}</div>`

			// new-style effects
			@effect testEffect() {
				this.effectCount++
				this.count // track
			}

			// Test old-style effects too
			override connectedCallback(): void {
				super.connectedCallback()

				this.createEffect(() => {
					this.effectCount2++
					this.sum // track
				})
			}
		}

		const el = new EffectReconnectTest()
		els.push(el)
		document.body.append(el)

		expect(el.effectCount).toBe(1)
		expect(el.effectCount2).toBe(1)

		el.count = 1
		expect(el.effectCount).toBe(2)
		expect(el.effectCount2).toBe(2)

		el.remove()

		el.count = 2
		expect(el.effectCount).toBe(2, 'effect should not run when disconnected')
		expect(el.effectCount2).toBe(2, 'old-style effect should not run when disconnected')

		document.body.append(el)

		expect(el.effectCount).toBe(3, 'effect should run once on reconnect')
		expect(el.effectCount2).toBe(3, 'old-style effect should run once on reconnect')

		el.count = 3
		el.n = 5 // triggers old-style effect second time
		expect(el.effectCount).toBe(4, 'effect should run on reactive changes after reconnecting')
		expect(el.effectCount2).toBe(5, 'old-style effect should run on reactive changes after reconnecting')
	})
})
