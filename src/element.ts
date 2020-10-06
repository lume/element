import type {Constructor} from 'lowclass'

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

	function elementFinisher<C extends Constructor<HTMLElement>>(Class: C): C {
		customElements.define(tagName, Class)
		return Class
	}
}
