/**
 * Execute the given `func`tion on the next micro "tick" of the JS engine.
 */
export function defer(func: () => unknown): Promise<unknown> {
	// "defer" is used as a semantic label for Promise.resolve().then
	return Promise.resolve().then(func)
}

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

export function defineProp(obj: any, prop: string, value: any) {
	Object.defineProperty(obj, prop, {
		value,
		writable: true,
		configurable: true,
		enumerable: true,
	})
}

// TYPES

type SplitIncludingDelimitor<S extends string, D extends string> = string extends S
	? string[]
	: S extends ''
	? []
	: S extends `${infer T}${D}${infer U}`
	? S extends `${T}${infer Z}${U}`
		? [T, Z, ...Split<U, D>]
		: never
	: [S]

export type Split<S extends string, D extends string> = string extends S
	? string[]
	: S extends ''
	? []
	: S extends `${infer T}${D}${infer U}`
	? [T, ...Split<U, D>]
	: [S]

export type Join<S extends any[], D extends string> = string[] extends S
	? string
	: S extends [`${infer T}`, ...infer U]
	? U[0] extends undefined
		? T
		: `${T}${D}${Join<U, D>}`
	: ''

type UndefinedToEmptyString<T extends string> = T extends undefined ? '' : T

// prettier-ignore
type UpperCaseChars = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'X' | 'Y' | 'Z';
type WordSeparators = '-' | '_' | ' '

type StringArrayToCamelCase<K extends string[]> = `${K[0]}${Capitalize<UndefinedToEmptyString<K[1]>>}`

export type CamelCase<K> = K extends string ? StringArrayToCamelCase<Split<K, WordSeparators>> : K

type StringPartToKebabCase<K extends string, S extends string, L extends string> = K extends S
	? '-'
	: K extends L
	? `-${Lowercase<K>}`
	: K
type StringArrayToKebabCase<K extends any[], S extends string, L extends string> = K extends [`${infer T}`, ...infer U]
	? `${StringPartToKebabCase<T, S, L>}${StringArrayToKebabCase<U, S, L>}`
	: ''

export type DashCase<K> = K extends string
	? StringArrayToKebabCase<
			SplitIncludingDelimitor<K, WordSeparators | UpperCaseChars>,
			WordSeparators,
			UpperCaseChars
	  >
	: K

export type CamelCasedProps<T> = {
	[K in keyof T as CamelCase<K>]: T[K]
}

export type DashCasedProps<T> = {
	[K in keyof T as DashCase<K>]: T[K]
}

// EXAMPLES
// type foo0 = CamelCase<"fooBar">;  // Becomes "fooBar"
// type foo3 = CamelCase<"foo-bar">; // Becomes "fooBar"
// type foo5 = CamelCase<"foo bar">; // Becomes "fooBar"
// type foo6 = CamelCase<"foo_bar">; // Becomes "fooBar"
// type foo4 = CamelCase<"foobar">;  // Becomes "foobar"
// type foo7 = DashCase<"fooBar">;   // Becomes "foo-bar"
// type foo11 = DashCase<"foo-bar">; // Becomes "foo-bar"
// type foo8 = DashCase<"foo bar">;  // Becomes "foo-bar"
// type foo9 = DashCase<"foo_bar">;  // Becomes "foo-bar"
// type foo10 = DashCase<"foobar">;  // Becomes "foobar"
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
