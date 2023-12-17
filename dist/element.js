import './metadata-shim.js';
import { untrack } from 'solid-js';
import { reactive, signalify } from 'classy-solid';
import { Element } from './LumeElement.js';
import { __classFinishers, __setUpAttribute } from './attribute.js';
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
        // following _setUpAttribute calls.
        Ctor.observedAttributes = undefined;
        for (const prop in attrs)
            __setUpAttribute(Ctor, prop, attrs[prop]);
    }
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
                const propsToSignalify = [];
                const attrsToProps = 
                // @ts-expect-error private access
                ElementDecorator.prototype.__attributesToProps ?? {};
                for (const propSpec of Object.values(attrsToProps)) {
                    const prop = propSpec.name;
                    const useSignal = !noSignal?.has(prop);
                    if (useSignal)
                        propsToSignalify.push(prop);
                    const handler = propSpec.attributeHandler;
                    // Default values for fields are handled in their initializer,
                    // and this catches default values for getters/setters.
                    if (handler && !('default' in handler))
                        handler.default = this[prop];
                }
                // This is signalifying any attribute props that may have been
                // defined in `static observedAttribute` rather than with @attribute
                // decorator (which composes @signal), so that we also cover
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
                if (propsToSignalify.length)
                    signalify(this, ...propsToSignalify);
            });
        }
    }
    const classFinishers = [...__classFinishers];
    __classFinishers.length = 0;
    function finishClass() {
        for (const finisher of classFinishers)
            finisher(ElementDecorator);
        if (tagName && autoDefine)
            customElements.define(tagName, ElementDecorator);
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
        // accessor to operate on it).
        // @ts-expect-error dynamic decorator stuff, has no impact on user types.
        self[key] = value;
    }
}
//# sourceMappingURL=element.js.map