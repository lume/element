import './metadata-shim.js'; // TODO remove this shim once decorators land natively.
import { signal } from 'classy-solid';
import { camelCaseToDash, defineProp } from './_utils.js';
export const __classFinishers = [];
export function attribute(handlerOrValue, context) {
    // if used as a decorator directly with no options
    if (arguments.length === 2)
        return handleAttributeDecoration(handlerOrValue, context, undefined);
    // otherwise used as a decorator factory, possibly being passed options, like `@attribute({...})`
    const handler = handlerOrValue;
    return (value, context) => handleAttributeDecoration(value, context, handler);
    // TODO throw an error for cases when @element is not used on a class with @attribute decorations, similar to classy-solid @signal/@reactive.
}
/**
 * Place this decorator before `@element` to avoid the property from being
 * backed by a Solid signal. I.e. the property will not be reactive, but will
 * still receive values from the HTML attribute.
 */
export const noSignal = (_value, context) => {
    if (!Object.hasOwn(context.metadata, 'noSignal'))
        context.metadata.noSignal = new Set();
    context.metadata.noSignal.add(context.name);
};
function handleAttributeDecoration(value, context, attributeHandler = {}) {
    const { kind, name, private: isPrivate, static: isStatic, metadata } = context;
    // Check only own metadata.noSignal, we don't want to use the one inherited from a base class.
    const noSignal = (Object.hasOwn(metadata, 'noSignal') && metadata.noSignal) || undefined;
    const useSignal = !noSignal?.has(name);
    if (typeof name === 'symbol')
        throw new Error('@attribute is not supported on symbol fields yet.');
    if (isPrivate)
        throw new Error('@attribute is not supported on private fields yet.');
    if (isStatic)
        throw new Error('@attribute is not supported on static fields.');
    // TODO decorate on prototype? Or decorate on instance?
    __classFinishers.push((Class) => __setUpAttribute(Class, name, attributeHandler));
    if (kind === 'field') {
        const signalInitializer = useSignal ? signal(value, context) : (v) => v;
        return function (initialValue) {
            initialValue = signalInitializer(initialValue);
            // Typically the first initializer to run for a class field (on
            // instantiation of the first instance of its class) will be our
            // source of truth for our default attribute value, but we check for
            // 'default' in attributeHandler just in case that a an attribute
            // decorator was passed an explicit default, f.e.
            // `@attribute({default: 123})`.
            if (!('default' in attributeHandler))
                attributeHandler.default = initialValue;
            return initialValue;
        };
    }
    else if (kind === 'getter' || kind === 'setter') {
        if (useSignal)
            signal(value, context);
    }
    else {
        throw new Error('@attribute is only for use on fields, getters, and setters. Auto accessor support is coming next if there is demand for it.');
    }
    return undefined; // shush TS
}
// TODO Do similar as with the following attributeChangedCallback prototype
// patch, but also with (dis)connected callbacks which can call an instance's
// template method, so users don't have to extend from the LumeElement base class.
// Extending from the LumeElement base class will be the method that non-decorator
// users must use.
export function __setUpAttribute(ctor, propName, attributeHandler) {
    if (
    //
    !ctor.observedAttributes ||
        !ctor.hasOwnProperty('observedAttributes')) {
        const inheritedAttrs = ctor.__proto__.observedAttributes;
        // @prod-prune
        if (inheritedAttrs && !Array.isArray(inheritedAttrs)) {
            throw new TypeError('observedAttributes is in the wrong format. Did you forget to decorate your custom element class with the `@element` decorator?');
        }
        defineProp(ctor, 'observedAttributes', [...(inheritedAttrs || [])]);
    }
    // @prod-prune
    if (!Array.isArray(ctor.observedAttributes)) {
        throw new TypeError('observedAttributes is in the wrong format. Maybe you forgot to decorate your custom element class with the `@element` decorator.');
    }
    const attrName = camelCaseToDash(propName);
    if (!ctor.observedAttributes.includes(attrName))
        ctor.observedAttributes.push(attrName);
    mapAttributeToProp(ctor.prototype, attrName, propName, attributeHandler);
}
const hasAttributeChangedCallback = Symbol('hasAttributeChangedCallback');
export const attributesToProps = Symbol('attributesToProps');
// This stores attribute definitions as an inheritance chain on the constructor.
function mapAttributeToProp(prototype, attr, prop, attributeHandler) {
    // Only define attributeChangedCallback once.
    if (!prototype[hasAttributeChangedCallback]) {
        prototype[hasAttributeChangedCallback] = true;
        const originalAttrChanged = prototype.attributeChangedCallback;
        prototype.attributeChangedCallback = function (attr, oldVal, newVal) {
            // If the class already has an attributeChangedCallback, let is run,
            // and let it call or not call super.attributeChangedCallback.
            if (originalAttrChanged) {
                originalAttrChanged.call(this, attr, oldVal, newVal);
            }
            // Otherwise, let's not intentionally break inheritance and be sure
            // we call the super method (if it exists).
            else {
                // This is equivalent to `super.attributeChangedCallback?()`
                prototype.__proto__?.attributeChangedCallback?.call(this, attr, oldVal, newVal);
            }
            // map from attribute to property
            const prop = this[attributesToProps]?.[attr];
            if (prop) {
                const handler = prop.attributeHandler;
                // prettier-ignore
                this[prop.name] = !handler
                    ? newVal
                    : newVal === null // attribute removed
                        ? 'default' in handler
                            ? handler.default
                            : null
                        : handler.from
                            ? handler.from(newVal)
                            : newVal;
            }
        };
    }
    // Extend the current prototype's attributesToProps object from the super
    // prototype's attributesToProps object.
    //
    // We use inheritance here or else all classes would pile their
    // attribute-prop definitions on a shared base class (they can clash,
    // override each other willy nilly and seemingly randomly).
    if (!prototype.hasOwnProperty(attributesToProps)) {
        // using defineProperty so that it is non-writable, non-enumerable, non-configurable
        Object.defineProperty(prototype, attributesToProps, {
            value: {
                __proto__: prototype[attributesToProps] || Object.prototype,
            },
        });
        // Object.create(prototype[attributesToProps] || Object.prototype)
    }
    prototype[attributesToProps][attr] = { name: prop, attributeHandler };
}
const toString = (str) => str;
/**
 * An attribute type for use in the `static observedAttributeHandlers` map
 * when not using decorators.
 *
 * Example usage without decorators:
 *
 * ```js
 * element('my-el')(
 *   class MyEl extends LumeElement {
 *     static observedAttributeHandlers = {
 *       name: attribute.string()
 *     }
 *
 *     name = "honeybun" // default value when attribute removed
 *   }
 * )
 * ```
 */
attribute.string = (() => ({ from: toString }));
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
export function stringAttribute(value, context) {
    return attribute(attribute.string())(value, context);
}
const toNumber = (str) => +str;
/**
 * An attribute type for use in the `static observedAttributeHandlers` map
 * when not using decorators.
 *
 * Example usage without decorators:
 *
 * ```js
 * element('my-el')(
 *   class MyEl extends LumeElement {
 *     static observedAttributeHandlers = {
 *       money: attribute.number()
 *     }
 *
 *     money = 1000 // default value when attribute removed
 *   }
 * )
 * ```
 */
attribute.number = (() => ({ from: toNumber }));
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
export function numberAttribute(value, context) {
    return attribute(attribute.number())(value, context);
}
const toBoolean = (str) => str !== 'false';
/**
 * An attribute type for use in the `static observedAttributeHandlers` map
 * when not using decorators.
 *
 * Example usage without decorators:
 *
 * ```js
 * element('my-el')(
 *   class MyEl extends LumeElement {
 *     static observedAttributeHandlers = {
 *       hasCash: attribute.boolean()
 *     }
 *
 *     hasCash = true // default value when attribute removed
 *   }
 * )
 * ```
 */
attribute.boolean = (() => ({ from: toBoolean }));
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
export function booleanAttribute(value, context) {
    return attribute(attribute.boolean())(value, context);
}
//# sourceMappingURL=attribute.js.map