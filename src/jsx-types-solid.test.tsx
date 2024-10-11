/* @jsxImportSource solid-js */

import {attribute, booleanAttribute, numberAttribute} from './attribute.js'
import {element} from './element.js'
import {event} from './event.js'
import {Element, type ElementAttributes} from './LumeElement.js'

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
@element('some-element-solid-jsx')
class SomeElement extends Element {
	@attribute someProp: 'true' | 'false' | boolean = true

	ignoredBoolean = false

	@booleanAttribute someBoolean = true

	#otherProp = 0

	/** This is a getter/setter whose getter always returns number, but whose setter can accept a specific non-number value which is coerced into a number. */
	@attribute get otherProp(): number {
		return this.#otherProp
	}
	@attribute set otherProp(_: this['__set__otherProp']) {
		this.#otherProp = _ as number // here you would coerce "foo" into a number, for example.
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

declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements {
			'some-element': ElementAttributes<SomeElement, SomeElementAttributes>
		}
	}
}

describe('JSX types with ElementAttributes', () => {
	it('derives JSX types from classes', () => {
		;<>
			{/* Ensure common element attributes still work. */}
			<some-element onclick={event => event.button} aria-hidden="true" class="foo" style="color: red" />

			<some-element some-prop="false" other-prop="foo" />
			<some-element some-prop="false" other-prop="foo" />
			<some-element some-prop={false} other-prop={123} />
			{/* @ts-expect-error good, number is invalid */}
			<some-element some-prop={123} />
			{/* @ts-expect-error good, 'blah' is invalid */}
			<some-element other-prop="blah" />

			<some-element prop:someProp="false" prop:otherProp="foo" />
			<some-element prop:someProp="false" prop:otherProp="foo" />
			<some-element prop:someProp={false} prop:otherProp={123} />
			{/* @ts-expect-error good, number is invalid */}
			<some-element prop:someProp={123} />
			{/* @ts-expect-error good, someProp JSX is not valid, has to be dash-cased version of the JS prop, or use the prop: prefix */}
			<some-element someProp={123} />
			{/* @ts-expect-error good, 'blah' is invalid */}
			<some-element prop:otherProp="blah" />

			{/* Additionally TypeScript will allow unknown dash-case props (the attr: can be used here to tell Solid to set the element attributes instead of the JS properties) */}
			<some-element attr:some-prop="false" attr:other-prop="foo" />
			{/* @ts-expect-error string types can be checked, here an invalid string type */}
			<some-element attr:some-prop="blah" />

			<some-element some-prop={true} />
			<some-element some-prop={false} />
			<some-element some-prop={'true'} />
			<some-element some-prop={'false'} />
			{/* @ts-expect-error good, "blah" is not valid */}
			<some-element some-prop={'blah'} />
			{/* @ts-expect-error good, "blah" is not valid */}
			<some-element some-prop="blah" />

			<some-element prop:someProp={true} />
			<some-element prop:someProp={false} />
			<some-element prop:someProp={'true'} />
			<some-element prop:someProp={'false'} />
			{/* @ts-expect-error good, "blah" is not valid */}
			<some-element prop:someProp={'blah'} />
			{/* @ts-expect-error good, "blah" is not valid */}
			<some-element prop:someProp="blah" />

			<some-element bool:some-prop={true} />
			<some-element bool:some-prop={false} />
			{/* @ts-expect-error good, only booleans are allowed when using `bool:` */}
			<some-element bool:some-prop={'true'} />
			{/* @ts-expect-error good, only booleans are allowed when using `bool:` */}
			<some-element bool:some-prop={'false'} />
			{/* @ts-expect-error good, "blah" is not valid */}
			<some-element bool:some-prop={'blah'} />
			{/* @ts-expect-error good, "blah" is not valid */}
			<some-element bool:some-prop="blah" />

			<some-element attr:some-prop={'true'} />
			<some-element attr:some-prop={'false'} />
			{/* @ts-expect-error good, only the strings "false" and "false" are allowed in attribute form */}
			<some-element attr:some-prop={true} />
			{/* @ts-expect-error good, only the strings "false" and "false" are allowed in attribute form */}
			<some-element attr:some-prop={false} />
			{/* @ts-expect-error good, "blah" is not valid */}
			<some-element attr:some-prop={'blah'} />
			{/* @ts-expect-error good, "blah" is not valid */}
			<some-element attr:some-prop="blah" />

			{/* @ts-expect-error `ignoredBoolean` was not selected, not available in JSX */}
			<some-element ignoredBoolean={true} />

			<some-element some-boolean={true} />
			<some-element some-boolean={false} />
			<some-element some-boolean={'true'} />
			<some-element some-boolean={'false'} />
			{/* @ts-expect-error good, "blah" is not valid */}
			<some-element some-boolean={'blah'} />
			{/* @ts-expect-error good, "blah" is not valid */}
			<some-element some-boolean="blah" />

			<some-element prop:someBoolean={true} />
			<some-element prop:someBoolean={false} />
			<some-element prop:someBoolean={'true'} />
			<some-element prop:someBoolean={'false'} />
			{/* @ts-expect-error good, "blah" is not valid */}
			<some-element prop:someBoolean={'blah'} />
			{/* @ts-expect-error good, "blah" is not valid */}
			<some-element prop:someBoolean="blah" />

			<some-element bool:some-boolean={true} />
			<some-element bool:some-boolean={false} />
			{/* @ts-expect-error good, only booleans are allowed when using `bool:` */}
			<some-element bool:some-boolean={'true'} />
			{/* @ts-expect-error good, only booleans are allowed when using `bool:` */}
			<some-element bool:some-boolean={'false'} />
			{/* @ts-expect-error good, "blah" is not valid */}
			<some-element bool:some-boolean={'blah'} />
			{/* @ts-expect-error good, "blah" is not valid */}
			<some-element bool:some-boolean="blah" />

			<some-element attr:some-boolean={'true'} />
			<some-element attr:some-boolean={'false'} />
			{/* @ts-expect-error good, only the strings "false" and "false" are allowed in attribute form */}
			<some-element attr:some-boolean={true} />
			{/* @ts-expect-error good, only the strings "false" and "false" are allowed in attribute form */}
			<some-element attr:some-boolean={false} />
			{/* @ts-expect-error good, "blah" is not valid */}
			<some-element attr:some-boolean={'blah'} />
			{/* @ts-expect-error good, "blah" is not valid */}
			<some-element attr:some-boolean="blah" />

			{/* @ts-expect-error foo doesn't exist. TypeScript will only check existence of properties without dashes */}
			<some-element foo="false" />

			<some-element onsomeevent={(event: SomeEvent) => event.foo} />
			<some-element on:someevent={(event: SomeEvent) => event.foo} />
			{/* @ts-expect-error wrong event type */}
			<some-element onsomeevent={(event: ErrorEvent) => event} />
			{/* @ts-expect-error wrong event type */}
			<some-element on:someevent={(event: ErrorEvent) => event} />

			{/* @ts-expect-error the property cannot be used like this, as Solid will try to pass the number to addEventListener, so we make it error with `never`. Use prop: or attr: instead. */}
			<some-element onnotanevent={Math.random()} />
			{/* @ts-expect-error only strings can be assigned to attributes */}
			<some-element attr:onnotanevent={123} />
			<some-element attr:onnotanevent="123" />
			<some-element prop:onnotanevent={123} />

			{/* @ts-expect-error `ignoredNumber` was not selected, not available in JSX */}
			<some-element ignoredNumber={123} />

			<some-element some-number={123} />
			{/* @ts-expect-error good, `false` is not a number */}
			<some-element some-number={false} />
			<some-element some-number="123" />
			<some-element some-number="123." />
			<some-element some-number=".123" />
			<some-element some-number="1.23" />
			<some-element some-number="1.2e1" />
			<some-element some-number="0xefef" />
			<some-element some-number="0b1010" />
			{/* @ts-expect-error good, "0z1010" is not a number string */}
			<some-element some-number="0z1010" />
			{/* @ts-expect-error good, "blah" is not a number string */}
			<some-element some-number="blah" />
			{/* @ts-expect-error good, "1.blah" is not a number string */}
			<some-element some-number="1.blah" />

			<some-element prop:someNumber={123} />
			{/* @ts-expect-error good, `false` is not a number */}
			<some-element prop:someNumber={false} />
			<some-element prop:someNumber="123" />
			<some-element prop:someNumber="123." />
			<some-element prop:someNumber=".123" />
			<some-element prop:someNumber="1.23" />
			<some-element prop:someNumber="1.2e1" />
			<some-element prop:someNumber="0xefef" />
			<some-element prop:someNumber="0b1010" />
			{/* @ts-expect-error good, "0z1010" is not a number string */}
			<some-element prop:someNumber="0z1010" />
			{/* @ts-expect-error good, "blah" is not a number string */}
			<some-element prop:someNumber="blah" />
			{/* @ts-expect-error good, "1.blah" is not a number string */}
			<some-element prop:someNumber="1.blah" />

			{/* @ts-expect-error good, attribute accepts only strings */}
			<some-element attr:some-number={123} />
			{/* @ts-expect-error good, `false` is not a number string */}
			<some-element attr:some-number={false} />
			<some-element attr:some-number="123" />
			<some-element attr:some-number="123." />
			<some-element attr:some-number=".123" />
			<some-element attr:some-number="1.23" />
			<some-element attr:some-number="1.2e1" />
			<some-element attr:some-number="0xefef" />
			<some-element attr:some-number="0b1010" />
			{/* @ts-expect-error good, "0z1010" is not a number string */}
			<some-element attr:some-number="0z1010" />
			{/* @ts-expect-error good, "blah" is not a number string */}
			<some-element attr:some-number="blah" />
			{/* @ts-expect-error good, "1.blah" is not a number string */}
			<some-element attr:some-number="1.blah" />
		</>
	})
})
