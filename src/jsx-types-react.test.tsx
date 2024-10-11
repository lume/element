/* @jsxImportSource react */

import {attribute, booleanAttribute, numberAttribute} from './attribute.js'
import {element} from './element.js'
import {event} from './event.js'
import {Element} from './LumeElement.js'
import type {ReactElementAttributes} from './react.js'

type SomeElementAttributes = 'someProp' | 'someBoolean' | 'otherProp' | 'onsomeevent' | 'onnotanevent' | 'someNumber'

/**
 * Note, decorators are not required for defining JSX types, but we are using
 * decorators here to show the best practice:
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
@element('some-element-react-jsx')
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

	@event onsomeevent: ((event: SomeEvent) => void) | null = null

	onnotanevent = 123

	ignoredNumber = 0

	@numberAttribute someNumber = 123
}

SomeElement

class SomeEvent extends Event {
	foo = 0
}

declare module 'react' {
	namespace JSX {
		interface IntrinsicElements {
			'some-element': ReactElementAttributes<SomeElement, SomeElementAttributes>
		}
	}
}

describe('JSX types with ReactElementAttributes', () => {
	it('derives JSX types from classes', () => {
		;<>
			{/* Ensure common element attributes still work. */}
			<some-element onClick={event => event.button} aria-hidden="true" className="foo" style={{color: 'red'}} />

			<some-element someProp="false" otherProp="foo" />
			<some-element someProp="false" otherProp="foo" />
			<some-element someProp={false} otherProp={123} />
			{/* @ts-expect-error good, number is invalid */}
			<some-element someProp={123} />
			{/* @ts-expect-error good, 'blah' is invalid */}
			<some-element otherProp="blah" />

			{/* Additionally TypeScript will allow unknown dash-case props (as we didn't not define JS properties with these exact dash-cased names, React 19+ will set the element attributes, useful for setting the attributes but React has no way to specify to set attributes for names without dashes) */}
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

			<some-element onsomeevent={(event: SomeEvent) => event.foo} />
			{/* @ts-expect-error on:-prefixed event props are not for React */}
			<some-element on:someevent={(event: SomeEvent) => event} />
			{/* @ts-expect-error wrong event type */}
			<some-element onsomeevent={(event: ErrorEvent) => event} />

			{/* This is fine in React, it will set the JS property to the given value instead of adding an event listener if the value is not a function. */}
			<some-element onnotanevent={123} />
			{/* @ts-expect-error good, boolean is not valid */}
			<some-element onnotanevent={true} />
			{/* @ts-expect-error good, event handler is not valid (although at runtime React will listen for "notanevent") */}
			<some-element onnotanevent={(e: Event) => e} />

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
	})
})
