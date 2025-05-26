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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { createEffect } from 'solid-js';
import { signal } from 'classy-solid';
import { Element, element, attribute, numberAttribute, booleanAttribute, stringAttribute, } from '../index.js';
describe('@element decorator', () => {
    it('reads options from static class fields', () => {
        let ElementWithStaticName = (() => {
            let _classDecorators = [element];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = Element;
            var ElementWithStaticName = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    ElementWithStaticName = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                }
                static elementName = 'el-with-static-name';
                static {
                    __runInitializers(_classThis, _classExtraInitializers);
                }
            };
            return ElementWithStaticName = _classThis;
        })();
        const e = new ElementWithStaticName();
        document.body.append(e);
        expect(e.tagName.toLowerCase()).toBe('el-with-static-name');
        e.remove();
        let WithStaticOptions = (() => {
            let _classDecorators = [element];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = Element;
            var WithStaticOptions = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    WithStaticOptions = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                }
                static elementName = 'with-static-options';
                static autoDefine = true;
                static {
                    __runInitializers(_classThis, _classExtraInitializers);
                }
            };
            return WithStaticOptions = _classThis;
        })();
        const el = new WithStaticOptions();
        document.body.append(el);
        expect(el.tagName.toLowerCase()).toBe('with-static-options');
        el.remove();
        let WithStaticOptions2 = (() => {
            let _classDecorators = [element];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = Element;
            var WithStaticOptions2 = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    WithStaticOptions2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                }
                static elementName = 'with-static-options2';
                static autoDefine = false; // don't automatically define in window.customElements
                static {
                    __runInitializers(_classThis, _classExtraInitializers);
                }
            };
            return WithStaticOptions2 = _classThis;
        })();
        // it throws because the element is not defined yet.
        expect(() => new WithStaticOptions2()).toThrow();
        WithStaticOptions2.defineElement();
        const el2 = new WithStaticOptions2();
        document.body.append(el2);
        expect(el2.tagName.toLowerCase()).toBe('with-static-options2');
        el2.remove();
    });
    it('accepts and options object', () => {
        let ElementWithOptionsName = (() => {
            let _classDecorators = [element({ elementName: 'el-with-options-name' /* autoDefine: defaults to true */ })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = Element;
            var ElementWithOptionsName = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    ElementWithOptionsName = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
            };
            return ElementWithOptionsName = _classThis;
        })();
        const e = new ElementWithOptionsName();
        document.body.append(e);
        expect(e.tagName.toLowerCase()).toBe('el-with-options-name');
        e.remove();
        let WithOptionsObject = (() => {
            let _classDecorators = [element({ elementName: 'with-options-object', autoDefine: true })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = Element;
            var WithOptionsObject = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    WithOptionsObject = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
            };
            return WithOptionsObject = _classThis;
        })();
        const el = new WithOptionsObject();
        document.body.append(el);
        expect(el.tagName.toLowerCase()).toBe('with-options-object');
        el.remove();
        let WithOptionsObject2 = (() => {
            let _classDecorators = [element({ elementName: 'with-options-object2', autoDefine: false })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = Element;
            var WithOptionsObject2 = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    WithOptionsObject2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
            };
            return WithOptionsObject2 = _classThis;
        })();
        // it throws because the element is not defined yet.
        expect(() => new WithOptionsObject2()).toThrow();
        WithOptionsObject2.defineElement();
        const el2 = new WithOptionsObject2();
        document.body.append(el2);
        expect(el2.tagName.toLowerCase()).toBe('with-options-object2');
        el2.remove();
    });
    it('uses the class name to derive the the dash-case element name if not provided', () => {
        let WithConstructorName1 = (() => {
            let _classDecorators = [element];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = Element;
            var WithConstructorName1 = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    WithConstructorName1 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
            };
            return WithConstructorName1 = _classThis;
        })();
        expect(WithConstructorName1.elementName).toBe('with-constructor-name1');
        const el = new WithConstructorName1();
        document.body.append(el);
        expect(el.tagName.toLowerCase()).toBe('with-constructor-name1');
        el.remove();
        let WithConstructorName2 = (() => {
            let _classDecorators = [element];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = Element;
            var WithConstructorName2 = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    WithConstructorName2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                }
                static autoDefine = false; // don't automatically define in window.customElements
                static {
                    __runInitializers(_classThis, _classExtraInitializers);
                }
            };
            return WithConstructorName2 = _classThis;
        })();
        expect(WithConstructorName2.elementName).toBe('with-constructor-name2');
        // it throws because the element is not defined yet.
        expect(() => new WithConstructorName2()).toThrow();
        WithConstructorName2.defineElement();
        const el2 = new WithConstructorName2();
        document.body.append(el2);
        expect(el2.tagName.toLowerCase()).toBe('with-constructor-name2');
        el2.remove();
        const WithConstructorName3 = WithConstructorName2.defineElement('with-constructor-name3');
        expect(WithConstructorName3.elementName).toBe('with-constructor-name3');
        const el3 = document.createElement('with-constructor-name3');
        document.body.append(el3);
        expect(el3.tagName.toLowerCase()).toBe('with-constructor-name3');
        el3.remove();
        let WithConstructorName4 = (() => {
            let _classDecorators = [element('', false)];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = Element;
            var WithConstructorName4 = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    WithConstructorName4 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
            };
            return WithConstructorName4 = _classThis;
        })();
        expect(WithConstructorName4.elementName).toBe('with-constructor-name4');
        // it throws because the element is not defined yet.
        expect(() => new WithConstructorName4()).toThrow();
        WithConstructorName4.defineElement();
        const el4 = new WithConstructorName4();
        document.body.append(el4);
        expect(el4.tagName.toLowerCase()).toBe('with-constructor-name4');
        el4.remove();
        let WithConstructorName5 = (() => {
            let _classDecorators = [element({ autoDefine: false })];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = Element;
            var WithConstructorName5 = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    WithConstructorName5 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
            };
            return WithConstructorName5 = _classThis;
        })();
        expect(WithConstructorName5.elementName).toBe('with-constructor-name5');
        // it throws because the element is not defined yet.
        expect(() => new WithConstructorName5()).toThrow();
        WithConstructorName5.defineElement();
        const el5 = new WithConstructorName5();
        document.body.append(el5);
        expect(el5.tagName.toLowerCase()).toBe('with-constructor-name5');
        el5.remove();
        let WithConstructorName6 = (() => {
            let _classDecorators = [element('')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = Element;
            var WithConstructorName6 = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    WithConstructorName6 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
            };
            return WithConstructorName6 = _classThis;
        })();
        expect(WithConstructorName6.elementName).toBe('with-constructor-name6');
        const el6 = new WithConstructorName6();
        document.body.append(el6);
        expect(el6.tagName.toLowerCase()).toBe('with-constructor-name6');
        el6.remove();
    });
    it('ensures initial field values act as default attribute values when attributes removed, with decorator syntax', () => {
        let DefaultValueTest = (() => {
            let _classDecorators = [element('default-values-with-decorators')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = Element;
            let _instanceExtraInitializers = [];
            let _foo_decorators;
            let _foo_initializers = [];
            let _foo_extraInitializers = [];
            let _bar_decorators;
            let _bar_initializers = [];
            let _bar_extraInitializers = [];
            let _num_decorators;
            let _num_initializers = [];
            let _num_extraInitializers = [];
            let _bool_decorators;
            let _bool_initializers = [];
            let _bool_extraInitializers = [];
            let _bool2_decorators;
            let _bool2_initializers = [];
            let _bool2_extraInitializers = [];
            let _baz_decorators;
            let _baz_initializers = [];
            let _baz_extraInitializers = [];
            let _baz2_decorators;
            let _baz2_initializers = [];
            let _baz2_extraInitializers = [];
            let _get_gettersetter_decorators;
            let _set_gettersetter_decorators;
            var DefaultValueTest = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    _foo_decorators = [attribute];
                    _bar_decorators = [stringAttribute];
                    _num_decorators = [numberAttribute];
                    _bool_decorators = [booleanAttribute];
                    _bool2_decorators = [booleanAttribute];
                    _baz_decorators = [stringAttribute];
                    _baz2_decorators = [stringAttribute];
                    _get_gettersetter_decorators = [numberAttribute];
                    _set_gettersetter_decorators = [numberAttribute];
                    __esDecorate(this, null, _get_gettersetter_decorators, { kind: "getter", name: "gettersetter", static: false, private: false, access: { has: obj => "gettersetter" in obj, get: obj => obj.gettersetter }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(this, null, _set_gettersetter_decorators, { kind: "setter", name: "gettersetter", static: false, private: false, access: { has: obj => "gettersetter" in obj, set: (obj, value) => { obj.gettersetter = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(null, null, _foo_decorators, { kind: "field", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, _foo_initializers, _foo_extraInitializers);
                    __esDecorate(null, null, _bar_decorators, { kind: "field", name: "bar", static: false, private: false, access: { has: obj => "bar" in obj, get: obj => obj.bar, set: (obj, value) => { obj.bar = value; } }, metadata: _metadata }, _bar_initializers, _bar_extraInitializers);
                    __esDecorate(null, null, _num_decorators, { kind: "field", name: "num", static: false, private: false, access: { has: obj => "num" in obj, get: obj => obj.num, set: (obj, value) => { obj.num = value; } }, metadata: _metadata }, _num_initializers, _num_extraInitializers);
                    __esDecorate(null, null, _bool_decorators, { kind: "field", name: "bool", static: false, private: false, access: { has: obj => "bool" in obj, get: obj => obj.bool, set: (obj, value) => { obj.bool = value; } }, metadata: _metadata }, _bool_initializers, _bool_extraInitializers);
                    __esDecorate(null, null, _bool2_decorators, { kind: "field", name: "bool2", static: false, private: false, access: { has: obj => "bool2" in obj, get: obj => obj.bool2, set: (obj, value) => { obj.bool2 = value; } }, metadata: _metadata }, _bool2_initializers, _bool2_extraInitializers);
                    __esDecorate(null, null, _baz_decorators, { kind: "field", name: "baz", static: false, private: false, access: { has: obj => "baz" in obj, get: obj => obj.baz, set: (obj, value) => { obj.baz = value; } }, metadata: _metadata }, _baz_initializers, _baz_extraInitializers);
                    __esDecorate(null, null, _baz2_decorators, { kind: "field", name: "baz2", static: false, private: false, access: { has: obj => "baz2" in obj, get: obj => obj.baz2, set: (obj, value) => { obj.baz2 = value; } }, metadata: _metadata }, _baz2_initializers, _baz2_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    DefaultValueTest = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
                foo = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _foo_initializers, 'foo'));
                bar = (__runInitializers(this, _foo_extraInitializers), __runInitializers(this, _bar_initializers, 'bar'));
                num = (__runInitializers(this, _bar_extraInitializers), __runInitializers(this, _num_initializers, 123));
                bool = (__runInitializers(this, _num_extraInitializers), __runInitializers(this, _bool_initializers, false));
                bool2 = (__runInitializers(this, _bool_extraInitializers), __runInitializers(this, _bool2_initializers, true
                // undefined initial value
                // @ts-expect-error
                ));
                // undefined initial value
                // @ts-expect-error
                baz = (__runInitializers(this, _bool2_extraInitializers), __runInitializers(this, _baz_initializers, void 0));
                baz2 = (__runInitializers(this, _baz_extraInitializers), __runInitializers(this, _baz2_initializers, null
                // The default attribute value will be 123, from the .num property.
                ));
                // The default attribute value will be 123, from the .num property.
                get gettersetter() {
                    return this.num;
                }
                set gettersetter(v) {
                    this.num = v;
                }
                constructor() {
                    super(...arguments);
                    __runInitializers(this, _baz2_extraInitializers);
                }
            };
            return DefaultValueTest = _classThis;
        })();
        let el = document.createElement('default-values-with-decorators');
        document.body.append(el);
        testAttributes(el, 'gettersetter');
        el.remove();
        let DefaultValueTestSubclass = (() => {
            let _classDecorators = [element('default-values-with-decorators-subclass')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = DefaultValueTest;
            let _instanceExtraInitializers = [];
            let _lorem_decorators;
            let _lorem_initializers = [];
            let _lorem_extraInitializers = [];
            let _ipsum_decorators;
            let _ipsum_initializers = [];
            let _ipsum_extraInitializers = [];
            let _dolor_decorators;
            let _dolor_initializers = [];
            let _dolor_extraInitializers = [];
            let _set_decorators;
            let _set_initializers = [];
            let _set_extraInitializers = [];
            let _amit_decorators;
            let _amit_initializers = [];
            let _amit_extraInitializers = [];
            let _yes_decorators;
            let _yes_initializers = [];
            let _yes_extraInitializers = [];
            let _yes2_decorators;
            let _yes2_initializers = [];
            let _yes2_extraInitializers = [];
            let _get_gettersetter2_decorators;
            let _set_gettersetter2_decorators;
            var DefaultValueTestSubclass = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    _lorem_decorators = [attribute];
                    _ipsum_decorators = [stringAttribute];
                    _dolor_decorators = [numberAttribute];
                    _set_decorators = [booleanAttribute];
                    _amit_decorators = [booleanAttribute];
                    _yes_decorators = [stringAttribute];
                    _yes2_decorators = [stringAttribute];
                    _get_gettersetter2_decorators = [numberAttribute];
                    _set_gettersetter2_decorators = [numberAttribute];
                    __esDecorate(this, null, _get_gettersetter2_decorators, { kind: "getter", name: "gettersetter2", static: false, private: false, access: { has: obj => "gettersetter2" in obj, get: obj => obj.gettersetter2 }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(this, null, _set_gettersetter2_decorators, { kind: "setter", name: "gettersetter2", static: false, private: false, access: { has: obj => "gettersetter2" in obj, set: (obj, value) => { obj.gettersetter2 = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(null, null, _lorem_decorators, { kind: "field", name: "lorem", static: false, private: false, access: { has: obj => "lorem" in obj, get: obj => obj.lorem, set: (obj, value) => { obj.lorem = value; } }, metadata: _metadata }, _lorem_initializers, _lorem_extraInitializers);
                    __esDecorate(null, null, _ipsum_decorators, { kind: "field", name: "ipsum", static: false, private: false, access: { has: obj => "ipsum" in obj, get: obj => obj.ipsum, set: (obj, value) => { obj.ipsum = value; } }, metadata: _metadata }, _ipsum_initializers, _ipsum_extraInitializers);
                    __esDecorate(null, null, _dolor_decorators, { kind: "field", name: "dolor", static: false, private: false, access: { has: obj => "dolor" in obj, get: obj => obj.dolor, set: (obj, value) => { obj.dolor = value; } }, metadata: _metadata }, _dolor_initializers, _dolor_extraInitializers);
                    __esDecorate(null, null, _set_decorators, { kind: "field", name: "set", static: false, private: false, access: { has: obj => "set" in obj, get: obj => obj.set, set: (obj, value) => { obj.set = value; } }, metadata: _metadata }, _set_initializers, _set_extraInitializers);
                    __esDecorate(null, null, _amit_decorators, { kind: "field", name: "amit", static: false, private: false, access: { has: obj => "amit" in obj, get: obj => obj.amit, set: (obj, value) => { obj.amit = value; } }, metadata: _metadata }, _amit_initializers, _amit_extraInitializers);
                    __esDecorate(null, null, _yes_decorators, { kind: "field", name: "yes", static: false, private: false, access: { has: obj => "yes" in obj, get: obj => obj.yes, set: (obj, value) => { obj.yes = value; } }, metadata: _metadata }, _yes_initializers, _yes_extraInitializers);
                    __esDecorate(null, null, _yes2_decorators, { kind: "field", name: "yes2", static: false, private: false, access: { has: obj => "yes2" in obj, get: obj => obj.yes2, set: (obj, value) => { obj.yes2 = value; } }, metadata: _metadata }, _yes2_initializers, _yes2_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    DefaultValueTestSubclass = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
                lorem = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _lorem_initializers, 'foo'));
                ipsum = (__runInitializers(this, _lorem_extraInitializers), __runInitializers(this, _ipsum_initializers, 'bar'));
                dolor = (__runInitializers(this, _ipsum_extraInitializers), __runInitializers(this, _dolor_initializers, 123));
                set = (__runInitializers(this, _dolor_extraInitializers), __runInitializers(this, _set_initializers, false));
                amit = (__runInitializers(this, _set_extraInitializers), __runInitializers(this, _amit_initializers, true
                // undefined initial value
                // @ts-expect-error
                ));
                // undefined initial value
                // @ts-expect-error
                yes = (__runInitializers(this, _amit_extraInitializers), __runInitializers(this, _yes_initializers, void 0));
                yes2 = (__runInitializers(this, _yes_extraInitializers), __runInitializers(this, _yes2_initializers, null
                // The default attribute value will be 123, from the .dolor property.
                ));
                // The default attribute value will be 123, from the .dolor property.
                get gettersetter2() {
                    return this.dolor;
                }
                set gettersetter2(v) {
                    this.dolor = v;
                }
                constructor() {
                    super(...arguments);
                    __runInitializers(this, _yes2_extraInitializers);
                }
            };
            return DefaultValueTestSubclass = _classThis;
        })();
        DefaultValueTestSubclass;
        el = document.createElement('default-values-with-decorators-subclass');
        document.body.append(el);
        testAttributes(el, 'gettersetter');
        testAttributes(el, 'gettersetter2', 'lorem', 'ipsum', 'dolor', 'set', 'amit', 'yes', 'yes2');
        el.remove();
    });
    it('ensures initial field values act as default attribute values when attributes removed, no decorator syntax, class fields', () => {
        const DefaultValueTest = element('default-values-without-decorators')(class extends Element {
            static observedAttributeHandlers = {
                foo: {},
                bar: attribute.string,
                num: attribute.number,
                bool: attribute.boolean,
                bool2: attribute.boolean,
                baz: attribute.string,
                baz2: attribute.string,
                gettersetter: attribute.number,
            };
            foo = 'foo';
            bar = 'bar';
            num = 123;
            bool = false;
            bool2 = true;
            // undefined initial value
            // @ts-expect-error
            baz;
            baz2 = null;
            get gettersetter() {
                return this.num;
            }
            set gettersetter(v) {
                this.num = v;
            }
        });
        let el = document.createElement('default-values-without-decorators');
        document.body.append(el);
        testAttributes(el, 'gettersetter');
        el.remove();
        element('default-values-without-decorators-subclass')(class DefaultValueTestSubclass extends DefaultValueTest {
            static observedAttributeHandlers = {
                lorem: {},
                ipsum: attribute.string,
                dolor: attribute.number,
                set: attribute.boolean,
                amit: attribute.boolean,
                yes: attribute.string,
                yes2: attribute.string,
                gettersetter2: attribute.number,
            };
            lorem = 'foo';
            ipsum = 'bar';
            dolor = 123;
            set = false;
            amit = true;
            // undefined initial value
            // @ts-expect-error
            yes;
            yes2 = null;
            get gettersetter2() {
                return this.dolor;
            }
            set gettersetter2(v) {
                this.dolor = v;
            }
        });
        el = document.createElement('default-values-without-decorators-subclass');
        document.body.append(el);
        testAttributes(el, 'gettersetter');
        testAttributes(el, 'gettersetter2', 'lorem', 'ipsum', 'dolor', 'set', 'amit', 'yes', 'yes2');
        el.remove();
    });
    it('ensures initial field values act as default attribute values when attributes removed, no decorator syntax, constructor properties', () => {
        const DefaultValueTest = element('default-values-without-decorators-constructor-props')(class extends Element {
            static observedAttributeHandlers = {
                foo: {},
                bar: attribute.string,
                num: attribute.number,
                bool: attribute.boolean,
                bool2: attribute.boolean,
                baz: attribute.string,
                baz2: attribute.string,
            };
            constructor() {
                super();
                // @ts-expect-error
                this.foo = 'foo';
                // @ts-expect-error
                this.bar = 'bar';
                // @ts-expect-error
                this.num = 123;
                // @ts-expect-error
                this.bool = false;
                // @ts-expect-error
                this.bool2 = true;
                // undefined initial value
                // @ts-expect-error
                this.baz = undefined;
                // @ts-expect-error
                this.baz2 = null;
            }
        });
        let el = document.createElement('default-values-without-decorators-constructor-props');
        document.body.append(el);
        testAttributes(el);
        el.remove();
        element('default-values-without-decorators-constructor-props-subclass')(class DefaultValueTestSubclass extends DefaultValueTest {
            static observedAttributeHandlers = {
                lorem: {},
                ipsum: attribute.string,
                dolor: attribute.number,
                set: attribute.boolean,
                amit: attribute.boolean,
                yes: attribute.string,
                yes2: attribute.string,
            };
            constructor() {
                super();
                // @ts-expect-error
                this.lorem = 'foo';
                // @ts-expect-error
                this.ipsum = 'bar';
                // @ts-expect-error
                this.dolor = 123;
                // @ts-expect-error
                this.set = false;
                // @ts-expect-error
                this.amit = true;
                // undefined initial value
                // @ts-expect-error
                this.yes = undefined;
                // @ts-expect-error
                this.yes2 = null;
            }
        });
        el = document.createElement('default-values-without-decorators-constructor-props-subclass');
        document.body.append(el);
        testAttributes(el);
        testAttributes(el, '', 'lorem', 'ipsum', 'dolor', 'set', 'amit', 'yes', 'yes2');
        el.remove();
    });
    it('automatically does not track reactivity in constructors when using decorators, using @signal', () => {
        let Foo = (() => {
            let _classDecorators = [element('untracked-ctor')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = Element;
            let _amount_decorators;
            let _amount_initializers = [];
            let _amount_extraInitializers = [];
            var Foo = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    _amount_decorators = [signal];
                    __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Foo = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
                amount = __runInitializers(this, _amount_initializers, 3);
                constructor() {
                    super(...arguments);
                    __runInitializers(this, _amount_extraInitializers);
                }
            };
            return Foo = _classThis;
        })();
        let Bar = (() => {
            let _classDecorators = [element('untracked-ctor-sub')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = Foo;
            let _double_decorators;
            let _double_initializers = [];
            let _double_extraInitializers = [];
            var Bar = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    _double_decorators = [signal];
                    __esDecorate(null, null, _double_decorators, { kind: "field", name: "double", static: false, private: false, access: { has: obj => "double" in obj, get: obj => obj.double, set: (obj, value) => { obj.double = value; } }, metadata: _metadata }, _double_initializers, _double_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Bar = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
                double = __runInitializers(this, _double_initializers, 0);
                constructor() {
                    super();
                    __runInitializers(this, _double_extraInitializers);
                    this.double = this.amount * 2; // this read of .amount should not be tracked
                }
            };
            return Bar = _classThis;
        })();
        let b;
        let count = 0;
        function noInfiniteReactivityLoop() {
            createEffect(() => {
                b = new Bar(); // this should not track
                count++;
            });
        }
        expect(noInfiniteReactivityLoop).not.toThrow();
        const b2 = b;
        b.amount = 4; // hence this should not trigger
        b.double = 8; // hence this should not trigger
        // If the effect ran only once initially because it did not track,
        // then both variables should reference the same instance
        expect(count).toBe(1);
        expect(b).toBe(b2);
    });
    it('automatically does not track reactivity in constructors when using decorators, using @attribute', () => {
        let Foo = (() => {
            let _classDecorators = [element('untracked-ctor2')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = Element;
            let _amount_decorators;
            let _amount_initializers = [];
            let _amount_extraInitializers = [];
            var Foo = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    _amount_decorators = [numberAttribute];
                    __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Foo = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
                amount = __runInitializers(this, _amount_initializers, 3);
                constructor() {
                    super(...arguments);
                    __runInitializers(this, _amount_extraInitializers);
                }
            };
            return Foo = _classThis;
        })();
        let Bar = (() => {
            let _classDecorators = [element('untracked-ctor-sub2')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = Foo;
            let _double_decorators;
            let _double_initializers = [];
            let _double_extraInitializers = [];
            var Bar = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    _double_decorators = [numberAttribute];
                    __esDecorate(null, null, _double_decorators, { kind: "field", name: "double", static: false, private: false, access: { has: obj => "double" in obj, get: obj => obj.double, set: (obj, value) => { obj.double = value; } }, metadata: _metadata }, _double_initializers, _double_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Bar = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
                double = __runInitializers(this, _double_initializers, 0);
                constructor() {
                    super();
                    __runInitializers(this, _double_extraInitializers);
                    this.double = this.amount * 2; // this read of .amount should not be tracked
                }
            };
            return Bar = _classThis;
        })();
        let b;
        let count = 0;
        function noInfiniteReactivityLoop() {
            createEffect(() => {
                b = new Bar(); // this should not track
                count++;
            });
        }
        expect(noInfiniteReactivityLoop).not.toThrow();
        const b2 = b;
        b.amount = 4; // hence this should not trigger
        b.double = 8; // hence this should not trigger
        // If the effect ran only once initially because it did not track,
        // then both variables should reference the same instance
        expect(count).toBe(1);
        expect(b).toBe(b2);
    });
    it('automatically does not track reactivity in constructors when not using decorators', () => {
        const Foo = element('untracked-ctor3')(class Foo extends Element {
            static observedAttributeHandlers = {
                amount: attribute.number,
            };
            amount = 3;
        });
        const Bar = element('untracked-ctor-sub3')(class Bar extends Foo {
            static observedAttributeHandlers = {
                // __proto__: super.observedAttributeHandlers,
                // ...super.observedAttributeHandlers,
                double: attribute.number,
            };
            double = 0;
            constructor() {
                super();
                this.double = this.amount * 2; // this read of .amount should not be tracked
            }
        });
        let b;
        let count = 0;
        function noInfiniteReactivityLoop() {
            createEffect(() => {
                b = new Bar(); // this should not track
                count++;
            });
        }
        expect(noInfiniteReactivityLoop).not.toThrow();
        const b2 = b;
        b.amount = 4; // hence this should not trigger
        b.double = 8; // hence this should not trigger
        // If the effect ran only once initially because it did not track,
        // then both variables should reference the same instance
        expect(count).toBe(1);
        expect(b).toBe(b2);
    });
});
function testAttributes(el, gettersetter = '', foo = 'foo', bar = 'bar', num = 'num', bool = 'bool', bool2 = 'bool2', baz = 'baz', baz2 = 'baz2') {
    el.setAttribute(foo, 'blah');
    // @ts-ignore
    expect(el[foo]).toBe('blah');
    el.removeAttribute(foo);
    // @ts-ignore
    expect(el[foo]).toBe('foo');
    el.setAttribute(bar, 'blah');
    // @ts-ignore
    expect(el[bar]).toBe('blah');
    el.removeAttribute(bar);
    // @ts-ignore
    expect(el[bar]).toBe('bar');
    el.setAttribute(num, '456');
    // @ts-ignore
    expect(el[num]).toBe(456);
    el.removeAttribute(num);
    // @ts-ignore
    expect(el[num]).toBe(123);
    el.setAttribute(bool, 'true');
    // @ts-ignore
    expect(el[bool]).toBe(true);
    el.removeAttribute(bool);
    // @ts-ignore
    expect(el[bool]).toBe(false);
    el.setAttribute(bool2, 'true');
    // @ts-ignore
    expect(el[bool2]).toBe(true);
    el.setAttribute(bool2, 'false');
    // @ts-ignore
    expect(el[bool2]).toBe(false);
    el.removeAttribute(bool2);
    // @ts-ignore
    expect(el[bool2]).toBe(true);
    el.setAttribute(baz, 'true');
    // @ts-ignore
    expect(el[baz]).toBe('true');
    el.removeAttribute(baz);
    // @ts-ignore
    expect(el[baz]).toBe(undefined);
    el.setAttribute(baz2, 'oh yeah');
    // @ts-ignore
    expect(el[baz2]).toBe('oh yeah');
    el.removeAttribute(baz2);
    // @ts-ignore
    expect(el[baz2] === null).toBe(true);
    if (gettersetter) {
        el.setAttribute(gettersetter, '456');
        // @ts-ignore
        expect(el[gettersetter]).toBe(456);
        el.removeAttribute(gettersetter);
        // @ts-ignore
        expect(el[gettersetter]).toBe(123);
    }
}
//# sourceMappingURL=element.test.js.map