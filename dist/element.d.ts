import { Element } from './LumeElement.js';
import type { AttributeHandler } from './attribute.js';
type PossibleStatics = {
    observedAttributes?: string[] | Record<string, AttributeHandler>;
    signalProperties?: string[];
    elementName?: string;
    __proto__?: any;
};
export type ElementCtor = typeof Element & PossibleStatics;
export declare function element(...args: any[]): any;
export {};
//# sourceMappingURL=element.d.ts.map