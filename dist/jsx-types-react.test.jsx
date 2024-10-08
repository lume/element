/* @jsxImportSource react */
class SomeElement extends HTMLElement {
    someProp = true;
    get otherProp() {
        return 0;
    }
    set otherProp(_) { }
    /** do not use this property, its only for JSX types */
    __set__otherProp;
}
SomeElement;
describe('JSX types with ReactElementAttributes', () => {
    it('derives JSX types from classes', () => {
        ;
        <>
			<some-element someProp="false" otherProp="foo"/>
			<some-element someProp="false" otherProp="foo"/>
			<some-element someProp={false} otherProp={123}/>
			{/* @ts-expect-error good, number is invalid */}
			<some-element someProp={123}/>
			{/* @ts-expect-error good, 'blah' is invalid */}
			<some-element otherProp="blah"/>

			{/* Additionally TypeScript will allow unknown dash-case props (as we didn't not define JS properties with these exact dash-cased names, React 19+ will set the element attributes, useful for setting the attributes but React has no way to specify to set attributes for names without dashes) */}
			<some-element some-prop="false" other-prop="foo"/>
			{/* @ts-expect-error foo doesn't exist. TypeScript will only check existence of properties without dashes */}
			<some-element foo="false"/>
		</>;
    });
});
export {};
//# sourceMappingURL=jsx-types-react.test.jsx.map