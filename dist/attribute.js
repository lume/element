import { camelCaseToDash, defineProp } from './_utils.js';
export function attribute(handlerOrProto, propName, descriptor) {
    const isDecoratorV2 = handlerOrProto && 'kind' in handlerOrProto;
    if (isDecoratorV2) {
        const classElement = handlerOrProto;
        return {
            ...classElement,
            finisher(Class) {
                var _a;
                _attribute(Class.prototype, classElement.key);
                return (_a = (classElement.finisher && classElement.finisher(Class))) !== null && _a !== void 0 ? _a : Class;
            },
        };
    }
    if (handlerOrProto && propName) {
        const prototype = handlerOrProto;
        return _attribute(prototype, propName, descriptor);
    }
    const handler = handlerOrProto;
    return (protoOrClassElement, propName, descriptor) => {
        const isDecoratorV2 = protoOrClassElement && 'kind' in protoOrClassElement;
        if (isDecoratorV2) {
            const classElement = protoOrClassElement;
            return {
                ...classElement,
                finisher(Class) {
                    var _a;
                    _attribute(Class.prototype, classElement.key, undefined, handler);
                    return (_a = (classElement.finisher && classElement.finisher(Class))) !== null && _a !== void 0 ? _a : Class;
                },
            };
        }
        return _attribute(protoOrClassElement, propName, descriptor, handler);
    };
}
export function _attribute(prototype, propName, descriptor, attributeHandler) {
    const ctor = prototype.constructor;
    if (!ctor.observedAttributes || !ctor.hasOwnProperty('observedAttributes')) {
        const inheritedAttrs = ctor.__proto__.observedAttributes;
        if (inheritedAttrs && !Array.isArray(inheritedAttrs)) {
            throw new TypeError('observedAttributes is in the wrong format. Maybe you forgot to decorate your custom element class with the `element` decorator.');
        }
        defineProp(ctor, 'observedAttributes', [...(inheritedAttrs || [])]);
    }
    if (!Array.isArray(ctor.observedAttributes)) {
        throw new TypeError('observedAttributes is in the wrong format. Maybe you forgot to decorate your custom element class with the `element` decorator.');
    }
    const attrName = camelCaseToDash(propName);
    if (!ctor.observedAttributes.includes(attrName))
        ctor.observedAttributes.push(attrName);
    if (!ctor.reactiveProperties || !ctor.hasOwnProperty('reactiveProperties'))
        defineProp(ctor, 'reactiveProperties', [...(ctor.reactiveProperties || [])]);
    if (!ctor.reactiveProperties.includes(propName))
        ctor.reactiveProperties.push(propName);
    mapAttributeToProp(prototype, attrName, propName, attributeHandler);
    if (descriptor)
        return descriptor;
}
function mapAttributeToProp(prototype, attr, prop, handler) {
    if (!prototype.__hasAttributeChangedCallback) {
        prototype.__hasAttributeChangedCallback = true;
        const originalAttrChanged = prototype.attributeChangedCallback;
        prototype.attributeChangedCallback = function (attr, oldVal, newVal) {
            var _a, _b;
            if (originalAttrChanged) {
                originalAttrChanged.call(this, attr, oldVal, newVal);
            }
            else {
                (_b = (_a = prototype.__proto__) === null || _a === void 0 ? void 0 : _a.attributeChangedCallback) === null || _b === void 0 ? void 0 : _b.call(this, attr, oldVal, newVal);
            }
            const prop = this.__attributesToProps && this.__attributesToProps[attr];
            if (prop) {
                const handler = prop.attributeHandler;
                this[prop.name] = handler && handler.from ? handler.from(newVal) : newVal;
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
        console.warn('The `@attribute` decorator is overriding an already-existing attribute-to-property mapping for the "' +
            attr +
            '" attribute.');
    }
    prototype.__attributesToProps[attr] = { name: prop, attributeHandler: handler };
}
attribute.string = ((def = '') => ({
    default: def,
    from(str) {
        return str == null ? this.default : str;
    },
}));
export function stringAttribute(defaultValue = '') {
    return attribute(attribute.string(defaultValue));
}
attribute.number = ((def = 0) => ({
    default: def,
    from(str) {
        return str == null ? this.default : +str;
    },
}));
export function numberAttribute(defaultValue = 0) {
    return attribute(attribute.number(defaultValue));
}
attribute.boolean = ((def = false) => ({
    default: def,
    from(str) {
        return str == null ? this.default : str !== 'false';
    },
}));
export function booleanAttribute(defaultValue = false) {
    return attribute(attribute.boolean(defaultValue));
}
//# sourceMappingURL=attribute.js.map