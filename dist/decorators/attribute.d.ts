import './metadata-shim.js';
import type { ElementCtor } from './element.js';
export declare const __classFinishers: ((Class: ElementCtor) => void)[];
type AttributeDecoratorContext<This = unknown, Value = unknown> = ClassFieldDecoratorContext<This, Value> | ClassGetterDecoratorContext<This, Value> | ClassSetterDecoratorContext<This, Value> | ClassAccessorDecoratorContext<This, Value>;
/**
 * A decorator that when used on a property or accessor causes an HTML attribute
 * with the same name (but dash-cased instead of camelCased) to be mapped to the
 * decorated property. For example, if the `@attribute` decorator is used on a
 * property called `firstName`, then an attribute called `first-name` will be
 * mapped to the property. Any time that the attribute value changes (f.e. with
 * `el.setAttribute`), the attribute value will propgate to the property which
 * triggers reactivity.
 *
 * The decorated property is backed by a Solid.js signal, thus useful in effects
 * or templates.
 *
 * The `@attribute` decorator is only for public fields, getters, setters, and
 * auto accessors.
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
    var string: AttributeHandler<string>;
    var number: AttributeHandler<number>;
    var boolean: AttributeHandler<boolean>;
    var event: AttributeHandler<EventListener<Event> | null>;
    var json: AttributeHandler<JSONValue>;
}
/**
 * Place this decorator before `@element` to avoid the property from being
 * backed by a Solid signal. I.e. the property will not be reactive, but will
 * still receive values from the HTML attribute.
 */
export declare const noSignal: (_value: unknown, context: AttributeDecoratorContext) => void;
export declare function __setUpAttribute(ctor: ElementCtor, attrName: string, propName: string, attributeHandler: AttributeHandler): any;
export declare const __hasAttributeChangedCallback: unique symbol;
export declare const __attributesToProps: unique symbol;
export type AttributePropSpec = {
    name: string;
    default?: unknown;
    attributeHandler?: AttributeHandler;
};
export type AttributePropSpecs = Record<string, AttributePropSpec>;
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
     *
     * **Default when omitted:** `value => value`
     */
    from?: (AttributeValue: string) => T;
    /**
     * A side effect to run when the value is set on the JS property. It also
     * runs once with the initial value. Avoid this if you can, and instead use
     * Solid effects. One use case of this is to call addEventListener with
     * event listener values immediately, just like with native `.on*`
     * properties.
     *
     * **Default when omitted:** `() => {}` (no sideeffect)
     */
    sideEffect?: (instance: Element, prop: string, propValue: T) => void;
    /**
     * @deprecated - Define a field with the initial value instead of providing
     * the initial value here. When decorators land in browsers, this will be
     * removed.
     *
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
     *
     * **Default when omitted:** the value of the respective class field, or
     * `undefined` if the field was not defined.
     */
    default?: T;
    /**
     * Whether to convert the property name to dash-case for the attribute name.
     * This option is ignore if the `name` option is set.
     *
     * The default is `true`, where the attribute name will be the same as the
     * property name but dash-cased (and all lower case). For example, `fooBar`
     * becomes `foo-bar` and `foo-bar` stays `foo-bar`.
     *
     * If this is set to `false`, the attribute name will be the same as the
     * property name, but all lowercased (attributes are case insensitive). For
     * example `fooBar` becomes `foobar` and `foo-bar` stays `foo-bar`.
     *
     * Note! Using this option to make a non-standard prop-attribute mapping
     * will result in template type definitions (f.e. in JSX) missing the
     * customized attribute names and will require custom type definition
     * management.
     *
     * **Default when omitted:** `true`
     */
    dashcase?: boolean;
    /**
     * The name of the attribute to use. Use of this options bad practice to be
     * avoided, but it may be useful in rare cases.
     *
     * If this is not specified, see `dashcase` for how the attribute name is
     * derived from the property name.
     *
     * Note! Using this option to make a non-standard prop-attribute mapping
     * will result in template type definitions (f.e. in JSX) missing the
     * customized attribute names and will require custom type definition
     * management.
     *
     * **Default when omitted:** the attribute name derived from the property
     * name, converted to dash-case based on the `dashcase` option.
     */
    name?: string;
    /**
     * Whether to suppress warnings about the attribute attribute name clashes
     * when not using default `dashcase` and `name` settings. This is
     * discouraged, and should only be used when you know what you're doing,
     * such as overriding a property that has `dashcase` set to `false` or
     * `name` set to the same name as the attribue of another property.
     *
     * **Default when omitted:** `false`
     */
    noWarn?: boolean;
};
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
export declare const stringAttribute: (value: unknown, context: AttributeDecoratorContext) => any;
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
export declare const numberAttribute: (value: unknown, context: AttributeDecoratorContext) => any;
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
export declare const booleanAttribute: (value: unknown, context: AttributeDecoratorContext) => any;
/**
 * A decorator for mapping an event attribute to a JS property (similar to
 * builtin attributes like "onclick"). The string value of the attribute will be
 * converted into a function for use as an event handler.
 *
 * Example decorator usage:
 *
 * ```js
 * ⁣@element('my-el')
 * class MyEl extends LumeElement {
 *   ⁣@eventAttribute onsomeevent = null
 *
 *   connectedCallback() {
 *     super.connectedCallback()
 *     this.dispatchEvent(new Event('someevent'))
 *   }
 * }
 *
 * const el = document.createElement('my-el')
 * el.onsomeevent = e => console.log('someevent', e)
 * document.body.append(el) // will log "someevent Event {...}" when the element is connected
 *
 * const el2 = document.createElement('my-el')
 * el2.setAttribute("onsomeevent", "console.log('someevent', event)")
 * document.body.append(el2) // will log "someevent Event {...}" when the element is connected
 * ```
 *
 * Example HTML attribute usage:
 *
 * ```html
 * <body>
 *   <my-el onsomeevent="console.log('someevent', event)"></my-el>
 * </body>
 * ```
 *
 * Example JSX prop usage:
 *
 * ```jsx
 * return <my-el onsomeevent={event => console.log('someevent', event)} />
 * ```
 */
export declare const eventAttribute: (value: unknown, context: AttributeDecoratorContext) => any;
export type EventListener<T extends Event = Event> = (event: T) => void;
export type EventHandler<T extends Event = Event> = {
    handleEvent: EventListener<T>;
};
export declare const jsonAttribute: (value: unknown, context: AttributeDecoratorContext) => any;
export type JSONValue = string | number | boolean | null | {
    [key: string]: JSONValue;
} | Array<JSONValue>;
export {};
//# sourceMappingURL=attribute.d.ts.map