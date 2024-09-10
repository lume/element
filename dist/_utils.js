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
export function identityTemplateTag(stringsParts, ...values) {
    // unfortunately, it does incur some unnecessary runtime overhead in order to
    // receive the string parts and the interpolated values and concatenate them
    // all together into the same string as if we hadn't used a template tag.
    let str = '';
    for (let i = 0; i < values.length; i++)
        str += stringsParts[i] + String(values[i]);
    return str + stringsParts[stringsParts.length - 1];
}
export function camelCaseToDash(str) {
    return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
}
export function dashCaseToCamelCase(str) {
    return str.replace(/-([a-z])/g, match => match[1].toUpperCase());
}
export function defineProp(obj, prop, value) {
    Object.defineProperty(obj, prop, {
        value,
        writable: true,
        configurable: true,
        enumerable: true,
    });
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
//# sourceMappingURL=_utils.js.map