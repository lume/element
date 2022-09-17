// CONTINUE: classy-solid is on the old lume/cli, but we need to switch to new
// CLI to track the build output on version updates and to use the electron-less
// test setup.

// Then we need to do the same here for lume/element

// CONTINUE: ensure that el.__reactifiedProps__ (or similar, if we renamed it) does
// not prevent subclasses from overriding a property. In lume/variable edition of
// lume/element, if the list contains a property that was already reactified in a
// super class, the subclass that defines an reactive proeprty (f.e. with
// @attribute) will not have its property reactified, and the subclass property
// will end up as a regular non-reactive class field with a value descriptor.

import {reactive, signalify} from 'classy-solid'
import {Element} from './LumeElement.js'
import {__classFinishers, __setUpAttribute} from './attribute.js'

import type {DecoratedValue, DecoratorArgs, DecoratorContext} from 'classy-solid/dist/decorators/types.js'
// import type {Element as LumeElement} from './LumeElement.js'
import type {AttributeHandler} from './attribute.js'

type PossibleStatics = {
	observedAttributes?: string[] | Record<string, AttributeHandler>
	signalProperties?: string[]
	elementName?: string
	__proto__?: any
}
// type ElementCtor = typeof LumeElement & {__proto__: any} & PossibleStatics
// type ElementCtor = {__proto__: any} & PossibleStatics
export type ElementCtor = typeof Element & PossibleStatics

/**
 * A class decorator that defines the target class as a custom element with the
 * given `tagName`. The `tagName` must contain a hyphen, as per standard Custom
 * Element rules.
 *
 * If called with a name, it defines a custom element with that name automatically:
 *
 * ```js
 * \@element('cool-element')
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
 * \@element('cool-element', false)
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
 * \@element
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
 * \@element('')
 * class CoolElement extends HTMLElement {...}
 *
 * // is the same as
 *
 * \@element
 * class CoolElement extends HTMLElement {...}
 * ```
 */
// export function element<T extends typeof HTMLElement>(Class: T, context?: DecoratorContext): T
// export function element(
// 	tagName: string,
// 	autoDefine?: boolean,
// ): <T extends typeof HTMLElement>(Class: T, context?: DecoratorContext) => T
// CONTINUE: Update to TS 5, so we can use better types than `any`
export function element(...args: any[]): any {
	// tagNameOrClass: string | typeof HTMLElement,
	// autoDefineOrContext: boolean | DecoratorContext = true,

	const [tagNameOrClass, autoDefineOrContext] = args as DecoratorArgs | [string, boolean | undefined]

	let tagName = ''
	let autoDefine = !!(autoDefineOrContext ?? true)

	// when called as a decorator factory, f.e. `@element('foo-bar') class MyEl ...` or `element('my-el')(class MyEl ...)`
	if (typeof tagNameOrClass === 'string') {
		tagName = tagNameOrClass
		return (...args: any[]) => {
			const [Class, context] = args as DecoratorArgs
			return applyElementDecoration(Class, context, tagName, autoDefine)
		}
	}

	// Otherwise `@element class MyEl ...` or `element(class MyEl ...)`
	autoDefine = false
	const Class = tagNameOrClass
	const context = autoDefineOrContext as DecoratorContext
	return applyElementDecoration(Class, context, tagName, autoDefine)
}

function applyElementDecoration(
	Class: DecoratedValue,
	context: DecoratorContext,
	tagName: string,
	autoDefine: boolean,
): any {
	if (typeof Class !== 'function' || (context && context.kind !== 'class'))
		throw new Error('@element is only for use on classes.')

	let Ctor = Class as ElementCtor
	const attrs = Ctor.observedAttributes

	if (Ctor.hasOwnProperty('elementName')) tagName = Ctor.elementName || tagName
	else Ctor.elementName = tagName

	if (Array.isArray(attrs)) {
		// Nothing to do here: either the user provided a regular
		// observedAttributes array like with plain Custom Elements, or
		// they used our decorators which happen to create the array for
		// them.
	} else if (attrs && typeof attrs === 'object') {
		// When we're not using decorators, our users have the option to
		// provide an observedAttributes object (instead of the usual
		// array) to specify attribute types. In this case, we need to
		// track the types, and convert observedAttributes to an array so
		// the browser will understand it like usual.

		// Delete it, so that it will be re-created as an array by the
		// following _setUpAttribute calls.
		Ctor.observedAttributes = undefined

		// This also adds the props to Class.signalProperties.
		for (const prop in attrs) __setUpAttribute(Ctor, prop, attrs[prop])
	}

	// We need to compose with @reactive so that it will signalify any @signal properties.
	Ctor = reactive(Ctor, context)

	class ElementDecoratorFinisher extends Ctor {
		constructor(...args: any[]) {
			// @ts-expect-error we don't know what the user's args will be, just pass them all.
			super(...args)
			handlePreUpgradeValues(this)

			// For each non-decorator observedAttribute, make it also a signal.
			//
			// This is signalifying any attribute props that may have been
			// defined in `static observedAttribute` rather than with @attribute
			// decorator (which composes @signal), so that we also cover
			// non-decorator usage until native decorators are out.
			//
			// Note, `signalify()` returns early if a property was already
			// signalified by @attribute (@signal), so this isn't going to
			// double-signalify.
			//
			// TODO: Once native decorators are out, remove this, rely on the
			// composition of decorators only, remove non-decorator usage
			// because it won't be necessary (people won't need build tools),
			// and having to duplicate keys in observedAttributes as well as
			// class fields is more room for human error.
			//
			const keys: (keyof this)[] = []
			const attrsToProps =
				// @ts-expect-error private access
				ElementDecoratorFinisher.prototype.__attributesToProps
			for (const key in attrsToProps) {
				// @ts-expect-error Object.hasOwn exists
				if (Object.hasOwn(attrsToProps, key)) keys.push(attrsToProps[key].name as keyof this)
			}
			if (keys.length) signalify(this, ...keys)
		}
	}

	const classFinishers = [...__classFinishers]
	__classFinishers.length = 0

	function finishClass() {
		for (const finisher of classFinishers) finisher(ElementDecoratorFinisher)

		if (tagName && autoDefine) customElements.define(tagName, ElementDecoratorFinisher)
	}

	if (context?.addInitializer) {
		// Use addInitializer to run logic after the class is fully defined
		// (af class static initializers have ran, otherwise the class
		// decorator runs at the top of a class static block before all
		// other static members are defined).
		context.addInitializer(finishClass)
	} else {
		// For JS without decorator support fall back to `queueMicrotask`
		// because `context` will be `undefined` in that scenario, so there
		// won't be a `context.addInitializer` function to call.
		// Note, without queueMicrotask
		// TODO: Once decorators are out natively, deprecate and remove
		// non-decorator usage, remove queueMicrotask
		queueMicrotask(finishClass)
	}

	return ElementDecoratorFinisher
}

function handlePreUpgradeValues(self: HTMLElement) {
	if (!(self instanceof Element)) return

	// @ts-expect-error, protected access is ok
	for (const [key, value] of self._preUpgradeValues) {
		// If the key is missing, it has already been handled, continue.
		if (!(key in self)) continue

		// Untrack the pre-upgrade value so that a subclass
		// of this class won't re-run this same logic again.
		// TODO needs testing.
		// @ts-expect-error, protected access is ok
		self._preUpgradeValues.delete(key)

		// Unshadow any possible inherited accessor only if
		// there is not an accessor. If there is an accessor it
		// handles inheritance its own way.
		const desc = Object.getOwnPropertyDescriptor(self, key)
		if (desc && 'value' in desc) {
			// @ts-expect-error dynamic decorator stuff, has no impact on user types.
			delete self[key]
		}

		// Set the pre-upgrade value (allowing any inherited
		// accessor to operate on it).
		// @ts-expect-error dynamic decorator stuff, has no impact on user types.
		self[key] = value
	}
}
