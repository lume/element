import {createEffect} from 'solid-js'
import {signal} from 'classy-solid'
import {
	Element,
	element,
	attribute,
	numberAttribute,
	booleanAttribute,
	stringAttribute,
	type AttributeHandlerMap,
} from '../index.js'

describe('@element decorator', () => {
	it('reads options from static class fields', () => {
		@element
		class ElementWithStaticName extends Element {
			static override elementName = 'el-with-static-name'
			// static autoDefine defaults to true
		}

		const e = new ElementWithStaticName()
		document.body.append(e)
		expect(e.tagName.toLowerCase()).toBe('el-with-static-name')
		e.remove()

		@element
		class WithStaticOptions extends Element {
			static override elementName = 'with-static-options'
			static override autoDefine = true
		}

		const el = new WithStaticOptions()
		document.body.append(el)
		expect(el.tagName.toLowerCase()).toBe('with-static-options')
		el.remove()

		@element
		class WithStaticOptions2 extends Element {
			static override elementName = 'with-static-options2'
			static override autoDefine = false // don't automatically define in window.customElements
		}

		// it throws because the element is not defined yet.
		expect(() => new WithStaticOptions2()).toThrow()

		WithStaticOptions2.defineElement()
		const el2 = new WithStaticOptions2()
		document.body.append(el2)
		expect(el2.tagName.toLowerCase()).toBe('with-static-options2')
		el2.remove()
	})

	it('accepts and options object', () => {
		@element({elementName: 'el-with-options-name' /* autoDefine: defaults to true */})
		class ElementWithOptionsName extends Element {}

		const e = new ElementWithOptionsName()
		document.body.append(e)
		expect(e.tagName.toLowerCase()).toBe('el-with-options-name')
		e.remove()

		@element({elementName: 'with-options-object', autoDefine: true})
		class WithOptionsObject extends Element {}

		const el = new WithOptionsObject()
		document.body.append(el)
		expect(el.tagName.toLowerCase()).toBe('with-options-object')
		el.remove()

		@element({elementName: 'with-options-object2', autoDefine: false})
		class WithOptionsObject2 extends Element {}

		// it throws because the element is not defined yet.
		expect(() => new WithOptionsObject2()).toThrow()

		WithOptionsObject2.defineElement()
		const el2 = new WithOptionsObject2()
		document.body.append(el2)
		expect(el2.tagName.toLowerCase()).toBe('with-options-object2')
		el2.remove()
	})

	it('uses the class name to derive the the dash-case element name if not provided', () => {
		@element
		class WithConstructorName1 extends Element {}

		expect(WithConstructorName1.elementName).toBe('with-constructor-name1')
		const el = new WithConstructorName1()
		document.body.append(el)
		expect(el.tagName.toLowerCase()).toBe('with-constructor-name1')
		el.remove()

		@element
		class WithConstructorName2 extends Element {
			static override autoDefine = false // don't automatically define in window.customElements
		}

		expect(WithConstructorName2.elementName).toBe('with-constructor-name2')

		// it throws because the element is not defined yet.
		expect(() => new WithConstructorName2()).toThrow()

		WithConstructorName2.defineElement()
		const el2 = new WithConstructorName2()
		document.body.append(el2)
		expect(el2.tagName.toLowerCase()).toBe('with-constructor-name2')
		el2.remove()

		const WithConstructorName3 = WithConstructorName2.defineElement('with-constructor-name3')

		expect(WithConstructorName3.elementName).toBe('with-constructor-name3')
		const el3 = document.createElement('with-constructor-name3')
		document.body.append(el3)
		expect(el3.tagName.toLowerCase()).toBe('with-constructor-name3')
		el3.remove()

		@element('', false)
		class WithConstructorName4 extends Element {}

		expect(WithConstructorName4.elementName).toBe('with-constructor-name4')

		// it throws because the element is not defined yet.
		expect(() => new WithConstructorName4()).toThrow()

		WithConstructorName4.defineElement()
		const el4 = new WithConstructorName4()
		document.body.append(el4)
		expect(el4.tagName.toLowerCase()).toBe('with-constructor-name4')
		el4.remove()

		@element({autoDefine: false})
		class WithConstructorName5 extends Element {}

		expect(WithConstructorName5.elementName).toBe('with-constructor-name5')

		// it throws because the element is not defined yet.
		expect(() => new WithConstructorName5()).toThrow()

		WithConstructorName5.defineElement()
		const el5 = new WithConstructorName5()
		document.body.append(el5)
		expect(el5.tagName.toLowerCase()).toBe('with-constructor-name5')
		el5.remove()

		@element('') // autoDefine is still true, so the class name will still be used instead of an empty string.
		class WithConstructorName6 extends Element {}

		expect(WithConstructorName6.elementName).toBe('with-constructor-name6')
		const el6 = new WithConstructorName6()
		document.body.append(el6)
		expect(el6.tagName.toLowerCase()).toBe('with-constructor-name6')
		el6.remove()
	})

	it('ensures initial field values act as default attribute values when attributes removed, with decorator syntax', () => {
		@element('default-values-with-decorators')
		class DefaultValueTest extends Element {
			@attribute foo = 'foo'
			@stringAttribute bar = 'bar'
			@numberAttribute num = 123
			@booleanAttribute bool = false
			@booleanAttribute bool2 = true

			// undefined initial value
			// @ts-expect-error
			@stringAttribute baz
			@stringAttribute baz2: string | null = null

			// The default attribute value will be 123, from the .num property.
			@numberAttribute
			get gettersetter() {
				return this.num
			}
			@numberAttribute
			set gettersetter(v) {
				this.num = v
			}
		}

		let el = document.createElement('default-values-with-decorators')
		document.body.append(el)

		testAttributes(el, 'gettersetter')

		el.remove()

		@element('default-values-with-decorators-subclass')
		class DefaultValueTestSubclass extends DefaultValueTest {
			@attribute lorem = 'foo'
			@stringAttribute ipsum = 'bar'
			@numberAttribute dolor = 123
			@booleanAttribute set = false
			@booleanAttribute amit = true

			// undefined initial value
			// @ts-expect-error
			@stringAttribute yes
			@stringAttribute yes2: string | null = null

			// The default attribute value will be 123, from the .dolor property.
			@numberAttribute
			get gettersetter2() {
				return this.dolor
			}
			@numberAttribute
			set gettersetter2(v) {
				this.dolor = v
			}
		}

		DefaultValueTestSubclass

		el = document.createElement('default-values-with-decorators-subclass')
		document.body.append(el)

		testAttributes(el, 'gettersetter')
		testAttributes(el, 'gettersetter2', 'lorem', 'ipsum', 'dolor', 'set', 'amit', 'yes', 'yes2')

		el.remove()
	})

	it('ensures initial field values act as default attribute values when attributes removed, no decorator syntax, class fields', () => {
		const DefaultValueTest = element('default-values-without-decorators')(
			class extends Element {
				static override observedAttributeHandlers: AttributeHandlerMap = {
					foo: {},
					bar: attribute.string,
					num: attribute.number,
					bool: attribute.boolean,
					bool2: attribute.boolean,
					baz: attribute.string,
					baz2: attribute.string,
					gettersetter: attribute.number,
				}

				foo = 'foo'
				bar = 'bar'
				num = 123
				bool = false
				bool2 = true

				// undefined initial value
				// @ts-expect-error
				baz
				baz2: string | null = null

				get gettersetter() {
					return this.num
				}
				set gettersetter(v) {
					this.num = v
				}
			},
		)

		let el = document.createElement('default-values-without-decorators')
		document.body.append(el)

		testAttributes(el, 'gettersetter')

		el.remove()

		element('default-values-without-decorators-subclass')(
			class DefaultValueTestSubclass extends DefaultValueTest {
				static override observedAttributeHandlers: AttributeHandlerMap = {
					lorem: {},
					ipsum: attribute.string,
					dolor: attribute.number,
					set: attribute.boolean,
					amit: attribute.boolean,
					yes: attribute.string,
					yes2: attribute.string,
					gettersetter2: attribute.number,
				}

				lorem = 'foo'
				ipsum = 'bar'
				dolor = 123
				set = false
				amit = true

				// undefined initial value
				// @ts-expect-error
				yes
				yes2: string | null = null

				get gettersetter2() {
					return this.dolor
				}
				set gettersetter2(v) {
					this.dolor = v
				}
			},
		)

		el = document.createElement('default-values-without-decorators-subclass')
		document.body.append(el)

		testAttributes(el, 'gettersetter')
		testAttributes(el, 'gettersetter2', 'lorem', 'ipsum', 'dolor', 'set', 'amit', 'yes', 'yes2')

		el.remove()
	})

	it('ensures initial field values act as default attribute values when attributes removed, no decorator syntax, constructor properties', () => {
		const DefaultValueTest = element('default-values-without-decorators-constructor-props')(
			class extends Element {
				static override observedAttributeHandlers: AttributeHandlerMap = {
					foo: {},
					bar: attribute.string,
					num: attribute.number,
					bool: attribute.boolean,
					bool2: attribute.boolean,
					baz: attribute.string,
					baz2: attribute.string,
				}

				constructor() {
					super()

					// @ts-expect-error
					this.foo = 'foo'
					// @ts-expect-error
					this.bar = 'bar'
					// @ts-expect-error
					this.num = 123
					// @ts-expect-error
					this.bool = false
					// @ts-expect-error
					this.bool2 = true

					// undefined initial value
					// @ts-expect-error
					this.baz = undefined
					// @ts-expect-error
					this.baz2 = null
				}
			},
		)

		let el = document.createElement('default-values-without-decorators-constructor-props')
		document.body.append(el)

		testAttributes(el)

		el.remove()

		element('default-values-without-decorators-constructor-props-subclass')(
			class DefaultValueTestSubclass extends DefaultValueTest {
				static override observedAttributeHandlers: AttributeHandlerMap = {
					lorem: {},
					ipsum: attribute.string,
					dolor: attribute.number,
					set: attribute.boolean,
					amit: attribute.boolean,
					yes: attribute.string,
					yes2: attribute.string,
				}

				constructor() {
					super()

					// @ts-expect-error
					this.lorem = 'foo'
					// @ts-expect-error
					this.ipsum = 'bar'
					// @ts-expect-error
					this.dolor = 123
					// @ts-expect-error
					this.set = false
					// @ts-expect-error
					this.amit = true

					// undefined initial value
					// @ts-expect-error
					this.yes = undefined
					// @ts-expect-error
					this.yes2 = null
				}
			},
		)

		el = document.createElement('default-values-without-decorators-constructor-props-subclass')
		document.body.append(el)

		testAttributes(el)
		testAttributes(el, '', 'lorem', 'ipsum', 'dolor', 'set', 'amit', 'yes', 'yes2')

		el.remove()
	})

	it('automatically does not track reactivity in constructors when using decorators, using @signal', () => {
		@element('untracked-ctor')
		class Foo extends Element {
			@signal amount = 3
		}

		@element('untracked-ctor-sub')
		class Bar extends Foo {
			@signal double = 0

			constructor() {
				super()
				this.double = this.amount * 2 // this read of .amount should not be tracked
			}
		}

		let b: Bar
		let count = 0

		function noInfiniteReactivityLoop() {
			createEffect(() => {
				b = new Bar() // this should not track
				count++
			})
		}

		expect(noInfiniteReactivityLoop).not.toThrow()

		const b2 = b!

		b!.amount = 4 // hence this should not trigger
		b!.double = 8 // hence this should not trigger

		// If the effect ran only once initially because it did not track,
		// then both variables should reference the same instance
		expect(count).toBe(1)
		expect(b!).toBe(b2)
	})

	it('automatically does not track reactivity in constructors when using decorators, using @attribute', () => {
		@element('untracked-ctor2')
		class Foo extends Element {
			@numberAttribute amount = 3
		}

		@element('untracked-ctor-sub2')
		class Bar extends Foo {
			@numberAttribute double = 0

			constructor() {
				super()
				this.double = this.amount * 2 // this read of .amount should not be tracked
			}
		}

		let b: Bar
		let count = 0

		function noInfiniteReactivityLoop() {
			createEffect(() => {
				b = new Bar() // this should not track
				count++
			})
		}

		expect(noInfiniteReactivityLoop).not.toThrow()

		const b2 = b!

		b!.amount = 4 // hence this should not trigger
		b!.double = 8 // hence this should not trigger

		// If the effect ran only once initially because it did not track,
		// then both variables should reference the same instance
		expect(count).toBe(1)
		expect(b!).toBe(b2)
	})

	it('automatically does not track reactivity in constructors when not using decorators', () => {
		const Foo = element('untracked-ctor3')(
			class Foo extends Element {
				static override observedAttributeHandlers: AttributeHandlerMap = {
					amount: attribute.number,
				}

				amount = 3
			},
		)
		type _Foo = InstanceType<typeof Foo>
		interface Foo extends _Foo {}

		const Bar = element('untracked-ctor-sub3')(
			class Bar extends Foo {
				static override observedAttributeHandlers: AttributeHandlerMap = {
					// __proto__: super.observedAttributeHandlers,
					// ...super.observedAttributeHandlers,
					double: attribute.number,
				}

				double = 0

				constructor() {
					super()
					this.double = this.amount * 2 // this read of .amount should not be tracked
				}
			},
		)
		type _Bar = InstanceType<typeof Bar>
		interface Bar extends _Bar {}

		let b: Bar
		let count = 0

		function noInfiniteReactivityLoop() {
			createEffect(() => {
				b = new Bar() // this should not track
				count++
			})
		}

		expect(noInfiniteReactivityLoop).not.toThrow()

		const b2 = b!

		b!.amount = 4 // hence this should not trigger
		b!.double = 8 // hence this should not trigger

		// If the effect ran only once initially because it did not track,
		// then both variables should reference the same instance
		expect(count).toBe(1)
		expect(b!).toBe(b2)
	})
})

function testAttributes(
	el: HTMLElement,
	gettersetter = '',
	foo = 'foo',
	bar = 'bar',
	num = 'num',
	bool = 'bool',
	bool2 = 'bool2',
	baz = 'baz',
	baz2 = 'baz2',
) {
	el.setAttribute(foo, 'blah')
	// @ts-ignore
	expect(el[foo]).toBe('blah')
	el.removeAttribute(foo)
	// @ts-ignore
	expect(el[foo]).toBe('foo')

	el.setAttribute(bar, 'blah')
	// @ts-ignore
	expect(el[bar]).toBe('blah')
	el.removeAttribute(bar)
	// @ts-ignore
	expect(el[bar]).toBe('bar')

	el.setAttribute(num, '456')
	// @ts-ignore
	expect(el[num]).toBe(456)
	el.removeAttribute(num)
	// @ts-ignore
	expect(el[num]).toBe(123)

	el.setAttribute(bool, 'true')
	// @ts-ignore
	expect(el[bool]).toBe(true)
	el.removeAttribute(bool)
	// @ts-ignore
	expect(el[bool]).toBe(false)

	el.setAttribute(bool2, 'true')
	// @ts-ignore
	expect(el[bool2]).toBe(true)
	el.setAttribute(bool2, 'false')
	// @ts-ignore
	expect(el[bool2]).toBe(false)
	el.removeAttribute(bool2)
	// @ts-ignore
	expect(el[bool2]).toBe(true)

	el.setAttribute(baz, 'true')
	// @ts-ignore
	expect(el[baz]).toBe('true')
	el.removeAttribute(baz)
	// @ts-ignore
	expect(el[baz]).toBe(undefined)

	el.setAttribute(baz2, 'oh yeah')
	// @ts-ignore
	expect(el[baz2]).toBe('oh yeah')
	el.removeAttribute(baz2)
	// @ts-ignore
	expect(el[baz2] === null).toBe(true)

	if (gettersetter) {
		el.setAttribute(gettersetter, '456')
		// @ts-ignore
		expect(el[gettersetter]).toBe(456)
		el.removeAttribute(gettersetter)
		// @ts-ignore
		expect(el[gettersetter]).toBe(123)
	}
}
