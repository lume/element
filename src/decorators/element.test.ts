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
			get accessor() {
				return this.num
			}
			@numberAttribute
			set accessor(v) {
				this.num = v
			}
		}

		let el = document.createElement('default-values-with-decorators')
		document.body.append(el)

		testAttributes(el, 'accessor')

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
			get accessor2() {
				return this.dolor
			}
			@numberAttribute
			set accessor2(v) {
				this.dolor = v
			}
		}

		DefaultValueTestSubclass

		el = document.createElement('default-values-with-decorators-subclass')
		document.body.append(el)

		testAttributes(el, 'accessor')
		testAttributes(el, 'accessor2', 'lorem', 'ipsum', 'dolor', 'set', 'amit', 'yes', 'yes2')

		el.remove()
	})

	it('ensures initial field values act as default attribute values when attributes removed, no decorator syntax, class fields', () => {
		const DefaultValueTest = element('default-values-without-decorators')(
			class extends Element {
				static override observedAttributeHandlers: AttributeHandlerMap = {
					foo: {},
					bar: attribute.string(),
					num: attribute.number(),
					bool: attribute.boolean(),
					bool2: attribute.boolean(),
					baz: attribute.string(),
					baz2: attribute.string(),
					accessor: attribute.number(),
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

				get accessor() {
					return this.num
				}
				set accessor(v) {
					this.num = v
				}
			},
		)

		let el = document.createElement('default-values-without-decorators')
		document.body.append(el)

		testAttributes(el, 'accessor')

		el.remove()

		element('default-values-without-decorators-subclass')(
			class DefaultValueTestSubclass extends DefaultValueTest {
				static override observedAttributeHandlers: AttributeHandlerMap = {
					lorem: {},
					ipsum: attribute.string(),
					dolor: attribute.number(),
					set: attribute.boolean(),
					amit: attribute.boolean(),
					yes: attribute.string(),
					yes2: attribute.string(),
					accessor2: attribute.number(),
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

				get accessor2() {
					return this.dolor
				}
				set accessor2(v) {
					this.dolor = v
				}
			},
		)

		el = document.createElement('default-values-without-decorators-subclass')
		document.body.append(el)

		testAttributes(el, 'accessor')
		testAttributes(el, 'accessor2', 'lorem', 'ipsum', 'dolor', 'set', 'amit', 'yes', 'yes2')

		el.remove()
	})

	it('ensures initial field values act as default attribute values when attributes removed, no decorator syntax, constructor properties', () => {
		const DefaultValueTest = element('default-values-without-decorators-constructor-props')(
			class extends Element {
				static override observedAttributeHandlers: AttributeHandlerMap = {
					foo: {},
					bar: attribute.string(),
					num: attribute.number(),
					bool: attribute.boolean(),
					bool2: attribute.boolean(),
					baz: attribute.string(),
					baz2: attribute.string(),
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
					ipsum: attribute.string(),
					dolor: attribute.number(),
					set: attribute.boolean(),
					amit: attribute.boolean(),
					yes: attribute.string(),
					yes2: attribute.string(),
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
					amount: attribute.number(),
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
					double: attribute.number(),
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
	accessor = '',
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

	if (accessor) {
		el.setAttribute(accessor, '456')
		// @ts-ignore
		expect(el[accessor]).toBe(456)
		el.removeAttribute(accessor)
		// @ts-ignore
		expect(el[accessor]).toBe(123)
	}
}
