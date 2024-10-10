import type { ReactElementAttributes } from './react.js';
declare class SomeElement extends HTMLElement {
    someProp: 'true' | 'false' | boolean;
    get otherProp(): number;
    set otherProp(_: this['__set__otherProp']);
    /** do not use this property, its only for JSX types */
    __set__otherProp: number | 'foo';
}
declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'some-element': ReactElementAttributes<SomeElement, 'someProp' | 'otherProp'>;
        }
    }
}
export {};
//# sourceMappingURL=jsx-types-react.test.d.ts.map