import './metadata-shim.js'; // TODO remove this shim once decorators land natively.
import { signal } from 'classy-solid';
import { camelCaseToDash, defineProp } from '../utils.js';
export const __classFinishers = [];
export function attribute(handlerOrValue, context) {
    // if used as a decorator directly with no options
    if (arguments.length === 2)
        return handleAttributeDecoration(handlerOrValue, context, undefined);
    // otherwise used as a decorator factory, possibly being passed options, like `@attribute({...})`
    const handler = handlerOrValue;
    return (value, context) => handleAttributeDecoration(value, context, handler);
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
            return signal(value, context);
    }
    else if (kind === 'accessor') {
        context.addInitializer(function () {
            const initialValue = this[name];
            if (!('default' in attributeHandler))
                attributeHandler.default = initialValue;
            // attributeHandler.sideEffect?.(this, name, initialValue)
        });
        if (useSignal)
            return signal(value, context);
    }
    else {
        throw new Error('@attribute is only for use on fields, getters/setters, and auto accessors.');
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
    const attrName = (attributeHandler.name ?? (attributeHandler.dashcase === false ? propName : camelCaseToDash(propName))).toLowerCase();
    // @prod-prune
    if (!attributeHandler.noWarn &&
        !attributeHandler.name &&
        attributeHandler.dashcase === false &&
        attrName !== propName && // uppercase letters in propName
        ctor.observedAttributes.includes(attrName)) {
        console.warn(`The attribute name "${attrName}" is already used by another property that might have a different letter casing. If you know what you're doing, such as overriding a property in a subclass, disable this warning by setting the attribute option 'noWarn' to 'true'. If you don't know why you're seeing this warning, then it means you've caused an attribute name clash on your custom element from two different properties with possibly varying name case such as "fooBar" and "foobar" along with the attribute option 'dashcase' set to 'false', and you should either set 'dashcase' to 'true' to avoid name collisions, manually set a different attribute 'name', or change the property name to have different letters case insensitively.`);
    }
    // @prod-prune
    if (!attributeHandler.noWarn && attributeHandler.name && ctor.observedAttributes.includes(attrName)) {
        console.warn(`The attribute name "${attrName}" is already used by another property with the same attribute name. If you know what you're doing, such as overriding a property in a subclass, disable this warning by setting the attribute option 'noWarn' to 'true'. If you don't know why you're seeing this warning, then it means you've caused an attribute name clash on your custom element from two different properties with the same attribute name, and you should either pick a different attribute 'name' value, or unset the attribute 'name' option (without setting the 'dashcase' option) to avoid name collisions.`);
    }
    if (!ctor.observedAttributes.includes(attrName))
        ctor.observedAttributes.push(attrName);
    mapAttributeToProp(ctor.prototype, attrName, propName, attributeHandler);
}
const hasAttributeChangedCallback = Symbol('hasAttributeChangedCallback');
export const __attributesToProps = Symbol('attributesToProps');
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
            const prop = this[__attributesToProps]?.[attr];
            this[prop.name] = newVal;
        };
    }
    // Extend the current prototype's attributesToProps object from the super
    // prototype's attributesToProps object.
    //
    // We use inheritance here or else all classes would pile their
    // attribute-prop definitions on a shared base class (they can clash,
    // override each other willy nilly and seemingly randomly).
    if (!Object.hasOwn(prototype, __attributesToProps)) {
        prototype[__attributesToProps] = { __proto__: prototype[__attributesToProps] || Object.prototype };
    }
    prototype[__attributesToProps][attr] = { name: prop, attributeHandler };
}
const toString = (str) => str;
/**
 * An attribute type for string attributes for use in the `static
 * observedAttributeHandlers` map when not using decorators.
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
 * An attribute type for number attributes for use in the `static
 * observedAttributeHandlers` map when not using decorators.
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
 * An attribute type for boolean attributes for use in the `static
 * observedAttributeHandlers` map when not using decorators.
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
/**
 * Converts an attribute string value (JS code) into a function for use as an
 * event handler, similar to built-in event attributes such as "onclick".
 */
const toEvent = function (str) {
    return new Function(str);
};
/**
 * An attribute type for attribute events for use in the `static
 * observedAttributeHandlers` map when not using decorators.
 *
 * Example usage without decorators:
 *
 * ```js
 * element('my-el')(
 *   class MyEl extends LumeElement {
 *     static observedAttributeHandlers = {
 *       "onsomeevent": attribute.event()
 *     }
 *
 *     "onsomeevent" = null
 *
 *     connectedCallback() {
 * 	     super.connectedCallback()
 *       this.dispatchEvent(new Event('someevent'))
 *     }
 *   }
 * )
 *
 * const el = document.createElement('my-el')
 * el.onsomeevent = e => console.log('someevent', e)
 * document.body.append(el) // will log "someevent Event {...}" when the element is connected
 *
 * const el2 = document.createElement('my-el')
 * el2.setAttribute("onsomeevent", "console.log('someevent', event)")
 * document.body.append(el2) // will log "someevent Event {...}" when the element is connected
 * ```
 */
attribute.event = (() => ({
    from: toEvent,
    dashcase: false,
    sideEffect(el, prop, handler) {
        if (handler && typeof handler !== 'function')
            throw new Error('Event handlers must be functions.');
        const previousHandler = el[prop];
        const eventName = prop.replace(/^on/, '');
        if (previousHandler)
            el.removeEventListener(eventName, previousHandler);
        if (handler)
            el.addEventListener(eventName, handler);
    },
}));
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
export function eventAttribute(value, context) {
    return attribute(attribute.event())(value, context);
}
//# sourceMappingURL=attribute.js.map