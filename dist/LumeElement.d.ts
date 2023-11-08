import type { AttributeHandler } from './attribute';
import type { DashCasedProps } from './_utils';
declare const HTMLElement: {
    new (): HTMLElement;
    prototype: HTMLElement;
};
declare class LumeElement extends HTMLElement {
    #private;
    static elementName: string;
    static defineElement(name?: string, registry?: CustomElementRegistry): typeof LumeElement;
    static reactiveProperties?: string[];
    static observedAttributes?: string[] | Record<string, AttributeHandler>;
    private __attributesToProps?;
    protected _preUpgradeValues: Map<PropertyKey, unknown>;
    protected __propsSetAtLeastOnce__?: Set<PropertyKey>;
    protected __reactifiedProps__?: Set<PropertyKey>;
    protected ___init___: void;
    private __handleInitialPropertyValuesIfAny;
    protected template?: Template;
    protected css?: string | (() => string);
    protected static css?: string | (() => string);
    readonly hasShadow: boolean;
    private __root;
    protected get root(): Node;
    protected set root(v: Node);
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
export type ElementAttributes<ElementType, SelectedProperties extends keyof ElementType, AdditionalProperties extends object = {}> = WithStringValues<DashCasedProps<Partial<Pick<ElementType, SelectedProperties>>>> & AdditionalProperties & Omit<JSX.HTMLAttributes<ElementType>, SelectedProperties | keyof AdditionalProperties>;
type WithStringValues<Type extends object> = {
    [Property in keyof Type]: Type[Property] extends string ? Type[Property] : Type[Property] | string;
};
//# sourceMappingURL=LumeElement.d.ts.map