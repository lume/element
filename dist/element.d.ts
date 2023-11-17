import { Element } from './LumeElement.js';
import type { AnyConstructor } from 'lowclass';
import type { AttributeHandler } from './attribute.js';
type PossibleStatics = {
    observedAttributes?: string[] | Record<string, AttributeHandler>;
    elementName?: string;
    __proto__: PossibleStatics;
};
export type ElementCtor = typeof Element & PossibleStatics;
export declare function element<T extends AnyConstructor<HTMLElement>>(Class: T, context?: ClassDecoratorContext): T;
export declare function element(tagName: string, autoDefine?: boolean): <T extends AnyConstructor<HTMLElement>>(Class: T, context?: ClassDecoratorContext) => T;
export {};
//# sourceMappingURL=element.d.ts.map