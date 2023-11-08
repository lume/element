import { signal } from 'classy-solid';
import { camelCaseToDash, defineProp } from './_utils.js';
export const __classFinishers = [];
export function attribute(...args) {
    if (args.length === 2)
        return handleAttributeDecoration(args, undefined);
    const [handler] = args;
    return (...args) => handleAttributeDecoration(args, handler);
}
function handleAttributeDecoration(args, attributeHandler = {}) {
    const [_, context] = args;
    const { kind, name, private: isPrivate, static: isStatic } = context;
    if (typeof name === 'symbol')
        throw new Error('@attribute is not supported on symbol fields yet.');
    if (isPrivate)
        throw new Error('@attribute is not supported on private fields yet.');
    if (isStatic)
        throw new Error('@attribute is not supported on static fields.');
    __classFinishers.push((Class) => __setUpAttribute(Class, name, attributeHandler));
    if (kind === 'field') {
        const signalInitializer = signal(_, context);
        return function (initialValue) {
            initialValue = signalInitializer(initialValue);
            attributeHandler.default = 'default' in attributeHandler ? attributeHandler.default : initialValue;
            return initialValue;
        };
    }
    else if (kind === 'accessor') {
        throw new Error('@attribute is not supported on `accessor` fields yet. Use it on a plain class field, along with the @element decorator applied on the same class.');
    }
    else if (kind === 'getter' || kind === 'setter') {
        signal(_, context);
    }
    else {
        throw new Error('@attribute is only for use on fields, accessors, getters, and setters.');
    }
    return undefined;
}
export function __setUpAttribute(ctor, propName, attributeHandler) {
    if (!ctor.observedAttributes ||
        !ctor.hasOwnProperty('observedAttributes')) {
        const inheritedAttrs = ctor.__proto__.observedAttributes;
        if (inheritedAttrs && !Array.isArray(inheritedAttrs)) {
            throw new TypeError('observedAttributes is in the wrong format. Did you forget to decorate your custom element class with the `@element` decorator?');
        }
        defineProp(ctor, 'observedAttributes', [...(inheritedAttrs || [])]);
    }
    if (!Array.isArray(ctor.observedAttributes)) {
        throw new TypeError('observedAttributes is in the wrong format. Maybe you forgot to decorate your custom element class with the `@element` decorator.');
    }
    const attrName = camelCaseToDash(propName);
    if (!ctor.observedAttributes.includes(attrName))
        ctor.observedAttributes.push(attrName);
    mapAttributeToProp(ctor.prototype, attrName, propName, attributeHandler);
}
function mapAttributeToProp(prototype, attr, prop, attributeHandler) {
    if (!prototype.__hasAttributeChangedCallback) {
        prototype.__hasAttributeChangedCallback = true;
        const originalAttrChanged = prototype.attributeChangedCallback;
        prototype.attributeChangedCallback = function (attr, oldVal, newVal) {
            if (originalAttrChanged) {
                originalAttrChanged.call(this, attr, oldVal, newVal);
            }
            else {
                prototype.__proto__?.attributeChangedCallback?.call(this, attr, oldVal, newVal);
            }
            const prop = this.__attributesToProps && this.__attributesToProps[attr];
            if (prop) {
                const handler = prop.attributeHandler;
                this[prop.name] = !handler
                    ? newVal
                    : newVal === null
                        ? 'default' in handler
                            ? handler.default
                            : null
                        : handler.from
                            ? handler.from(newVal)
                            : newVal;
            }
        };
    }
    if (!prototype.hasOwnProperty('__attributesToProps')) {
        Object.defineProperty(prototype, '__attributesToProps', {
            value: {
                __proto__: prototype.__attributesToProps || Object.prototype,
            },
        });
    }
    if (prototype.__attributesToProps[attr]) {
        console.debug('The `@attribute` decorator is overriding an already-existing attribute-to-property mapping for the "' +
            attr +
            '" attribute.');
    }
    prototype.__attributesToProps[attr] = { name: prop, attributeHandler };
}
const toString = (str) => str;
attribute.string = (() => ({ from: toString }));
export function stringAttribute(value, context) {
    return attribute(attribute.string())(value, context);
}
const toNumber = (str) => +str;
attribute.number = (() => ({ from: toNumber }));
export function numberAttribute(value, context) {
    return attribute(attribute.number())(value, context);
}
const toBoolean = (str) => str !== 'false';
attribute.boolean = (() => ({ from: toBoolean }));
export function booleanAttribute(value, context) {
    return attribute(attribute.boolean())(value, context);
}
//# sourceMappingURL=attribute.js.map