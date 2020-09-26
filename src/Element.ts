import {render} from '@lume/variable'
import {identityTemplateTag, defer, camelCaseToDash} from './utils'

import type {Constructor} from 'lowclass'

let ctor: typeof Element

// Throw a helpful error if no Custom Elements v1 API exists.
if (!('customElements' in window)) {
	// TODO: provide a link to the Docs.
	throw new Error(`
		Your browser does not support the Custom Elements API. You'll
		need to install a Custom Elements polyfill.
	`)
}

export class Element extends HTMLElement {
	static observedAttributes?: string[]

	private __attributesToProps?: Record<string, {name: string; attributeHandler?: AttributeHandler}>

	constructor() {
		super()

		// XXX We could remove this and instead use a `@initialize`-based
		// decorator when the new decorators land, which would allow us to run
		// this logic during construction without requiring the user to extend
		// from a specific base class (Element).
		this.__handleInitialPropertyValuesIfAny()

		// XXX Should we handle initial attributes too?
	}

	private __handleInitialPropertyValuesIfAny() {
		// We need to delete initial value-descriptor properties (if they exist)
		// and store the initial values in the storage for our reactive variable
		// accessors.
		//
		// If we don't do this, then DOM APIs like cloneNode will create our
		// node without first upgrading it, and then if someone sets a property
		// (while our reactive accessors are not yet present in the class
		// prototype) it means those values will be set as value descriptor
		// properties on the instance instead of interacting with our accessors
		// (i.e. the new properties will override our accessors that the
		// instance will gain on its prototype chain once the upgrade process
		// places our class prototype in the instance's prototype chain).
		//
		// This can also happen if we set properties on an element that isn't
		// upgraded into a custom element yet, and thus will not yet have our
		// accessors.

		if (this.__attributesToProps) {
			for (const attr in this.__attributesToProps) {
				const prop = this.__attributesToProps[attr]
				const propName = prop.name as keyof this

				if (this.hasOwnProperty(propName)) {
					const descriptor = Object.getOwnPropertyDescriptor(this, propName)!

					// override only value descriptors (we assume a
					// getter/setter descriptor is intentional and meant to
					// override or extend our getter/setter so we leave those
					// alone)
					if ('value' in descriptor) {
						// delete the value descriptor...
						delete this[propName]

						// ...and re-assign the value so that it goes through an inherited accessor
						//
						// NOTE, deferring allows preexisting preupgrade values
						// to be handled *after* class fields have been set
						// during Custom Element upgrade (because otherwise
						// those would override the pre-existing values we're
						// trying to assign here).
						defer(() => (this[propName] = descriptor.value))
					}
				}
			}
		}
	}

	protected template?: Template
	protected elementStyle?(): string
	protected css?: string | (() => string)
	protected static css?: string | (() => string)

	private __root: Node | null = null

	/**
	 * Subclasses can override this to provide an alternate Node to render into
	 * (f.e. a subclass can `return this` to render into itself instead of making a root)
	 */
	protected get root(): Node {
		if (this.__root) return this.__root
		if (this.shadowRoot) return this.shadowRoot
		return this.attachShadow({mode: 'open'})
	}
	protected set root(v: Node) {
		this.__root = v
	}

	private __dispose?: () => void
	private __hasShadow = true

	connectedCallback() {
		this.__hasShadow = this.root instanceof ShadowRoot

		this.__setStyle()

		const template = this.template

		// TODO This needs testing to ensure it works with DOM or the result of JSX alike.
		if (template)
			this.__dispose = render(typeof template === 'function' ? template.bind(this) : () => template, this.root)
	}

	disconnectedCallback() {
		this.__dispose && this.__dispose()

		this.__cleanupStyle()
	}

	private static __styleRootNodeRefCountPerTagName = new WeakMap<Node, Record<string, number>>()
	private __styleRootNode: HTMLHeadElement | ShadowRoot | null = null

	private __setStyle() {
		ctor = this.constructor as typeof Element
		const staticCSS = typeof ctor.css === 'function' ? (ctor.css = ctor.css()) : ctor.css || ''
		const dynamicCSS = typeof this.css === 'function' ? this.css() : this.css || ''

		if (this.__hasShadow) {
			const hostSelector = ':host'
			const staticStyle = document.createElement('style')

			staticStyle.innerHTML = `
				${hostSelector} {
					display: block;
					${this.elementStyle ? this.elementStyle() : ''}
				}

				${staticCSS}
				${dynamicCSS}
			`

			// If this element has a shadow root, put the style there. This is the
			// standard way to scope styles to a component.

			this.root.appendChild(staticStyle)
		} else {
			if (staticCSS) {
				const hostSelector = this.tagName.toLowerCase()
				const staticStyle = document.createElement('style')

				staticStyle.innerHTML = `
					${hostSelector} {
						display: block;
						${this.elementStyle ? this.elementStyle() : ''}
					}

					${staticCSS.replace(':host', hostSelector)}
				`

				// If this element doesn't have a shadow root, then we want to append the
				// style only once to the rootNode where it lives (a ShadoowRoot or
				// Document). If there are multiple of this same element in the rootNode,
				// then the style will be added only once and will style all the elements
				// in the same rootNode.

				// Because we're connected, getRootNode will return either the
				// Document, or a ShadowRoot.
				const rootNode = this.getRootNode()

				this.__styleRootNode = ((rootNode === document ? document.head : rootNode) as unknown) as
					| HTMLHeadElement
					| ShadowRoot

				let refCountPerTagName = Element.__styleRootNodeRefCountPerTagName.get(this.__styleRootNode)
				if (!refCountPerTagName)
					Element.__styleRootNodeRefCountPerTagName.set(this.__styleRootNode, (refCountPerTagName = {}))
				const refCount = refCountPerTagName[this.tagName] || 0
				refCountPerTagName[this.tagName] = refCount + 1

				if (refCount === 0) {
					staticStyle.id = this.tagName.toLowerCase()

					this.__styleRootNode.appendChild(staticStyle)
				}
			}

			if (dynamicCSS) {
				// For dynamic per-instance styles, make one style element per
				// element instance so it contains that element's unique styles,
				// associated to a unique attribute selector.
				const id = this.tagName.toLowerCase() + '-' + this.__id

				// Add the unique attribute that the style selector will target.
				this.setAttribute(id, '')

				// TODO Instead of creating one style element per custom
				// element, we can add the styles to a single style element. We
				// can use the CSS OM instead of innerHTML to make it faster
				// (but innerHTML is nice for dev mode, so allow option for
				// both).
				const dynamicStyle = (this.__dynammicStyle = document.createElement('style'))

				dynamicStyle.id = id
				dynamicStyle.innerHTML = dynamicCSS.replace(':host', `[${id}]`)

				const rootNode = this.getRootNode()

				this.__styleRootNode = ((rootNode === document ? document.head : rootNode) as unknown) as
					| HTMLHeadElement
					| ShadowRoot

				this.__styleRootNode.appendChild(dynamicStyle)
			}
		}
	}

	private static __elementId = 0
	private __id = Element.__elementId++
	private __dynammicStyle: HTMLStyleElement | null = null

	private __cleanupStyle() {
		do {
			if (this.__hasShadow) break

			const refCountPerTagName = Element.__styleRootNodeRefCountPerTagName.get(this.__styleRootNode!)

			if (!refCountPerTagName) break

			let refCount = refCountPerTagName[this.tagName]

			if (refCount === undefined) break

			refCountPerTagName[this.tagName] = --refCount

			if (refCount === 0) {
				delete refCountPerTagName[this.tagName]

				// TODO PERF maybe we can improve performance by saving the style
				// instance, instead of querying for it.
				const style = this.__styleRootNode!.querySelector('#' + this.tagName)
				style?.remove()
			}
		} while (false)

		if (this.__dynammicStyle) this.__dynammicStyle.remove()
	}

	// not used currently, but we'll leave this here so that child classes can
	// call super, and that way we can add an implementation later when needed.
	adoptedCallback() {}
}

/**
 * A class decorator that defines the target class as a custom element with the
 * given `tagName`. The `tagName` must contain a hyphen, as per standard Custom
 * Element rules.
 */
// eslint-disable-next-line typescript/explicit-function-return-type
export function element(tagName: string) {
	return function(classOrClassElement: any): any {
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

type AttributeHandler = {
	// TODO `to` handler currently does nothing. If it is present, then prop
	// changes should reflect back to the attribute. In most cases, this is
	// undesirable (for performance).
	to?: (prop: unknown) => string | null
	from?: (v: string | null) => unknown
}

/**
 * A property or accessor decorator that maps an HTML attribute with the
 * dash-case version of the property, to the property. For example, if the
 * attribute decorator is used on a property called firstName, then the
 * property will be mapped to an attribute called first-name. Any time that the
 * attribute value changes (f.e. with setAttribute), then the property will
 * have this value set onto it.
 */
export function attribute(
	prototype: any /*CustomElementPrototype*/,
	propName: string,
	descriptor?: PropertyDescriptor,
): any
export function attribute(handler?: AttributeHandler): (proto: any, propName: string) => any
export function attribute(handlerOrProto?: any, propName?: string, descriptor?: PropertyDescriptor): any {
	// This is true only if we're using the decorator in a Babel-compiled app
	// with non-legacy decorators. TypeScript only has legacy decorators.
	const isDecoratorV2 = handlerOrProto && 'kind' in handlerOrProto

	if (isDecoratorV2) {
		const classElement = handlerOrProto

		return {
			...classElement,
			finisher(Class: Constructor) {
				_attribute(Class.prototype, classElement.key)
				return classElement.finisher?.(Class) ?? Class
			},
		}
	}

	if (handlerOrProto && propName) {
		// if being used as a legacy decorator directly
		const prototype = handlerOrProto
		return _attribute(prototype, propName, descriptor)
	}

	// `attribute` is being used as a decorator factory, possibly being passed a
	// handler, like `@attribute({...})`

	const handler = handlerOrProto

	return (protoOrClassElement: any, propName?: string, descriptor?: PropertyDescriptor): any => {
		// This is true only if we're using the decorator in a Babel-compiled app
		// with non-legacy decorators. TypeScript only has legacy decorators.
		const isDecoratorV2 = protoOrClassElement && 'kind' in protoOrClassElement

		if (isDecoratorV2) {
			const classElement = protoOrClassElement

			return {
				...classElement,
				finisher(Class: Constructor) {
					_attribute(Class.prototype, classElement.key, undefined, handler)
					return classElement.finisher?.(Class) ?? Class
				},
			}
		}

		return _attribute(protoOrClassElement, propName!, descriptor, handler)
	}
}

// TODO Do similar as with the following attributeChangedCallback prototype
// patch, but also with (dis)connected callbacks which can call an instance's
// template method, so users don't have to extend from the Element base class.
// Extending from the Element base class will be the method that non-decorator
// users must use.

function _attribute(
	prototype: any /*CustomElementPrototype*/,
	propName: string,
	descriptor?: PropertyDescriptor,
	attributeHandler?: AttributeHandler,
): any {
	const ctor = prototype.constructor as typeof Element

	if (!prototype.__hasAttributeChangedCallback) {
		prototype.__hasAttributeChangedCallback = true

		const originalAttrChanged = prototype.attributeChangedCallback

		prototype.attributeChangedCallback = function(attr: string, oldVal: string | null, newVal: string | null) {
			// If the class already has an attributeChangedCallback, let is run,
			// and let is call or not call super.attributeChangedCallback.
			if (originalAttrChanged) {
				originalAttrChanged.call(this, attr, oldVal, newVal)
			}
			// Otherwise, let's not intentionally break inheritance and be sure
			// we call the super method (if it exists).
			else {
				// This is equivalent to `super.attributeChangedCallback?()`
				prototype.__proto__?.attributeChangedCallback?.call(this, attr, oldVal, newVal)
			}

			// map from attribute to property
			const prop = this.__attributesToProps && this.__attributesToProps[attr]

			if (prop) {
				const handler = prop.attributeHandler
				this[prop.name] = handler && handler.from ? handler.from(newVal) : newVal
			}
		}
	}

	if (!ctor.hasOwnProperty('observedAttributes')) {
		Object.defineProperty(ctor, 'observedAttributes', {
			// read the super value just in case there is one.
			value: [...(ctor.observedAttributes || [])],
			writable: true,
			configurable: true,
			enumerable: true,
		})
	}

	const attrName = camelCaseToDash(propName)

	if (!ctor.observedAttributes!.includes(attrName)) ctor.observedAttributes!.push(attrName)

	mapAttributeToProp(ctor, attrName, propName, attributeHandler)

	if (descriptor) return descriptor
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
				// prettier-ignore
				__proto__: ctor.prototype.
					// @ts-ignore, private access
					__attributesToProps
						|| Object.prototype
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

/**
 * A no-op (identity) template tag useful for marking CSS strings for syntax
 * highlighting. For example:
 *
 * ```js
 * const style = css`
 *   .el {
 *     background: skyblue;
 *   }
 * `
 * ```
 */
export const css = identityTemplateTag

// This is TypeScript-specific. Eventually Hegel would like to have better
// support for JSX. We'd need to figure how to supports types for both systems.
type JSXOrDOM = JSX.Element | globalThis.Element
type TemplateContent = JSXOrDOM | JSXOrDOM[]
type Template = TemplateContent | (() => TemplateContent)

export function numberAttribute(defaultValue: number) {
	return attribute({from: str => (str == null ? defaultValue : +str)})
}

export function booleanAttribute(defaultValue: boolean) {
	return attribute({from: str => (str == null ? defaultValue : str !== 'false')})
}
