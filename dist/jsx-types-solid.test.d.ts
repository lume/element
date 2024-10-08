import type { ElementAttributes } from './LumeElement.js';
declare class SomeElement extends HTMLElement {
    someProp: 'true' | 'false' | boolean;
    get otherProp(): number;
    set otherProp(_: this['__set__otherProp']);
    /** do not use this property, its only for JSX types */
    __set__otherProp: number | 'foo';
}
declare module 'solid-js' {
    namespace JSX {
        interface IntrinsicElements {
            'some-element': ElementAttributes<SomeElement, 'someProp' | 'otherProp'>;
        }
    }
}
export {};
//# sourceMappingURL=jsx-types-solid.test.d.ts.map