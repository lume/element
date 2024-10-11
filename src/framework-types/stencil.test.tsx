/* @jsxImportSource @stencil/core */

// TODO jsxImportSource is working for now using the patch in the patches/
// folder. We're working on jsxImportSource support for Stencil here:
// https://github.com/stenciljs/core/issues/6180

import {attribute, booleanAttribute, eventAttribute, numberAttribute} from '../decorators/attribute.js'
import {element} from '../decorators/element.js'
import {Element} from '../LumeElement.js'
import type {StencilElementAttributes} from './stencil.js'
import type {} from '@stencil/core'
import {assertType} from '../test-utils.test.js'

type SomeElementAttributes =
	| 'someProp'
	| 'someBoolean'
	| 'otherProp'
	| 'onsomeevent'
	| 'onnotanevent'
	| 'onnotanotherevent'
	| 'someNumber'

/**
 * Note, decorators are not required for defining JSX types, but we are using
 * decorators here to show the best practice.
 *
 * You want to select *only* properties decorated with attribute decorators and
 * on* event properties. Technically the JSX types will work if you select
 * any plain properties, but it won't be type safe because the JSX types
 * will include string types, which the decorators are responsible for
 * converting into the non-string values.
 *
 * To have well-defined, consistent, and interoperable elements, you always want
 * properties that are paired with attributes. Otherwise you'll have elements
 * that don't work well in plain HTML, and that require plain JS to operate, and
 * that can also make them more difficult to use in some non-custom-element
 * frameworks where they will need to be referenced for manipulation in JS
 * instead of in declarative templates. When all properties are mapped to
 * attributes, it makes them capable of always receiving data from HTML sent
 * from a server, for example HTML with any language on a backend.
 *
 * In rare cases, having a JS property that is not paired with an attribute is
 * needed, but strive to avoid this. An example where this might be inevitable
 * is when wrapping a non-custom-element framework component in a custom
 * element, where the non-custom-element component accepts only special types of
 * objects via its props, and those objects are not representable as strings (or
 * it would be difficult to do so). But even in these cases, an approach is to
 * map a set of attribute properties to those special objects instead of
 * accepting (or as alternative to accepting) the special objects.
 */
// TODO move the above paragraphs to the docs.
@element('some-element-stencil-jsx')
class SomeElement extends Element {
	@attribute someProp: 'true' | 'false' | boolean = true

	ignoredBoolean = false

	@booleanAttribute someBoolean = true

	#otherProp = 0

	/**
	 * This is a getter/setter whose getter always returns number, but whose
	 * setter can accept a specific non-number value which is coerced into a
	 * number.
	 */
	@attribute get otherProp(): number {
		return this.#otherProp
	}
	@attribute set otherProp(_: this['__set__otherProp']) {
		// Here you would need custom logic to coerce "foo" into a number, for example.
		this.#otherProp = _ as number
	}

	/** do not use this property, its only for JSX types */
	__set__otherProp!: number | 'foo'

	@eventAttribute onsomeevent: ((event: SomeEvent) => void) | null = null

	@numberAttribute onnotanevent = 123
	onnotanotherevent: (n: number) => void = _n => {}

	ignoredNumber = 0

	@numberAttribute someNumber = 123
}

SomeElement

class SomeEvent extends Event {
	foo = 0
}

declare module '@stencil/core' {
	namespace JSX {
		interface IntrinsicElements {
			'some-element': StencilElementAttributes<SomeElement, SomeElementAttributes>
		}
	}
}

describe('JSX types with StencilElementAttributes', () => {
	it('derives JSX types from classes', () => {
		;<>
			{/* check builtin element types exist */}
			<div class={'foo'}></div>

			{/* Ensure common element attributes still work. */}
			<some-element onClick={event => event.button} aria-hidden="true" class="foo" style={{color: 'red'}} />

			<some-element someProp="false" otherProp="foo" />
			<some-element someProp={false} otherProp={123} />
			{/* @ts-expect-error good, number is invalid */}
			<some-element someProp={123} />
			{/* @ts-expect-error good, 'blah' is invalid */}
			<some-element otherProp="blah" />

			{/* Additionally TypeScript will allow unknown dash-case props (as we didn't not define JS properties with these exact dash-cased names) */}
			<some-element some-prop="false" other-prop="foo" />
			{/* @ts-expect-error foo doesn't exist. TypeScript will only check existence of properties without dashes */}
			<some-element foo="false" />

			{/* @ts-expect-error `ignoredBoolean` was not selected, not available in JSX */}
			<some-element ignoredBoolean={123} />

			<some-element someBoolean />
			<some-element someBoolean={true} />
			<some-element someBoolean={false} />
			<some-element someBoolean="true" />
			<some-element someBoolean="false" />
			{/* @ts-expect-error good, only booleans and boolean strings allowed, no strings */}
			<some-element someBoolean="blah" />
			{/* @ts-expect-error good, only booleans allowed */}
			<some-element someBoolean={123} />

			<some-element onsomeevent={event => event.foo} />
			<some-element onsomeevent="console.log('someevent')" />
			{/* @ts-expect-error on:-prefixed event props are not for Stencil */}
			<some-element on:someevent={event => event.foo} />
			{/* @ts-expect-error wrong event type */}
			<some-element onsomeevent={(event: ErrorEvent) => event} />

			{/* @ts-expect-error non-event on* properties are disallwed in Stencil because Stencil will only treat them as event listeners and will not forward the values to JS properties. (The 'as any' ensure we're not type checking the value, and only checking existence of the prop.) */}
			<some-element onnotanevent={123 as any} />

			{/* @ts-expect-error Ensure that non-event-listener on* properties are ignored, as Stencil will always listen to events based on their name which is incorrect (the functions will receive an event instead of the arguments they expect). (Use "as any" to ensure we check property existence, not value type.) */}
			<some-element onnotanotherevent={(() => {}) as any} />

			{/* @ts-expect-error `ignoredNumber` was not selected, not available in JSX */}
			<some-element ignoredNumber={123} />

			<some-element someNumber={123} />
			{/* @ts-expect-error good, `false` is not a number */}
			<some-element someNumber={false} />
			<some-element someNumber="123" />
			<some-element someNumber="123." />
			<some-element someNumber=".123" />
			<some-element someNumber="1.23" />
			<some-element someNumber="1.2e1" />
			<some-element someNumber="0xefef" />
			<some-element someNumber="0b1010" />
			{/* @ts-expect-error good, "0z1010" is not a number string */}
			<some-element someNumber="0z1010" />
			{/* @ts-expect-error good, "blah" is not a number string */}
			<some-element someNumber="blah" />
			{/* @ts-expect-error good, "1.blah" is not a number string */}
			<some-element someNumber="1.blah" />
		</>

		type ElementClass = HTMLElement & {
			num: number
			str: 'foo' | 'bar'
			bool: boolean
			onfoo: EventListener | null
			oncLick: EventListener | null
		}

		type props = StencilElementAttributes<ElementClass, 'num' | 'str' | 'bool' | 'onfoo' | 'oncLick'>

		assertType<props['num'], number | `${number}` | undefined>()
		assertType<props['str'], 'foo' | 'bar' | undefined>()
		assertType<props['bool'], boolean | 'true' | 'false' | undefined>()
		assertType<props['onfoo'], EventListener | string | null | undefined>()
		assertType<props['oncLick'], EventListener | string | null | undefined>()
	})
})
