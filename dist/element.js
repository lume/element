import './metadata-shim.js';
import { untrack } from 'solid-js';
import { reactive, signalify } from 'classy-solid';
import { Element } from './LumeElement.js';
import { __classFinishers, __setUpAttribute, __attributesToProps } from './attribute.js';
import { __eventSetter, eventFields } from './event.js';
const isAttributeHandler = Symbol('isAttributeHandler');
export function element(tagNameOrClass, autoDefineOrContext) {
    let tagName = '';
    let autoDefine = !!(autoDefineOrContext ?? true);
    // when called as a decorator factory, f.e. `@element('foo-bar') class MyEl ...` or `element('my-el')(class MyEl ...)`
    if (typeof tagNameOrClass === 'string') {
        tagName = tagNameOrClass;
        return (Class, context) => {
            return applyElementDecoration(Class, context, tagName, autoDefine);
        };
    }
    // Otherwise `@element class MyEl ...` or `element(class MyEl ...)`
    autoDefine = false;
    const Class = tagNameOrClass;
    const context = autoDefineOrContext;
    return applyElementDecoration(Class, context, tagName, autoDefine);
}
function applyElementDecoration(Class, context, tagName, autoDefine) {
    if (typeof Class !== 'function' || (context && context.kind !== 'class'))
        throw new Error('@element is only for use on classes.');
    const { metadata = {} } = context ?? {}; // context may be undefined with plain-JS element() usage.
    // Check only own metadata.noSignal, we don't want to use the one inherited from a base class.
    const noSignal = (Object.hasOwn(metadata, 'noSignal') && metadata.noSignal) || undefined;
    let Ctor = Class;
    const attrs = Ctor.observedAttributes;
    if (Ctor.hasOwnProperty('elementName'))
        tagName = Ctor.elementName || tagName;
    else
        Ctor.elementName = tagName;
    if (Array.isArray(attrs)) {
        // Nothing to do here: either the user provided a regular
        // observedAttributes array like with plain Custom Elements, or
        // they used our decorators which happen to create the array for
        // them.
    }
    else if (attrs && typeof attrs === 'object') {
        // When we're not using decorators, our users have the option to
        // provide an observedAttributes object (instead of the usual
        // array) to specify attribute types. In this case, we need to
        // track the types, and convert observedAttributes to an array so
        // the browser will understand it like usual.
        // Delete it, so that it will be re-created as an array by the
        // following __setUpAttribute calls.
        Ctor.observedAttributes = undefined;
        const stack = new Error().stack;
        console.warn('Defining the static observedAttributes property as a map of attribute names to attribute handlers is now deprecated, please use the static observedAttributeHandlers property to define the map instead.\n' +
            stack);
        const _attrs = attrs;
        for (const prop in _attrs)
            __setUpAttribute(Ctor, prop, attrs[prop]);
    }
    const handlers = Object.hasOwn(Ctor, 'observedAttributeHandlers') ? Ctor.observedAttributeHandlers : undefined;
    if (handlers)
        for (const prop of Object.keys(handlers))
            __setUpAttribute(Ctor, prop, handlers[prop]);
    // We need to compose with @reactive so that it will signalify any @signal properties.
    Ctor = reactive(Ctor, context);
    class ElementDecorator extends Ctor {
        constructor(...args) {
            // @ts-expect-error we don't know what the user's args will be, just pass them all.
            super(...args);
            // Untrack to be sure we don't cause dependencies during creation of
            // objects (super() is already untracked by the reactive decorator).
            untrack(() => {
                handlePreUpgradeValues(this);
                const attrsToProps = ElementDecorator.prototype[__attributesToProps] ?? {};
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
                    let isField = false;
                    const fieldDesc = Object.getOwnPropertyDescriptor(this, prop);
                    const protoDesc = Object.getOwnPropertyDescriptor(Class.prototype, prop);
                    // The decorated property is either on the instance (field), or the decorated class's prototype (getter/setter).
                    let descriptor = fieldDesc;
                    if (descriptor)
                        isField = true; // not on prototype
                    if (!descriptor)
                        descriptor = protoDesc;
                    if (!descriptor)
                        descriptorError(prop);
                    const { get, set } = descriptor;
                    const isAccessor = !!(descriptor && (get || set));
                    const initialValue = isAccessor && get ? get.call(this) : this[prop];
                    signalify(isField ? this : Class.prototype, [
                        prop,
                        initialValue,
                    ]);
                }
                // Intercept JS values to run attribute handlers.
                for (const propSpec of propSpecs) {
                    const prop = propSpec.name;
                    const handler = propSpec.attributeHandler;
                    if (!handler)
                        continue;
                    // Default values for fields are handled in their initializer,
                    // and this catches default values for getters/setters.
                    if (!('default' in handler))
                        handler.default = this[prop];
                    let isField = false;
                    const fieldDesc = Object.getOwnPropertyDescriptor(this, prop);
                    const protoDesc = Object.getOwnPropertyDescriptor(Class.prototype, prop);
                    // The decorated property is either on the instance (field), or the decorated class's prototype (getter/setter).
                    let descriptor = fieldDesc;
                    if (descriptor)
                        isField = true; // not on prototype
                    if (!descriptor)
                        descriptor = protoDesc;
                    if (!descriptor)
                        descriptorError(prop);
                    const { get, set, writable } = descriptor;
                    const isAccessor = !!(get || set);
                    if (!isAccessor && !isField)
                        throw new Error(`Cannot map attribute to prototype value property "${String(prop)}". Only prototype getters/setters are supported. Either make the property a class field, or make two separate properties: one for the attribute as a class field, one for the prototype value property.`);
                    if ((isAccessor && !set) || (!isAccessor && !writable))
                        throw new Error(`An attribute decorator cannot be used on readonly property "${String(prop)}".`);
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
                        : // @ts-expect-error indexed access with symbol
                            (() => this[storage]);
                    const newSetter = isAccessor
                        ? // function because it will be on the prototype, needs dynamic `this`
                            function (value) {
                                if (typeof value === 'string' || value === null)
                                    value = __handleAttributeValue(value, handler);
                                set.call(this, value);
                            }
                        : ((value) => {
                            if (typeof value === 'string' || value === null)
                                value = __handleAttributeValue(value, handler);
                            // @ts-expect-error indexed access with symbol
                            this[storage] = value;
                        });
                    newGetter && (newGetter[isAttributeHandler] = true);
                    newSetter[isAttributeHandler] = true;
                    Object.defineProperty(location, prop, {
                        enumerable: descriptor.enumerable,
                        configurable: descriptor.configurable,
                        get: newGetter,
                        set: newSetter,
                    });
                }
                const meta = metadata;
                // Set up event fields (accessors and getters/setters are handled in the @event decorator directly).
                if (Object.hasOwn(meta, eventFields)) {
                    for (let name of meta[eventFields]) {
                        if (!name.startsWith('on'))
                            throw new Error('Event fields must start with "on".');
                        handleEventProp.call(this, name);
                    }
                    for (let name of Ctor.events ?? []) {
                        name = 'on' + name;
                        handleEventProp.call(this, name);
                    }
                    function handleEventProp(name) {
                        const eventName = name.replace(/^on/, '');
                        const desc = Object.getOwnPropertyDescriptor(this, name);
                        if (desc && (desc.get || desc.set)) {
                            throw new Error('@event is not supported on fields converted to getters/setters yet. When using the @event decorator on a class field, ensure the field is not converted to a getter/setter by anything else (f.e. another decorator also used on the same property).');
                        }
                        let value = (desc?.value ?? null);
                        const get = () => value;
                        const set = (v) => (value = v);
                        Object.defineProperty(this, name, {
                            enumerable: true,
                            configurable: true,
                            get,
                            set: __eventSetter(name, eventName, get, set),
                        });
                    }
                }
            });
        }
    }
    const classFinishers = [...__classFinishers];
    __classFinishers.length = 0;
    function finishClass() {
        for (const finisher of classFinishers)
            finisher(ElementDecorator);
        if (tagName && autoDefine)
            // guard against missing DOM API (f.e. SSR)
            globalThis.window?.customElements?.define(tagName, ElementDecorator);
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
    return ElementDecorator;
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
function __handleAttributeValue(value, handler) {
    // prettier-ignore
    return !handler
        ? value
        : value === null // attribute removed
            ? 'default' in handler
                ? handler.default
                : null
            : handler.from
                ? handler.from(value)
                : value;
}
function descriptorError(prop) {
    throw new TypeError(`Missing descriptor for property "${String(prop)}" while mapping attributes to properties. Make sure the @element decorator is the first decorator on your element class, and if you're using 'static observedAttributes' or 'static observedAttributeHandlers' make sure you also define the respective class fields for the initial values. If a pre-existing class is already decoratored with other decorators, extend from it, then use @element directly on the subclass.`);
}
//# sourceMappingURL=element.js.map