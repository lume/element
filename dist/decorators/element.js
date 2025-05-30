import './metadata-shim.js';
import { untrack } from 'solid-js';
import { reactive, signalify } from 'classy-solid';
import { Element } from '../LumeElement.js';
import { __classFinishers, __setUpAttribute, __attributesToProps, } from './attribute.js';
import { camelCaseToDash } from '../utils.js';
const isAttributeHandler = Symbol('isAttributeHandler');
export function element(tagNameOrClassOrOptions = {}, autoDefineOrContext) {
    // when called as a decorator factory with tagName and autoDefine, f.e. `@element('my-el') class MyEl ...` or `element('my-el', false)(class MyEl ...)`
    if (typeof tagNameOrClassOrOptions === 'string') {
        const elementName = tagNameOrClassOrOptions;
        const autoDefine = !!(autoDefineOrContext ?? true);
        return (Class, context) => applyElementDecoration(Class, context, { elementName, autoDefine });
    }
    // when called as a decorator factory with or without an options object, f.e. `@element() class MyEl ...` or `@element({tagName: 'my-el'}) class MyEl ...` or `element({tagName: 'my-el', autoDefine: false})(class MyEl ...)`
    if (typeof tagNameOrClassOrOptions === 'object') {
        return (Class, context) => applyElementDecoration(Class, context, tagNameOrClassOrOptions);
    }
    // Otherwise called as a decorator, f.e. `@element class MyEl ...` or `element(class MyEl ...)`
    const Class = tagNameOrClassOrOptions;
    const context = autoDefineOrContext;
    return applyElementDecoration(Class, context);
}
function applyElementDecoration(Class, context, options = {}) {
    if (typeof Class !== 'function' || (context && context.kind !== 'class'))
        throw new Error('@element is only for use on classes.');
    const usedAsDecorator = !!context;
    const { metadata = {} } = context ?? {}; // context may be undefined with plain-JS element() usage.
    // Check only own metadata.noSignal, we don't want to use the one inherited from a base class.
    const noSignal = (Object.hasOwn(metadata, 'noSignal') && metadata.noSignal) || undefined;
    const attrs = Class.observedAttributes;
    if (Array.isArray(attrs)) {
        // Nothing to do here: either the user provided a regular
        // observedAttributes array like with plain Custom Elements, or
        // they used our decorators which happen to create the array for
        // them.
    }
    else if (attrs && typeof attrs === 'object') {
        // When we're not using decorators, our users have the option to provide
        // an observedAttributes object (instead of the usual array) to specify
        // attribute types (deprecated, use observedAttributeHandlers instead).
        // In this case, we need to track the types, and convert
        // observedAttributes to an array so the browser will understand it like
        // usual.
        // Delete it, so that it will be re-created as an array by the
        // following __setUpAttribute calls.
        Class.observedAttributes = undefined;
        const stack = new Error().stack;
        console.warn('Defining the static observedAttributes property as a map of attribute names to attribute handlers is now deprecated, please use the static observedAttributeHandlers property to define the map instead.\n' +
            stack);
        const _attrs = attrs;
        for (const prop in _attrs) {
            const handler = _attrs[prop];
            const attrName = (handler.name ?? (handler.dashcase === false ? prop : camelCaseToDash(prop))).toLowerCase();
            __setUpAttribute(Class, attrName, prop, handler);
        }
    }
    const handlers = Object.hasOwn(Class, 'observedAttributeHandlers') ? Class.observedAttributeHandlers : undefined;
    if (handlers) {
        for (const [prop, handler] of Object.entries(handlers)) {
            const attrName = (handler.name ?? (handler.dashcase === false ? prop : camelCaseToDash(prop))).toLowerCase();
            __setUpAttribute(Class, attrName, prop, handlers[prop]);
        }
    }
    // @prod-prune
    queueMicrotask(() => {
        // If mixing @element with static observedAttributeHandlers, warn the user.
        const handlers2 = Object.hasOwn(Class, 'observedAttributeHandlers') ? Class.observedAttributeHandlers : undefined;
        if (usedAsDecorator && !handlers && handlers2) {
            console.warn(`When using 'static observedAttributeHandlers' do not use the 'element' function as a decorator, instead call it as a plain function, otherwise 'static observedAttributeHandlers' will not handled because class static fields are initialized after class decorators.`);
        }
    });
    // We need to compose with @reactive so that it will signalify any @signal properties.
    const ReactiveDecorated = reactive(Class, context);
    class ElementDecorated extends ReactiveDecorated {
        constructor(...args) {
            // @ts-expect-error we don't know what the user's args will be, just pass them all.
            super(...args);
            // Untrack to be sure we don't cause dependencies during creation of
            // objects (super() is already untracked by the reactive decorator).
            untrack(() => {
                handlePreUpgradeValues(this);
                const attrsToProps = ElementDecorated.prototype[__attributesToProps] ?? {};
                // We're using Object.values here for *own* properties so
                // we handle properties of the current decorated class (not
                // of the super classes).
                const propSpecs = Object.values(attrsToProps);
                // This is signalifying any attribute props that may have been
                // defined in `static observedAttributes` or `static
                // observedAttributeHandlers` rather than with an attribute
                // decorator (which composes `@signal`), so that we also cover
                // non-decorator usage until native decorators are out.
                //
                // Note, `signalify()` returns early if a property was already
                // signalified by @attribute (@signal), so this isn't going to
                // double-signalify.
                //
                // TODO: Once native decorators are out, remove this, and remove
                // non-decorator usage because everyone will be able to use
                // decorators. We can also then delete `noSignal` from `metadata`
                // here in the class as it is no longer needed at class
                // instantiation time.
                //
                // Having to duplicate keys in observedAttributes as well as class
                // fields is more room for human error, so it'll be nice to remove
                // non-decorator usage.
                for (const propSpec of propSpecs) {
                    const prop = propSpec.name;
                    const useSignal = !noSignal?.has(prop);
                    if (!useSignal)
                        continue;
                    const fieldDesc = Object.getOwnPropertyDescriptor(this, prop);
                    const protoDesc = Object.getOwnPropertyDescriptor(Class.prototype, prop);
                    const isField = !!fieldDesc;
                    // The decorated property is either on the instance (field), or the decorated class's prototype (getter/setter).
                    let descriptor = fieldDesc ?? protoDesc;
                    if (!descriptor)
                        descriptorError(prop);
                    const { get, set } = descriptor;
                    const isAccessor = !!(descriptor && (get || set));
                    const initialValue = isAccessor && get ? get.call(this) : this[prop];
                    signalify(isField ? this : Class.prototype, [prop, initialValue]);
                }
                // Intercept JS values to run attribute handlers.
                for (const propSpec of propSpecs) {
                    const prop = propSpec.name;
                    const handler = propSpec.attributeHandler;
                    if (!handler)
                        continue;
                    const fieldDesc = Object.getOwnPropertyDescriptor(this, prop);
                    const protoDesc = Object.getOwnPropertyDescriptor(Class.prototype, prop);
                    const isField = !!fieldDesc;
                    // The decorated property is either on the instance (field), or the decorated class's prototype (getter/setter).
                    let descriptor = fieldDesc ?? protoDesc;
                    if (!descriptor)
                        descriptorError(prop);
                    const { get, set, writable } = descriptor;
                    const isAccessor = !!(get || set);
                    if (!isAccessor && !isField)
                        throw new Error(`Cannot map attribute to prototype value property "${String(prop)}". Only prototype getters/setters are supported. Either make the property a class field, or make two separate properties: one for the attribute as a class field, one for the prototype value property.`);
                    if ((isAccessor && !set) || (!isAccessor && !writable))
                        throw new Error(`An attribute decorator cannot be used on readonly property "${String(prop)}".`);
                    const initialValue = isAccessor && get ? get.call(this) : this[prop];
                    // Default values for fields are handled in their initializer,
                    // and this catches default values for getters/setters.
                    if (!('default' in propSpec))
                        propSpec.default = 'default' in handler ? handler.default : initialValue;
                    handler.sideEffect?.(this, prop, initialValue);
                    let storage;
                    // We check if we have an accessor, because sometimes we
                    // don't if the property is not signalified (f.e. if
                    // `@attribute @noSignal` was used, then we have a regular
                    // field.)
                    if (isAccessor) {
                        if (set?.[isAttributeHandler])
                            continue;
                    }
                    else {
                        // We must be patching a field
                        storage = Symbol('attributeHandlerStorage:' + String(prop));
                        // @ts-expect-error indexed access with symbol
                        this[storage] = this[prop];
                    }
                    const location = isField ? this : Class.prototype;
                    const newGetter = isAccessor
                        ? get
                        : function () {
                            // @ts-expect-error indexed access with symbol
                            return this[storage];
                        };
                    const newSetter = isAccessor
                        ? // function because it will be on the prototype, needs dynamic `this`
                            function (value) {
                                if (typeof value === 'string' || value === null)
                                    value = __handleAttributeValue(value, handler, propSpec);
                                untrack(() => handler.sideEffect?.(this, prop, value));
                                set.call(this, value);
                            }
                        : function (value) {
                            if (typeof value === 'string' || value === null)
                                value = __handleAttributeValue(value, handler, propSpec);
                            untrack(() => handler.sideEffect?.(this, prop, value));
                            // @ts-expect-error indexed access with symbol
                            this[storage] = value;
                        };
                    newGetter && (newGetter[isAttributeHandler] = true);
                    newSetter[isAttributeHandler] = true;
                    Object.defineProperty(location, prop, {
                        enumerable: descriptor.enumerable,
                        configurable: descriptor.configurable,
                        get: newGetter,
                        set: newSetter,
                    });
                }
            });
        }
    }
    const classFinishers = [...__classFinishers];
    __classFinishers.length = 0;
    function finishClass() {
        // This need to be here in the finisher because it will run *after*
        // static class fields (the decorator function itself runs before static
        // class fields are ready).
        options.elementName ||= Class.elementName || camelCaseToDash(Class.name);
        options.autoDefine ??= Class.autoDefine;
        Object.assign(Class, options);
        for (const finisher of classFinishers)
            finisher(ElementDecorated);
        if (options.elementName && options.autoDefine)
            // guard against missing DOM API (f.e. SSR)
            globalThis.window?.customElements?.define(options.elementName, ElementDecorated);
    }
    if (context?.addInitializer) {
        // Use addInitializer to run logic after the class is fully defined
        // (after class static initializers have ran, otherwise the class
        // decorator runs before any static members are initialized)
        context.addInitializer(finishClass);
    }
    else {
        // For JS without decorator support fall back manually running the
        // initializer because `context` will be `undefined` in that scenario,
        // so there won't be a `context.addInitializer` function to call.
        // In this case all static members are already initialized too.
        //
        // TODO: Once decorators are out natively, deprecate and remove this
        // non-decorator support
        finishClass();
    }
    return ElementDecorated;
}
function handlePreUpgradeValues(self) {
    if (!(self instanceof Element))
        return;
    // @ts-expect-error, protected access is ok
    for (const [key, value] of self._preUpgradeValues) {
        // If the key is missing, it has already been handled, continue.
        if (!(key in self))
            continue;
        // Untrack the pre-upgrade value so that a subclass
        // of this class won't re-run this same logic again.
        // TODO needs testing.
        // @ts-expect-error, protected access is ok
        self._preUpgradeValues.delete(key);
        // Unshadow any possible inherited accessor only if
        // there is not an accessor. If there is an accessor it
        // handles inheritance its own way.
        const desc = Object.getOwnPropertyDescriptor(self, key);
        if (desc && 'value' in desc) {
            // @ts-expect-error dynamic decorator stuff, has no impact on user types.
            delete self[key];
        }
        // Set the pre-upgrade value (allowing any inherited
        // or own accessor to operate on it).
        // @ts-expect-error dynamic decorator stuff, has no impact on user types.
        self[key] = value;
    }
}
function __handleAttributeValue(value, handler, propSpec) {
    // prettier-ignore
    return !handler
        ? value
        : value === null // attribute removed
            // ? 'default' in handler
            // 	? handler.default
            // 	: null
            // ? 'default' in propSpec!
            // 	? propSpec!.default
            // 	: null
            ? propSpec.default
            : handler.from
                ? handler.from(value)
                : value;
}
function descriptorError(prop) {
    throw new TypeError(`Missing descriptor for property "${String(prop)}" while mapping attributes to properties. Make sure the @element decorator is the first decorator on your element class, and if you're using 'static observedAttributes' or 'static observedAttributeHandlers' make sure you also define the respective class fields for the initial values. If a pre-existing class is already decoratored with other decorators, extend from it, then use @element directly on the subclass.`);
}
//# sourceMappingURL=element.js.map