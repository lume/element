import {render} from '@lume/variable'
import {Constructor} from 'lowclass'

let ctor: typeof Element

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

					if ('value' in descriptor) {
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

	protected connectedCallback() {
		this.__hasShadow = this.root instanceof ShadowRoot

		this.__setStyle()

		const template = this.template

		// TODO This needs testing to ensure it works with DOM or the result of JSX alike.
		if (template)
			this.__dispose = render(typeof template === 'function' ? template.bind(this) : () => template, this.root)
	}

	protected disconnectedCallback() {
		this.__dispose && this.__dispose()

		this.__cleanupStyle()
	}

	private static __rootNodeRefCountPerTagName = new WeakMap<Node, Record<string, number>>()

	private __setStyle() {
		const hostSelector = this.__hasShadow ? ':host' : this.tagName.toLowerCase()

		const style = document.createElement('style')

		ctor = this.constructor as typeof Element

		style.innerHTML = `
			${hostSelector} {
				display: block;
				${this.elementStyle ? this.elementStyle() : ''}
			}

			${typeof ctor.css === 'function' ? (ctor.css = ctor.css()) : ctor.css || ''}
			${typeof this.css === 'function' ? this.css() : this.css || ''}
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

	protected attributeChangedCallback(attr: string, _oldVal: string | null, newVal: string | null) {
		_attrChanged(this, attr, _oldVal, newVal)
	}
}

function _attrChanged(self: Element, attr: string, _oldVal: string | null, newVal: string | null) {
	// map from attribute to property
	// @ts-ignore private access
	const prop = self.__attributesToProps && self.__attributesToProps[attr]

	if (prop) {
		const handler = prop.attributeHandler
		;(self as any)[prop.name] = handler && handler.from ? handler.from(newVal) : newVal
	}
}

/**
 * A class decorator that defines the target class as a custom element with the
 * given `tagName`. The `tagName` must contain a hyphen, as per standard Custom
 * Element rules.
 */
// eslint-disable-next-line typescript/explicit-function-return-type
export function element(tagName: string) {
	return function<C extends Constructor<HTMLElement>>(Ctor: C): C {
		customElements.define(tagName, Ctor)
		return Ctor
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
export function attribute(handlerOrProto: any, propName?: string, descriptor?: PropertyDescriptor): any {
	if (handlerOrProto && propName) {
		// if being used as a decorator directly
		const prototype = handlerOrProto
		return _attribute(prototype, propName, descriptor)
	} else {
		// if being used as a decorator factory
		return (proto: any, propName: string, descriptor?: PropertyDescriptor): any => {
			const handler = handlerOrProto
			return _attribute(proto, propName, descriptor, handler)
		}
	}
}

// TODO Do similar as with the following attributeChangedCallback prototype
// patch, but also with (dis)connected callbacks which can call an instance's
// template method, so users don't have to extend from the Element base class.
// Extnding from the Element base class will be the method that non-decorator
// users must use.
// TODO Document both decorator and non-decorator usages.

function _attribute(
	prototype: any /*CustomElementPrototype*/,
	propName: string,
	descriptor: PropertyDescriptor | undefined,
	attributeHandler?: AttributeHandler,
): any {
	const ctor = prototype.constructor as typeof Element

	if (!prototype.__hasAttributeChangedCallback) {
		prototype.__hasAttributeChangedCallback = true
		prototype.attributeChangedCallback = function(attr: string, oldVal: string | null, newVal: string | null) {
			// equivalent to super.attributeChangedCallback?()
			prototype.__proto__ &&
				prototype.__proto__.attributeChangedCallback &&
				prototype.__proto__.attributeChangedCallback.call(this, attr, oldVal, newVal)

			_attrChanged(this, attr, oldVal, newVal)
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
				__proto__:
					ctor.prototype.
						// @ts-ignore, private access
						__attributesToProps ||
							Object.prototype
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

/**
 * Execute the given `func`tion on the next micro "tick" of the JS engine.
 */
export function defer(func: () => unknown): Promise<unknown> {
	// "defer" is used as a semantic label for Promise.resolve().then
	return Promise.resolve().then(func)
}

/**
 * This is an identity "template string tag function", which hen applied to a
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

// This is the actual DOM Element type, base class for both HTMLElements and SVGElements
type JSXOrDOM = JSX.Element | globalThis.Element
type TemplateContent = JSXOrDOM | JSXOrDOM[]
type Template = TemplateContent | (() => TemplateContent)
