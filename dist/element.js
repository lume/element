import { reactive, signalify } from 'classy-solid';
import { Element } from './LumeElement.js';
import { __classFinishers, __setUpAttribute } from './attribute.js';
export function element(...args) {
    const [tagNameOrClass, autoDefineOrContext] = args;
    let tagName = '';
    let autoDefine = !!(autoDefineOrContext ?? true);
    if (typeof tagNameOrClass === 'string') {
        tagName = tagNameOrClass;
        return (...args) => {
            const [Class, context] = args;
            return applyElementDecoration(Class, context, tagName, autoDefine);
        };
    }
    autoDefine = false;
    const Class = tagNameOrClass;
    const context = autoDefineOrContext;
    return applyElementDecoration(Class, context, tagName, autoDefine);
}
function applyElementDecoration(Class, context, tagName, autoDefine) {
    if (typeof Class !== 'function' || (context && context.kind !== 'class'))
        throw new Error('@element is only for use on classes.');
    let Ctor = Class;
    const attrs = Ctor.observedAttributes;
    if (Ctor.hasOwnProperty('elementName'))
        tagName = Ctor.elementName || tagName;
    else
        Ctor.elementName = tagName;
    if (Array.isArray(attrs)) {
    }
    else if (attrs && typeof attrs === 'object') {
        Ctor.observedAttributes = undefined;
        for (const prop in attrs)
            __setUpAttribute(Ctor, prop, attrs[prop]);
    }
    Ctor = reactive(Ctor, context);
    class ElementDecoratorFinisher extends Ctor {
        constructor(...args) {
            super(...args);
            handlePreUpgradeValues(this);
            const keys = [];
            const attrsToProps = ElementDecoratorFinisher.prototype.__attributesToProps;
            for (const key in attrsToProps) {
                if (Object.hasOwn(attrsToProps, key))
                    keys.push(attrsToProps[key].name);
            }
            if (keys.length)
                signalify(this, ...keys);
        }
    }
    const classFinishers = [...__classFinishers];
    __classFinishers.length = 0;
    function finishClass() {
        for (const finisher of classFinishers)
            finisher(ElementDecoratorFinisher);
        if (tagName && autoDefine)
            customElements.define(tagName, ElementDecoratorFinisher);
    }
    if (context?.addInitializer) {
        context.addInitializer(finishClass);
    }
    else {
        queueMicrotask(finishClass);
    }
    return ElementDecoratorFinisher;
}
function handlePreUpgradeValues(self) {
    if (!(self instanceof Element))
        return;
    for (const [key, value] of self._preUpgradeValues) {
        if (!(key in self))
            continue;
        self._preUpgradeValues.delete(key);
        const desc = Object.getOwnPropertyDescriptor(self, key);
        if (desc && 'value' in desc) {
            delete self[key];
        }
        self[key] = value;
    }
}
//# sourceMappingURL=element.js.map