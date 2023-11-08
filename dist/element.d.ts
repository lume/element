import type { Constructor } from 'lowclass';
type ElementCtor = Constructor<HTMLElement>;
export declare function element(tagName: string, autoDefine?: boolean): <T extends ElementCtor>(Class: T) => T;
export declare function element<T extends ElementCtor>(Class: T): T;
export {};
//# sourceMappingURL=element.d.ts.map