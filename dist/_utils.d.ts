/**
 * This is an identity "template string tag function", which when applied to a
 * template string returns the equivalent of not having used a template tag on
 * a template string to begin with.
 *
 * For example, The following two strings are equivalent:
 *
 * ```js
 * const number = 42
 * const string1 = `meaning of life: ${number}`
 * const string2 = identityTemplateTag`meaning of life: ${number}`
 * ```
 *
 * This can be useful when assigning it to variables like `css` or `html` in
 * order to trigger syntax checking and highlighting inside template strings
 * without actually doing anything to the string (a no-op).
 */
export declare function identityTemplateTag(stringsParts: TemplateStringsArray, ...values: any[]): string;
export declare function camelCaseToDash(str: string): string;
export declare function dashCaseToCamelCase(str: string): string;
export declare function defineProp(obj: any, prop: string, value: any): void;
export type JoinToCamelCase<S extends string, Sep extends string = '-', UPPER extends boolean = false, Res extends string = ''> = S extends `${infer L}${infer R}` ? L extends Sep ? JoinToCamelCase<R, Sep, true, Res> : UPPER extends true ? JoinToCamelCase<R, Sep, false, `${Res}${Uppercase<L>}`> : JoinToCamelCase<R, Sep, false, `${Res}${Lowercase<L>}`> : Res;
type KebabMap = {
    A: "a";
    B: "b";
    C: "c";
    D: "d";
    E: "e";
    F: "f";
    G: "g";
    H: "h";
    I: "i";
    J: "j";
    K: "k";
    L: "l";
    M: "m";
    N: "n";
    O: "o";
    P: "p";
    Q: "q";
    R: "r";
    S: "s";
    T: "t";
    U: "u";
    V: "v";
    W: "w";
    X: "x";
    Y: "y";
    Z: "z";
};
type SplitCamelCase<S extends string, Sep extends string = '-', U extends string = ''> = S extends `${infer Target}${infer R}` ? Target extends keyof KebabMap ? U extends '' ? SplitCamelCase<R, Sep, `${U}${KebabMap[Target]}`> : SplitCamelCase<R, Sep, `${U}${Sep}${KebabMap[Target]}`> : SplitCamelCase<R, Sep, `${U}${Target}`> : U;
export type CamelCasedProps<T> = {
    [K in keyof T as JoinToCamelCase<Extract<K, string>, '-'>]: T[K];
};
export type DashCasedProps<T> = {
    [K in keyof T as SplitCamelCase<Extract<K, string>, '-'>]: T[K];
};
export {};
//# sourceMappingURL=_utils.d.ts.map