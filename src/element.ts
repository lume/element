import {reactive} from './variable'

import type {Constructor} from 'lowclass'
import type {Element} from './LumeElement'

/**
 * A class decorator that defines the target class as a custom element with the
 * given `tagName`. The `tagName` must contain a hyphen, as per standard Custom
 * Element rules.
 *
 * @example
 * ```js
 * \@element('cool-element')
 * class CoolElement extends HTMLElement {
 *   // ...
 * }
 *
 * document.body.append(document.createElement('cool-element'))
 * ```
 */
export function element(tagName: string) {
	return function (classOrClassElement: any): any {
		// Newer v2 decorator (used in a Babel environment, no other tool supports them currently).
		if ('kind' in classOrClassElement) {
			const classElement = classOrClassElement
			return {...classElement, finisher: elementFinisher}
		}

		// Legacy v1 decorator
		const Class = classOrClassElement
		return elementFinisher(Class)
	}

	function elementFinisher<C extends Constructor<Element>>(Class: C): C {
		// Check if the flag was already set by use of an @reactive decorator,
		// in that case we don't need to apply it.
		// XXX Maybe we can move this flag into decorator metadata once decorators spec stabilizes.
		Class = (Class as any).__isReactive__ ? Class : reactive(Class)

		Class = class extends Class {
			constructor(...args: any[]) {
				super(...args)

				if (this._preUpgradeValues) {
					for (const [key, value] of this._preUpgradeValues) {
						if (key in Class.prototype) {
							// Untrack the pre-upgrade value so that a subclass
							// of this class won't re-run this same logic again.
							// TODO needs testing.
							this._preUpgradeValues.delete(key)
						}

						// Unshadow any possible inherited accessor.
						delete this[key as keyof this]

						// Set the pre-upgrade value (allowing any inherited
						// accessor to operate on it).
						this[key as keyof this] = value as any
					}
				}
			}
		}

		customElements.define(tagName, Class)

		return Class
	}
}
