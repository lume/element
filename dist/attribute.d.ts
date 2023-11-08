import type { ElementCtor } from './element.js';
export declare const __classFinishers: ((Class: ElementCtor) => void)[];
export declare function attribute(handler?: AttributeHandler): (value: any, context: any) => any;
export declare function attribute(value: any, context: any): any;
export declare namespace attribute {
    var string: AttributeType<string>;
    var number: AttributeType<number>;
    var boolean: AttributeType<boolean>;
}
export declare function __setUpAttribute(ctor: ElementCtor, propName: string, attributeHandler: AttributeHandler): any;
export type AttributeHandler<T = any> = {
    to?: (propValue: T) => string | null;
    from?: (AttributeValue: string) => T;
    default?: T;
};
type AttributeType<T> = () => AttributeHandler<T>;
export declare function stringAttribute(value: any, context: any): any;
export declare function numberAttribute(value: any, context: any): any;
export declare function booleanAttribute(value: any, context: any): any;
export {};
//# sourceMappingURL=attribute.d.ts.map