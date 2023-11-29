import type { AttributeHandler } from './attribute';
import type { DashCasedProps } from './_utils';
declare const HTMLElement: {
    new (): HTMLElement;
    prototype: HTMLElement;
};
declare class LumeElement extends HTMLElement {
    #private;
    /**
     * The default tag name of the elements this class instantiates. When using
     * the `@element` decorator, this property will be set to the value defined
     * by the decorator.
     */
    static elementName: string;
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
    static defineElement(name?: string, registry?: CustomElementRegistry): typeof LumeElement;
    /** Non-decorator users can use this to specify attributes, which automatically map to reactive properties. */
    static observedAttributes?: string[] | Record<string, AttributeHandler>;
    private __attributesToProps?;
    protected _preUpgradeValues: Map<PropertyKey, unknown>;
    protected ___init___: void;
    private __handleInitialPropertyValuesIfAny;
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
    private __root;
    /**
     * Subclasses can override this to provide an alternate Node to render into
     * (f.e. a subclass can `return this` to render into itself instead of
     * making a root) regardless of the value of `hasShadow`.
     */
    protected get root(): Node;
    protected set root(v: Node);
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
    private __dispose?;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback?(name: string, oldVal: string | null, newVal: string | null): void;
    private static __styleRootNodeRefCountPerTagName;
    private __styleRootNode;
    private __setStyle;
    private static __elementId;
    private __id;
    private __dynamicStyle;
    private __cleanupStyle;
    adoptedCallback(): void;
}
export { LumeElement as Element };
import type { JSX } from './jsx-runtime';
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
 * The result is that TypeScript will properly type-check the following
 * JSX expression (notice lorem-ipsum is dash-case):
 *
 * ```jsx
 * let coolEl = <cool-element foo={'foo'} bar={null} lorem-ipsum={456}></cool-element>
 * ```
 */
export type ElementAttributes<ElementType, SelectedProperties extends keyof ElementType, AdditionalProperties extends object = {}> = WithStringValues<DashCasedProps<Partial<Pick<ElementType, SelectedProperties>>>> & AdditionalProperties & Omit<JSX.HTMLAttributes<ElementType>, SelectedProperties | keyof AdditionalProperties>;
type WithStringValues<Type extends object> = {
    [Property in keyof Type]: Type[Property] extends string ? Type[Property] : Type[Property] | string;
};
//# sourceMappingURL=LumeElement.d.ts.map