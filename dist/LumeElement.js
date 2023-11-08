import { render } from 'solid-js/web';
import { defer } from './_utils.js';
let ctor;
const HTMLElement = globalThis.HTMLElement ??
    class HTMLElement {
        constructor() {
            throw new Error("@lume/element needs a DOM to operate with! If this code is running during server-side rendering, it means your app is trying to instantiate elements when it shouldn't be, and should be refactored to avoid doing that when no DOM is present.");
        }
    };
class LumeElement extends HTMLElement {
    static elementName = '';
    static defineElement(name, registry = customElements) {
        if (!name) {
            name = this.elementName;
            if (registry.get(name)) {
                console.warn(`defineElement(): An element class was already defined for tag name ${name}.`);
                return this;
            }
            registry.define(name, this);
            return this;
        }
        else {
            if (registry.get(name)) {
                console.warn(`defineElement(): An element class was already defined for tag name ${name}.`);
                return this;
            }
            else {
                const Class = class extends this {
                };
                Class.elementName = name;
                registry.define(name, Class);
                return Class;
            }
        }
    }
    static observedAttributes;
    ___init___ = (() => {
        this.__handleInitialPropertyValuesIfAny();
    })();
    __handleInitialPropertyValuesIfAny() {
        const preUpgradeKeys = Object.keys(this);
        this._preUpgradeValues = new Map();
        for (const propName of preUpgradeKeys) {
            const descriptor = Object.getOwnPropertyDescriptor(this, propName);
            if ('value' in descriptor) {
                delete this[propName];
                this._preUpgradeValues.set(propName, descriptor.value);
                defer(() => {
                    const propSetAtLeastOnce = this.__propsSetAtLeastOnce__?.has(propName);
                    if (propSetAtLeastOnce)
                        return;
                    const inheritsProperty = propName in this.__proto__;
                    const hasReactifiedProp = this.__reactifiedProps__?.has(propName);
                    if (inheritsProperty || hasReactifiedProp)
                        this[propName] = descriptor.value;
                });
            }
            else {
            }
        }
    }
    hasShadow = true;
    __root = null;
    get root() {
        if (!this.hasShadow)
            return this;
        if (this.__root)
            return this.__root;
        if (this.shadowRoot)
            return (this.__root = this.shadowRoot);
        return (this.__root = this.attachShadow({ mode: 'open' }));
    }
    set root(v) {
        if (!this.hasShadow)
            throw new Error('Can not set root, element.hasShadow is false.');
        if (this.__root || this.shadowRoot)
            throw new Error('Element root can only be set once if there is no ShadowRoot.');
        this.__root = v;
    }
    get styleRoot() {
        return this.root;
    }
    attachShadow(options) {
        if (this.__root)
            console.warn('Element already has a root defined.');
        return (this.__root = super.attachShadow(options));
    }
    connectedCallback() {
        this.__setStyle();
        const template = this.template;
        if (template)
            this.__dispose = render(typeof template === 'function' ? template.bind(this) : () => template, this.root);
    }
    disconnectedCallback() {
        this.__dispose && this.__dispose();
        this.__cleanupStyle();
    }
    static __styleRootNodeRefCountPerTagName = new WeakMap();
    __styleRootNode = null;
    #defaultHostStyle = (hostSelector) => `${hostSelector} {
		display: block;
	}`;
    __setStyle() {
        ctor = this.constructor;
        const staticCSS = typeof ctor.css === 'function' ? (ctor.css = ctor.css()) : ctor.css || '';
        const instanceCSS = typeof this.css === 'function' ? this.css() : this.css || '';
        if (this.hasShadow) {
            const hostSelector = ':host';
            const staticStyle = document.createElement('style');
            staticStyle.innerHTML = `
				${this.#defaultHostStyle(hostSelector)}
				${staticCSS}
				${instanceCSS}
			`;
            this.styleRoot.appendChild(staticStyle);
        }
        else {
            const rootNode = this.getRootNode();
            this.__styleRootNode = rootNode === document ? document.head : rootNode;
            let refCountPerTagName = LumeElement.__styleRootNodeRefCountPerTagName.get(this.__styleRootNode);
            if (!refCountPerTagName)
                LumeElement.__styleRootNodeRefCountPerTagName.set(this.__styleRootNode, (refCountPerTagName = {}));
            const refCount = refCountPerTagName[this.tagName] || 0;
            refCountPerTagName[this.tagName] = refCount + 1;
            if (refCount === 0) {
                const hostSelector = this.tagName.toLowerCase();
                const staticStyle = document.createElement('style');
                staticStyle.innerHTML = `
					${this.#defaultHostStyle(hostSelector)}
					${staticCSS ? staticCSS.replaceAll(':host', hostSelector) : staticCSS}
				`;
                staticStyle.id = this.tagName.toLowerCase();
                this.__styleRootNode.appendChild(staticStyle);
            }
            if (instanceCSS) {
                const id = this.tagName.toLowerCase() + '-' + this.__id;
                this.setAttribute(id, '');
                const instanceStyle = (this.__dynamicStyle = document.createElement('style'));
                instanceStyle.id = id;
                instanceStyle.innerHTML = instanceCSS.replaceAll(':host', `[${id}]`);
                const rootNode = this.getRootNode();
                this.__styleRootNode = rootNode === document ? document.head : rootNode;
                this.__styleRootNode.appendChild(instanceStyle);
            }
        }
    }
    static __elementId = 0;
    __id = LumeElement.__elementId++;
    __dynamicStyle = null;
    __cleanupStyle() {
        do {
            if (this.hasShadow)
                break;
            const refCountPerTagName = LumeElement.__styleRootNodeRefCountPerTagName.get(this.__styleRootNode);
            if (!refCountPerTagName)
                break;
            let refCount = refCountPerTagName[this.tagName];
            if (refCount === undefined)
                break;
            refCountPerTagName[this.tagName] = --refCount;
            if (refCount === 0) {
                delete refCountPerTagName[this.tagName];
                const style = this.__styleRootNode.querySelector('#' + this.tagName);
                style?.remove();
            }
        } while (false);
        if (this.__dynamicStyle)
            this.__dynamicStyle.remove();
    }
    adoptedCallback() { }
}
export { LumeElement as Element };
//# sourceMappingURL=LumeElement.js.map