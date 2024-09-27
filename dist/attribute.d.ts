import './metadata-shim.js';
import type { ElementCtor } from './element.js';
export declare const __classFinishers: ((Class: ElementCtor) => void)[];
/** The `@attribute` decorator currently works only on fields, getters, and setters. */
type AttributeDecoratorContext<This = unknown, Value = unknown> = ClassFieldDecoratorContext<This, Value> | ClassGetterDecoratorContext<This, Value> | ClassSetterDecoratorContext<This, Value>;
/**
 * A decorator that when used on a property or accessor causes an HTML attribute
 * with the same name (but dash-cased instead of camelCased) to be mapped to the
 * decorated property. For example, if the `@attribute` decorator is used on a
 * property called `firstName`, then an attribute called `first-name` will be
 * mapped to the property. Any time that the attribute value changes (f.e. with
 * `el.setAttribute`), the attribute value will propgate to the property a
 * trigger an update.
 *
 * The decorated property is backed by a Solid.js signal, thus useful in effects
 * or templates.
 *
 * Example:
 *
 * ```js
 * ⁣@element('my-el')
 * class MyEl extends Element {
 *   ⁣@attribute name = 'Lazayah'
 *
 *   template = () => <p>Name: {this.name}</p>
 * }
 * ```
 */
export declare function attribute(value: unknown, context: AttributeDecoratorContext): any;
export declare function attribute(handler?: AttributeHandler): (value: unknown, context: AttributeDecoratorContext) => any;
export declare namespace attribute {
    var string: AttributeType<string>;
    var number: AttributeType<number>;
    var boolean: AttributeType<boolean>;
}
/**
 * Place this decorator before `@element` to avoid the property from being
 * backed by a Solid signal. I.e. the property will not be reactive, but will
 * still receive values from the HTML attribute.
 */
export declare const noSignal: (_value: unknown, context: AttributeDecoratorContext) => void;
export declare function __setUpAttribute(ctor: ElementCtor, propName: string, attributeHandler: AttributeHandler): any;
export declare const __attributesToProps: unique symbol;
/**
 * Defines how values are mapped from an attribute to a JS property on a custom
 * element class.
 */
export type AttributeHandler<T = any> = {
    to?: (propValue: T) => string | null;
    /**
     * Define how to deserialize an attribute string value on its way to the
     * respective JS property.
     *
     * If not defined, the attribute string value is passed to the JS property
     * untouched.
     */
    from?: (AttributeValue: string) => T;
    /**
     * The default value that the respective JS property should have when the
     * attribute is removed.
     *
     * If this is not specified, and the respective class field is defined, it
     * will default to the initial value of the class field.  If this is
     * specified, it will take precedence over the respective field's initial
     * value. This should generally be avoided, and the class field initial
     * value should be relied on as the source of the default value.
     *
     * When defined, an attribute's respective JS property will be set to this
     * value when the attribute is removed. If not defined, then the JS property
     * will always receive the initial value of the respective JS class field or
     * `undefined` if the field was not defined (that's the "initial value" of
     * the field), when the attribute is removed.
     */
    default?: T;
};
type AttributeType<T> = () => AttributeHandler<T>;
/**
 * This is essentially an alias for `@attribute`. You can just use `@attribute`
 * if you want a more concise definition.
 *
 * A decorator for mapping a string-valued attribute to a JS property. All
 * attribute values get passed as-is, except for `null` (i.e. when an attribute
 * is removed) which gets converted into an empty string or the default value of
 * the class field. The handling of `null` (on attribute removed) is the only
 * difference between this and plain `@attribute`, where `@attribute` will pass
 * along `null`.
 *
 * Example decorator usage:
 *
 * ```js
 * ⁣@element('my-el')
 * class MyEl extends LumeElement {
 *   ⁣@stringAttribute color = "skyblue"
 * }
 * ```
 *
 * Example HTML attribute usage:
 *
 * ```html
 * <!-- el.color === "", because an attribute without a written value has an empty string value. -->
 * <my-el color></my-el>
 *
 * <!-- el.color === "skyblue", based on the default value defined on the class field. -->
 * <my-el></my-el>
 *
 * <!-- el.color === "deeppink" -->
 * <my-el color="deeppink"></my-el>
 *
 * <!-- el.color === "4.5" -->
 * <my-el color="4.5"></my-el>
 *
 * <!-- el.color === "any string in here" -->
 * <my-el color="any string in here"></my-el>
 * ```
 */
export declare function stringAttribute(value: unknown, context: AttributeDecoratorContext): any;
/**
 * A decorator for mapping a number attribute to a JS property. The string value
 * of the attribute will be parsed into a number.
 *
 * Example decorator usage:
 *
 * ```js
 * ⁣@element('my-el')
 * class MyEl extends LumeElement {
 *   ⁣@numberAttribute money = 123
 * }
 * ```
 *
 * Example HTML attribute usage:
 *
 * ```html
 * <!-- el.money === 0, because an empty string gets coerced into 0. -->
 * <my-el money></my-el>
 *
 * <!-- el.money === 123, based on the default value defined on the class field. -->
 * <my-el></my-el>
 *
 * <!-- el.money === 10 -->
 * <my-el money="10"></my-el>
 *
 * <!-- el.money === 4.5 -->
 * <my-el money="4.5"></my-el>
 *
 * <!-- el.money === Infinity -->
 * <my-el money="Infinity"></my-el>
 *
 * <!-- el.money === NaN -->
 * <my-el money="NaN"></my-el>
 *
 * <!-- el.money === NaN -->
 * <my-el money="blahblah"></my-el>
 * ```
 */
export declare function numberAttribute(value: unknown, context: AttributeDecoratorContext): any;
/**
 * A decorator for mapping a boolean attribute to a JS property. The string
 * value of the attribute will be converted into a boolean value on the JS
 * property. A string value of `"false"` and a value of `null` (attribute
 * removed) will be converted into a `false` value on the JS property. All other
 * attribute values (strings) will be converted into `true`.
 *
 * Example decorator usage:
 *
 * ```js
 * ⁣@element('my-el')
 * class MyEl extends LumeElement {
 *   ⁣@booleanAttribute hasMoney = true
 *   ⁣@booleanAttribute excited = false
 * }
 * ```
 *
 * Example HTML attribute usage:
 *
 * ```html
 * <!-- el.hasMoney === true, el.excited === true -->
 * <my-el has-money excited></my-el>
 *
 * <!-- el.hasMoney === true, el.excited === false, based on the default values defined
 * on the class fields. Start the a class field with a value of `false` to have
 * behavior similar to traditional DOM boolean attributes where the presence of
 * the attribute determines the boolean value of its respective JS property. -->
 * <my-el></my-el>
 *
 * <!-- el.hasMoney === false, el.excited === true -->
 * <my-el has-money="false"></my-el>
 *
 * <!-- el.hasMoney === true, el.excited === true -->
 * <my-el has-money="true"></my-el>
 *
 * <!-- el.hasMoney === true, el.excited === true -->
 * <my-el has-money=""></my-el>
 *
 * <!-- el.hasMoney === true, el.excited === true -->
 * <my-el has-money="blahblah"></my-el>
 * ```
 */
export declare function booleanAttribute(value: unknown, context: AttributeDecoratorContext): any;
export {};
//# sourceMappingURL=attribute.d.ts.map