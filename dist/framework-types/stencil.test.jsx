/* @jsxImportSource @stencil/core */
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
// TODO jsxImportSource is working for now using the patch in the patches/
// folder. We're working on jsxImportSource support for Stencil here:
// https://github.com/stenciljs/core/issues/6180
import { attribute, booleanAttribute, eventAttribute, numberAttribute } from '../decorators/attribute.js';
import { element } from '../decorators/element.js';
import { Element } from '../LumeElement.js';
import { assertType } from '../test-utils.test.js';
/**
 * Note, decorators are not required for defining JSX types, but we are using
 * decorators here to show the best practice.
 *
 * You want to select *only* properties decorated with attribute decorators and
 * on* event properties. Technically the JSX types will work if you select
 * any plain properties, but it won't be type safe because the JSX types
 * will include string types, which the decorators are responsible for
 * converting into the non-string values.
 *
 * To have well-defined, consistent, and interoperable elements, you always want
 * properties that are paired with attributes. Otherwise you'll have elements
 * that don't work well in plain HTML, and that require plain JS to operate, and
 * that can also make them more difficult to use in some non-custom-element
 * frameworks where they will need to be referenced for manipulation in JS
 * instead of in declarative templates. When all properties are mapped to
 * attributes, it makes them capable of always receiving data from HTML sent
 * from a server, for example HTML with any language on a backend.
 *
 * In rare cases, having a JS property that is not paired with an attribute is
 * needed, but strive to avoid this. An example where this might be inevitable
 * is when wrapping a non-custom-element framework component in a custom
 * element, where the non-custom-element component accepts only special types of
 * objects via its props, and those objects are not representable as strings (or
 * it would be difficult to do so). But even in these cases, an approach is to
 * map a set of attribute properties to those special objects instead of
 * accepting (or as alternative to accepting) the special objects.
 */
// TODO move the above paragraphs to the docs.
let SomeElement = (() => {
    let _classDecorators = [element('some-element-stencil-jsx')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = Element;
    let _instanceExtraInitializers = [];
    let _someProp_decorators;
    let _someProp_initializers = [];
    let _someProp_extraInitializers = [];
    let _someBoolean_decorators;
    let _someBoolean_initializers = [];
    let _someBoolean_extraInitializers = [];
    let _get_otherProp_decorators;
    let _set_otherProp_decorators;
    let _onsomeevent_decorators;
    let _onsomeevent_initializers = [];
    let _onsomeevent_extraInitializers = [];
    let _onnotanevent_decorators;
    let _onnotanevent_initializers = [];
    let _onnotanevent_extraInitializers = [];
    let _someNumber_decorators;
    let _someNumber_initializers = [];
    let _someNumber_extraInitializers = [];
    var SomeElement = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _someProp_decorators = [attribute];
            _someBoolean_decorators = [booleanAttribute];
            _get_otherProp_decorators = [attribute];
            _set_otherProp_decorators = [attribute];
            _onsomeevent_decorators = [eventAttribute];
            _onnotanevent_decorators = [numberAttribute];
            _someNumber_decorators = [numberAttribute];
            __esDecorate(this, null, _get_otherProp_decorators, { kind: "getter", name: "otherProp", static: false, private: false, access: { has: obj => "otherProp" in obj, get: obj => obj.otherProp }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _set_otherProp_decorators, { kind: "setter", name: "otherProp", static: false, private: false, access: { has: obj => "otherProp" in obj, set: (obj, value) => { obj.otherProp = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, null, _someProp_decorators, { kind: "field", name: "someProp", static: false, private: false, access: { has: obj => "someProp" in obj, get: obj => obj.someProp, set: (obj, value) => { obj.someProp = value; } }, metadata: _metadata }, _someProp_initializers, _someProp_extraInitializers);
            __esDecorate(null, null, _someBoolean_decorators, { kind: "field", name: "someBoolean", static: false, private: false, access: { has: obj => "someBoolean" in obj, get: obj => obj.someBoolean, set: (obj, value) => { obj.someBoolean = value; } }, metadata: _metadata }, _someBoolean_initializers, _someBoolean_extraInitializers);
            __esDecorate(null, null, _onsomeevent_decorators, { kind: "field", name: "onsomeevent", static: false, private: false, access: { has: obj => "onsomeevent" in obj, get: obj => obj.onsomeevent, set: (obj, value) => { obj.onsomeevent = value; } }, metadata: _metadata }, _onsomeevent_initializers, _onsomeevent_extraInitializers);
            __esDecorate(null, null, _onnotanevent_decorators, { kind: "field", name: "onnotanevent", static: false, private: false, access: { has: obj => "onnotanevent" in obj, get: obj => obj.onnotanevent, set: (obj, value) => { obj.onnotanevent = value; } }, metadata: _metadata }, _onnotanevent_initializers, _onnotanevent_extraInitializers);
            __esDecorate(null, null, _someNumber_decorators, { kind: "field", name: "someNumber", static: false, private: false, access: { has: obj => "someNumber" in obj, get: obj => obj.someNumber, set: (obj, value) => { obj.someNumber = value; } }, metadata: _metadata }, _someNumber_initializers, _someNumber_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SomeElement = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        someProp = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _someProp_initializers, true));
        ignoredBoolean = (__runInitializers(this, _someProp_extraInitializers), false);
        someBoolean = __runInitializers(this, _someBoolean_initializers, true);
        #otherProp = (__runInitializers(this, _someBoolean_extraInitializers), 0);
        /**
         * This is a getter/setter whose getter always returns number, but whose
         * setter can accept a specific non-number value which is coerced into a
         * number.
         */
        get otherProp() {
            return this.#otherProp;
        }
        set otherProp(_) {
            // Here you would need custom logic to coerce "foo" into a number, for example.
            this.#otherProp = _;
        }
        /** do not use this property, its only for JSX types */
        __set__otherProp;
        onsomeevent = __runInitializers(this, _onsomeevent_initializers, null);
        onnotanevent = (__runInitializers(this, _onsomeevent_extraInitializers), __runInitializers(this, _onnotanevent_initializers, 123));
        onnotanotherevent = (__runInitializers(this, _onnotanevent_extraInitializers), _n => { });
        ignoredNumber = 0;
        someNumber = __runInitializers(this, _someNumber_initializers, 123);
        constructor() {
            super(...arguments);
            __runInitializers(this, _someNumber_extraInitializers);
        }
    };
    return SomeElement = _classThis;
})();
SomeElement;
class SomeEvent extends Event {
    foo = 0;
}
describe('JSX types with StencilElementAttributes', () => {
    it('derives JSX types from classes', () => {
        ;
        <>
			{/* check builtin element types exist */}
			<div class={'foo'}></div>

			{/* Ensure common element attributes still work. */}
			<some-element onClick={event => event.button} aria-hidden="true" class="foo" style={{ color: 'red' }}/>

			<some-element someProp="false" otherProp="foo"/>
			<some-element someProp={false} otherProp={123}/>
			{/* @ts-expect-error good, number is invalid */}
			<some-element someProp={123}/>
			{/* @ts-expect-error good, 'blah' is invalid */}
			<some-element otherProp="blah"/>

			{/* Additionally TypeScript will allow unknown dash-case props (as we didn't not define JS properties with these exact dash-cased names) */}
			<some-element some-prop="false" other-prop="foo"/>
			{/* @ts-expect-error foo doesn't exist. TypeScript will only check existence of properties without dashes */}
			<some-element foo="false"/>

			{/* @ts-expect-error `ignoredBoolean` was not selected, not available in JSX */}
			<some-element ignoredBoolean={123}/>

			<some-element someBoolean/>
			<some-element someBoolean={true}/>
			<some-element someBoolean={false}/>
			<some-element someBoolean="true"/>
			<some-element someBoolean="false"/>
			{/* @ts-expect-error good, only booleans and boolean strings allowed, no strings */}
			<some-element someBoolean="blah"/>
			{/* @ts-expect-error good, only booleans allowed */}
			<some-element someBoolean={123}/>

			<some-element onsomeevent={event => event.foo}/>
			<some-element onsomeevent="console.log('someevent')"/>
			{/* @ts-expect-error on:-prefixed event props are not for Stencil */}
			<some-element on:someevent={event => event.foo}/>
			{/* @ts-expect-error wrong event type */}
			<some-element onsomeevent={(event) => event}/>

			{/* @ts-expect-error non-event on* properties are disallwed in Stencil because Stencil will only treat them as event listeners and will not forward the values to JS properties. (The 'as any' ensure we're not type checking the value, and only checking existence of the prop.) */}
			<some-element onnotanevent={123}/>

			{/* @ts-expect-error Ensure that non-event-listener on* properties are ignored, as Stencil will always listen to events based on their name which is incorrect (the functions will receive an event instead of the arguments they expect). (Use "as any" to ensure we check property existence, not value type.) */}
			<some-element onnotanotherevent={(() => { })}/>

			{/* @ts-expect-error `ignoredNumber` was not selected, not available in JSX */}
			<some-element ignoredNumber={123}/>

			<some-element someNumber={123}/>
			{/* @ts-expect-error good, `false` is not a number */}
			<some-element someNumber={false}/>
			<some-element someNumber="123"/>
			<some-element someNumber="123."/>
			<some-element someNumber=".123"/>
			<some-element someNumber="1.23"/>
			<some-element someNumber="1.2e1"/>
			<some-element someNumber="0xefef"/>
			<some-element someNumber="0b1010"/>
			{/* @ts-expect-error good, "0z1010" is not a number string */}
			<some-element someNumber="0z1010"/>
			{/* @ts-expect-error good, "blah" is not a number string */}
			<some-element someNumber="blah"/>
			{/* @ts-expect-error good, "1.blah" is not a number string */}
			<some-element someNumber="1.blah"/>
		</>;
        assertType();
        assertType();
        assertType();
        assertType();
        assertType();
    });
});
//# sourceMappingURL=stencil.test.jsx.map