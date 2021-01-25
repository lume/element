import {reactive} from './variable.js'
import {Element} from './LumeElement.js'
import {_attribute} from './attribute.js'

import type {Constructor} from 'lowclass'
import type {AttributeHandler} from './attribute.js'

type PossibleStatics = {
	observedAttributes?: string[] | Record<string, AttributeHandler>
	reactiveProperties?: string[]
}
type ElementCtor = Constructor<HTMLElement>

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
 * this case use the decorator without a calling it first, then you can
 * manually define the element in any other way as needed later:
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
export function element(tagName: string, autoDefine?: boolean): <T extends ElementCtor>(Class: T) => T
export function element<T extends ElementCtor>(Class: T): T
export function element(tagNameOrClass: string | ElementCtor, autoDefine = true): any {
	let tagName = ''

	// F.e. use as `@element class MyEl extends LumeElement {}` or `element(class MyEl extends HTMLElement {})`
	if (typeof tagNameOrClass === 'function') {
		autoDefine = false
		const Class = tagNameOrClass
		return handleClass(Class)
	}

	tagName = tagNameOrClass

	return handleClass

	function handleClass(classOrClassElement: ElementCtor | {kind: any}): any {
		// Newer v2 decorator (used in a Babel environment, no other tool supports them currently).
		if ('kind' in classOrClassElement) {
			const classElement = classOrClassElement
			return {...classElement, finisher: elementFinisher}
		}

		// Legacy v1 decorator
		const Class = classOrClassElement
		return elementFinisher(Class)
	}

	function elementFinisher<C extends ElementCtor>(Class: C & PossibleStatics): C {
		const attrs = Class.observedAttributes

		if (Array.isArray(attrs)) {
			// Nothing to do if we're using decorators, as those set up the
			// observedAttributes array.
		} else if (attrs && typeof attrs === 'object') {
			// When we're not using decorators, we can provide an
			// observedAttributes object to specify attribute types.

			// Delete it, so that it will be re-created as an array by the following _attribute calls.
			Class.observedAttributes = undefined

			// This also adds the props to Class.reactiveProperties.
			for (const prop in attrs) _attribute(Class.prototype, prop, undefined, attrs[prop])
		}

		// Check if the flag was already set by use of an @reactive decorator,
		// in that case we don't need to apply it.
		// XXX Maybe we can move this flag into decorator metadata once decorators spec stabilizes.
		// Class = (Class as any).hasOwnProperty('__isReactive__') ? Class : reactive(Class)

		// if ((Class as any).hasOwnProperty('__isReactive__'))
		// 	throw new Error("Don't use @element and @reactive class decorators on the same class.")

		Class = reactive(Class)

		Class = class ElementDecoratorFinisher extends Class {
			constructor(...args: any[]) {
				super(...args)

				if (this instanceof Element) {
					// @ts-ignore, protected access is ok
					for (const [key, value] of this._preUpgradeValues) {
						// if (key in Class.prototype) {
						if (key in this) {
							// Untrack the pre-upgrade value so that a subclass
							// of this class won't re-run this same logic again.
							// TODO needs testing.
							// @ts-ignore, protected access is ok
							this._preUpgradeValues.delete(key)
						}

						// Unshadow any possible inherited accessor only if
						// there is not an accessor. If there is an accessor it
						// handles inheritance its own way.
						const desc = Object.getOwnPropertyDescriptor(this, key)
						if (desc && 'value' in desc) {
							delete this[key as keyof this]
						}

						// Set the pre-upgrade value (allowing any inherited
						// accessor to operate on it).
						this[key as keyof this] = value as any
					}
				}
			}
		}

		if (tagName && autoDefine) customElements.define(tagName, Class)

		return Class
	}
}
