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
export function identityTemplateTag(stringsParts: TemplateStringsArray, ...values: any[]): string {
	// unfortunately, it does incur some unnecessary runtime overhead in order to
	// receive the string parts and the interpolated values and concatenate them
	// all together into the same string as if we hadn't used a template tag.

	let str = ''

	for (let i = 0; i < values.length; i++) str += stringsParts[i] + String(values[i])

	return str + stringsParts[stringsParts.length - 1]
}

export function camelCaseToDash(str: string): string {
	return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase()
}

export function dashCaseToCamelCase(str: string) {
	return str.replace(/-([a-z])/g, match => match[1]!.toUpperCase())
}

export function defineProp(obj: any, prop: string, value: any) {
	Object.defineProperty(obj, prop, {
		value,
		writable: true,
		configurable: true,
		enumerable: true,
	})
}

// TYPES

// https://github.com/type-challenges/type-challenges/issues/9116
// More solutions at https://github.com/type-challenges/type-challenges/tree/main/questions/00114-hard-camelcase
//
// bug, fooBar becomes foobar, https://github.com/type-challenges/type-challenges/issues/9116#issuecomment-1107928665
// export type JoinToCamelCase<
// 	S extends string,
// 	Sep extends string = '-',
// 	R extends string = '',
// > = S extends `${infer First}${Sep}${infer Rest}`
// 	? R extends ''
// 		? JoinToCamelCase<Lowercase<Rest>, Sep, `${R}${Lowercase<First>}`>
// 		: JoinToCamelCase<Lowercase<Rest>, Sep, `${R}${Capitalize<First>}`>
// 	: R extends ''
// 	? Lowercase<S>
// 	: `${R}${Capitalize<S>}`
//
export type JoinToCamelCase<
	S extends string,
	Sep extends string = '-',
	UPPER extends boolean = false,
	Res extends string = '',
> = S extends `${infer L}${infer R}`
	? L extends Sep
		? JoinToCamelCase<R, Sep, true, Res>
		: UPPER extends true
		? JoinToCamelCase<R, Sep, false, `${Res}${Uppercase<L>}`>
		: JoinToCamelCase<R, Sep, false, `${Res}${Lowercase<L>}`>
	: Res

// https://github.com/type-challenges/type-challenges/issues/9098
// More solutions at https://github.com/type-challenges/type-challenges/blob/main/questions/00612-medium-kebabcase/README.md
//
// export type SplitCamelCase<
// 	S extends string,
// 	Sep extends string = '-',
// 	isFirstChar = true,
// > = S extends `${infer s}${infer right}`
// 	? s extends Lowercase<s>
// 		? `${s}${SplitCamelCase<right, Sep, false>}`
// 		: isFirstChar extends true
// 		? `${Lowercase<s>}${SplitCamelCase<right, Sep, false>}`
// 		: `${Sep}${Lowercase<s>}${SplitCamelCase<right, Sep, false>}`
// 	: S
//
//
//
// type FirstLowcase<T extends string> = T extends `${infer F}${infer R}`
// 	? F extends Lowercase<F>
// 		? T
// 		: `${Lowercase<F>}${R}`
// 	: T
// type SplitCamelCase<S extends string, Sep extends string = '-'> = S extends `${infer F}${infer R}`
// 	? R extends FirstLowcase<R>
// 		? `${FirstLowcase<F>}${SplitCamelCase<R, Sep>}`
// 		: `${FirstLowcase<F>}${Sep}${SplitCamelCase<FirstLowcase<R>, Sep>}`
// 	: S
//
//
//
// type SplitCamelCase<S, Sep extends string = '-'> = S extends `${infer First}${infer Rest}`
// 	? Rest extends Uncapitalize<Rest>
// 		? `${Uncapitalize<First>}${SplitCamelCase<Rest, Sep>}`
// 		: `${Uncapitalize<First>}${Sep}${SplitCamelCase<Rest, Sep>}`
// 	: S
//
//
//
// prettier-ignore
type KebabMap = { A: "a", B: "b", C: "c", D: "d", E: "e", F: "f", G: "g", H: "h", I: "i", J: "j", K: "k", L: "l", M: "m", N: "n", O: "o", P: "p", Q: "q", R: "r", S: "s", T: "t", U: "u", V: "v", W: "w", X: "x", Y: "y", Z: "z", }
type SplitCamelCase<
	S extends string,
	Sep extends string = '-',
	U extends string = '',
> = S extends `${infer Target}${infer R}`
	? Target extends keyof KebabMap
		? U extends ''
			? SplitCamelCase<R, Sep, `${U}${KebabMap[Target]}`>
			: SplitCamelCase<R, Sep, `${U}${Sep}${KebabMap[Target]}`>
		: SplitCamelCase<R, Sep, `${U}${Target}`>
	: U

export type CamelCasedProps<T> = {
	[K in keyof T as JoinToCamelCase<Extract<K, string>, '-'>]: T[K]
}

export type DashCasedProps<T> = {
	[K in keyof T as SplitCamelCase<Extract<K, string>, '-'>]: T[K]
}

// EXAMPLES
// type foo0 = JoinToCamelCase<'fooBarBaz'> // Becomes "foobabaz"
// type foo3 = JoinToCamelCase<'foo-bar-baz'> // Becomes "fooBarBaz"
// type foo5 = JoinToCamelCase<'foo bar baz', ' '> // Becomes "fooBarBaz"
// type foo6 = JoinToCamelCase<'foo_bar_baz', '_'> // Becomes "fooBarBaz"
// type foo14 = JoinToCamelCase<'foo:bar:baz', ':'> // Becomes "fooBarBaz"
// type foo4 = JoinToCamelCase<'foobarbaz'> // the same
// type foo7 = SplitCamelCase<'fooBar'> // Becomes "foo-bar"
// type foo12 = SplitCamelCase<'fooBar', '_'> // Becomes "foo_bar"
// type foo13 = SplitCamelCase<'fooBar', ' '> // Becomes "foo bar"
// type foo11 = SplitCamelCase<'foo-bar'> // the same
// type foo8 = SplitCamelCase<'foo bar'> // the same
// type foo9 = SplitCamelCase<'foo_bar'> // the same
// type foo10 = SplitCamelCase<'foobar'> // the same
// type t = Join<['foo', 'bar'], ':'> // Becomes "foo:bar"
//
// interface KebabCased {
//     "foo-bar": string;
//     foo: number;
// }
// type CamelCased = CamelCasedProps<KebabCased>;
// Becomes
// {
//    fooBar: string;
//    foo: number;
// }

/**
 * Returns
 * - `true` if all of union-types are `string`
 *  - `false` if none of union-types are `string`
 *  - `boolean` if >1 of union-types are `string`
 */
export type IsString<U> = U extends string ? true : false
