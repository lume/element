import { reactive, signalify } from 'classy-solid';
import { Element } from './LumeElement.js';
import { __classFinishers, __setUpAttribute } from './attribute.js';
export function element(tagNameOrClass, autoDefineOrContext) {
    let tagName = '';
    let autoDefine = !!(autoDefineOrContext ?? true);
    if (typeof tagNameOrClass === 'string') {
        tagName = tagNameOrClass;
        return (Class, context) => {
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
            const props = [];
            const attrsToProps = ElementDecoratorFinisher.prototype.__attributesToProps;
            for (const attr in attrsToProps) {
                const prop = attrsToProps[attr].name;
                if (Object.hasOwn(attrsToProps, attr))
                    props.push(prop);
                const handler = attrsToProps[attr].attributeHandler;
                if (handler && !('default' in handler))
                    handler.default = this[prop];
            }
            if (props.length)
                signalify(this, ...props);
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
        finishClass();
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