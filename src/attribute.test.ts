import {element, attribute, numberAttribute, booleanAttribute, reactive, autorun} from './index.js'

describe('lume/variable reactive properties work with lume/element decorators', () => {
	it('reacts to updates using autorun', () => {
		@element('foo-el')
		@reactive
		class FooEl extends HTMLElement {
			@reactive foo = 123
		}

		const f = new FooEl()

		let count = 0

		// Runs once initially, then re-runs any time f.foo has changed.
		autorun(() => {
			f.foo
			count++
		})

		expect(count).toBe(1)

		f.foo = 123
		expect(count).toBe(2)
	})

	it('attributes can be mapped to properties with @attribute', () => {
		@element('foo-bar')
		@reactive
		class FooBar extends HTMLElement {
			@reactive @attribute foo: string | null = '0'
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
		autorun(() => {
			f.foo
			ff.foo
			count++
		})

		f.setAttribute('foo', '123')
		expect(count).toBe(2)
		expect(f.foo).toBe('123')

		f.setAttribute('foo', '456')
		expect(count).toBe(3)
		expect(f.foo).toBe('456')

		f.removeAttribute('foo')
		expect(count).toBe(4)
		expect(f.foo).toBe(null)

		ff.foo = 'good night!'
		expect(count).toBe(5)
		// Remember, properties do not reflect to attributes (no option for that yet).
		expect(ff.getAttribute('foo')).toBe('good day!')
		expect(ff.foo).toBe('good night!')
	})

	it('using @attribute without @reactive simply sets the property without reactivity', () => {
		@element('pur-pose')
		class Purpose extends HTMLElement {
			@attribute purpose: string | null = '0'
		}

		const f = new Purpose()

		let count = 0

		autorun(() => {
			f.purpose = 'Alive to discover.'
			count++
		})

		expect(count).toBe(1)

		f.setAttribute('purpose', 'Born to create!')
		expect(count).toBe(1)
		expect(f.purpose).toBe('Born to create!')

		f.purpose = 'To inspire.'
		expect(count).toBe(1)
		expect(f.purpose).toBe('To inspire.')
		// No option to reflect props to attributes yet.
		expect(f.getAttribute('purpose')).toBe('Born to create!')
	})
})

describe('various types of attributes', () => {
	it('@numberAttribute decorator for working with number values', () => {
		@element('x-person')
		@reactive
		class Person extends HTMLElement {
			// Currently the typed attributes need an arg for the default value.
			@reactive @numberAttribute(0) age = 0
			@numberAttribute(0) @reactive weight = 0
			@numberAttribute(0) height = 0
		}

		const p = new Person()

		let count = 0

		autorun(() => {
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
		@reactive
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
			@reactive @booleanAttribute(false) hasCat = false
			@booleanAttribute(true) @reactive hasDog = true
		}

		const p = new PetLover()

		let count = 0

		autorun(() => {
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
