/* @jsxImportSource solid-js */

import type {ElementAttributes} from './LumeElement.js'

class SomeElement extends HTMLElement {
	someProp: 'true' | 'false' | boolean = true

	get otherProp(): number {
		return 0
	}
	set otherProp(_: this['__set__otherProp']) {}

	/** do not use this property, its only for JSX types */
	__set__otherProp!: number | 'foo'
}

SomeElement

declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements {
			'some-element': ElementAttributes<SomeElement, 'someProp' | 'otherProp'>
		}
	}
}

describe('JSX types with ElementAttributes', () => {
	it('derives JSX types from classes', () => {
		;<>
			<some-element some-prop="false" other-prop="foo" />
			<some-element some-prop="false" other-prop="foo" />
			<some-element some-prop={false} other-prop={123} />
			{/* @ts-expect-error good, number is invalid */}
			<some-element some-prop={123} />
			{/* @ts-expect-error good, 'blah' is invalid */}
			<some-element other-prop="blah" />

			{/* Additionally TypeScript will allow unknown dash-case props (the attr: can be used here to tell Solid to set the element attributes instead of the JS properties) */}
			<some-element attr:some-prop="false" attr:other-prop="foo" />
			{/* @ts-expect-error foo doesn't exist. TypeScript will only check existence of properties without dashes */}
			<some-element foo="false" />
		</>
	})
})
