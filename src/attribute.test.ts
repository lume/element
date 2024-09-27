import {createEffect} from 'solid-js'
import {signal} from 'classy-solid'
import {
	Element,
	element,
	attribute,
	numberAttribute,
	booleanAttribute,
	noSignal,
	stringAttribute,
	type AttributeHandlerMap,
} from './index.js'

describe('classy-solid @signal properties with lume/element @element decorators on plain HTMLElements', () => {
	it('reacts to updates using createEffect', () => {
		@element('foo-el')
		class FooEl extends HTMLElement {
			@signal foo = 123
		}

		const f = new FooEl()
		let count = 0

		// Runs once initially, then re-runs any time f.foo has changed.
		createEffect(() => {
			f.foo
			count++
		})

		expect(count).toBe(1)
		f.foo = 123
		expect(count).toBe(2)
		expect(f.foo).toBe(123)
	})

	it('maintains reactivity for overridden fields', () => {
		@element('foo-el2')
		class FooEl extends HTMLElement {
			@signal foo = 123
		}

		@element('override-el')
		class OverrideEl extends FooEl {
			@signal override foo = 456
		}

		const f = new OverrideEl()
		let count = 0

		// Runs once initially, then re-runs any time f.foo has changed.
		createEffect(() => {
			f.foo
			count++
		})

		expect(f.foo).toBe(456)
		expect(count).toBe(1)
		f.foo = 789
		expect(count).toBe(2)
		expect(f.foo).toBe(789)
	})
})

describe('@attribute tests', () => {
	it('attributes can be mapped to properties with @attribute', () => {
		@element('foo-bar')
		class FooBar extends HTMLElement {
			@attribute foo = '0'
		}

		const f = new FooBar()

		// Properties currently do not reflect back to attributes (no option
		// for that yet).
		expect(f.getAttribute('foo')).toBe(null)

		document.body.insertAdjacentHTML('beforeend', `<foo-bar foo="good day!"></foo-bar>`)
		const ff = document.body.lastElementChild! as FooBar

		expect(ff.getAttribute('foo')).toBe('good day!')
		expect(ff.foo).toBe('good day!')

		let count = 0

		// Runs once initially, then re-runs any time f.foo has changed.
		createEffect(() => {
			f.foo
			ff.foo
			count++
		})

		expect(count).toBe(1)
		f.setAttribute('foo', '123')
		expect(count).toBe(2)
		expect(f.foo).toBe('123')

		f.setAttribute('foo', '456')
		expect(count).toBe(3)
		expect(f.foo).toBe('456')

		f.removeAttribute('foo')
		expect(count).toBe(4)
		expect(f.foo).toBe('0')

		ff.foo = 'good night!'
		expect(count).toBe(5)

		// Remember, properties do not reflect to attributes (no option for that yet).
		expect(ff.getAttribute('foo')).toBe('good day!')
		expect(ff.foo).toBe('good night!')
	})

	// Ensure we didn't break this feature of classy-solid's @signal decorator.
	it('maintains reactivity for overridden fields', () => {
		@element('foo-bar2')
		class FooBar extends HTMLElement {
			@attribute foo = '0'
		}

		@element('overridden-foo')
		class OverrideFoo extends FooBar {
			@attribute override foo = '1'
		}

		const f = new OverrideFoo()
		let count = 0

		// Runs once initially, then re-runs any time f.foo has changed.
		createEffect(() => {
			f.foo
			count++
		})

		expect(f.foo).toBe('1')
		expect(count).toBe(1)
		f.setAttribute('foo', '123')
		expect(count).toBe(2)
		expect(f.foo).toBe('123')

		// Check that the default value for attribute removed is from the overriden initial value.
		f.removeAttribute('foo')
		expect(count).toBe(3)
		expect(f.foo).toBe('1')
	})

	it("@signal doesn't need to be used if using @attribute, as those are @signal too", () => {
		@element('pur-pose')
		class Purpose extends Element {
			@attribute purpose = '0'
		}

		const f = new Purpose()

		let count = 0

		createEffect(() => {
			f.purpose
			count++
		})

		f.purpose = 'Alive to discover.'

		expect(count).toBe(2)

		f.setAttribute('purpose', 'Born to create!')
		expect(count).toBe(3)
		expect(f.purpose).toBe('Born to create!')

		f.purpose = 'To inspire.'
		expect(count).toBe(4)
		expect(f.purpose).toBe('To inspire.')

		// There is no option to reflect props to attributes yet. Do we want that?
		expect(f.getAttribute('purpose')).toBe('Born to create!')
	})

	it('@attribute works with accessors', () => {
		@element('pur-pose-2')
		class Purpose extends Element {
			__purpose: string | null = null

			@attribute
			get purpose() {
				return this.__purpose
			}
			@attribute
			set purpose(v) {
				this.__purpose = v
			}
		}

		const f = new Purpose()

		let count = 0

		createEffect(() => {
			f.purpose
			count++
		})

		f.purpose = 'Alive to discover.'

		expect(count).toBe(2)

		f.setAttribute('purpose', 'Born to create!')
		expect(count).toBe(3)
		expect(f.purpose).toBe('Born to create!')
		expect(f.__purpose).toBe('Born to create!')

		f.purpose = 'To inspire.'
		expect(count).toBe(4)
		expect(f.purpose).toBe('To inspire.')
		expect(f.__purpose).toBe('To inspire.')

		// There is no option to reflect props to attributes yet. Do we want that?
		expect(f.getAttribute('purpose')).toBe('Born to create!')
	})

	it('skip composing with @signal if @noSignal is used before it, class field', async () => {
		@element('no-signal')
		class NoSignal extends Element {
			@attribute @noSignal foo = '123'
			@attribute bar = '123'
		}

		const el = document.createElement('no-signal') as NoSignal
		document.body.append(el)

		let count = 0

		createEffect(() => {
			el.foo
			el.bar
			count++
		})

		expect(el.foo).toBe('123')
		expect(el.bar).toBe('123')
		expect(count).toBe(1)

		el.setAttribute('foo', '456')

		expect(el.foo).toBe('456')
		expect(el.bar).toBe('123')
		expect(count).toBe(1) // still 1, foo is not reactive

		el.setAttribute('bar', '456')

		expect(el.foo).toBe('456')
		expect(el.bar).toBe('456')
		expect(count).toBe(2) // 2, bar is reactive

		////////////////////////////////////
		// Ensure overriding fields works

		@element('no-signal2')
		class NoSignal2 extends NoSignal {
			@attribute override foo = '123'
			@attribute @noSignal override bar = '123'
		}

		const el2 = document.createElement('no-signal2') as NoSignal2
		document.body.append(el2)

		let count2 = 0

		createEffect(() => {
			el2.foo
			el2.bar
			count2++
		})

		expect(el2.foo).toBe('123')
		expect(el2.bar).toBe('123')
		expect(count2).toBe(1)

		el2.setAttribute('foo', '456')

		expect(el2.foo).toBe('456')
		expect(el2.bar).toBe('123')
		expect(count2).toBe(2) // 2, foo is reactive

		el2.setAttribute('bar', '456')

		expect(el2.foo).toBe('456')
		expect(el2.bar).toBe('456')
		expect(count2).toBe(2) // still 2, bar is not reactive
	})

	it('skip composing with @signal if @noSignal is used before it, class getter/setter', async () => {
		@element('no-signal3')
		class NoSignal3 extends Element {
			#val1 = '123'

			@attribute
			@noSignal
			get value1() {
				return this.#val1
			}
			@attribute
			@noSignal
			set value1(v) {
				this.#val1 = v
			}

			#val2 = '123'

			@attribute
			get value2() {
				return this.#val2
			}
			@attribute
			set value2(v) {
				this.#val2 = v
			}
		}

		const el = document.createElement('no-signal3') as NoSignal3
		document.body.append(el)

		let count = 0

		createEffect(() => {
			el.value1
			el.value2
			count++
		})

		expect(el.value1).toBe('123')
		expect(el.value2).toBe('123')
		expect(count).toBe(1)

		el.setAttribute('value1', '456')

		expect(el.value1).toBe('456')
		expect(el.value2).toBe('123')
		expect(count).toBe(1) // still 1, el.value1 is not reactive

		el.setAttribute('value2', '456')

		expect(el.value1).toBe('456')
		expect(el.value2).toBe('456')
		expect(count).toBe(2) // 2, el.value2 is reactive

		////////////////////////////////////
		// Ensure overriding getters/setters works

		@element('no-signal4')
		class NoSignal4 extends NoSignal3 {
			#val1 = '123'

			@attribute
			override get value1() {
				return this.#val1
			}
			@attribute
			override set value1(v) {
				this.#val1 = v
			}

			#val2 = '123'

			@attribute
			@noSignal
			override get value2() {
				return this.#val2
			}
			@attribute
			@noSignal
			override set value2(v) {
				this.#val2 = v
			}
		}

		const el2 = document.createElement('no-signal4') as NoSignal4
		document.body.append(el2)

		let count2 = 0

		createEffect(() => {
			el2.value1
			el2.value2
			count2++
		})

		expect(el2.value1).toBe('123')
		expect(el2.value2).toBe('123')
		expect(count2).toBe(1)

		el2.setAttribute('value1', '456')

		expect(el2.value1).toBe('456')
		expect(el2.value2).toBe('123')
		expect(count2).toBe(2) // 1, el2.value1 is reactive

		el2.setAttribute('value2', '456')

		expect(el2.value1).toBe('456')
		expect(el2.value2).toBe('456')
		expect(count2).toBe(2) // still 2, el2.value2 is not reactive
	})

	@element('override-base')
	class OverrideBase extends Element {
		@numberAttribute foo = 123

		#bar = '123'

		@stringAttribute
		get bar() {
			return this.#bar
		}
		@stringAttribute
		set bar(v) {
			this.#bar = v
		}

		@booleanAttribute baz = false
	}

	@element('override-subclass')
	class OverrideSubclass extends OverrideBase {
		// @ts-expect-error overriding with an incompatible type is fine in plain JS
		@stringAttribute override foo = '123'

		#bar = 123

		@numberAttribute
		// @ts-expect-error overriding with an incompatible type is fine in plain JS
		override get bar() {
			return this.#bar
		}
		@numberAttribute
		// @ts-expect-error overriding with an incompatible type is fine in plain JS
		override set bar(v) {
			this.#bar = v
		}

		// @ts-expect-error overriding with an incompatible type is fine in plain JS
		@stringAttribute baz = false // not recommended: initial/default value not matching with decorator type
	}

	it('allows overriding fields/getters/setters in subclasses, using decorators', () => {
		let el: Element = new OverrideBase()
		document.body.append(el)

		testAttribute(el, 'foo', '456', 456, 123)
		testAttribute(el, 'bar', '456', '456', '123')
		testAttribute(el, 'baz', 'true', true, false)

		el.remove()

		el = new OverrideSubclass()
		document.body.append(el)

		testAttribute(el, 'foo', '456', '456', '123')
		testAttribute(el, 'bar', '456', 456, 123)
		testAttribute(el, 'baz', 'true', 'true', false)

		el.remove()
	})

	it('handles property values the same as attributes, using decorators', () => {
		let el: Element = new OverrideBase()
		document.body.append(el)

		testProp(el, 'foo', '456', 456, 456, 123, 'number')
		testProp(el, 'foo', 'asdf', NaN, NaN, 123, 'number') // no error (should handlers throw if the value can't be properly deserialized?)
		testProp(el, 'bar', '456', '456', '456', '123', 'string')
		testProp(el, 'baz', 'true', true, true, false, 'boolean')

		el.remove()

		el = new OverrideSubclass()
		document.body.append(el)

		testProp(el, 'foo', '456', '456', '456', '123', 'string')
		testProp(el, 'bar', '456', 456, 456, 123, 'number')
		testProp(el, 'baz', 'true', 'true', 'true', false, 'string')

		el.remove()
	})

	const OverrideBase2 = element('override-base2')(
		class extends Element {
			static override observedAttributeHandlers: AttributeHandlerMap = {
				foo: attribute.number(),
				bar: attribute.string(),
				baz: attribute.boolean(),
			}

			foo = 123

			#bar = '123'

			get bar() {
				return this.#bar
			}
			set bar(v) {
				this.#bar = v
			}

			baz = false
		},
	)

	const OverrideSubclass2 = element('override-subclass2')(
		class extends OverrideBase2 {
			static override observedAttributeHandlers: AttributeHandlerMap = {
				foo: attribute.string(),
				bar: attribute.number(),
				baz: attribute.string(),
			}

			// @ts-expect-error overriding with an incompatible type is fine in plain JS
			override foo = '123'

			#bar = 123

			// @ts-expect-error overriding with an incompatible type is fine in plain JS
			override get bar() {
				return this.#bar
			}
			// @ts-expect-error overriding with an incompatible type is fine in plain JS
			override set bar(v) {
				this.#bar = v
			}

			// @ts-expect-error overriding with an incompatible type is fine in plain JS
			baz = false
		},
	)

	it('allows overriding fields/getters/setters in subclasses, without decorators', () => {
		let el: Element = new OverrideBase2()
		document.body.append(el)

		testAttribute(el, 'foo', '456', 456, 123)
		testAttribute(el, 'bar', '456', '456', '123')
		testAttribute(el, 'baz', 'true', true, false)

		el.remove()

		el = new OverrideSubclass2()
		document.body.append(el)

		testAttribute(el, 'foo', '456', '456', '123')
		testAttribute(el, 'bar', '456', 456, 123)
		testAttribute(el, 'baz', 'true', 'true', false)

		el.remove()
	})

	it('handles property values the same as attributes, without decorators', () => {
		let el: Element = new OverrideBase2()
		document.body.append(el)

		testProp(el, 'foo', '456', 456, 456, 123, 'number')
		testProp(el, 'foo', 'asdf', NaN, NaN, 123, 'number') // no error (should handlers throw if the value can't be properly deserialized?)
		testProp(el, 'bar', '456', '456', '456', '123', 'string')
		testProp(el, 'baz', 'true', true, true, false, 'boolean')

		el.remove()

		el = new OverrideSubclass2()
		document.body.append(el)

		testProp(el, 'foo', '456', '456', '456', '123', 'string')
		testProp(el, 'bar', '456', 456, 456, 123, 'number')
		testProp(el, 'baz', 'true', 'true', 'true', false, 'string')

		el.remove()
	})

	it('works with write-only non-signal setter', () => {
		@element('non-signal-write-only')
		class NonSignalWriteOnly extends Element {
			#value = true

			@booleanAttribute
			@noSignal
			set value(v: boolean) {
				this.#value = v
			}

			test() {
				return this.#value
			}
		}

		const el = new NonSignalWriteOnly()
		document.body.append(el)

		expect(el.test()).toBe(true)
		el.setAttribute('value', 'false')
		expect(el.test()).toBe(false)

		// With a setter-only property, the initial value cannot be known, so
		// attribute removal results in undefined.
		// Auto-accessor fields would allow knowing the initial value (TODO).
		el.removeAttribute('value')
		expect(String(el.test())).toBe('undefined')

		el.remove()
	})
})

describe('various types of attributes', () => {
	it('@numberAttribute decorator for working with number values', () => {
		@element('x-person')
		class Person extends HTMLElement {
			// Currently the typed attributes need an arg for the default value.
			@numberAttribute age = 0
			@numberAttribute weight = 0
			@numberAttribute height = 0
		}

		const p = new Person()

		let count = 0

		createEffect(() => {
			p.age
			p.weight
			count++
		})
		expect(count).toBe(1)

		p.setAttribute('age', '43')
		expect(count).toBe(2)
		expect(p.age).toBe(43)

		p.setAttribute('weight', '168')
		expect(count).toBe(3)
		expect(p.weight).toBe(168)

		p.setAttribute('height', '5.9')
		expect(count).toBe(3)
		expect(p.height).toBe(5.9)

		// Removing the attributes sets the prop values back to default.
		p.removeAttribute('age')
		p.removeAttribute('weight')
		p.removeAttribute('height')
		expect(count).toBe(5)
		expect(p.age).toBe(0)
		expect(p.weight).toBe(0)
		expect(p.height).toBe(0)

		// TODO should this work too? Currently attributeChangedCallback
		// does the coercion (falls the attributeHandler.from() method).
		// Should it instead be a setter? Measure performance.
		// p.age = '43'
		// expect(count).toBe(6)
		// expect(p.age).toBe(43)

		p.age = 44
		expect(count).toBe(6)
		expect(p.age).toBe(44)

		// TODO should this work too? Currently attributeChangedCallback
		// does the coercion (falls the attributeHandler.from() method).
		// Should it instead be a setter? Measure performance.
		// p.weight = '168'
		// expect(count).toBe(8)
		// expect(p.weight).toBe(168)

		p.weight = 169
		expect(count).toBe(7)
		expect(p.weight).toBe(169)

		// TODO should this work too? Currently attributeChangedCallback
		// does the coercion (falls the attributeHandler.from() method).
		// Should it instead be a setter? Measure performance.
		// p.height = '5.9'
		// expect(count).toBe(9)
		// expect(p.height).toBe(5.9)

		p.height = 6
		expect(count).toBe(7)
		expect(p.height).toBe(6)
	})

	it('@booleanAttribute decorator for working with boolean values', () => {
		@element('pet-lover')
		class PetLover extends HTMLElement {
			// Boolean attributes are
			// - true when they exist and have any value other than "false". f.e. foo="" and foo="null" result in a value of `true`.
			// - false when they exist and have the value "false". f.e. foo="false"
			// When the attributes do not exist (getAttribute returns
			// `null`) they have the value specified by the default arg
			// passed into the decorator. If the default value is set to
			// `true`, then removing the attribute results in a `true` value
			// (this is different than traditional boolean attribute where
			// the absence of an attribute means `false`). Set the default
			// value to `false` to have the result be `false` when the
			// attribute is not present or when it is explicitly set to
			// "false".
			@booleanAttribute hasCat = false
			@booleanAttribute hasDog = true
		}

		const p = new PetLover()

		let count = 0

		createEffect(() => {
			p.hasCat
			p.hasDog
			count++
		})

		expect(count).toBe(1)

		// NOTE! The camelCase property names are mapped from dash-case attributes names.
		p.setAttribute('has-cat', '')
		expect(count).toBe(2)
		expect(p.hasCat).toBe(true)

		p.setAttribute('has-cat', 'foo')
		expect(count).toBe(3)
		expect(p.hasCat).toBe(true)

		p.setAttribute('has-dog', 'false')
		expect(count).toBe(4)
		expect(p.hasDog).toBe(false)

		p.setAttribute('has-dog', 'anything')
		expect(count).toBe(5)
		expect(p.hasDog).toBe(true)

		// Removing the attributes sets the prop values back to default.
		p.removeAttribute('has-cat')
		p.removeAttribute('has-dog')
		expect(p.getAttribute('has-cat')).toBe(null)
		expect(p.getAttribute('has-dog')).toBe(null)
		expect(count).toBe(7)
		expect(p.hasCat).toBe(false)
		expect(p.hasDog).toBe(true)
	})
})

function testAttribute(el: Element, prop: string, attrValue: any, handledValue: any, defaultValue: any) {
	el.setAttribute(prop, attrValue)
	// @ts-expect-error no indexed signature
	expect(el[prop]).toBe(handledValue)
	el.removeAttribute(prop)
	// @ts-expect-error no indexed signature
	expect(el[prop]).toBe(defaultValue)
}

function testProp(
	el: Element,
	prop: string,
	attrValue: string,
	jsValue: any,
	handledValue: any,
	defaultValue: any,
	valueType: string,
) {
	// @ts-expect-error no indexed signature
	el[prop] = jsValue
	// @ts-expect-error no indexed signature
	expect(el[prop]).toBe(handledValue)
	// @ts-expect-error no indexed signature
	expect(typeof el[prop]).toBe(valueType)
	// @ts-expect-error no indexed signature
	el[prop] = attrValue // same as setting the attribute (string)
	// @ts-expect-error no indexed signature
	expect(el[prop]).toBe(handledValue)
	// @ts-expect-error no indexed signature
	expect(typeof el[prop]).toBe(valueType)
	// @ts-expect-error no indexed signature
	el[prop] = null // same as removing the attribute
	// @ts-expect-error no indexed signature
	expect(el[prop]).toBe(defaultValue)
}
