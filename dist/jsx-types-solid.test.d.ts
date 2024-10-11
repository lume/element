import { Element, type ElementAttributes } from './LumeElement.js';
type SomeElementAttributes = 'someProp' | 'someBoolean' | 'otherProp' | 'onsomeevent' | 'onnotanevent' | 'someNumber';
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
declare class SomeElement extends Element {
    #private;
    someProp: 'true' | 'false' | boolean;
    ignoredBoolean: boolean;
    someBoolean: boolean;
    /** This is a getter/setter whose getter always returns number, but whose setter can accept a specific non-number value which is coerced into a number. */
    get otherProp(): number;
    set otherProp(_: this['__set__otherProp']);
    /** do not use this property, its only for JSX types */
    __set__otherProp: number | 'foo';
    onsomeevent: ((event: SomeEvent) => void) | null;
    onnotanevent: number;
    ignoredNumber: number;
    someNumber: number;
}
declare class SomeEvent extends Event {
    foo: number;
}
declare module 'solid-js' {
    namespace JSX {
        interface IntrinsicElements {
            'some-element': ElementAttributes<SomeElement, SomeElementAttributes>;
        }
    }
}
export {};
//# sourceMappingURL=jsx-types-solid.test.d.ts.map