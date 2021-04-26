import {reactive} from './variable.js'
import {Element} from './LumeElement.js'
import {_attribute} from './attribute.js'

import type {Constructor} from 'lowclass'
import type {AttributeHandler} from './attribute.js'

type PossibleStatics = {
	observedAttributes?: string[] | Record<string, AttributeHandler>
	reactiveProperties?: string[]
	elementName?: string
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

		if (Class.hasOwnProperty('elementName')) tagName = Class.elementName || tagName
		else Class.elementName = tagName

		if (Array.isArray(attrs)) {
			// Nothing to do here: either the user provided a regular
			// observedAttributes array like with plain Custom Elements, or
			// they used our decorators which happen to create the array for
			// them. Either way, the take it from here with the array.
		} else if (attrs && typeof attrs === 'object') {
			// When we're not using decorators, our users have the option to
			// provide an observedAttributes object (insetad of the usual
			// array) to specify attribute types. In this case, we need to
			// track the types, and convert observedAttributes to an array so
			// the browser will understand it like usual.

			// Delete it, so that it will be re-created as an array by the
			// following _attribute calls.
			Class.observedAttributes = undefined

			// This also adds the props to Class.reactiveProperties.
			for (const prop in attrs) _attribute(Class.prototype, prop, undefined, attrs[prop])
		}

		const ReactiveClass = reactive(Class) as typeof Class

		class ElementDecoratorFinisher extends ReactiveClass {
			constructor(...args: any[]) {
				super(...args)

				if (this instanceof Element) {
					// @ts-ignore, protected access is ok
					for (const [key, value] of this._preUpgradeValues) {
						// If the key is missing, it has already been handled, continue.
						if (!(key in this)) {
							continue
						}

						// Untrack the pre-upgrade value so that a subclass
						// of this class won't re-run this same logic again.
						// TODO needs testing.
						// @ts-ignore, protected access is ok
						this._preUpgradeValues.delete(key)

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

		if (tagName && autoDefine) customElements.define(tagName, ElementDecoratorFinisher)

		return ElementDecoratorFinisher
	}
}
