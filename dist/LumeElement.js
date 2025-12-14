var _a;
import { render } from 'solid-js/web';
// isPropSetAtLeastOnce__ was exposed by classy-solid specifically for
// @lume/element to use. It tells us if a signal property has been set at
// least once, and if so allows us to skip overwriting it with a custom
// element preupgrade value.
import { Effects, isPropSetAtLeastOnce__, startEffects, stopEffects } from 'classy-solid';
// TODO `templateMode: 'append' | 'replace'`, which allows a subclass to specify
// if template content replaces the content of `root`, or is appended to `root`.
const HTMLElement = globalThis.HTMLElement ??
    class HTMLElement {
        constructor() {
            throw new Error("@lume/element needs a DOM to operate with! If this code is running during server-side rendering, it means your app is trying to instantiate elements when it shouldn't be, and should be refactored to avoid doing that when no DOM is present.");
        }
    };
const root = Symbol('root');
// TODO Make LumeElement `abstract`
class LumeElement extends HTMLElement {
    /**
     * The default tag name of the elements this class instantiates. When using
     * the `@element` decorator, if this field has not been specified, it will
     * be set to the value defined by the decorator.
     */
    static elementName = '';
    /**
     * When using the @element decorator, the element will be automatically
     * defined in the CustomElementRegistry if this is true, otherwise manual
     * registration will be needed if false. If autoDefine is passed into the
     * decorator, this field will be overriden by that value.
     */
    static autoDefine = true;
    static defineElement(nameOrRegistry = this.elementName, registry = customElements) {
        const name = typeof nameOrRegistry === 'string' ? nameOrRegistry : this.elementName;
        registry = typeof nameOrRegistry === 'string' ? customElements : nameOrRegistry;
        if (this === _a)
            throw new TypeError('defineElement() can only be called on a subclass of LumeElement.');
        if (!name)
            throw new TypeError(`defineElement(): Element name cannot be empty.`);
        if (registry.get(name))
            throw new TypeError(`defineElement(): registry has an existing definition for "${name}".`);
        // Allow the same element to be defined with multiple names.
        const alreadyUsed = !!registry.getName(this);
        const Class = alreadyUsed ? class extends this {
        } : this;
        Class.elementName = name;
        registry.define(name, Class);
        return Class;
    }
    /**
     * Non-decorator users can use this to specify a list of attributes, and the
     * attributes will automatically be mapped to reactive properties. All
     * attributes in the list will be treated with the equivalent of the
     * `@attribute` decorator.
     *
     * The ability to provide a map of attribute names to attribute handlers
     * (`Record<string, AttributeHandler>`) has been deprecaated, and instead
     * that map should be provided via the `static observedAttributeHandlers`
     * property, while this property is now typed to accept only a string array
     * as per DOM spec.
     */
    static observedAttributes;
    /**
     * Non-decorator users can use this instead of `observedAttributes` to
     * specify a map of attribute names to attribute handlers. The named
     * attributes will automatically be mapped to reactive properties, and each
     * attribute will be treated with the corresponding attribute handler.
     *
     * Example:
     *
     * ```js
     * element('my-el')(
     *   class MyEl extends LumeElement {
     *     static observedAttributeHandlers = {
     *       foo: attribute.string(),
     *       bar: attribute.number(),
     *       baz: attribute.boolean(),
     *     }
     *
     *     // The initial values defined here will be the values that these
     *     // properties revert to when the respective attributes are removed.
     *     foo = 'hello'
     *     bar = 123
     *     baz = false
     *   }
     * )
     * ```
     */
    static observedAttributeHandlers;
    /**
     * When `true`, effects created via the classy-solid `@effect` decorator
     * will automatically start upon instance construction.
     *
     * Defaults to `false` with effects starting in `connectedCallback()`.
     */
    static autoStartEffects = false;
    #handleInitialPropertyValuesIfAny() {
        // We need to delete initial value-descriptor properties (if they exist)
        // and store the initial values in the storage for our @signal property
        // accessors.
        //
        // If we don't do this, then DOM APIs like cloneNode will create our
        // node without first upgrading it, and then if someone sets a property
        // (while our reactive accessors are not yet present in the class
        // prototype) it means those values will be set as value descriptor
        // properties on the instance instead of interacting with our accessors
        // (i.e. the new properties will override our accessors that the
        // instance will gain on its prototype chain once the upgrade process
        // places our class prototype in the instance's prototype chain).
        //
        // This can also happen if we set properties on an element that isn't
        // upgraded into a custom element yet, and thus will not yet have our
        // accessors.
        //
        // Assumption: any enumerable own props must've been set on the
        // element before it was upgraded. Builtin DOM properties are
        // not enumerable.
        const preUpgradeKeys = Object.keys(this);
        this._preUpgradeValues = new Map();
        for (const propName of preUpgradeKeys) {
            const descriptor = Object.getOwnPropertyDescriptor(this, propName);
            // Handle only value descriptors.
            if ('value' in descriptor) {
                // Delete the pre-upgrade value descriptor (1/2)...
                delete this[propName];
                // The @element decorator reads this, and the class finisher
                // will set pre-upgrade values.
                this._preUpgradeValues.set(propName, descriptor.value);
                // NOTE, for classes not decorated with @element, deferring
                // allows preexisting preupgrade values to be handled *after*
                // class fields have been set during Custom Element upgrade
                // construction (otherwise those class fields would override the
                // preupgrade values we're trying to assign here).
                // TODO Once decorators are out everywhere, deprecate
                // non-decorator usage, and eventually remove code intended for
                // non-decorator usage such as this.
                queueMicrotask(() => {
                    const propSetAtLeastOnce = isPropSetAtLeastOnce__(this, propName);
                    // ... (2/2) and re-assign the value so that it goes through
                    // a @signal accessor that got defined, or through an
                    // inherited accessor that the preupgrade value shadowed.
                    //
                    // If the property has been set between the time LumeElement
                    // constructor ran and the deferred microtask, then we don't
                    // overwrite the property's value with the pre-upgrade value
                    // because it has already been intentionally set to a
                    // desired value post-construction.
                    // (NOTE: Avoid setting properties in constructors because
                    // that will set the signals at least once. Instead,
                    // override with a new @attribute or @signal class field.)
                    //
                    // AND we handle inherited props or signal props only
                    // (because that means there may be an accessor that needs
                    // the value to be passed in). The @element decorator otherwise
                    // handles non-inherited props before construction
                    // finishes. {{
                    if (propSetAtLeastOnce)
                        return;
                    const inheritsProperty = propName in this.__proto__;
                    if (inheritsProperty)
                        this[propName] = descriptor.value;
                    // }}
                });
            }
            else {
                // We assume a getter/setter descriptor is intentional and meant
                // to override or extend our getter/setter so we leave those
                // alone. The user is responsible for ensuring they either
                // override, or extend, our accessor with theirs.
            }
        }
    }
    // This property MUST be defined before any other non-static non-declared
    // class properties so that the initializer runs before any other properties
    // are defined, in order to detect and handle instance properties that
    // already pre-exist from custom element pre-upgrade time.
    // TODO Should we handle initial attributes too?
    // @ts-expect-error unused
    #___init___ = this.#handleInitialPropertyValuesIfAny();
    /**
     * When `true`, the custom element will have a `ShadowRoot`. Set to `false`
     * to not use a `ShadowRoot`. When `false`, styles will not be scoped via
     * the built-in `ShadowRoot` scoping mechanism, but by a much more simple
     * shared style sheet placed at the nearest root node, with `:host`
     * selectors converted to tag names.
     */
    hasShadow = true;
    /** Options used for the ShadowRoot, passed to `attachShadow()`. */
    shadowOptions;
    [root] = null;
    /**
     * Subclasses can override this to provide an alternate Node to render into
     * (f.e. a subclass can `return this` to render into itself instead of
     * making a root) regardless of the value of `hasShadow`.
     */
    get templateRoot() {
        if (!this.hasShadow)
            return this;
        if (this[root])
            return this[root];
        if (this.shadowRoot)
            return (this[root] = this.shadowRoot);
        // TODO use `this.attachInternals()` (ElementInternals API) to get the root instead.
        return (this[root] = this.attachShadow({ mode: 'open', ...this.shadowOptions }));
    }
    set templateRoot(v) {
        if (!this.hasShadow)
            throw new Error('Can not set root, element.hasShadow is false.');
        // @prod-prune
        if (this[root] || this.shadowRoot)
            throw new Error('Element root can only be set once if there is no ShadowRoot.');
        this[root] = v;
    }
    /** @deprecated `root` is renamed to `templateRoot`, and `root` will be removed in a future breaking version. */
    get root() {
        return this.templateRoot;
    }
    set root(val) {
        this.templateRoot = val;
    }
    /**
     * Define which `Node` to append style sheets to when `hasShadow` is `true`.
     * Defaults to the `this.root`, which in turn defaults to the element's
     * `ShadowRoot`.  When `hasShadow` is `true`, an alternate `styleRoot` is
     * sometimes needed for styles to be appended elsewhere than the root. For
     * example, return some other `Node` within the root to append styles to.
     * This is ignored if `hasShadow` is `false`.
     *
     * This can be useful for fixing issues where the default append of a style
     * sheet into the `ShadowRoot` conflicts with how DOM is created in
     * `template` (f.e.  if the user's DOM creation in `template` clears the
     * `ShadowRoot` content, or etc, then we want to place the stylesheet
     * somewhere else).
     */
    get styleRoot() {
        return this.templateRoot;
    }
    attachShadow(options) {
        if (this[root])
            console.warn('Element already has a root defined.');
        return (this[root] = super.attachShadow(options));
    }
    #effects = new Effects();
    // For old-style (non-decorator) effects (f.e. subclasses creating effects
    // in connectedCallback).
    createEffect(fn) {
        this.#effects.createEffect(fn);
    }
    #disposeTemplate;
    connectedCallback() {
        const template = this.template;
        if (template)
            this.#disposeTemplate = render(typeof template === 'function' ? template.bind(this) : () => template, this.templateRoot);
        this.#setStyle();
        startEffects(this); // start new-style (decorator) effects
    }
    disconnectedCallback() {
        this.#effects.clearEffects(); // Clean up old-style (non-decorator) effects.
        stopEffects(this); // Clean up new-style (decorator) effects
        this.#disposeTemplate?.();
        this.#cleanupStyle();
    }
    static #styleRootNodeRefCountPerTagName = new WeakMap();
    #styleRootNode = null;
    #defaultHostStyle = (hostSelector) => /*css*/ `${hostSelector} {
		display: block;
	}`;
    static #elementId = 0;
    #id = _a.#elementId++;
    #dynamicStyle = null;
    #setStyle() {
        const ctor = this.constructor;
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
            // If this element has a shadow root, put the style there. This is the
            // standard way to scope styles to a component.
            this.styleRoot.appendChild(staticStyle);
            // TODO use adoptedStyleSheets when that is supported by FF and Safari
        }
        else {
            // When this element doesn't have a shadow root, then we want to append the
            // style only once to the rootNode where it lives (a ShadoowRoot or
            // Document). If there are multiple of this same element in the rootNode,
            // then the style will be added only once and will style all the elements
            // in the same rootNode.
            // Because we're connected, getRootNode will return either the
            // Document, or a ShadowRoot.
            const rootNode = this.getRootNode();
            this.#styleRootNode = rootNode === document ? document.head : rootNode;
            let refCountPerTagName = _a.#styleRootNodeRefCountPerTagName.get(this.#styleRootNode);
            if (!refCountPerTagName)
                _a.#styleRootNodeRefCountPerTagName.set(this.#styleRootNode, (refCountPerTagName = {}));
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
                this.#styleRootNode.appendChild(staticStyle);
            }
            if (instanceCSS) {
                // For dynamic per-instance styles, make one style element per
                // element instance so it contains that element's unique styles,
                // associated to a unique attribute selector.
                const id = this.tagName.toLowerCase() + '-' + this.#id;
                // Add the unique attribute that the style selector will target.
                this.setAttribute(id, '');
                // TODO Instead of creating one style element per custom
                // element, we can add the styles to a single style element. We
                // can use the CSS OM instead of innerHTML to make it faster
                // (but innerHTML is nice for dev mode because it shows the
                // content in the DOM when looking in element inspector, so
                // allow option for both).
                const instanceStyle = (this.#dynamicStyle = document.createElement('style'));
                instanceStyle.id = id;
                instanceStyle.innerHTML = instanceCSS.replaceAll(':host', `[${id}]`);
                const rootNode = this.getRootNode();
                this.#styleRootNode = rootNode === document ? document.head : rootNode;
                this.#styleRootNode.appendChild(instanceStyle);
            }
        }
    }
    #cleanupStyle() {
        do {
            if (this.hasShadow)
                break;
            const refCountPerTagName = _a.#styleRootNodeRefCountPerTagName.get(this.#styleRootNode);
            if (!refCountPerTagName)
                break;
            let refCount = refCountPerTagName[this.tagName];
            if (refCount === undefined)
                break;
            refCountPerTagName[this.tagName] = --refCount;
            if (refCount === 0) {
                delete refCountPerTagName[this.tagName];
                // TODO PERF Improve performance by saving the style
                // instance on a static var, instead of querying for it.
                const style = this.#styleRootNode.querySelector('#' + this.tagName);
                style?.remove();
            }
        } while (false);
        if (this.#dynamicStyle)
            this.#dynamicStyle.remove();
    }
    // not used currently, but we'll leave this here so that child classes can
    // call super, and that way we can add an implementation later when needed.
    adoptedCallback() { }
}
_a = LumeElement;
// TODO rename the export to LumeElement in a breaking version bump.
export { LumeElement as Element };
//# sourceMappingURL=LumeElement.js.map