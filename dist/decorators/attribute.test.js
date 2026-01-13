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
var __propKey = (this && this.__propKey) || function (x) {
    return typeof x === "symbol" ? x : "".concat(x);
};
import { createEffect } from 'solid-js';
import { memo, effect, signal } from 'classy-solid';
import { Element, element, attribute, numberAttribute, booleanAttribute, eventAttribute, noSignal, stringAttribute, jsonAttribute, } from '../index.js';
describe('@attribute', () => {
    it('attributes can be mapped to properties with @attribute', () => {
        let FooBar = (() => {
            let _classDecorators = [element('foo-bar')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = HTMLElement;
            let _foo_decorators;
            let _foo_initializers = [];
            let _foo_extraInitializers = [];
            var FooBar = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    _foo_decorators = [attribute];
                    __esDecorate(null, null, _foo_decorators, { kind: "field", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, _foo_initializers, _foo_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    FooBar = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
                foo = __runInitializers(this, _foo_initializers, '0');
                constructor() {
                    super(...arguments);
                    __runInitializers(this, _foo_extraInitializers);
                }
            };
            return FooBar = _classThis;
        })();
        const f = new FooBar();
        // Properties currently do not reflect back to attributes (no option
        // for that yet).
        expect(f.getAttribute('foo')).toBe(null);
        document.body.insertAdjacentHTML('beforeend', `<foo-bar foo="good day!"></foo-bar>`);
        const ff = document.body.lastElementChild;
        expect(ff.getAttribute('foo')).toBe('good day!');
        expect(ff.foo).toBe('good day!');
        let count = 0;
        // Runs once initially, then re-runs any time f.foo has changed.
        createEffect(() => {
            f.foo;
            ff.foo;
            count++;
        });
        expect(count).toBe(1);
        f.setAttribute('foo', '123');
        expect(count).toBe(2);
        expect(f.foo).toBe('123');
        f.setAttribute('foo', '456');
        expect(count).toBe(3);
        expect(f.foo).toBe('456');
        f.removeAttribute('foo');
        expect(count).toBe(4);
        expect(f.foo).toBe('0');
        ff.foo = 'good night!';
        expect(count).toBe(5);
        // Remember, properties do not reflect to attributes (no option for that yet).
        expect(ff.getAttribute('foo')).toBe('good day!');
        expect(ff.foo).toBe('good night!');
    });
    it("@signal doesn't need to be used if using @attribute, as those are @signal too", () => {
        let Purpose = (() => {
            let _classDecorators = [element('pur-pose')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = Element;
            let _purpose_decorators;
            let _purpose_initializers = [];
            let _purpose_extraInitializers = [];
            var Purpose = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    _purpose_decorators = [attribute];
                    __esDecorate(null, null, _purpose_decorators, { kind: "field", name: "purpose", static: false, private: false, access: { has: obj => "purpose" in obj, get: obj => obj.purpose, set: (obj, value) => { obj.purpose = value; } }, metadata: _metadata }, _purpose_initializers, _purpose_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Purpose = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
                purpose = __runInitializers(this, _purpose_initializers, '0');
                constructor() {
                    super(...arguments);
                    __runInitializers(this, _purpose_extraInitializers);
                }
            };
            return Purpose = _classThis;
        })();
        const f = new Purpose();
        let count = 0;
        let val = '';
        createEffect(() => {
            val = f.purpose;
            count++;
        });
        f.purpose = 'Alive to discover.';
        expect(count).toBe(2);
        expect(val).toBe('Alive to discover.');
        f.setAttribute('purpose', 'Born to create!');
        expect(count).toBe(3);
        expect(val).toBe('Born to create!');
        f.purpose = 'To inspire.';
        expect(count).toBe(4);
        expect(val).toBe('To inspire.');
        // There is no option to reflect props to attributes yet. Do we want that?
        expect(f.getAttribute('purpose')).toBe('Born to create!');
    });
    it('works with accessors', () => {
        let Purpose = (() => {
            let _classDecorators = [element('pur-pose-2')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = Element;
            let _instanceExtraInitializers = [];
            let _get_purpose_decorators;
            let _set_purpose_decorators;
            var Purpose = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    _get_purpose_decorators = [attribute];
                    _set_purpose_decorators = [attribute];
                    __esDecorate(this, null, _get_purpose_decorators, { kind: "getter", name: "purpose", static: false, private: false, access: { has: obj => "purpose" in obj, get: obj => obj.purpose }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(this, null, _set_purpose_decorators, { kind: "setter", name: "purpose", static: false, private: false, access: { has: obj => "purpose" in obj, set: (obj, value) => { obj.purpose = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Purpose = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
                __purpose = (__runInitializers(this, _instanceExtraInitializers), null);
                get purpose() {
                    return this.__purpose;
                }
                set purpose(v) {
                    this.__purpose = v;
                }
            };
            return Purpose = _classThis;
        })();
        const f = new Purpose();
        let count = 0;
        createEffect(() => {
            f.purpose;
            count++;
        });
        f.purpose = 'Alive to discover.';
        expect(count).toBe(2);
        f.setAttribute('purpose', 'Born to create!');
        expect(count).toBe(3);
        expect(f.purpose).toBe('Born to create!');
        expect(f.__purpose).toBe('Born to create!');
        f.purpose = 'To inspire.';
        expect(count).toBe(4);
        expect(f.purpose).toBe('To inspire.');
        expect(f.__purpose).toBe('To inspire.');
        // There is no option to reflect props to attributes yet. Do we want that?
        expect(f.getAttribute('purpose')).toBe('Born to create!');
    });
    it('skips composing with @signal if @noSignal is used before it, class field', async () => {
        let NoSignal = (() => {
            let _classDecorators = [element('no-signal')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = Element;
            let _foo_decorators;
            let _foo_initializers = [];
            let _foo_extraInitializers = [];
            let _bar_decorators;
            let _bar_initializers = [];
            let _bar_extraInitializers = [];
            var NoSignal = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    _foo_decorators = [attribute, noSignal];
                    _bar_decorators = [attribute];
                    __esDecorate(null, null, _foo_decorators, { kind: "field", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, _foo_initializers, _foo_extraInitializers);
                    __esDecorate(null, null, _bar_decorators, { kind: "field", name: "bar", static: false, private: false, access: { has: obj => "bar" in obj, get: obj => obj.bar, set: (obj, value) => { obj.bar = value; } }, metadata: _metadata }, _bar_initializers, _bar_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    NoSignal = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
                foo = __runInitializers(this, _foo_initializers, '123');
                bar = (__runInitializers(this, _foo_extraInitializers), __runInitializers(this, _bar_initializers, '123'));
                constructor() {
                    super(...arguments);
                    __runInitializers(this, _bar_extraInitializers);
                }
            };
            return NoSignal = _classThis;
        })();
        const el = document.createElement('no-signal');
        document.body.append(el);
        let count = 0;
        createEffect(() => {
            el.foo;
            el.bar;
            count++;
        });
        expect(el.foo).toBe('123');
        expect(el.bar).toBe('123');
        expect(count).toBe(1);
        el.setAttribute('foo', '456');
        expect(el.foo).toBe('456');
        expect(el.bar).toBe('123');
        expect(count).toBe(1); // still 1, foo is not reactive
        el.setAttribute('bar', '456');
        expect(el.foo).toBe('456');
        expect(el.bar).toBe('456');
        expect(count).toBe(2); // 2, bar is reactive
        ////////////////////////////////////
        // Ensure overriding fields works
        let NoSignal2 = (() => {
            let _classDecorators = [element('no-signal2')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = NoSignal;
            let _foo_decorators;
            let _foo_initializers = [];
            let _foo_extraInitializers = [];
            let _bar_decorators;
            let _bar_initializers = [];
            let _bar_extraInitializers = [];
            var NoSignal2 = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    _foo_decorators = [attribute];
                    _bar_decorators = [attribute, noSignal];
                    __esDecorate(null, null, _foo_decorators, { kind: "field", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, _foo_initializers, _foo_extraInitializers);
                    __esDecorate(null, null, _bar_decorators, { kind: "field", name: "bar", static: false, private: false, access: { has: obj => "bar" in obj, get: obj => obj.bar, set: (obj, value) => { obj.bar = value; } }, metadata: _metadata }, _bar_initializers, _bar_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    NoSignal2 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
                foo = __runInitializers(this, _foo_initializers, '123');
                bar = (__runInitializers(this, _foo_extraInitializers), __runInitializers(this, _bar_initializers, '123'));
                constructor() {
                    super(...arguments);
                    __runInitializers(this, _bar_extraInitializers);
                }
            };
            return NoSignal2 = _classThis;
        })();
        const el2 = document.createElement('no-signal2');
        document.body.append(el2);
        let count2 = 0;
        createEffect(() => {
            el2.foo;
            el2.bar;
            count2++;
        });
        expect(el2.foo).toBe('123');
        expect(el2.bar).toBe('123');
        expect(count2).toBe(1);
        el2.setAttribute('foo', '456');
        expect(el2.foo).toBe('456');
        expect(el2.bar).toBe('123');
        expect(count2).toBe(2); // 2, foo is reactive
        el2.setAttribute('bar', '456');
        expect(el2.foo).toBe('456');
        expect(el2.bar).toBe('456');
        expect(count2).toBe(2); // still 2, bar is not reactive
    });
    it('skips composing with @signal if @noSignal is used before it, class getter/setter', async () => {
        let NoSignal3 = (() => {
            let _classDecorators = [element('no-signal3')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = Element;
            let _instanceExtraInitializers = [];
            let _get_value1_decorators;
            let _set_value1_decorators;
            let _get_value2_decorators;
            let _set_value2_decorators;
            var NoSignal3 = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    _get_value1_decorators = [attribute, noSignal];
                    _set_value1_decorators = [attribute, noSignal];
                    _get_value2_decorators = [attribute];
                    _set_value2_decorators = [attribute];
                    __esDecorate(this, null, _get_value1_decorators, { kind: "getter", name: "value1", static: false, private: false, access: { has: obj => "value1" in obj, get: obj => obj.value1 }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(this, null, _set_value1_decorators, { kind: "setter", name: "value1", static: false, private: false, access: { has: obj => "value1" in obj, set: (obj, value) => { obj.value1 = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(this, null, _get_value2_decorators, { kind: "getter", name: "value2", static: false, private: false, access: { has: obj => "value2" in obj, get: obj => obj.value2 }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(this, null, _set_value2_decorators, { kind: "setter", name: "value2", static: false, private: false, access: { has: obj => "value2" in obj, set: (obj, value) => { obj.value2 = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    NoSignal3 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
                #val1 = (__runInitializers(this, _instanceExtraInitializers), '123');
                get value1() {
                    return this.#val1;
                }
                set value1(v) {
                    this.#val1 = v;
                }
                #val2 = '123';
                get value2() {
                    return this.#val2;
                }
                set value2(v) {
                    this.#val2 = v;
                }
            };
            return NoSignal3 = _classThis;
        })();
        const el = document.createElement('no-signal3');
        document.body.append(el);
        let count = 0;
        createEffect(() => {
            el.value1;
            el.value2;
            count++;
        });
        expect(el.value1).toBe('123');
        expect(el.value2).toBe('123');
        expect(count).toBe(1);
        el.setAttribute('value1', '456');
        expect(el.value1).toBe('456');
        expect(el.value2).toBe('123');
        expect(count).toBe(1); // still 1, el.value1 is not reactive
        el.setAttribute('value2', '456');
        expect(el.value1).toBe('456');
        expect(el.value2).toBe('456');
        expect(count).toBe(2); // 2, el.value2 is reactive
        ////////////////////////////////////
        // Ensure overriding getters/setters works
        let NoSignal4 = (() => {
            let _classDecorators = [element('no-signal4')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = NoSignal3;
            let _instanceExtraInitializers = [];
            let _get_value1_decorators;
            let _set_value1_decorators;
            let _get_value2_decorators;
            let _set_value2_decorators;
            var NoSignal4 = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    _get_value1_decorators = [attribute];
                    _set_value1_decorators = [attribute];
                    _get_value2_decorators = [attribute, noSignal];
                    _set_value2_decorators = [attribute, noSignal];
                    __esDecorate(this, null, _get_value1_decorators, { kind: "getter", name: "value1", static: false, private: false, access: { has: obj => "value1" in obj, get: obj => obj.value1 }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(this, null, _set_value1_decorators, { kind: "setter", name: "value1", static: false, private: false, access: { has: obj => "value1" in obj, set: (obj, value) => { obj.value1 = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(this, null, _get_value2_decorators, { kind: "getter", name: "value2", static: false, private: false, access: { has: obj => "value2" in obj, get: obj => obj.value2 }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(this, null, _set_value2_decorators, { kind: "setter", name: "value2", static: false, private: false, access: { has: obj => "value2" in obj, set: (obj, value) => { obj.value2 = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    NoSignal4 = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
                #val1 = (__runInitializers(this, _instanceExtraInitializers), '123');
                get value1() {
                    return this.#val1;
                }
                set value1(v) {
                    this.#val1 = v;
                }
                #val2 = '123';
                get value2() {
                    return this.#val2;
                }
                set value2(v) {
                    this.#val2 = v;
                }
            };
            return NoSignal4 = _classThis;
        })();
        const el2 = document.createElement('no-signal4');
        document.body.append(el2);
        let count2 = 0;
        createEffect(() => {
            el2.value1;
            el2.value2;
            count2++;
        });
        expect(el2.value1).toBe('123');
        expect(el2.value2).toBe('123');
        expect(count2).toBe(1);
        el2.setAttribute('value1', '456');
        expect(el2.value1).toBe('456');
        expect(el2.value2).toBe('123');
        expect(count2).toBe(2); // 1, el2.value1 is reactive
        el2.setAttribute('value2', '456');
        expect(el2.value1).toBe('456');
        expect(el2.value2).toBe('456');
        expect(count2).toBe(2); // still 2, el2.value2 is not reactive
    });
    let OverrideBase = (() => {
        let _classDecorators = [element('override-base')];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        let _classSuper = Element;
        let _instanceExtraInitializers = [];
        let _foo_decorators;
        let _foo_initializers = [];
        let _foo_extraInitializers = [];
        let _get_bar_decorators;
        let _set_bar_decorators;
        let _baz_decorators;
        let _baz_initializers = [];
        let _baz_extraInitializers = [];
        var OverrideBase = class extends _classSuper {
            static { _classThis = this; }
            static {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                _foo_decorators = [numberAttribute];
                _get_bar_decorators = [stringAttribute];
                _set_bar_decorators = [stringAttribute];
                _baz_decorators = [booleanAttribute];
                __esDecorate(this, null, _get_bar_decorators, { kind: "getter", name: "bar", static: false, private: false, access: { has: obj => "bar" in obj, get: obj => obj.bar }, metadata: _metadata }, null, _instanceExtraInitializers);
                __esDecorate(this, null, _set_bar_decorators, { kind: "setter", name: "bar", static: false, private: false, access: { has: obj => "bar" in obj, set: (obj, value) => { obj.bar = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
                __esDecorate(null, null, _foo_decorators, { kind: "field", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, _foo_initializers, _foo_extraInitializers);
                __esDecorate(null, null, _baz_decorators, { kind: "field", name: "baz", static: false, private: false, access: { has: obj => "baz" in obj, get: obj => obj.baz, set: (obj, value) => { obj.baz = value; } }, metadata: _metadata }, _baz_initializers, _baz_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                OverrideBase = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            }
            foo = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _foo_initializers, 123));
            #bar = (__runInitializers(this, _foo_extraInitializers), '123');
            get bar() {
                return this.#bar;
            }
            set bar(v) {
                this.#bar = v;
            }
            baz = __runInitializers(this, _baz_initializers, false);
            constructor() {
                super(...arguments);
                __runInitializers(this, _baz_extraInitializers);
            }
        };
        return OverrideBase = _classThis;
    })();
    let OverrideSubclass = (() => {
        let _classDecorators = [element('override-subclass')];
        let _classDescriptor;
        let _classExtraInitializers = [];
        let _classThis;
        let _classSuper = OverrideBase;
        let _instanceExtraInitializers = [];
        let _foo_decorators;
        let _foo_initializers = [];
        let _foo_extraInitializers = [];
        let _get_bar_decorators;
        let _set_bar_decorators;
        let _baz_decorators;
        let _baz_initializers = [];
        let _baz_extraInitializers = [];
        var OverrideSubclass = class extends _classSuper {
            static { _classThis = this; }
            static {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                _foo_decorators = [stringAttribute];
                _get_bar_decorators = [numberAttribute];
                _set_bar_decorators = [numberAttribute];
                _baz_decorators = [stringAttribute];
                __esDecorate(this, null, _get_bar_decorators, { kind: "getter", name: "bar", static: false, private: false, access: { has: obj => "bar" in obj, get: obj => obj.bar }, metadata: _metadata }, null, _instanceExtraInitializers);
                __esDecorate(this, null, _set_bar_decorators, { kind: "setter", name: "bar", static: false, private: false, access: { has: obj => "bar" in obj, set: (obj, value) => { obj.bar = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
                __esDecorate(null, null, _foo_decorators, { kind: "field", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, _foo_initializers, _foo_extraInitializers);
                __esDecorate(null, null, _baz_decorators, { kind: "field", name: "baz", static: false, private: false, access: { has: obj => "baz" in obj, get: obj => obj.baz, set: (obj, value) => { obj.baz = value; } }, metadata: _metadata }, _baz_initializers, _baz_extraInitializers);
                __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                OverrideSubclass = _classThis = _classDescriptor.value;
                if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                __runInitializers(_classThis, _classExtraInitializers);
            }
            // @ts-expect-error overriding with an incompatible type is fine in plain JS
            foo = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _foo_initializers, '123'));
            #bar = (__runInitializers(this, _foo_extraInitializers), 123);
            // @ts-expect-error overriding with an incompatible type is fine in plain JS
            get bar() {
                return this.#bar;
            }
            // @ts-expect-error overriding with an incompatible type is fine in plain JS
            set bar(v) {
                this.#bar = v;
            }
            // @ts-expect-error overriding with an incompatible type is fine in plain JS
            baz = __runInitializers(this, _baz_initializers, false); // not recommended: initial/default value not matching with decorator type
            constructor() {
                super(...arguments);
                __runInitializers(this, _baz_extraInitializers);
            }
        };
        return OverrideSubclass = _classThis;
    })();
    it('allows overriding fields/getters/setters in subclasses, using decorators', () => {
        let el = new OverrideBase();
        document.body.append(el);
        testAttribute(el, 'foo', '456', 456, 123);
        testAttribute(el, 'bar', '456', '456', '123');
        testAttribute(el, 'baz', 'true', true, false);
        el.remove();
        el = new OverrideSubclass();
        document.body.append(el);
        testAttribute(el, 'foo', '456', '456', '123');
        testAttribute(el, 'bar', '456', 456, 123);
        testAttribute(el, 'baz', 'true', 'true', false);
        el.remove();
    });
    it('handles property values the same as attributes, using decorators', () => {
        let el = new OverrideBase();
        document.body.append(el);
        testProp(el, 'foo', '456', 456, 456, 123, 'number');
        testProp(el, 'foo', 'asdf', NaN, NaN, 123, 'number'); // no error (should handlers throw if the value can't be properly deserialized?)
        testProp(el, 'bar', '456', '456', '456', '123', 'string');
        testProp(el, 'baz', 'true', true, true, false, 'boolean');
        el.remove();
        el = new OverrideSubclass();
        document.body.append(el);
        testProp(el, 'foo', '456', '456', '456', '123', 'string');
        testProp(el, 'bar', '456', 456, 456, 123, 'number');
        testProp(el, 'baz', 'true', 'true', 'true', false, 'string');
        el.remove();
    });
    const OverrideBase2 = element('override-base2')(class extends Element {
        static observedAttributeHandlers = {
            foo: attribute.number,
            bar: attribute.string,
            baz: attribute.boolean,
        };
        foo = 123;
        #bar = '123';
        get bar() {
            return this.#bar;
        }
        set bar(v) {
            this.#bar = v;
        }
        baz = false;
    });
    const OverrideSubclass2 = element('override-subclass2')(class extends OverrideBase2 {
        static observedAttributeHandlers = {
            foo: attribute.string,
            bar: attribute.number,
            baz: attribute.string,
        };
        // @ts-expect-error overriding with an incompatible type is fine in plain JS
        foo = '123';
        #bar = 123;
        // @ts-expect-error overriding with an incompatible type is fine in plain JS
        get bar() {
            return this.#bar;
        }
        // @ts-expect-error overriding with an incompatible type is fine in plain JS
        set bar(v) {
            this.#bar = v;
        }
        // @ts-expect-error overriding with an incompatible type is fine in plain JS
        baz = false;
    });
    it('allows overriding fields/getters/setters in subclasses, without decorators', () => {
        let el = new OverrideBase2();
        document.body.append(el);
        testAttribute(el, 'foo', '456', 456, 123);
        testAttribute(el, 'bar', '456', '456', '123');
        testAttribute(el, 'baz', 'true', true, false);
        el.remove();
        el = new OverrideSubclass2();
        document.body.append(el);
        testAttribute(el, 'foo', '456', '456', '123');
        testAttribute(el, 'bar', '456', 456, 123);
        testAttribute(el, 'baz', 'true', 'true', false);
        el.remove();
    });
    it('handles property values the same as attributes, without decorators', () => {
        let el = new OverrideBase2();
        document.body.append(el);
        testProp(el, 'foo', '456', 456, 456, 123, 'number');
        testProp(el, 'foo', 'asdf', NaN, NaN, 123, 'number'); // no error (should handlers throw if the value can't be properly deserialized?)
        testProp(el, 'bar', '456', '456', '456', '123', 'string');
        testProp(el, 'baz', 'true', true, true, false, 'boolean');
        el.remove();
        el = new OverrideSubclass2();
        document.body.append(el);
        testProp(el, 'foo', '456', '456', '456', '123', 'string');
        testProp(el, 'bar', '456', 456, 456, 123, 'number');
        testProp(el, 'baz', 'true', 'true', 'true', false, 'string');
        el.remove();
    });
    it('works with write-only non-signal setter', () => {
        let NonSignalWriteOnly = (() => {
            let _classDecorators = [element('non-signal-write-only')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = Element;
            let _instanceExtraInitializers = [];
            let _set_value_decorators;
            var NonSignalWriteOnly = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    _set_value_decorators = [booleanAttribute, noSignal];
                    __esDecorate(this, null, _set_value_decorators, { kind: "setter", name: "value", static: false, private: false, access: { has: obj => "value" in obj, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    NonSignalWriteOnly = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
                #value = (__runInitializers(this, _instanceExtraInitializers), true);
                set value(v) {
                    this.#value = v;
                }
                test() {
                    return this.#value;
                }
            };
            return NonSignalWriteOnly = _classThis;
        })();
        const el = new NonSignalWriteOnly();
        document.body.append(el);
        expect(el.test()).toBe(true);
        el.setAttribute('value', 'false');
        expect(el.test()).toBe(false);
        // With a setter-only property, the initial value cannot be known, so
        // attribute removal results in undefined.
        // Auto-accessor fields would allow knowing the initial value (TODO).
        el.removeAttribute('value');
        expect(String(el.test())).toBe('undefined');
        el.remove();
    });
    describe('invalid usages', () => {
        it('throws on symbol property names', () => {
            const createClass = () => {
                let Test = (() => {
                    var _a;
                    let _classDecorators = [element('symbol-attribute')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = Element;
                    let _member_decorators;
                    let _member_initializers = [];
                    let _member_extraInitializers = [];
                    var Test = class extends _classSuper {
                        static { _classThis = this; }
                        static {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            __esDecorate(null, null, _member_decorators, { kind: "field", name: _a, static: false, private: false, access: { has: obj => _a in obj, get: obj => obj[_a], set: (obj, value) => { obj[_a] = value; } }, metadata: _metadata }, _member_initializers, _member_extraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            Test = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        }
                        [(_member_decorators = [attribute], _a = __propKey(Symbol('foo')))] = __runInitializers(this, _member_initializers, '123');
                        constructor() {
                            super(...arguments);
                            __runInitializers(this, _member_extraInitializers);
                        }
                    };
                    return Test = _classThis;
                })();
                Test;
            };
            expect(createClass).toThrow('@attribute is not supported on symbol fields yet.');
        });
        it('throws on private fields', () => {
            const createClass = () => {
                let Test = (() => {
                    let _classDecorators = [element('private-attribute')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = Element;
                    let _private_foo_decorators;
                    let _private_foo_initializers = [];
                    let _private_foo_extraInitializers = [];
                    var Test = class extends _classSuper {
                        static { _classThis = this; }
                        static {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            _private_foo_decorators = [attribute];
                            __esDecorate(null, null, _private_foo_decorators, { kind: "field", name: "#foo", static: false, private: true, access: { has: obj => #foo in obj, get: obj => obj.#foo, set: (obj, value) => { obj.#foo = value; } }, metadata: _metadata }, _private_foo_initializers, _private_foo_extraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            Test = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        }
                        #foo = __runInitializers(this, _private_foo_initializers, '123');
                        constructor() {
                            super(...arguments);
                            __runInitializers(this, _private_foo_extraInitializers);
                        }
                    };
                    return Test = _classThis;
                })();
                Test;
            };
            expect(createClass).toThrow('@attribute is not supported on private fields yet.');
        });
        it('throws on static fields', () => {
            const createClass = () => {
                let Test = (() => {
                    let _classDecorators = [element('static-attribute')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = Element;
                    let _static_foo_decorators;
                    let _static_foo_initializers = [];
                    let _static_foo_extraInitializers = [];
                    var Test = class extends _classSuper {
                        static { _classThis = this; }
                        static {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            _static_foo_decorators = [attribute];
                            __esDecorate(null, null, _static_foo_decorators, { kind: "field", name: "foo", static: true, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, _static_foo_initializers, _static_foo_extraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            Test = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        }
                        static foo = __runInitializers(_classThis, _static_foo_initializers, '123');
                        static {
                            __runInitializers(_classThis, _static_foo_extraInitializers);
                            __runInitializers(_classThis, _classExtraInitializers);
                        }
                    };
                    return Test = _classThis;
                })();
                Test;
            };
            expect(createClass).toThrow('@attribute is not supported on static fields.');
        });
        it('throws on methods', () => {
            const createClass = () => {
                let Test = (() => {
                    let _classDecorators = [element('method-attribute')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = Element;
                    let _instanceExtraInitializers = [];
                    let _method_decorators;
                    var Test = class extends _classSuper {
                        static { _classThis = this; }
                        static {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            _method_decorators = [attribute];
                            __esDecorate(this, null, _method_decorators, { kind: "method", name: "method", static: false, private: false, access: { has: obj => "method" in obj, get: obj => obj.method }, metadata: _metadata }, null, _instanceExtraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            Test = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        }
                        // @ts-expect-error testing invalid usage
                        method() { }
                        constructor() {
                            super(...arguments);
                            __runInitializers(this, _instanceExtraInitializers);
                        }
                    };
                    return Test = _classThis;
                })();
                Test;
            };
            expect(createClass).toThrow('@attribute is only for use on fields, getters/setters, and auto accessors.');
        });
    });
    describe('subclass extension', () => {
        it('supports overridden fields', () => {
            let FooBar = (() => {
                let _classDecorators = [element('foo-bar2')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = HTMLElement;
                let _foo_decorators;
                let _foo_initializers = [];
                let _foo_extraInitializers = [];
                var FooBar = class extends _classSuper {
                    static { _classThis = this; }
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        _foo_decorators = [attribute];
                        __esDecorate(null, null, _foo_decorators, { kind: "field", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, _foo_initializers, _foo_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        FooBar = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    }
                    foo = __runInitializers(this, _foo_initializers, '0');
                    constructor() {
                        super(...arguments);
                        __runInitializers(this, _foo_extraInitializers);
                    }
                };
                return FooBar = _classThis;
            })();
            let OverrideFoo = (() => {
                let _classDecorators = [element('overridden-foo')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = FooBar;
                let _foo_decorators;
                let _foo_initializers = [];
                let _foo_extraInitializers = [];
                var OverrideFoo = class extends _classSuper {
                    static { _classThis = this; }
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        _foo_decorators = [attribute];
                        __esDecorate(null, null, _foo_decorators, { kind: "field", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, _foo_initializers, _foo_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        OverrideFoo = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    }
                    foo = __runInitializers(this, _foo_initializers, '1');
                    constructor() {
                        super(...arguments);
                        __runInitializers(this, _foo_extraInitializers);
                    }
                };
                return OverrideFoo = _classThis;
            })();
            const f = new OverrideFoo();
            testOverriden(f);
        });
        it('supports overridden auto accessor', () => {
            let FooBar = (() => {
                let _classDecorators = [element('foo-bar3')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = HTMLElement;
                let _foo_decorators;
                let _foo_initializers = [];
                let _foo_extraInitializers = [];
                var FooBar = class extends _classSuper {
                    static { _classThis = this; }
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        _foo_decorators = [attribute];
                        __esDecorate(this, null, _foo_decorators, { kind: "accessor", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, _foo_initializers, _foo_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        FooBar = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    }
                    #foo_accessor_storage = __runInitializers(this, _foo_initializers, '0');
                    get foo() { return this.#foo_accessor_storage; }
                    set foo(value) { this.#foo_accessor_storage = value; }
                    constructor() {
                        super(...arguments);
                        __runInitializers(this, _foo_extraInitializers);
                    }
                };
                return FooBar = _classThis;
            })();
            let OverrideFoo = (() => {
                let _classDecorators = [element('overridden-foo2')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = FooBar;
                let _foo_decorators;
                let _foo_initializers = [];
                let _foo_extraInitializers = [];
                var OverrideFoo = class extends _classSuper {
                    static { _classThis = this; }
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        _foo_decorators = [attribute];
                        __esDecorate(this, null, _foo_decorators, { kind: "accessor", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, _foo_initializers, _foo_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        OverrideFoo = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    }
                    #foo_accessor_storage = __runInitializers(this, _foo_initializers, '1');
                    get foo() { return this.#foo_accessor_storage; }
                    set foo(value) { this.#foo_accessor_storage = value; }
                    constructor() {
                        super(...arguments);
                        __runInitializers(this, _foo_extraInitializers);
                    }
                };
                return OverrideFoo = _classThis;
            })();
            const f = new OverrideFoo();
            testOverriden(f);
        });
        it('supports overridden getter/setter', () => {
            let FooBar = (() => {
                let _classDecorators = [element('foo-bar4')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = HTMLElement;
                let _instanceExtraInitializers = [];
                let _get_foo_decorators;
                let _set_foo_decorators;
                var FooBar = class extends _classSuper {
                    static { _classThis = this; }
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        _get_foo_decorators = [attribute];
                        _set_foo_decorators = [attribute];
                        __esDecorate(this, null, _get_foo_decorators, { kind: "getter", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo }, metadata: _metadata }, null, _instanceExtraInitializers);
                        __esDecorate(this, null, _set_foo_decorators, { kind: "setter", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        FooBar = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    }
                    _foo = (__runInitializers(this, _instanceExtraInitializers), '0');
                    get foo() {
                        return this._foo;
                    }
                    set foo(v) {
                        this._foo = v;
                    }
                };
                return FooBar = _classThis;
            })();
            let OverrideFoo = (() => {
                let _classDecorators = [element('overridden-foo3')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = FooBar;
                let _instanceExtraInitializers = [];
                let _get_foo_decorators;
                let _set_foo_decorators;
                var OverrideFoo = class extends _classSuper {
                    static { _classThis = this; }
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        _get_foo_decorators = [attribute];
                        _set_foo_decorators = [attribute];
                        __esDecorate(this, null, _get_foo_decorators, { kind: "getter", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo }, metadata: _metadata }, null, _instanceExtraInitializers);
                        __esDecorate(this, null, _set_foo_decorators, { kind: "setter", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        OverrideFoo = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    }
                    _foo2 = (__runInitializers(this, _instanceExtraInitializers), '1');
                    get foo() {
                        return this._foo2;
                    }
                    set foo(v) {
                        this._foo2 = v;
                    }
                };
                return OverrideFoo = _classThis;
            })();
            const f = new OverrideFoo();
            testOverriden(f);
        });
        function testOverriden(f) {
            let count = 0;
            let val = '';
            // Runs once initially, then re-runs any time f.foo has changed.
            createEffect(() => {
                val = f.foo;
                count++;
            });
            expect(val).toBe('1');
            expect(count).toBe(1);
            f.setAttribute('foo', '123');
            expect(count).toBe(2);
            expect(val).toBe('123');
            // Check that the default value for attribute removed is from the overriden initial value.
            f.removeAttribute('foo');
            expect(count).toBe(3);
            expect(val).toBe('1');
        }
    });
    describe('compatibility with classy-solid decoraters', () => {
        it('works with @attribute field and @memo getter', () => {
            let MemoAttribute = (() => {
                let _classDecorators = [element('memo-attribute')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = HTMLElement;
                let _instanceExtraInitializers = [];
                let _foo_decorators;
                let _foo_initializers = [];
                let _foo_extraInitializers = [];
                let _get_fooMemo_decorators;
                var MemoAttribute = class extends _classSuper {
                    static { _classThis = this; }
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        _foo_decorators = [attribute];
                        _get_fooMemo_decorators = [memo];
                        __esDecorate(this, null, _get_fooMemo_decorators, { kind: "getter", name: "fooMemo", static: false, private: false, access: { has: obj => "fooMemo" in obj, get: obj => obj.fooMemo }, metadata: _metadata }, null, _instanceExtraInitializers);
                        __esDecorate(null, null, _foo_decorators, { kind: "field", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, _foo_initializers, _foo_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        MemoAttribute = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    }
                    foo = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _foo_initializers, '0'));
                    get fooMemo() {
                        return this.foo + '_foo';
                    }
                    constructor() {
                        super(...arguments);
                        __runInitializers(this, _foo_extraInitializers);
                    }
                };
                return MemoAttribute = _classThis;
            })();
            const f = new MemoAttribute();
            let count = 0;
            let val = '';
            createEffect(() => {
                val = f.fooMemo;
                count++;
            });
            expect(count).toBe(1);
            expect(val).toBe('0_foo');
            f.setAttribute('foo', '123');
            expect(count).toBe(2);
            expect(val).toBe('123_foo');
            f.foo = '456';
            expect(count).toBe(3);
            expect(val).toBe('456_foo');
            f.removeAttribute('foo');
            expect(count).toBe(4);
            expect(val).toBe('0_foo');
        });
        it('works with @attribute auto accessor and @memo getter', () => {
            // FIXME This currently doesn't work. Needs a fix in classy-solid.
            // difficulties: https://github.com/tc39/proposal-decorators/issues/574
            // For now, use only attribute fields (not auto accessors or getter/setters).
            expect(test).toThrow('Cannot read private member');
            function test() {
                let MemoAttribute = (() => {
                    let _classDecorators = [element('memo-attribute2')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = HTMLElement;
                    let _instanceExtraInitializers = [];
                    let _foo_decorators;
                    let _foo_initializers = [];
                    let _foo_extraInitializers = [];
                    let _get_fooMemo_decorators;
                    var MemoAttribute = class extends _classSuper {
                        static { _classThis = this; }
                        static {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            _foo_decorators = [attribute];
                            _get_fooMemo_decorators = [memo];
                            __esDecorate(this, null, _foo_decorators, { kind: "accessor", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, _foo_initializers, _foo_extraInitializers);
                            __esDecorate(this, null, _get_fooMemo_decorators, { kind: "getter", name: "fooMemo", static: false, private: false, access: { has: obj => "fooMemo" in obj, get: obj => obj.fooMemo }, metadata: _metadata }, null, _instanceExtraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            MemoAttribute = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        }
                        #foo_accessor_storage = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _foo_initializers, '0'));
                        get foo() { return this.#foo_accessor_storage; }
                        set foo(value) { this.#foo_accessor_storage = value; }
                        get fooMemo() {
                            return this.foo + '_foo';
                        }
                        constructor() {
                            super(...arguments);
                            __runInitializers(this, _foo_extraInitializers);
                        }
                    };
                    return MemoAttribute = _classThis;
                })();
                const f = new MemoAttribute();
                let count = 0;
                let val = '';
                createEffect(() => {
                    val = f.fooMemo;
                    count++;
                });
                expect(count).toBe(1);
                expect(val).toBe('0_foo');
                f.setAttribute('foo', '123');
                expect(count).toBe(2);
                expect(val).toBe('123_foo');
                f.foo = '456';
                expect(count).toBe(3);
                expect(val).toBe('456_foo');
                f.removeAttribute('foo');
                expect(count).toBe(4);
                expect(val).toBe('0_foo');
            }
        });
        it('works with @attribute getter/setter and @memo getter', () => {
            // FIXME This currently doesn't work. Needs a fix in classy-solid.
            // difficulties: https://github.com/tc39/proposal-decorators/issues/574
            // For now, use only attribute fields (not auto accessors or getter/setters).
            expect(test).toThrow('Received: undefined_foo');
            function test() {
                let MemoAttribute = (() => {
                    let _classDecorators = [element('memo-attribute3')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = HTMLElement;
                    let _instanceExtraInitializers = [];
                    let _get_foo_decorators;
                    let _set_foo_decorators;
                    let _get_fooMemo_decorators;
                    var MemoAttribute = class extends _classSuper {
                        static { _classThis = this; }
                        static {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            _get_foo_decorators = [attribute];
                            _set_foo_decorators = [attribute];
                            _get_fooMemo_decorators = [memo];
                            __esDecorate(this, null, _get_foo_decorators, { kind: "getter", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo }, metadata: _metadata }, null, _instanceExtraInitializers);
                            __esDecorate(this, null, _set_foo_decorators, { kind: "setter", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
                            __esDecorate(this, null, _get_fooMemo_decorators, { kind: "getter", name: "fooMemo", static: false, private: false, access: { has: obj => "fooMemo" in obj, get: obj => obj.fooMemo }, metadata: _metadata }, null, _instanceExtraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            MemoAttribute = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        }
                        _foo = (__runInitializers(this, _instanceExtraInitializers), '0');
                        get foo() {
                            return this._foo;
                        }
                        set foo(v) {
                            this._foo = v;
                        }
                        get fooMemo() {
                            return this.foo + '_foo';
                        }
                    };
                    return MemoAttribute = _classThis;
                })();
                const f = new MemoAttribute();
                let count = 0;
                let val = '';
                createEffect(() => {
                    val = f.fooMemo;
                    count++;
                });
                expect(count).toBe(1);
                expect(val).toBe('0_foo');
                f.setAttribute('foo', '123');
                expect(count).toBe(2);
                expect(val).toBe('123_foo');
                f.foo = '456';
                expect(count).toBe(3);
                expect(val).toBe('456_foo');
                f.removeAttribute('foo');
                expect(count).toBe(4);
                expect(val).toBe('0_foo');
            }
        });
        it('works with @attribute field and @effect method', () => {
            let count = 0;
            let value = '';
            let EffectAttribute = (() => {
                let _classDecorators = [element('effect-attribute')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = HTMLElement;
                let _instanceExtraInitializers = [];
                let _foo_decorators;
                let _foo_initializers = [];
                let _foo_extraInitializers = [];
                let _testEffect_decorators;
                var EffectAttribute = class extends _classSuper {
                    static { _classThis = this; }
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        _foo_decorators = [attribute];
                        _testEffect_decorators = [effect];
                        __esDecorate(this, null, _testEffect_decorators, { kind: "method", name: "testEffect", static: false, private: false, access: { has: obj => "testEffect" in obj, get: obj => obj.testEffect }, metadata: _metadata }, null, _instanceExtraInitializers);
                        __esDecorate(null, null, _foo_decorators, { kind: "field", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, _foo_initializers, _foo_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        EffectAttribute = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    }
                    foo = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _foo_initializers, '0'));
                    testEffect() {
                        console.log('effect running');
                        count++;
                        value = this.foo;
                    }
                    constructor() {
                        super(...arguments);
                        __runInitializers(this, _foo_extraInitializers);
                    }
                };
                return EffectAttribute = _classThis;
            })();
            const f = new EffectAttribute();
            document.body.append(f);
            expect(count).toBe(1);
            expect(value).toBe('0');
            f.setAttribute('foo', '123');
            expect(count).toBe(2);
            expect(value).toBe('123');
            f.foo = '456';
            expect(count).toBe(3);
            expect(value).toBe('456');
            f.removeAttribute('foo');
            expect(count).toBe(4);
            expect(value).toBe('0');
            f.remove();
        });
        it('works with @attribute auto accessor and @effect method', () => {
            // FIXME This currently doesn't work. Needs a fix in classy-solid.
            // difficulties: https://github.com/tc39/proposal-decorators/issues/574
            // For now, use only attribute fields (not auto accessors or getter/setters).
            expect(test).toThrow('Cannot read private member');
            function test() {
                let count = 0;
                let value = '';
                let EffectAttribute = (() => {
                    let _classDecorators = [element('effect-attribute2')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = HTMLElement;
                    let _instanceExtraInitializers = [];
                    let _foo_decorators;
                    let _foo_initializers = [];
                    let _foo_extraInitializers = [];
                    let _testEffect_decorators;
                    var EffectAttribute = class extends _classSuper {
                        static { _classThis = this; }
                        static {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            _foo_decorators = [attribute];
                            _testEffect_decorators = [effect];
                            __esDecorate(this, null, _foo_decorators, { kind: "accessor", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, _foo_initializers, _foo_extraInitializers);
                            __esDecorate(this, null, _testEffect_decorators, { kind: "method", name: "testEffect", static: false, private: false, access: { has: obj => "testEffect" in obj, get: obj => obj.testEffect }, metadata: _metadata }, null, _instanceExtraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            EffectAttribute = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        }
                        #foo_accessor_storage = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _foo_initializers, '0'));
                        get foo() { return this.#foo_accessor_storage; }
                        set foo(value) { this.#foo_accessor_storage = value; }
                        testEffect() {
                            console.log('effect running');
                            count++;
                            value = this.foo;
                        }
                        constructor() {
                            super(...arguments);
                            __runInitializers(this, _foo_extraInitializers);
                        }
                    };
                    return EffectAttribute = _classThis;
                })();
                const f = new EffectAttribute();
                document.body.append(f);
                expect(count).toBe(1);
                expect(value).toBe('0');
                f.setAttribute('foo', '123');
                expect(count).toBe(2);
                expect(value).toBe('123');
                f.foo = '456';
                expect(count).toBe(3);
                expect(value).toBe('456');
                f.removeAttribute('foo');
                expect(count).toBe(4);
                expect(value).toBe('0');
                f.remove();
            }
        });
        it('works with @attribute getter/setter and @effect method', () => {
            // FIXME This currently doesn't work. Needs a fix in classy-solid.
            // difficulties: https://github.com/tc39/proposal-decorators/issues/574
            // For now, use only attribute fields (not auto accessors or getter/setters).
            expect(test).toThrow('Received: undefined_test');
            function test() {
                let count = 0;
                let value = '';
                let EffectAttribute = (() => {
                    let _classDecorators = [element('effect-attribute3')];
                    let _classDescriptor;
                    let _classExtraInitializers = [];
                    let _classThis;
                    let _classSuper = HTMLElement;
                    let _instanceExtraInitializers = [];
                    let _get_foo_decorators;
                    let _set_foo_decorators;
                    let _testEffect_decorators;
                    var EffectAttribute = class extends _classSuper {
                        static { _classThis = this; }
                        static {
                            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                            _get_foo_decorators = [attribute];
                            _set_foo_decorators = [attribute];
                            _testEffect_decorators = [effect];
                            __esDecorate(this, null, _get_foo_decorators, { kind: "getter", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo }, metadata: _metadata }, null, _instanceExtraInitializers);
                            __esDecorate(this, null, _set_foo_decorators, { kind: "setter", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
                            __esDecorate(this, null, _testEffect_decorators, { kind: "method", name: "testEffect", static: false, private: false, access: { has: obj => "testEffect" in obj, get: obj => obj.testEffect }, metadata: _metadata }, null, _instanceExtraInitializers);
                            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                            EffectAttribute = _classThis = _classDescriptor.value;
                            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                            __runInitializers(_classThis, _classExtraInitializers);
                        }
                        _foo = (__runInitializers(this, _instanceExtraInitializers), '0');
                        get foo() {
                            return this._foo;
                        }
                        set foo(v) {
                            this._foo = v;
                        }
                        testEffect() {
                            console.log('effect running');
                            count++;
                            value = this.foo;
                        }
                    };
                    return EffectAttribute = _classThis;
                })();
                const f = new EffectAttribute();
                document.body.append(f);
                expect(count).toBe(1);
                expect(value + '_test').toBe('0' + '_test');
                f.setAttribute('foo', '123');
                expect(count).toBe(2);
                expect(value).toBe('123');
                f.foo = '456';
                expect(count).toBe(3);
                expect(value).toBe('456');
                f.removeAttribute('foo');
                expect(count).toBe(4);
                expect(value).toBe('0');
                f.remove();
            }
        });
        it('subclass overrides attribute field with signal field', () => {
            let AttributeSignalBase = (() => {
                let _classDecorators = [element('attribute-signal-base')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = HTMLElement;
                let _foo_decorators;
                let _foo_initializers = [];
                let _foo_extraInitializers = [];
                var AttributeSignalBase = class extends _classSuper {
                    static { _classThis = this; }
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        _foo_decorators = [attribute];
                        __esDecorate(null, null, _foo_decorators, { kind: "field", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, _foo_initializers, _foo_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        AttributeSignalBase = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    }
                    foo = __runInitializers(this, _foo_initializers, 'base');
                    constructor() {
                        super(...arguments);
                        __runInitializers(this, _foo_extraInitializers);
                    }
                };
                return AttributeSignalBase = _classThis;
            })();
            let AttributeSignalSub = (() => {
                let _classDecorators = [element('attribute-signal-sub')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = AttributeSignalBase;
                let _foo_decorators;
                let _foo_initializers = [];
                let _foo_extraInitializers = [];
                var AttributeSignalSub = class extends _classSuper {
                    static { _classThis = this; }
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        _foo_decorators = [signal];
                        __esDecorate(null, null, _foo_decorators, { kind: "field", name: "foo", static: false, private: false, access: { has: obj => "foo" in obj, get: obj => obj.foo, set: (obj, value) => { obj.foo = value; } }, metadata: _metadata }, _foo_initializers, _foo_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        AttributeSignalSub = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    }
                    foo = __runInitializers(this, _foo_initializers, 'sub');
                    constructor() {
                        super(...arguments);
                        __runInitializers(this, _foo_extraInitializers);
                    }
                };
                return AttributeSignalSub = _classThis;
            })();
            const f = new AttributeSignalSub();
            let count = 0;
            let val = '';
            createEffect(() => {
                val = f.foo;
                count++;
            });
            expect(val).toBe('sub');
            expect(count).toBe(1);
            f.setAttribute('foo', 'changed');
            expect(count).toBe(2);
            expect(val).toBe('changed');
            f.removeAttribute('foo');
            expect(count).toBe(3);
            expect(val).toBe('base'); // goes back to base class default because the subclass field does not track a new default attribute value
        });
    });
});
describe('types of attributes', () => {
    it('@numberAttribute decorator for working with number values', () => {
        let Person = (() => {
            let _classDecorators = [element('x-person')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = HTMLElement;
            let _age_decorators;
            let _age_initializers = [];
            let _age_extraInitializers = [];
            let _weight_decorators;
            let _weight_initializers = [];
            let _weight_extraInitializers = [];
            let _height_decorators;
            let _height_initializers = [];
            let _height_extraInitializers = [];
            var Person = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    _age_decorators = [numberAttribute];
                    _weight_decorators = [numberAttribute];
                    _height_decorators = [numberAttribute];
                    __esDecorate(null, null, _age_decorators, { kind: "field", name: "age", static: false, private: false, access: { has: obj => "age" in obj, get: obj => obj.age, set: (obj, value) => { obj.age = value; } }, metadata: _metadata }, _age_initializers, _age_extraInitializers);
                    __esDecorate(null, null, _weight_decorators, { kind: "field", name: "weight", static: false, private: false, access: { has: obj => "weight" in obj, get: obj => obj.weight, set: (obj, value) => { obj.weight = value; } }, metadata: _metadata }, _weight_initializers, _weight_extraInitializers);
                    __esDecorate(null, null, _height_decorators, { kind: "field", name: "height", static: false, private: false, access: { has: obj => "height" in obj, get: obj => obj.height, set: (obj, value) => { obj.height = value; } }, metadata: _metadata }, _height_initializers, _height_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    Person = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
                // Currently the typed attributes need an arg for the default value.
                age = __runInitializers(this, _age_initializers, 0);
                weight = (__runInitializers(this, _age_extraInitializers), __runInitializers(this, _weight_initializers, 0));
                height = (__runInitializers(this, _weight_extraInitializers), __runInitializers(this, _height_initializers, 0));
                constructor() {
                    super(...arguments);
                    __runInitializers(this, _height_extraInitializers);
                }
            };
            return Person = _classThis;
        })();
        const p = new Person();
        let count = 0;
        createEffect(() => {
            p.age;
            p.weight;
            count++;
        });
        expect(count).toBe(1);
        p.setAttribute('age', '43');
        expect(count).toBe(2);
        expect(p.age).toBe(43);
        p.setAttribute('weight', '168');
        expect(count).toBe(3);
        expect(p.weight).toBe(168);
        p.setAttribute('height', '5.9');
        expect(count).toBe(3);
        expect(p.height).toBe(5.9);
        // Removing the attributes sets the prop values back to default.
        p.removeAttribute('age');
        p.removeAttribute('weight');
        p.removeAttribute('height');
        expect(count).toBe(5);
        expect(p.age).toBe(0);
        expect(p.weight).toBe(0);
        expect(p.height).toBe(0);
        // @ts-expect-error string type to test coercion
        p.age = '43';
        expect(count).toBe(6);
        expect(p.age).toBe(43);
        p.age = 44;
        expect(count).toBe(7);
        expect(p.age).toBe(44);
        // @ts-expect-error string type to test coercion
        p.weight = '168';
        expect(count).toBe(8);
        expect(p.weight).toBe(168);
        p.weight = 169;
        expect(count).toBe(9);
        expect(p.weight).toBe(169);
        // @ts-expect-error string type to test coercion
        p.height = '5.9';
        expect(count).toBe(9);
        expect(p.height).toBe(5.9);
        p.height = 6;
        expect(count).toBe(9);
        expect(p.height).toBe(6);
    });
    it('@booleanAttribute decorator for working with boolean values', () => {
        let PetLover = (() => {
            let _classDecorators = [element('pet-lover')];
            let _classDescriptor;
            let _classExtraInitializers = [];
            let _classThis;
            let _classSuper = HTMLElement;
            let _hasCat_decorators;
            let _hasCat_initializers = [];
            let _hasCat_extraInitializers = [];
            let _hasDog_decorators;
            let _hasDog_initializers = [];
            let _hasDog_extraInitializers = [];
            var PetLover = class extends _classSuper {
                static { _classThis = this; }
                static {
                    const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                    _hasCat_decorators = [booleanAttribute];
                    _hasDog_decorators = [booleanAttribute];
                    __esDecorate(null, null, _hasCat_decorators, { kind: "field", name: "hasCat", static: false, private: false, access: { has: obj => "hasCat" in obj, get: obj => obj.hasCat, set: (obj, value) => { obj.hasCat = value; } }, metadata: _metadata }, _hasCat_initializers, _hasCat_extraInitializers);
                    __esDecorate(null, null, _hasDog_decorators, { kind: "field", name: "hasDog", static: false, private: false, access: { has: obj => "hasDog" in obj, get: obj => obj.hasDog, set: (obj, value) => { obj.hasDog = value; } }, metadata: _metadata }, _hasDog_initializers, _hasDog_extraInitializers);
                    __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                    PetLover = _classThis = _classDescriptor.value;
                    if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                    __runInitializers(_classThis, _classExtraInitializers);
                }
                // Boolean attributes are
                // - true when they exist and have any value other than "false". f.e. foo="" and foo="null" result in a value of `true`.
                // - false when they exist and have the value "false". f.e. foo="false"
                // When the attributes do not exist (getAttribute returns
                // `null`) they have the value specified by the default arg
                // passed into the decorator. If the default value is set to
                // `true`, then removing the attribute results in a `true` value
                // (this is different than traditional boolean attribute where
                // the absence of an attribute means `false`). Set the default
                // value to `false` to have the result be `false` when the
                // attribute is not present or when it is explicitly set to
                // "false".
                hasCat = __runInitializers(this, _hasCat_initializers, false);
                hasDog = (__runInitializers(this, _hasCat_extraInitializers), __runInitializers(this, _hasDog_initializers, true));
                constructor() {
                    super(...arguments);
                    __runInitializers(this, _hasDog_extraInitializers);
                }
            };
            return PetLover = _classThis;
        })();
        const p = new PetLover();
        let count = 0;
        createEffect(() => {
            p.hasCat;
            p.hasDog;
            count++;
        });
        expect(count).toBe(1);
        // NOTE! The camelCase property names are mapped from dash-case attributes names.
        p.setAttribute('has-cat', '');
        expect(count).toBe(2);
        expect(p.hasCat).toBe(true);
        p.setAttribute('has-cat', 'foo');
        expect(count).toBe(3);
        expect(p.hasCat).toBe(true);
        p.setAttribute('has-dog', 'false');
        expect(count).toBe(4);
        expect(p.hasDog).toBe(false);
        p.setAttribute('has-dog', 'anything');
        expect(count).toBe(5);
        expect(p.hasDog).toBe(true);
        // Removing the attributes sets the prop values back to default.
        p.removeAttribute('has-cat');
        p.removeAttribute('has-dog');
        expect(p.getAttribute('has-cat')).toBe(null);
        expect(p.getAttribute('has-dog')).toBe(null);
        expect(count).toBe(7);
        expect(p.hasCat).toBe(false);
        expect(p.hasDog).toBe(true);
    });
    describe('@eventAttribute', () => {
        it('registers event listeners when assigned to event-named properties, using decorators', () => {
            let testEvent = null;
            const ontestevent = (e) => (testEvent = e);
            const ontestevent2 = (e) => (testEvent = e);
            let otherEvent = null;
            const onotherevent = (e) => (otherEvent = e);
            let anotherEvent = null;
            const onanother = (e) => (anotherEvent = e);
            let yetanotherEvent = null;
            const onyetanother = (e) => (yetanotherEvent = e);
            let onemoreEvent = null;
            const ononemore = (e) => (onemoreEvent = e);
            let lastoneEvent = null;
            const onlastone = (e) => (lastoneEvent = e);
            let LastOneForRealEvent = null;
            const onLastOneForReal = (e) => (LastOneForRealEvent = e);
            let lastOneForRealForRealEvent = null;
            const onLastOneForRealForReal = (e) => (lastOneForRealForRealEvent = e);
            // test builtin event props work the same
            let loadEvent = null;
            const onload = (e) => (loadEvent = e);
            let MyEl = (() => {
                let _classDecorators = [element('event-listeners')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = Element;
                let _instanceExtraInitializers = [];
                let _ontestevent_decorators;
                let _ontestevent_initializers = [];
                let _ontestevent_extraInitializers = [];
                let _onotherevent_decorators;
                let _onotherevent_initializers = [];
                let _onotherevent_extraInitializers = [];
                let _get_onanother_decorators;
                let _set_onanother_decorators;
                let _get_onyetanother_decorators;
                let _set_onyetanother_decorators;
                let _ononemore_decorators;
                let _ononemore_initializers = [];
                let _ononemore_extraInitializers = [];
                let _onlastone_decorators;
                let _onlastone_initializers = [];
                let _onlastone_extraInitializers = [];
                let _onLastOneForReal_decorators;
                let _onLastOneForReal_initializers = [];
                let _onLastOneForReal_extraInitializers = [];
                let _member_decorators;
                let _member_initializers = [];
                let _member_extraInitializers = [];
                var MyEl = class extends _classSuper {
                    static { _classThis = this; }
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        _ontestevent_decorators = [eventAttribute];
                        _onotherevent_decorators = [eventAttribute];
                        _get_onanother_decorators = [eventAttribute];
                        _set_onanother_decorators = [eventAttribute];
                        _get_onyetanother_decorators = [eventAttribute];
                        _set_onyetanother_decorators = [eventAttribute];
                        _ononemore_decorators = [eventAttribute];
                        _onlastone_decorators = [eventAttribute];
                        _onLastOneForReal_decorators = [eventAttribute];
                        _member_decorators = [eventAttribute];
                        __esDecorate(this, null, _ontestevent_decorators, { kind: "accessor", name: "ontestevent", static: false, private: false, access: { has: obj => "ontestevent" in obj, get: obj => obj.ontestevent, set: (obj, value) => { obj.ontestevent = value; } }, metadata: _metadata }, _ontestevent_initializers, _ontestevent_extraInitializers);
                        __esDecorate(this, null, _onotherevent_decorators, { kind: "accessor", name: "onotherevent", static: false, private: false, access: { has: obj => "onotherevent" in obj, get: obj => obj.onotherevent, set: (obj, value) => { obj.onotherevent = value; } }, metadata: _metadata }, _onotherevent_initializers, _onotherevent_extraInitializers);
                        __esDecorate(this, null, _get_onanother_decorators, { kind: "getter", name: "onanother", static: false, private: false, access: { has: obj => "onanother" in obj, get: obj => obj.onanother }, metadata: _metadata }, null, _instanceExtraInitializers);
                        __esDecorate(this, null, _set_onanother_decorators, { kind: "setter", name: "onanother", static: false, private: false, access: { has: obj => "onanother" in obj, set: (obj, value) => { obj.onanother = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
                        __esDecorate(this, null, _get_onyetanother_decorators, { kind: "getter", name: "onyetanother", static: false, private: false, access: { has: obj => "onyetanother" in obj, get: obj => obj.onyetanother }, metadata: _metadata }, null, _instanceExtraInitializers);
                        __esDecorate(this, null, _set_onyetanother_decorators, { kind: "setter", name: "onyetanother", static: false, private: false, access: { has: obj => "onyetanother" in obj, set: (obj, value) => { obj.onyetanother = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
                        __esDecorate(null, null, _ononemore_decorators, { kind: "field", name: "ononemore", static: false, private: false, access: { has: obj => "ononemore" in obj, get: obj => obj.ononemore, set: (obj, value) => { obj.ononemore = value; } }, metadata: _metadata }, _ononemore_initializers, _ononemore_extraInitializers);
                        __esDecorate(null, null, _onlastone_decorators, { kind: "field", name: "onlastone", static: false, private: false, access: { has: obj => "onlastone" in obj, get: obj => obj.onlastone, set: (obj, value) => { obj.onlastone = value; } }, metadata: _metadata }, _onlastone_initializers, _onlastone_extraInitializers);
                        __esDecorate(null, null, _onLastOneForReal_decorators, { kind: "field", name: "onLastOneForReal", static: false, private: false, access: { has: obj => "onLastOneForReal" in obj, get: obj => obj.onLastOneForReal, set: (obj, value) => { obj.onLastOneForReal = value; } }, metadata: _metadata }, _onLastOneForReal_initializers, _onLastOneForReal_extraInitializers);
                        __esDecorate(null, null, _member_decorators, { kind: "field", name: 'onlast-one-for-real-for-real', static: false, private: false, access: { has: obj => 'onlast-one-for-real-for-real' in obj, get: obj => obj['onlast-one-for-real-for-real'], set: (obj, value) => { obj['onlast-one-for-real-for-real'] = value; } }, metadata: _metadata }, _member_initializers, _member_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        MyEl = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    }
                    #ontestevent_accessor_storage = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _ontestevent_initializers, ontestevent));
                    get ontestevent() { return this.#ontestevent_accessor_storage; }
                    set ontestevent(value) { this.#ontestevent_accessor_storage = value; }
                    #onotherevent_accessor_storage = (__runInitializers(this, _ontestevent_extraInitializers), __runInitializers(this, _onotherevent_initializers, null));
                    get onotherevent() { return this.#onotherevent_accessor_storage; }
                    set onotherevent(value) { this.#onotherevent_accessor_storage = value; }
                    #onanother = (__runInitializers(this, _onotherevent_extraInitializers), onanother);
                    get onanother() {
                        return this.#onanother;
                    }
                    set onanother(v) {
                        this.#onanother = v;
                    }
                    #onyetanother = null;
                    get onyetanother() {
                        return this.#onyetanother;
                    }
                    set onyetanother(v) {
                        this.#onyetanother = v;
                    }
                    ononemore = __runInitializers(this, _ononemore_initializers, ononemore);
                    onlastone = (__runInitializers(this, _ononemore_extraInitializers), __runInitializers(this, _onlastone_initializers, null));
                    onLastOneForReal = (__runInitializers(this, _onlastone_extraInitializers), __runInitializers(this, _onLastOneForReal_initializers, null));
                    'onlast-one-for-real-for-real' = (__runInitializers(this, _onLastOneForReal_extraInitializers), __runInitializers(this, _member_initializers, null
                    // onload = null // this is a builtin event prop
                    ));
                    // onload = null // this is a builtin event prop
                    connectedCallback() {
                        super.connectedCallback();
                        this.dispatchEvent(new Event('testevent'));
                        this.dispatchEvent(new Event('otherevent'));
                        this.dispatchEvent(new Event('another'));
                        this.dispatchEvent(new Event('yetanother'));
                        this.dispatchEvent(new Event('onemore'));
                        this.dispatchEvent(new Event('lastone'));
                        this.dispatchEvent(new Event('LastOneForReal'));
                        this.dispatchEvent(new Event('last-one-for-real-for-real'));
                        this.dispatchEvent(new Event('load'));
                    }
                    constructor() {
                        super(...arguments);
                        __runInitializers(this, _member_extraInitializers);
                    }
                };
                return MyEl = _classThis;
            })();
            let MyElSub = (() => {
                let _classDecorators = [element('event-listeners-sub')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = MyEl;
                var MyElSub = class extends _classSuper {
                    static { _classThis = this; }
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        MyElSub = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    }
                    abc = 123;
                };
                return MyElSub = _classThis;
            })();
            let MyElSub2 = (() => {
                let _classDecorators = [element('event-listeners-sub2')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = MyEl;
                let _ontestevent_decorators;
                let _ontestevent_initializers = [];
                let _ontestevent_extraInitializers = [];
                var MyElSub2 = class extends _classSuper {
                    static { _classThis = this; }
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        _ontestevent_decorators = [eventAttribute];
                        __esDecorate(this, null, _ontestevent_decorators, { kind: "accessor", name: "ontestevent", static: false, private: false, access: { has: obj => "ontestevent" in obj, get: obj => obj.ontestevent, set: (obj, value) => { obj.ontestevent = value; } }, metadata: _metadata }, _ontestevent_initializers, _ontestevent_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        MyElSub2 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    }
                    #ontestevent_accessor_storage = __runInitializers(this, _ontestevent_initializers, ontestevent);
                    get ontestevent() { return this.#ontestevent_accessor_storage; }
                    set ontestevent(value) { this.#ontestevent_accessor_storage = value; }
                    constructor() {
                        super(...arguments);
                        __runInitializers(this, _ontestevent_extraInitializers);
                    }
                };
                return MyElSub2 = _classThis;
            })();
            let MyElSub3 = (() => {
                let _classDecorators = [element('event-listeners-sub3')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = MyEl;
                let _ontestevent_decorators;
                let _ontestevent_initializers = [];
                let _ontestevent_extraInitializers = [];
                var MyElSub3 = class extends _classSuper {
                    static { _classThis = this; }
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        _ontestevent_decorators = [eventAttribute];
                        __esDecorate(this, null, _ontestevent_decorators, { kind: "accessor", name: "ontestevent", static: false, private: false, access: { has: obj => "ontestevent" in obj, get: obj => obj.ontestevent, set: (obj, value) => { obj.ontestevent = value; } }, metadata: _metadata }, _ontestevent_initializers, _ontestevent_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        MyElSub3 = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    }
                    #ontestevent_accessor_storage = __runInitializers(this, _ontestevent_initializers, ontestevent2);
                    get ontestevent() { return this.#ontestevent_accessor_storage; }
                    set ontestevent(value) { this.#ontestevent_accessor_storage = value; }
                    constructor() {
                        super(...arguments);
                        __runInitializers(this, _ontestevent_extraInitializers);
                    }
                };
                return MyElSub3 = _classThis;
            })();
            const el = new MyEl();
            const el2 = new MyElSub();
            const el3 = new MyElSub2();
            const el4 = new MyElSub3();
            testEvents(el);
            testEvents(el2);
            testEvents(el3);
            testEvents(el4);
            function testEvents(el) {
                testEvent = null;
                otherEvent = null;
                anotherEvent = null;
                yetanotherEvent = null;
                onemoreEvent = null;
                lastoneEvent = null;
                LastOneForRealEvent = null;
                lastOneForRealForRealEvent = null;
                loadEvent = null;
                el.onotherevent = onotherevent;
                el.onyetanother = onyetanother;
                el.onlastone = onlastone;
                el.onLastOneForReal = onLastOneForReal;
                el['onlast-one-for-real-for-real'] = onLastOneForRealForReal;
                el.onload = onload;
                document.body.append(el);
                expect(testEvent).toBeInstanceOf(Event);
                expect(otherEvent).toBeInstanceOf(Event);
                expect(anotherEvent).toBeInstanceOf(Event);
                expect(yetanotherEvent).toBeInstanceOf(Event);
                expect(onemoreEvent).toBeInstanceOf(Event);
                expect(lastoneEvent).toBeInstanceOf(Event);
                expect(LastOneForRealEvent).toBeInstanceOf(Event);
                expect(lastOneForRealForRealEvent).toBeInstanceOf(Event);
                expect(loadEvent).toBeInstanceOf(Event);
                testEvent = null;
                otherEvent = null;
                anotherEvent = null;
                yetanotherEvent = null;
                onemoreEvent = null;
                lastoneEvent = null;
                LastOneForRealEvent = null;
                lastOneForRealForRealEvent = null;
                loadEvent = null;
                el.dispatchEvent(new Event('testevent'));
                el.dispatchEvent(new Event('otherevent'));
                el.dispatchEvent(new Event('another'));
                el.dispatchEvent(new Event('yetanother'));
                el.dispatchEvent(new Event('onemore'));
                el.dispatchEvent(new Event('lastone'));
                el.dispatchEvent(new Event('LastOneForReal'));
                el.dispatchEvent(new Event('last-one-for-real-for-real'));
                el.dispatchEvent(new Event('load'));
                expect(testEvent).toBeInstanceOf(Event);
                expect(otherEvent).toBeInstanceOf(Event);
                expect(anotherEvent).toBeInstanceOf(Event);
                expect(yetanotherEvent).toBeInstanceOf(Event);
                expect(onemoreEvent).toBeInstanceOf(Event);
                expect(lastoneEvent).toBeInstanceOf(Event);
                expect(LastOneForRealEvent).toBeInstanceOf(Event);
                expect(lastOneForRealForRealEvent).toBeInstanceOf(Event);
                expect(loadEvent).toBeInstanceOf(Event);
                testEvent = null;
                otherEvent = null;
                anotherEvent = null;
                yetanotherEvent = null;
                onemoreEvent = null;
                lastoneEvent = null;
                LastOneForRealEvent = null;
                lastOneForRealForRealEvent = null;
                loadEvent = null;
                let testEvent2 = null;
                const ontestevent2 = (e) => (testEvent2 = e);
                el.ontestevent = ontestevent2;
                let otherEvent2 = null;
                const onotherevent2 = (e) => (otherEvent2 = e);
                el.onotherevent = onotherevent2;
                let anotherEvent2 = null;
                const onanother2 = (e) => (anotherEvent2 = e);
                el.onanother = onanother2;
                let yetanotherEvent2 = null;
                const onyetanother2 = (e) => (yetanotherEvent2 = e);
                el.onyetanother = onyetanother2;
                let onemoreEvent2 = null;
                const ononemore2 = (e) => (onemoreEvent2 = e);
                el.ononemore = ononemore2;
                let lastoneEvent2 = null;
                const onlastone2 = (e) => (lastoneEvent2 = e);
                el.onlastone = onlastone2;
                let LastOneForRealEvent2 = null;
                const onLastOneForReal2 = (e) => (LastOneForRealEvent2 = e);
                el.onLastOneForReal = onLastOneForReal2;
                let lastOneForRealForRealEvent2 = null;
                const onLastOneForRealForReal2 = (e) => (lastOneForRealForRealEvent2 = e);
                el['onlast-one-for-real-for-real'] = onLastOneForRealForReal2;
                let loadEvent2 = null;
                const onload2 = (e) => (loadEvent2 = e);
                el.onload = onload2;
                el.dispatchEvent(new Event('testevent'));
                el.dispatchEvent(new Event('otherevent'));
                el.dispatchEvent(new Event('another'));
                el.dispatchEvent(new Event('yetanother'));
                el.dispatchEvent(new Event('onemore'));
                el.dispatchEvent(new Event('lastone'));
                el.dispatchEvent(new Event('LastOneForReal'));
                el.dispatchEvent(new Event('last-one-for-real-for-real'));
                el.dispatchEvent(new Event('load'));
                expect(String(testEvent)).toBe('null');
                expect(String(otherEvent)).toBe('null');
                expect(String(anotherEvent)).toBe('null');
                expect(String(yetanotherEvent)).toBe('null');
                expect(String(onemoreEvent)).toBe('null');
                expect(String(lastoneEvent)).toBe('null');
                expect(String(LastOneForRealEvent)).toBe('null');
                expect(String(lastOneForRealForRealEvent)).toBe('null');
                expect(String(loadEvent)).toBe('null');
                expect(testEvent2).toBeInstanceOf(Event);
                expect(otherEvent2).toBeInstanceOf(Event);
                expect(anotherEvent2).toBeInstanceOf(Event);
                expect(yetanotherEvent2).toBeInstanceOf(Event);
                expect(onemoreEvent2).toBeInstanceOf(Event);
                expect(lastoneEvent2).toBeInstanceOf(Event);
                expect(LastOneForRealEvent2).toBeInstanceOf(Event);
                expect(lastOneForRealForRealEvent2).toBeInstanceOf(Event);
                expect(loadEvent2).toBeInstanceOf(Event);
            }
        });
        it('registers event listeners when assigned to event-named properties, not using decorators', () => {
            // test builtin event props work the same
            let loadEvent = null;
            const onload = (e) => (loadEvent = e);
            let seriouslyTheLastOneEvent = null;
            const onSeriouslyTheLastOne = (e) => (seriouslyTheLastOneEvent = e);
            let okThisIsTheFinalOneEvent = null;
            const onokThisIsTheFinalOne = (e) => (okThisIsTheFinalOneEvent = e);
            const MyEl = element('event-listeners2')(class extends Element {
                static observedAttributeHandlers = {
                    'onseriously-the-last-one': attribute.event,
                    onokThisIsTheFinalOne: attribute.event,
                };
                'onseriously-the-last-one' = null;
                onokThisIsTheFinalOne = null;
                // onload = null // this is a builtin event prop
                connectedCallback() {
                    super.connectedCallback();
                    this.dispatchEvent(new Event('load'));
                    this.dispatchEvent(new Event('seriously-the-last-one'));
                    this.dispatchEvent(new Event('okThisIsTheFinalOne'));
                }
            });
            const el = new MyEl();
            el.onload = onload;
            el['onseriously-the-last-one'] = onSeriouslyTheLastOne;
            el.onokThisIsTheFinalOne = onokThisIsTheFinalOne;
            document.body.append(el);
            expect(loadEvent).toBeInstanceOf(Event);
            expect(seriouslyTheLastOneEvent).toBeInstanceOf(Event);
            expect(okThisIsTheFinalOneEvent).toBeInstanceOf(Event);
            loadEvent = null;
            seriouslyTheLastOneEvent = null;
            okThisIsTheFinalOneEvent = null;
            el.dispatchEvent(new Event('load'));
            el.dispatchEvent(new Event('seriously-the-last-one'));
            el.dispatchEvent(new Event('okThisIsTheFinalOne'));
            expect(loadEvent).toBeInstanceOf(Event);
            expect(seriouslyTheLastOneEvent).toBeInstanceOf(Event);
            expect(okThisIsTheFinalOneEvent).toBeInstanceOf(Event);
            loadEvent = null;
            seriouslyTheLastOneEvent = null;
            okThisIsTheFinalOneEvent = null;
            let loadEvent2 = null;
            const onload2 = (e) => (loadEvent2 = e);
            el.onload = onload2;
            let seriouslyTheLastOneEvent2 = null;
            const onSeriouslyTheLastOne2 = (e) => (seriouslyTheLastOneEvent2 = e);
            el['onseriously-the-last-one'] = onSeriouslyTheLastOne2;
            let okThisIsTheFinalOneEvent2 = null;
            const onokThisIsTheFinalOne2 = (e) => (okThisIsTheFinalOneEvent2 = e);
            el.onokThisIsTheFinalOne = onokThisIsTheFinalOne2;
            el.dispatchEvent(new Event('load'));
            el.dispatchEvent(new Event('seriously-the-last-one'));
            el.dispatchEvent(new Event('okThisIsTheFinalOne'));
            expect(String(loadEvent)).toBe('null');
            expect(String(seriouslyTheLastOneEvent)).toBe('null');
            expect(String(okThisIsTheFinalOneEvent)).toBe('null');
            expect(loadEvent2).toBeInstanceOf(Event);
            expect(seriouslyTheLastOneEvent2).toBeInstanceOf(Event);
            expect(okThisIsTheFinalOneEvent2).toBeInstanceOf(Event);
        });
        it('registers event listeners when assigned via DOM attributes, using decorators', () => {
            const win = window;
            win.loadEvent = null; // test builtin event props work the same
            win.seriouslyTheLastOneEvent = null;
            win.okThisIsTheFinalOneEvent = null;
            let MyEl = (() => {
                let _classDecorators = [element('event-listeners3')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = Element;
                let _member_decorators;
                let _member_initializers = [];
                let _member_extraInitializers = [];
                let _onokThisIsTheFinalOne_decorators;
                let _onokThisIsTheFinalOne_initializers = [];
                let _onokThisIsTheFinalOne_extraInitializers = [];
                var MyEl = class extends _classSuper {
                    static { _classThis = this; }
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        _member_decorators = [eventAttribute];
                        _onokThisIsTheFinalOne_decorators = [eventAttribute];
                        __esDecorate(null, null, _member_decorators, { kind: "field", name: 'onseriously-the-last-one', static: false, private: false, access: { has: obj => 'onseriously-the-last-one' in obj, get: obj => obj['onseriously-the-last-one'], set: (obj, value) => { obj['onseriously-the-last-one'] = value; } }, metadata: _metadata }, _member_initializers, _member_extraInitializers);
                        __esDecorate(null, null, _onokThisIsTheFinalOne_decorators, { kind: "field", name: "onokThisIsTheFinalOne", static: false, private: false, access: { has: obj => "onokThisIsTheFinalOne" in obj, get: obj => obj.onokThisIsTheFinalOne, set: (obj, value) => { obj.onokThisIsTheFinalOne = value; } }, metadata: _metadata }, _onokThisIsTheFinalOne_initializers, _onokThisIsTheFinalOne_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        MyEl = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    }
                    'onseriously-the-last-one' = __runInitializers(this, _member_initializers, null);
                    onokThisIsTheFinalOne = (__runInitializers(this, _member_extraInitializers), __runInitializers(this, _onokThisIsTheFinalOne_initializers, null
                    // onload = null // this is a builtin event prop
                    ));
                    // onload = null // this is a builtin event prop
                    connectedCallback() {
                        super.connectedCallback();
                        this.dispatchEvent(new Event('load'));
                        this.dispatchEvent(new Event('seriously-the-last-one'));
                        this.dispatchEvent(new Event('okThisIsTheFinalOne'));
                    }
                    constructor() {
                        super(...arguments);
                        __runInitializers(this, _onokThisIsTheFinalOne_extraInitializers);
                    }
                };
                return MyEl = _classThis;
            })();
            const el = new MyEl();
            el.setAttribute('onload', 'window.loadEvent = event');
            el.setAttribute('onseriously-the-last-one', 'window.seriouslyTheLastOneEvent = event');
            el.setAttribute('onokThisIsTheFinalOne', 'window.okThisIsTheFinalOneEvent = event');
            document.body.append(el);
            expect(win.loadEvent).toBeInstanceOf(Event);
            expect(win.seriouslyTheLastOneEvent).toBeInstanceOf(Event);
            expect(win.okThisIsTheFinalOneEvent).toBeInstanceOf(Event);
            win.loadEvent = null;
            win.seriouslyTheLastOneEvent = null;
            win.okThisIsTheFinalOneEvent = null;
            el.dispatchEvent(new Event('load'));
            el.dispatchEvent(new Event('seriously-the-last-one'));
            el.dispatchEvent(new Event('okThisIsTheFinalOne'));
            expect(win.loadEvent).toBeInstanceOf(Event);
            expect(win.seriouslyTheLastOneEvent).toBeInstanceOf(Event);
            expect(win.okThisIsTheFinalOneEvent).toBeInstanceOf(Event);
            win.loadEvent = null;
            win.seriouslyTheLastOneEvent = null;
            win.okThisIsTheFinalOneEvent = null;
            win.loadEvent2 = null;
            el.setAttribute('onload', 'window.loadEvent2 = event');
            win.seriouslyTheLastOneEvent2 = null;
            el.setAttribute('onseriously-the-last-one', 'window.seriouslyTheLastOneEvent2 = event');
            win.okThisIsTheFinalOneEvent2 = null;
            el.setAttribute('onokThisIsTheFinalOne', 'window.okThisIsTheFinalOneEvent2 = event');
            el.dispatchEvent(new Event('load'));
            el.dispatchEvent(new Event('seriously-the-last-one'));
            el.dispatchEvent(new Event('okThisIsTheFinalOne'));
            expect(String(win.loadEvent)).toBe('null');
            expect(String(win.seriouslyTheLastOneEvent)).toBe('null');
            expect(String(win.okThisIsTheFinalOneEvent)).toBe('null');
            expect(win.loadEvent2).toBeInstanceOf(Event);
            expect(win.seriouslyTheLastOneEvent2).toBeInstanceOf(Event);
            expect(win.okThisIsTheFinalOneEvent2).toBeInstanceOf(Event);
        });
        it('registers event listeners when assigned via DOM attributes, not using decorators', () => {
            const win = window;
            win.loadEvent = null; // test builtin event props work the same
            win.seriouslyTheLastOneEvent = null;
            win.okThisIsTheFinalOneEvent = null;
            const MyEl = element('event-listeners4')(class extends Element {
                static observedAttributeHandlers = {
                    'onseriously-the-last-one': attribute.event,
                    onokThisIsTheFinalOne: attribute.event,
                };
                'onseriously-the-last-one' = null;
                onokThisIsTheFinalOne = null;
                // onload = null // this is a builtin event prop
                connectedCallback() {
                    super.connectedCallback();
                    this.dispatchEvent(new Event('load'));
                    this.dispatchEvent(new Event('seriously-the-last-one'));
                    this.dispatchEvent(new Event('okThisIsTheFinalOne'));
                }
            });
            const el = new MyEl();
            el.setAttribute('onload', 'window.loadEvent = event');
            el.setAttribute('onseriously-the-last-one', 'window.seriouslyTheLastOneEvent = event');
            el.setAttribute('onokThisIsTheFinalOne', 'window.okThisIsTheFinalOneEvent = event');
            document.body.append(el);
            expect(win.loadEvent).toBeInstanceOf(Event);
            expect(win.seriouslyTheLastOneEvent).toBeInstanceOf(Event);
            expect(win.okThisIsTheFinalOneEvent).toBeInstanceOf(Event);
            win.loadEvent = null;
            win.seriouslyTheLastOneEvent = null;
            win.okThisIsTheFinalOneEvent = null;
            el.dispatchEvent(new Event('load'));
            el.dispatchEvent(new Event('seriously-the-last-one'));
            el.dispatchEvent(new Event('okThisIsTheFinalOne'));
            expect(win.loadEvent).toBeInstanceOf(Event);
            expect(win.seriouslyTheLastOneEvent).toBeInstanceOf(Event);
            expect(win.okThisIsTheFinalOneEvent).toBeInstanceOf(Event);
            win.loadEvent = null;
            win.seriouslyTheLastOneEvent = null;
            win.okThisIsTheFinalOneEvent = null;
            win.loadEvent2 = null;
            el.setAttribute('onload', 'window.loadEvent2 = event');
            win.seriouslyTheLastOneEvent2 = null;
            el.setAttribute('onseriously-the-last-one', 'window.seriouslyTheLastOneEvent2 = event');
            win.okThisIsTheFinalOneEvent2 = null;
            el.setAttribute('onokThisIsTheFinalOne', 'window.okThisIsTheFinalOneEvent2 = event');
            el.dispatchEvent(new Event('load'));
            el.dispatchEvent(new Event('seriously-the-last-one'));
            el.dispatchEvent(new Event('okThisIsTheFinalOne'));
            expect(String(win.loadEvent)).toBe('null');
            expect(String(win.seriouslyTheLastOneEvent)).toBe('null');
            expect(String(win.okThisIsTheFinalOneEvent)).toBe('null');
            expect(win.loadEvent2).toBeInstanceOf(Event);
            expect(win.seriouslyTheLastOneEvent2).toBeInstanceOf(Event);
            expect(win.okThisIsTheFinalOneEvent2).toBeInstanceOf(Event);
        });
    });
    describe('@jsonAttribute', () => {
        it('handles JSON attribute values', () => {
            let JsonAttributeTest = (() => {
                let _classDecorators = [element('json-attribute-test')];
                let _classDescriptor;
                let _classExtraInitializers = [];
                let _classThis;
                let _classSuper = HTMLElement;
                let _data_decorators;
                let _data_initializers = [];
                let _data_extraInitializers = [];
                var JsonAttributeTest = class extends _classSuper {
                    static { _classThis = this; }
                    static {
                        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                        _data_decorators = [jsonAttribute];
                        __esDecorate(null, null, _data_decorators, { kind: "field", name: "data", static: false, private: false, access: { has: obj => "data" in obj, get: obj => obj.data, set: (obj, value) => { obj.data = value; } }, metadata: _metadata }, _data_initializers, _data_extraInitializers);
                        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
                        JsonAttributeTest = _classThis = _classDescriptor.value;
                        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
                        __runInitializers(_classThis, _classExtraInitializers);
                    }
                    data = __runInitializers(this, _data_initializers, { a: 1, b: 2 });
                    constructor() {
                        super(...arguments);
                        __runInitializers(this, _data_extraInitializers);
                    }
                };
                return JsonAttributeTest = _classThis;
            })();
            const el = new JsonAttributeTest();
            expect(el.data).toEqual({ a: 1, b: 2 });
            el.setAttribute('data', '{"a":10,"b":20,"c":30}');
            expect(el.data).toEqual({ a: 10, b: 20, c: 30 });
            // TODO prop-to-attribute reflection
            // el.data = {x: 'hello', y: 'world'}
            // expect(el.getAttribute('data')).toBe('{"x":"hello","y":"world"}')
            function testInvalidJson() {
                let error;
                window.addEventListener('error', e => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    error = e.error;
                }, { once: true, capture: true });
                try {
                    el.setAttribute('data', 'invalid json'); // this line still makes WTR report an uncaught error.
                }
                finally {
                }
                expect(error).toBeInstanceOf(SyntaxError); // this works
            }
            // TODO invalid json causes uncaught error in WTR as expected, but we can't catch it in the test right now.
            testInvalidJson; //()
        });
    });
});
function testAttribute(el, prop, attrValue, handledValue, defaultValue) {
    el.setAttribute(prop, attrValue);
    // @ts-expect-error no indexed signature
    expect(el[prop]).toBe(handledValue);
    el.removeAttribute(prop);
    // @ts-expect-error no indexed signature
    expect(el[prop]).toBe(defaultValue);
}
function testProp(el, prop, attrValue, jsValue, handledValue, defaultValue, valueType) {
    // @ts-expect-error no indexed signature
    el[prop] = jsValue;
    // @ts-expect-error no indexed signature
    expect(el[prop]).toBe(handledValue);
    // @ts-expect-error no indexed signature
    expect(typeof el[prop]).toBe(valueType);
    // @ts-expect-error no indexed signature
    el[prop] = attrValue; // same as setting the attribute (string)
    // @ts-expect-error no indexed signature
    expect(el[prop]).toBe(handledValue);
    // @ts-expect-error no indexed signature
    expect(typeof el[prop]).toBe(valueType);
    // @ts-expect-error no indexed signature
    el[prop] = null; // same as removing the attribute
    // @ts-expect-error no indexed signature
    expect(el[prop]).toBe(defaultValue);
}
//# sourceMappingURL=attribute.test.js.map