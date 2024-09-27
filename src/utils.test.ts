import type {CamelCasedProps, JoinToCamelCase, SplitCamelCase} from './utils.js'

// Type tests

// EXAMPLES
type foo0 = JoinToCamelCase<'fooBarBaz'> // Becomes "foobabaz"
const a: foo0 = 'foobarbaz'
a

type foo3 = JoinToCamelCase<'foo-bar-baz'> // Becomes "fooBarBaz"
const b: foo3 = 'fooBarBaz'
b

type foo5 = JoinToCamelCase<'foo bar baz', ' '> // Becomes "fooBarBaz"
const c: foo5 = 'fooBarBaz'
c

type foo6 = JoinToCamelCase<'foo_bar_baz', '_'> // Becomes "fooBarBaz"
const d: foo6 = 'fooBarBaz'
d

type foo14 = JoinToCamelCase<'foo:bar:baz', ':'> // Becomes "fooBarBaz"
const e: foo14 = 'fooBarBaz'
e

type foo4 = JoinToCamelCase<'foobarbaz'> // the same
const f: foo4 = 'foobarbaz'
f

type foo7 = SplitCamelCase<'fooBar'> // Becomes "foo-bar"
const g: foo7 = 'foo-bar'
g

type foo12 = SplitCamelCase<'fooBar', '_'> // Becomes "foo_bar"
const h: foo12 = 'foo_bar'
h

type foo13 = SplitCamelCase<'fooBar', ' '> // Becomes "foo bar"
const i: foo13 = 'foo bar'
i

type foo11 = SplitCamelCase<'foo-bar'> // the same
const j: foo11 = 'foo-bar'
j

type foo8 = SplitCamelCase<'foo bar'> // the same
const k: foo8 = 'foo bar'
k

type foo9 = SplitCamelCase<'foo_bar'> // the same
const l: foo9 = 'foo_bar'
l

type foo10 = SplitCamelCase<'foobar'> // the same
const m: foo10 = 'foobar'
m

type t = JoinToCamelCase<'foo-bar', '-'> // Becomes "foo:bar"
const n: t = 'fooBar'
n // Yeah.

interface KebabCased {
	'foo-bar': string
	foo: number
}

type CamelCased = CamelCasedProps<KebabCased>

const o: CamelCased = {
	fooBar: 'anystring',
	foo: 123,
}
o

const they = it

describe('type tests', () => {
	they('pass', () => {})
})
