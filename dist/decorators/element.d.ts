import './metadata-shim.js';
import { Element, type AttributeHandlerMap } from '../LumeElement.js';
import type { AnyConstructor } from 'lowclass/dist/Constructor.js';
type PossibleStatics = {
    observedAttributes?: string[];
    observedAttributeHandlers?: AttributeHandlerMap;
    elementName?: string;
    events?: string[];
    __proto__: PossibleStatics;
};
export type ElementCtor = typeof Element & PossibleStatics;
export interface ElementDecoratorOptions {
    elementName?: string;
    autoDefine?: boolean;
}
type ElementClassDecorator = <T extends AnyConstructor<HTMLElement>>(Class: T, context?: ClassDecoratorContext) => T;
/**
 * A class decorator that defines the target class as a custom element with the
 * given `tagName`. The `tagName` must contain a hyphen, as per standard Custom
 * Element rules.
 *
 * If called with a name, it defines a custom element with that name automatically:
 *
 * ```js
 * ⁣@element('cool-element')
 * class CoolElement extends HTMLElement {
 *   // ...
 * }
 *
 * document.body.append(document.createElement('cool-element'))
 * ```
 *
 * If called the second arg set to false, then the element definition should be manually triggered:
 *
 * ```js
 * ⁣@element('cool-element', false)
 * class CoolElement extends HTMLElement {
 *   // ...
 * }
 *
 * // Using the class's default name:
 * CoolElement.defineElement()
 *
 * // Or using a different name:
 * CoolElement.defineElement('awesome-element')
 *
 * document.body.append(document.createElement('cool-element'))
 * ```
 *
 * Sometimes you may not want to define a name for the element,
 * however the decorator is still needed for key functionality.
 * To accomplish this, call it with `autoDefine` set to false,
 *
 * ```js
 * ⁣@element({ autoDefine: false })
 * class CoolElement extends HTMLElement {
 *   // ...
 * }
 * ```
 * or
 * ```js
 * ⁣@element('', false)
 * class CoolElement extends HTMLElement {
 *   // ...
 * }
 * ```
 * Then you can manually define the element later with a name of your choosing:
 * ```js
 * // ...Manually define it at some point after making the class...
 * CoolElement.defineElement('cool-element')
 *
 * // Or:
 * customElements.define('cool-element', CoolElement)
 *
 * // But not the following (runtime error due to no name being defined):
 * CoolElement.defineElement()
 *
 * document.body.append(document.createElement('cool-element'))
 * ```
 *
 * If you call it with an empty string, an empty options object, or as a
 * decorator directly, it will fall back to using the class name as the element
 * name:
 *
 * ```js
 * ⁣@element('')
 * class CoolElement extends HTMLElement {...}
 *
 * // is the same as
 *
 * ⁣@element()
 * class CoolElement extends HTMLElement {...}
 *
 * // is the same as
 *
 * ⁣@element
 * class CoolElement extends HTMLElement {...}
 *
 * // is the same as
 *
 * ⁣@element('cool-element')
 * class CoolElement extends HTMLElement {...}
 *
 * // is the same as
 *
 * ⁣@element
 * class CoolElement extends HTMLElement {
 *   static elementName = 'cool-element'
 * }
 *
 * // is the same as
 *
 * ⁣@element({ elementName: 'cool-element' })
 * class CoolElement extends HTMLElement {...}
 *
 * // is the same as
 *
 * @element('', false)
 * class CoolElement extends HTMLElement {...}
 * customElements.define('cool-element', CoolElement)
 *
 * // is the same as
 *
 * @element('', false)
 * class CoolElement extends HTMLElement {...}
 * CoolElement.defineElement('cool-element')
 *
 * // is the same as
 *
 * @element({autoDefine: false})
 * class CoolElement extends HTMLElement {
 *   static elementName = 'cool-element'
 * }
 * CoolElement.defineElement()
 * ```
 *
 * If using `@attribute` decorators, make sure `@element` is the first
 * decorator applied to the class so that it can set up the attributes
 * properly.
 *
 * @param tagName - The custom element name to define the class as.
 * @param autoDefine - If `true`, the element will be defined automatically
 * when the class is declared. If `false`, you must manually call
 *
 */
export declare function element(tagName: string, autoDefine?: boolean): ElementClassDecorator;
/**
 * @param Class - The class to decorate.
 * @param context - The decorator context.
 */
export declare function element<T extends AnyConstructor<HTMLElement>>(Class: T, context?: ClassDecoratorContext): T;
/**
 * @param options - Options object.
 */
export declare function element(options: ElementDecoratorOptions): ElementClassDecorator;
export {};
//# sourceMappingURL=element.d.ts.map