import { reactive } from './variable.js';
import { Element } from './LumeElement.js';
import { _attribute } from './attribute.js';
export function element(tagNameOrClassOrClassElement, autoDefine = true) {
    let tagName = '';
    if (typeof tagNameOrClassOrClassElement === 'string') {
        tagName = tagNameOrClassOrClassElement;
        return elementDecorator.bind(null, tagName, autoDefine);
    }
    autoDefine = false;
    const classOrClassElement = tagNameOrClassOrClassElement;
    return elementDecorator(tagName, autoDefine, classOrClassElement);
}
function elementDecorator(tagName, autoDefine, classOrClassElement) {
    if ('kind' in classOrClassElement) {
        const classElement = classOrClassElement;
        return { ...classElement, finisher: elementFinisher.bind(null, tagName, autoDefine) };
    }
    const Class = classOrClassElement;
    return elementFinisher(tagName, autoDefine, Class);
}
function elementFinisher(tagName, autoDefine, Class) {
    const attrs = Class.observedAttributes;
    if (Class.hasOwnProperty('elementName'))
        tagName = Class.elementName || tagName;
    else
        Class.elementName = tagName;
    if (Array.isArray(attrs)) {
    }
    else if (attrs && typeof attrs === 'object') {
        Class.observedAttributes = undefined;
        for (const prop in attrs)
            _attribute(Class.prototype, prop, undefined, attrs[prop]);
    }
    Class = reactive(Class);
    class ElementDecoratorFinisher extends Class {
        constructor(...args) {
            super(...args);
            handlePreUpgradeValues(this);
        }
    }
    if (tagName && autoDefine)
        customElements.define(tagName, ElementDecoratorFinisher);
    return ElementDecoratorFinisher;
}
function handlePreUpgradeValues(self) {
    if (!(self instanceof Element))
        return;
    for (const [key, value] of self._preUpgradeValues) {
        if (!(key in self)) {
            continue;
        }
        self._preUpgradeValues.delete(key);
        const desc = Object.getOwnPropertyDescriptor(self, key);
        if (desc && 'value' in desc) {
            delete self[key];
        }
        self[key] = value;
    }
}
//# sourceMappingURL=element.js.map