import type { ElementCtor } from './element.js';
export declare const __classFinishers: ((Class: ElementCtor) => void)[];
type AttributeDecoratorContext = ClassFieldDecoratorContext | ClassGetterDecoratorContext | ClassSetterDecoratorContext;
export declare function attribute(handler?: AttributeHandler): (value: unknown, context: AttributeDecoratorContext) => any;
export declare function attribute(value: unknown, context: AttributeDecoratorContext): any;
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
export declare function stringAttribute(value: unknown, context: AttributeDecoratorContext): any;
export declare function numberAttribute(value: unknown, context: AttributeDecoratorContext): any;
export declare function booleanAttribute(value: unknown, context: AttributeDecoratorContext): any;
export {};
//# sourceMappingURL=attribute.d.ts.map