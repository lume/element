import * as React from 'react'
import {render} from 'solid-js/dom'
import {Constructor, Mixin, MixinResult} from 'lowclass'
import createEmotion, {Emotion} from 'create-emotion'

export * from '@lume/variable'
export * from './element-type-helpers'

export class Element extends HTMLElement {
	constructor() {
		super()
		this.__handleInitialPropertyValuesIfAny()
	}

	static observedAttributes?: string[]

	private __attributesToProps?: Record<string, {name: string; attributeHandler?: AttributeHandler}>

	private __handleInitialPropertyValuesIfAny() {
		// We need to delete value-descriptor properties and store the initial
		// values in the storage for our reactive variable accessors.
		//
		// If we don't do this, then DOM APIs like cloneNode will create our node
		// without first upgrading it and set property values, which means those
		// values will be set as value descriptor properties on the instance instead
		// of interacting with our accessors (i.e. overriding our accessors that the
		// instance will gain once the upgrade process places our prototype in the
		// instance's prototype chain).
		//
		// This can also happen if you set properties on an element that isn't
		// upgraded into a custom element yet, and thus will not yet have our
		// accessors.

		if (this.__attributesToProps) {
			for (const attr in this.__attributesToProps) {
				const prop = this.__attributesToProps[attr]
				const propName = prop.name as keyof this

				if (this.hasOwnProperty(propName)) {
					// override only value descriptors (we assume a getter/setter descriptor is intentional and meant to override or extend our getter/setter)
					const descriptor = Object.getOwnPropertyDescriptor(this, propName)!

					if (descriptor.value) {
						// delete the value descriptor...
						delete this[propName]

						// ...and re-assign the value so that it goes through an inherited accessor
						//
						// NOTE, deferring allows preexisting preupgrade values to be
						// handled *after* default constructor values are have been set
						// during Custom Element upgrade.
						defer(() => (this[propName] = descriptor.value))
					}
				}
			}
		}
	}

	protected makeStyle?(): string
	protected elementStyle?(): string
	protected template?(): Element

	/**
	 * Subclasses can override this to provide an alternate Node to render into
	 * (f.e. a subclass can `return this` to render into itself instead of making a root)
	 */
	protected get root(): Node {
		if (this.shadowRoot) return this.shadowRoot
		return this.attachShadow({mode: 'open'})
	}

	private __dispose?: () => void
	private __hasShadow = true

	protected connectedCallback() {
		this.__hasShadow = this.root instanceof ShadowRoot

		this.__setStyle()

		// TODO the cast to Element should not be needed, will be fixed by
		// https://github.com/ryansolid/solid/issues/87
		if (this.template) this.__dispose = render(this.template.bind(this), this.root as Element)
	}

	protected disconnectedCallback() {
		this.__dispose && this.__dispose()

		this.__cleanupStyle()
	}

	private static __rootNodeRefCountPerTagName = new WeakMap<Node, Record<string, number>>()

	private __setStyle() {
		const hostSelector = this.__hasShadow ? ':host' : this.tagName.toLowerCase()

		const style = document.createElement('style')

		style.innerHTML = `
      ${hostSelector} {
        display: block;
        ${this.elementStyle ? this.elementStyle() : ''}
      }

      ${this.makeStyle ? this.makeStyle() : ''}
    `

		if (this.__hasShadow) {
			// If this element has a shadow root, put the style there. This is the
			// standard way to scope styles to a component.

			this.root.appendChild(style)
		} else {
			// If this element doesn't have a shadow root, then we want to append the
			// style only once to the rootNode where it lives (a ShadoowRoot or
			// Document). If there are multiple of this same element in the rootNode,
			// then the style will be added only once and will style all the elements
			// in the same rootNode.

			const _rootNode = this.getRootNode()
			const rootNode = _rootNode === document ? document.head : _rootNode

			let refCountPerTagName = Element.__rootNodeRefCountPerTagName.get(rootNode)
			if (!refCountPerTagName) Element.__rootNodeRefCountPerTagName.set(rootNode, (refCountPerTagName = {}))
			const refCount = refCountPerTagName[this.tagName] || 0
			refCountPerTagName[this.tagName] = refCount + 1

			if (refCount === 0) {
				style.id = this.tagName
				rootNode.appendChild(style)
			}
		}
	}

	private __cleanupStyle() {
		if (this.__hasShadow) return

		const rootNode = this.getRootNode()
		const refCountPerTagName = Element.__rootNodeRefCountPerTagName.get(rootNode)

		if (!refCountPerTagName) return

		const refCount = refCountPerTagName[this.tagName]

		if (refCount === undefined) return

		refCountPerTagName[this.tagName] = refCount - 1

		if (refCount === 0) {
			const style = (rootNode as Element).querySelector('#' + this.tagName)
			if (style) rootNode.removeChild(style)
		}
	}

	// not used currently, but we'll leave this hear so that child classes can call super,
	// and that way we can always add an implementation later when needed.
	protected adoptedCallback() {}

	protected attributeChangedCallback(attr: string, _oldVal: string, newVal: string) {
		// map attribute to property
		const prop = this.__attributesToProps && this.__attributesToProps[attr]
		if (prop) {
			const handler = prop.attributeHandler
			;(this as any)[prop.name] = handler && handler.from ? handler.from(newVal) : newVal
		}
	}
}

// prettier-ignore
const base26Chars = [
  'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'
]

/**
 * Given an array of characters `baseChars` with length X, convert an int
 * `value` to base X, using the chars in the array for the digit representation.
 */
// We need this because Emotion.js accepts only letters in the createEmotion key
// option.
// Based on https://stackoverflow.com/a/923814/454780
function integerToString(value: number, baseChars: string[]): string {
	value = Math.floor(value)

	let result = ''
	const targetBase = baseChars.length

	do {
		result = baseChars[value % targetBase] + result
		value = value / targetBase
	} while (value > 1)

	return result
}

let emotionCount = 0

const emotions = new WeakMap<WithEmotion, Emotion>()

// eslint-disable-next-line typescript/explicit-function-return-type
function WithEmotionMixin<T extends Constructor<Element>>(Base?: T) {
	if (!Base) Base = Constructor(Element)

	class WithEmotion extends Constructor<Element>(Base) {
		get emotion(): ReturnType<typeof createEmotion> {
			let emotion = emotions.get(this)

			if (!emotion) {
				emotions.set(
					this,
					(emotion = createEmotion({
						// The key option is required when there will be multiple instances
						// of Emotion in a single app, and we need one instance of Emotion
						// per element instance, for now.
						key: this.tagName.toLowerCase() + '-' + integerToString(++emotionCount, base26Chars),

						// The `as HTMLElement` cast is needed because the type def for
						// `createEmotion` is too specific, and does not accept just Node
						// (f.e. shadow roots are Node, but not HTMLElement, and we may want
						// to attach the generated <style> elements to this element's shadow
						// root)
						container: this.root as HTMLElement,
					})),
				)
			}

			return emotion
		}

		get css(): ReturnType<typeof createEmotion>['css'] {
			return this.emotion.css
		}
	}

	return WithEmotion as MixinResult<typeof WithEmotion, T>
}

export const WithEmotion = Mixin(WithEmotionMixin, Element)
export interface WithEmotion extends InstanceType<typeof WithEmotion> {}

/**
 * A class decorator that defines the target class as a custom element with the
 * given `tagName`. The `tagName` must contain a hyphen, as per standard Custom
 * Element rules.
 */
// eslint-disable-next-line typescript/explicit-function-return-type
export function customElement(tagName: string) {
	return function<C extends Constructor<HTMLElement>>(Ctor: C): C {
		customElements.define(tagName, Ctor)
		return Ctor
	}
}

type AttributeHandler = {
	to?: (prop: unknown) => string
	from?: (v: string) => unknown
}

/**
 * A property or accessor decorator that maps an HTML attribute with the
 * dash-case version of the property, to the property. For example, if the
 * attribute decorator is used on a property called firstName, then the
 * property will be mapped to an attribute called first-name. Any time that the
 * attribute value changes (f.e. with setAttribute), then the property will
 * have this value set onto it.
 */
export function attribute(prototype: any /*CustomElementPrototype*/, propName: string): any
export function attribute(handler?: AttributeHandler): (proto: any, propName: string) => any
export function attribute(handlerOrProto: any, propName?: string): any {
	if (handlerOrProto && propName) {
		// if being used as a decorator directly
		_attribute(handlerOrProto, propName)
	} else {
		// if being used as a decorator factory
		return (proto: any, propName: string) => {
			_attribute(proto, propName, handlerOrProto)
		}
	}
}

function _attribute({constructor}: any /*CustomElementPrototype*/, propName: string, handler?: AttributeHandler): void {
	const ctor = constructor as typeof Element

	// TODO this will fail on constructors that have only a `static get
	// observedAttributes()`. Set a descriptor instead?
	if (!ctor.hasOwnProperty('observedAttributes')) ctor.observedAttributes = [...(ctor.observedAttributes || [])]

	const attrName = camelCaseToDash(propName)

	// if (!ctor.observedAttributes!.indexOf(attr)) ctor.observedAttributes = [...ctor.observedAttributes!, attr]
	if (!ctor.observedAttributes!.includes(attrName)) ctor.observedAttributes!.push(attrName)

	mapAttributeToProp(ctor, attrName, propName, handler)
}

// type CustomElementPrototype = {
//   constructor: CustomElementCtor
// }

// TODO this stores attributes as an inheritance chain on the constructor. It'd
// be more fool-proof (not publicly exposed) to store attribute-prop mappings in
// WeakMaps, but then we'd need to implement our own inheritance
// (prototype-like) lookup for the attributes.
function mapAttributeToProp(ctor: typeof Element, attr: string, prop: string, handler?: AttributeHandler): void {
	if (!ctor.prototype.hasOwnProperty('__attributesToProps')) {
		// using defineProperty so that it is non-writable, non-enumerable, non-configurable
		Object.defineProperty(ctor.prototype, '__attributesToProps', {
			value: {
				__proto__:
					// prettier-ignore
					ctor.prototype.
            // @ts-ignore, private access
            __attributesToProps ||
            Object.prototype,
			},
		})
	}

	// TODO throw helpful warning if overriding an already-existing attribute-prop mapping
	if (
		// prettier-ignore
		ctor.prototype.
      // @ts-ignore, private access
      __attributesToProps!
      [attr]
	) {
		console.warn(
			'The `@attribute` decorator is overriding an already-existing attribute-to-property mapping for the "' +
				attr +
				'" attribute.',
		)
	}

	// prettier-ignore
	ctor.prototype.
    // @ts-ignore, private access
    __attributesToProps!
    [attr] = {name: prop, attributeHandler: handler}
}

function camelCaseToDash(str: string): string {
	return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase()
}

// define the slot element type, for use with ShadowDOM
export interface HTMLSlotElementAttributes extends React.HTMLAttributes<HTMLSlotElement> {
	name?: string
}
declare global {
	namespace JSX {
		interface IntrinsicElements {
			slot: React.DetailedHTMLProps<HTMLSlotElementAttributes, HTMLSlotElement>
		}
	}
}

/**
 * Execute the given `func`tion on the next micro "tick" of the JS engine.
 */
export function defer(func: () => unknown): Promise<unknown> {
	// "defer" is used as a semantic label for Promise.resolve().then
	return Promise.resolve().then(func)
}

export const version = '0.0.3'
