import type { AttributeHandler, AttributePropSpecs, __attributesToProps, __hasAttributeChangedCallback } from './decorators/attribute.js';
import type { DashCasedProps } from './utils.js';
declare const root: unique symbol;
declare const LumeElement_base: (new (...a: any[]) => {
    "__#1@#effects": Set<import("classy-solid").Effect>;
    createEffect(fn: () => void): void;
    stopEffects(): void;
    "__#1@#createEffect1"(fn: () => void): void;
    "__#1@#stopEffects1"(): void;
    "__#1@#owner": import("solid-js").Owner | null;
    "__#1@#dispose": (() => void) | null;
    "__#1@#createEffect2"(fn: () => void): void;
    "__#1@#stopEffects2"(): void;
}) & {
    new (): HTMLElement;
    prototype: HTMLElement;
};
declare class LumeElement extends LumeElement_base {
    #private;
    /**
     * The default tag name of the elements this class instantiates. When using
     * the `@element` decorator, if this field has not been specified, it will
     * be set to the value defined by the decorator.
     */
    static elementName: string;
    /**
     * When using the @element decorator, the element will be automatically
     * defined in the CustomElementRegistry if this is true, otherwise manual
     * registration will be needed if false. If autoDefine is passed into the
     * decorator, this field will be overriden by that value.
     */
    static autoDefine: boolean;
    /**
     * Define this class for the given element `name`, or using its default name
     * (`elementName`) if no `name` given. Defaults to using the global
     * `customElements` registry unless another registry is provided (for
     * example a ShadowRoot-scoped registry).
     *
     * If a `name` is given, then the class will be extended with an empty
     * subclass so that a new class is used for each new name, because otherwise
     * a CustomElementRegistry does not allow the same exact class to be used
     * more than once regardless of the name.
     *
     * @returns Returns the defined element class, which is only going to be a
     * different subclass of the class this is called on if passing in a custom
     * `name`, otherwise returns the same class this is called on.
     */
    static defineElement(): typeof LumeElement;
    static defineElement(registry: CustomElementRegistry): typeof LumeElement;
    static defineElement(name: string): typeof LumeElement;
    static defineElement(name: string, registry: CustomElementRegistry): typeof LumeElement;
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
    static observedAttributes?: string[];
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
    static observedAttributeHandlers?: AttributeHandlerMap;
    /** Note, this is internal and used by the @attribute decorator, see attribute.ts. */
    [__attributesToProps]?: AttributePropSpecs;
    /** Note, this is internal and used by the @attribute decorator, see attribute.ts. */
    [__hasAttributeChangedCallback]?: true;
    /**
     * This can be used by a subclass, or other frameworks handling elements, to
     * detect property values that exist from before custom element upgrade.
     *
     * When this base class runs (before any subclass constructor does), it will
     * track any discovered pre-upgrade property values here, then subclasses
     * can subequently handle (if needed, as this base class will automatically
     * convert pre-upgrade properties into reactive/signal descriptors if they
     * were defined to be reactive with `classy-solid`'s `@signal` decorator,
     * LumeElement's `@attribute` decorator (and derivatives), or `static
     * observedAttributes`.
     */
    protected _preUpgradeValues: Map<PropertyKey, unknown>;
    /**
     * If a subclass provides this, it should return DOM. It is called with
     * Solid.js `render()`, so it can also contain Solid.js reactivity (signals
     * and effects) and templating (DOM-returning reactive JSX or html template
     * literals).
     */
    protected template?: Template;
    /**
     * If provided, this style gets created once per ShadowRoot of each element
     * instantiated from this class. The expression can access `this` for string
     * interpolation.
     */
    protected css?: string | (() => string);
    /**
     * If provided, this style gets created a single time for all elements
     * instantiated from this class, instead of once per element. If you do not
     * need to interpolate values into the string using `this`, then use this
     * static property for more performance compared to the instance property.
     */
    protected static css?: string | (() => string);
    /**
     * When `true`, the custom element will have a `ShadowRoot`. Set to `false`
     * to not use a `ShadowRoot`. When `false`, styles will not be scoped via
     * the built-in `ShadowRoot` scoping mechanism, but by a much more simple
     * shared style sheet placed at the nearest root node, with `:host`
     * selectors converted to tag names.
     */
    readonly hasShadow: boolean;
    /** Options used for the ShadowRoot, passed to `attachShadow()`. */
    shadowOptions?: ShadowRootInit;
    [root]: Node | null;
    /**
     * Subclasses can override this to provide an alternate Node to render into
     * (f.e. a subclass can `return this` to render into itself instead of
     * making a root) regardless of the value of `hasShadow`.
     */
    protected get templateRoot(): Node;
    protected set templateRoot(v: Node);
    /** @deprecated `root` is renamed to `templateRoot`, and `root` will be removed in a future breaking version. */
    get root(): Node;
    set root(val: Node);
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
    protected get styleRoot(): Node;
    attachShadow(options: ShadowRootInit): ShadowRoot;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback?(name: string, oldVal: string | null, newVal: string | null): void;
    adoptedCallback(): void;
}
export { LumeElement as Element };
export type AttributeHandlerMap = Record<string, AttributeHandler>;
import type { JSX } from './jsx-runtime.js';
type JSXOrDOM = JSX.Element | globalThis.Element;
type TemplateContent = JSXOrDOM | JSXOrDOM[];
type Template = TemplateContent | (() => TemplateContent);
/**
 * A helper for defining the JSX types of an element's attributes.
 *
 * You give it your element class and a list of properties (a string
 * union type), and it outputs a type with those properties being
 * optional and dash-cased. The output object also contains all the
 * built-in HTML attributes. You can then augment the
 * JSX.IntrinsicElements definition with the attributes for your element.
 *
 * For example, you would do the following so that your element's attribute
 * are available and type checked in the JSX of any consumers:
 *
 * ```js
 * import {Element, attribute, numberAttribute, element, ElementAttributes} from '@lume/element'
 *
 * ⁣@element('cool-element')
 * class CoolElement extends Element {
 *   ⁣@attribute foo: string | null = null
 *   ⁣@attribute bar: string | null = 'bar'
 *   ⁣@numberAttribute(123) loremIpsum = 123
 * }
 *
 * declare module 'solid-js' {
 *   namespace JSX {
 *     interface IntrinsicElements {
 *       'cool-element': ElementAttributes<CoolElement, 'foo' | 'bar'>
 *     }
 *   }
 * }
 * ```
 *
 * The result is that TypeScript will properly type-check the following JSX
 * expression (notice loremIpsum is camelCase in the class, but dash-cased
 * lorem-ipsum is used in the JSX):
 *
 * ```jsx
 * let coolEl = <cool-element foo={'foo'} bar={null} lorem-ipsum={456}></cool-element>
 * ```
 *
 * If your element has no attributes, you can use `ElementAttributes<YourElement>`
 * without specifying any properties.
 */
export type ElementAttributes<El, SelectedProperties extends keyof RemoveSetterPrefixes<RemoveAccessors<El>> | keyof {} = keyof {}, AdditionalProperties extends object = {}> = Omit<JSX.HTMLAttributes<El>, SelectedProperties | keyof AdditionalProperties | 'onerror'> & {
    onerror?: ((error: ErrorEvent) => void) | null;
} & Partial<DashCasedProps<WithStringValues<NonNumberProps<NonBooleanProps<NonOnProps<El, SelectedProperties>>>>>> & Partial<PrefixProps<'prop:', WithStringValues<NonNumberProps<NonBooleanProps<Pick<RemapSetters<El>, SelectedProperties>>>>>> & Partial<PrefixProps<'attr:', DashCasedProps<AsStringValues<NonNumberProps<NonBooleanProps<Pick<RemapSetters<El>, SelectedProperties>>>>>>> & Partial<DashCasedProps<WithBooleanStringValues<BooleanProps<NonOnProps<El, SelectedProperties>>>> & PrefixProps<'bool:', DashCasedProps<AsBooleanValues<BooleanProps<Pick<RemapSetters<El>, SelectedProperties>>>>> & PrefixProps<'prop:', WithBooleanStringValues<BooleanProps<Pick<RemapSetters<El>, SelectedProperties>>>> & PrefixProps<'attr:', DashCasedProps<WithBooleanStringValues<BooleanProps<Pick<RemapSetters<El>, SelectedProperties>>>>>> & Partial<DashCasedProps<WithNumberStringValues<NumberProps<NonOnProps<El, SelectedProperties>>>> & PrefixProps<'prop:', WithNumberStringValues<NumberProps<Pick<RemapSetters<El>, SelectedProperties>>>> & PrefixProps<'attr:', DashCasedProps<WithNumberStringValues<NumberProps<Pick<RemapSetters<El>, SelectedProperties>>>>>> & Partial<WithStringValues<SkipUppercase<EventListenersOnly<EventProps<El, SelectedProperties>>>>> & Partial<AddDelimitersToEventKeys<EventListenersOnly<EventProps<El, SelectedProperties>>>> & AdditionalProperties;
export type RemapSetters<El> = RemoveSetterPrefixes<RemoveAccessors<El>>;
export type NonOnProps<El, K extends keyof RemapSetters<El>> = Pick<RemapSetters<El>, OmitFromUnion<K, EventKeys<K>>>;
export type NonEventProps<El, K extends keyof RemoveSetterPrefixes<RemoveAccessors<El>>> = NonOnProps<El, K> & NonFunctionsOnly<EventProps<El, K>>;
export type EventProps<T, Keys extends keyof T> = Pick<T, EventKeys<OmitFromUnion<Keys, symbol | number>>>;
export type NonBooleanProps<T> = Omit<T, keyof BooleanProps<T>>;
export type BooleanProps<T> = {
    [K in keyof T as T[K] extends boolean | 'true' | 'false' ? K : never]: T[K];
};
export type NonNumberProps<T> = Omit<T, keyof NumberProps<T>>;
export type NumberProps<T> = {
    [K in keyof T as T[K] extends number ? K : never]: T[K];
};
export type FunctionsOnly<T> = {
    [K in keyof T as NonNullable<T[K]> extends (...args: any[]) => any ? K : never]: T[K];
};
export type EventListenersOnly<T> = {
    [K in keyof T as EventListener extends NonNullable<T[K]> ? K : never]: T[K];
};
export type NonFunctionsOnly<T> = {
    [K in keyof T as ((...args: any[]) => any) extends NonNullable<T[K]> ? never : K]: T[K];
};
/**
 * Make all non-string properties union with |string because they can all
 * receive string values from string attributes like opacity="0.5" (those values
 * are converted to the types of values they should be, f.e. reading a
 * `@numberAttribute` property always returns a `number`)
 */
export type WithStringValues<T extends object> = {
    [K in keyof T]: PickFromUnion<T[K], string> extends never ? // if the type does not include a type assignable to string
    T[K] | string : T[K];
};
export type WithBooleanStringValues<T extends object> = {
    [K in keyof T]: T[K] | 'true' | 'false';
};
export type AsBooleanValues<T extends object> = {
    [K in keyof T]: boolean;
};
export type WithNumberStringValues<T extends object> = {
    [K in keyof T]: T[K] | `${number}`;
};
export type AsValues<T extends object, V> = {
    [K in keyof T]: V;
};
export type AsStringValues<T extends object> = {
    [K in keyof T]: PickFromUnion<T[K], string> extends never ? string : T[K];
};
type StringKeysOnly<T extends PropertyKey> = OmitFromUnion<T, number | symbol>;
export type OmitFromUnion<T, TypeToOmit> = T extends TypeToOmit ? never : T;
type PickFromUnion<T, TypeToPick> = T extends TypeToPick ? T : never;
export type EventKeys<T extends string> = T extends `on${string}` ? T : never;
export type AddDelimitersToEventKeys<T extends object> = {
    [K in keyof T as K extends string ? AddDelimiters<K, ':'> : never]: T[K];
};
type AddDelimiters<T extends string, Delimiter extends string> = T extends `${'on'}${infer Right}` ? `${'on'}${Delimiter}${Right}` : T;
export type PrefixProps<Prefix extends string, T> = {
    [K in keyof T as K extends string ? `${Prefix}${K}` : K]: T[K];
};
export type RemoveSetterPrefixes<T> = RemovePrefixes<T, SetterTypePrefix>;
export type RemovePrefixes<T, Prefix extends string> = {
    [K in keyof T as K extends string ? RemovePrefix<K, Prefix> : K]: T[K];
};
type RemovePrefix<T extends string, Prefix extends string> = T extends `${Prefix}${infer Rest}` ? Rest : T;
export type RemoveAccessors<T> = {
    [K in keyof T as K extends RemovePrefix<StringKeysOnly<SetterTypeKeysFor<T>>, SetterTypePrefix> ? never : K]: T[K];
};
type SetterTypeKeysFor<T> = keyof PrefixPick<T, SetterTypePrefix>;
type PrefixPick<T, Prefix extends string> = {
    [K in keyof T as K extends `${Prefix}${string}` ? K : never]: T[K];
};
export type SetterTypePrefix = '__set__';
export type ContainsUppercase<S extends string> = S extends `${infer First}${infer Rest}` ? First extends Uppercase<First> ? true : ContainsUppercase<Rest> : false;
export type SkipUppercase<T> = {
    [K in keyof T as K extends string ? (ContainsUppercase<K> extends true ? never : K) : never]: T[K];
};
//# sourceMappingURL=LumeElement.d.ts.map