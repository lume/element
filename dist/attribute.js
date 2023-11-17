import { signal } from 'classy-solid';
import { camelCaseToDash, defineProp } from './_utils.js';
export const __classFinishers = [];
export function attribute(handlerOrValue, context) {
    if (arguments.length === 2)
        return handleAttributeDecoration(handlerOrValue, context, undefined);
    const handler = handlerOrValue;
    return (value, context) => handleAttributeDecoration(value, context, handler);
}
function handleAttributeDecoration(value, context, attributeHandler = {}) {
    const { kind, name, private: isPrivate, static: isStatic } = context;
    if (typeof name === 'symbol')
        throw new Error('@attribute is not supported on symbol fields yet.');
    if (isPrivate)
        throw new Error('@attribute is not supported on private fields yet.');
    if (isStatic)
        throw new Error('@attribute is not supported on static fields.');
    __classFinishers.push((Class) => __setUpAttribute(Class, name, attributeHandler));
    if (kind === 'field') {
        const signalInitializer = signal(value, context);
        return function (initialValue) {
            initialValue = signalInitializer(initialValue);
            attributeHandler.default = 'default' in attributeHandler ? attributeHandler.default : initialValue;
            return initialValue;
        };
    }
    else if (kind === 'getter' || kind === 'setter') {
        signal(value, context);
    }
    else {
        throw new Error('@attribute is only for use on fields, getters, and setters. Auto accessor support is coming next if there is demand for it.');
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