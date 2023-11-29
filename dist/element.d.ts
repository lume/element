import { Element } from './LumeElement.js';
import type { AnyConstructor } from 'lowclass';
import type { AttributeHandler } from './attribute.js';
type PossibleStatics = {
    observedAttributes?: string[] | Record<string, AttributeHandler>;
    elementName?: string;
    __proto__: PossibleStatics;
};
export type ElementCtor = typeof Element & PossibleStatics;
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
 * however the decorator is still needed for key functionality. In
 * this case use the decorator without calling it first, then you can
 * manually define the element in another way as needed:
 *
 * ```js
 * ⁣@element
 * class CoolElement extends HTMLElement {
 *   // ...
 * }
 *
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
 * If you call it with an empty string, it behaves the same as the previous example:
 *
 * ```js
 * ⁣@element('')
 * class CoolElement extends HTMLElement {...}
 *
 * // is the same as
 *
 * ⁣@element
 * class CoolElement extends HTMLElement {...}
 * ```
 */
export declare function element(tagName: string, autoDefine?: boolean): <T extends AnyConstructor<HTMLElement>>(Class: T, context?: ClassDecoratorContext) => T;
export declare function element<T extends AnyConstructor<HTMLElement>>(Class: T, context?: ClassDecoratorContext): T;
export {};
//# sourceMappingURL=element.d.ts.map