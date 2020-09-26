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
