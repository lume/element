export declare function attribute(prototype: any, propName: string, descriptor?: PropertyDescriptor): any;
export declare function attribute(handler?: AttributeHandler): (proto: any, propName: string) => any;
export declare namespace attribute {
    var string: AttributeType<string>;
    var number: AttributeType<number>;
    var boolean: AttributeType<boolean>;
}
export declare function _attribute(prototype: any, propName: string, descriptor?: PropertyDescriptor, attributeHandler?: AttributeHandler): any;
export type AttributeHandler<T = any> = {
    to?: (propValue: T) => string | null;
    from?: (AttributeValue: string | null) => T;
    default?: T;
};
type AttributeType<T> = (defaultValue?: T) => AttributeHandler<T>;
export declare function stringAttribute(defaultValue?: string): (proto: any, propName: string) => any;
export declare function numberAttribute(defaultValue?: number): (proto: any, propName: string) => any;
export declare function booleanAttribute(defaultValue?: boolean): (proto: any, propName: string) => any;
export {};
//# sourceMappingURL=attribute.d.ts.map