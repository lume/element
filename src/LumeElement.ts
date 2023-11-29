import {render} from 'solid-js/web'
// __isPropSetAtLeastOnce was exposed by classy-solid specifically for
// @lume/element to use. It tells us if a signal property has been set at
// least once, and if so allows us to skip overwriting it with a custom
// element preupgrade value.
import {__isPropSetAtLeastOnce} from 'classy-solid'
import {defer} from './_utils.js'

import type {AttributeHandler} from './attribute'
import type {DashCasedProps} from './_utils'

// TODO `templateMode: 'append' | 'replace'`, which allows a subclass to specify
// if template content replaces the content of `root`, or is appended to `root`.

let ctor: typeof LumeElement

const HTMLElement =
	globalThis.HTMLElement ??
	class HTMLElement {
		constructor() {
			throw new Error(
				"@lume/element needs a DOM to operate with! If this code is running during server-side rendering, it means your app is trying to instantiate elements when it shouldn't be, and should be refactored to avoid doing that when no DOM is present.",
			)
		}
	}

// TODO Make LumeElement `abstract`

class LumeElement extends HTMLElement {
	/**
	 * The default tag name of the elements this class instantiates. When using
	 * the `@element` decorator, this property will be set to the value defined
	 * by the decorator.
	 */
	static elementName: string = ''

	/**
	 * Define this class for the given element `name`, or using its default name
	 * (`elementName`) if no `name` given. Defaults to using the global
	 * `customElements` registry unless another registry is provided (for
	 * example a ShadowRoot-scoped registry).
	 *
	 * If a `name` is given, then the class will be extended with an empty
	 * subclass so that a new class is used for each new name, because otherwise
	 * a CustomElementRegistry does not allow the same exact class to be used
	 * more than once regardless of the name.
	 *
	 * @returns Returns the defined element class, which is only going to be a
	 * different subclass of the class this is called on if passing in a custom
	 * `name`, otherwise returns the same class this is called on.
	 */
	static defineElement(name?: string, registry: CustomElementRegistry = customElements): typeof LumeElement {
		if (!name) {
			name = this.elementName
			if (registry.get(name)) {
				console.warn(`defineElement(): An element class was already defined for tag name ${name}.`)
				return this
			}
			registry.define(name, this)
			return this
		} else {
			if (registry.get(name)) {
				console.warn(`defineElement(): An element class was already defined for tag name ${name}.`)
				return this
			} else {
				// Allow the same element to be defined more than once using
				// alternative names.
				const Class = class extends this {}
				Class.elementName = name
				registry.define(name, Class)
				return Class
			}
		}
	}

	/** Non-decorator users can use this to specify attributes, which automatically map to reactive properties. */
	static observedAttributes?: string[] | Record<string, AttributeHandler>

	// Note, this is used in the @attribute decorator, see attribute.ts.
	private declare __attributesToProps?: Record<string, {name: string; attributeHandler?: AttributeHandler}>

	protected declare _preUpgradeValues: Map<PropertyKey, unknown>

	// This property MUST be defined before any other non-static non-declared
	// class properties . Its initializer needs to run before any other
	// properties are defined, in order to detect and handle only instance
	// properties that already exist from custom element pre-upgrade time.
	protected ___init___ = (() => {
		this.__handleInitialPropertyValuesIfAny()

		// TODO Should we handle initial attributes too?
	})()

	private __handleInitialPropertyValuesIfAny() {
		// We need to delete initial value-descriptor properties (if they exist)
		// and store the initial values in the storage for our @signal property
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
		//
		// Assumption: any enumerable own props must've been set on the
		// element before it was upgraded. Builtin DOM properties are
		// not enumerable.

		const preUpgradeKeys = Object.keys(this) as (keyof this)[]
		this._preUpgradeValues = new Map()

		for (const propName of preUpgradeKeys) {
			const descriptor = Object.getOwnPropertyDescriptor(this, propName)!

			// Handle only value descriptors.
			if ('value' in descriptor) {
				// Delete the pre-upgrade value descriptor (1/2)...
				delete this[propName]

				// The @element decorator reads this, and the class finisher
				// will set pre-upgrade values.
				this._preUpgradeValues.set(propName, descriptor.value)

				// NOTE, for classes not decorated with @element, deferring
				// allows preexisting preupgrade values to be handled *after*
				// class fields have been set during Custom Element upgrade
				// construction (otherwise those class fields would override the
				// preupgrade values we're trying to assign here).
				defer(() => {
					const propSetAtLeastOnce = __isPropSetAtLeastOnce(this, propName as string | symbol)

					// ... (2/2) and re-assign the value so that it goes through
					// a @signal accessor that got defined, or through an
					// inherited accessor that the preupgrade value shadowed.
					//
					// If the property has been set between the time LumeElement
					// constructor ran and the deferred microtask, then we don't
					// overwrite the property's value with the pre-upgrade value
					// because it has already been intentionally set to a
					// desired value post-construction.
					// (NOTE: Avoid setting properties in constructors because
					// that will set the signals at least once. Instead,
					// override with a new @attribute or @signal class field.)
					//
					// AND we handle inherited props or signal props only
					// (because that means there may be an accessor that needs
					// the value to be passed in). The @element decorator otherwise
					// handles non-inherited props before construction
					// finishes. {{
					if (propSetAtLeastOnce) return

					const inheritsProperty = propName in (this as any).__proto__
					if (inheritsProperty) this[propName] = descriptor.value
					// }}
				})
			} else {
				// We assume a getter/setter descriptor is intentional and meant
				// to override or extend our getter/setter so we leave those
				// alone. The user is responsible for ensuring they either
				// override, or extend, our accessor with theirs.
			}
		}
	}

	/**
	 * If a subclass provides this, it should return DOM. It is called with
	 * Solid.js `render()`, so it can also contain Solid.js reactivity (signals
	 * and effects) and templating (DOM-returning reactive JSX or html template
	 * literals).
	 */
	protected declare template?: Template

	/**
	 * If provided, this style gets created once per ShadowRoot of each element
	 * instantiated from this class. The expression can access `this` for string
	 * interpolation.
	 */
	protected declare css?: string | (() => string)

	/**
	 * If provided, this style gets created a single time for all elements
	 * instantiated from this class, instead of once per element. If you do not
	 * need to interpolate values into the string using `this`, then use this
	 * static property for more performance compared to the instance property.
	 */
	protected declare static css?: string | (() => string)

	/**
	 * When `true`, the custom element will have a `ShadowRoot`. Set to `false`
	 * to not use a `ShadowRoot`. When `false`, styles will not be scoped via
	 * the built-in `ShadowRoot` scoping mechanism, but by a much more simple
	 * shared style sheet placed at the nearest root node, with `:host`
	 * selectors converted to tag names.
	 */
	readonly hasShadow: boolean = true

	private __root: Node | null = null

	/**
	 * Subclasses can override this to provide an alternate Node to render into
	 * (f.e. a subclass can `return this` to render into itself instead of
	 * making a root) regardless of the value of `hasShadow`.
	 */
	protected get root(): Node {
		if (!this.hasShadow) return this
		if (this.__root) return this.__root
		if (this.shadowRoot) return (this.__root = this.shadowRoot)
		// TODO use `this.attachInternals()` (ElementInternals API) to get the root instead.
		return (this.__root = this.attachShadow({mode: 'open'}))
	}
	protected set root(v: Node) {
		if (!this.hasShadow) throw new Error('Can not set root, element.hasShadow is false.')
		// @prod-prune
		if (this.__root || this.shadowRoot) throw new Error('Element root can only be set once if there is no ShadowRoot.')
		this.__root = v
	}

	/**
	 * Define which `Node` to append style sheets to when `hasShadow` is `true`.
	 * Defaults to the `this.root`, which in turn defaults to the element's
	 * `ShadowRoot`.  When `hasShadow` is `true`, an alternate `styleRoot` is
	 * sometimes needed for styles to be appended elsewhere than the root. For
	 * example, return some other `Node` within the root to append styles to.
	 * This is ignored if `hasShadow` is `false`.
	 *
	 * This can be useful for fixing issues where the default append of a style
	 * sheet into the `ShadowRoot` conflicts with how DOM is created in
	 * `template` (f.e.  if the user's DOM creation in `template` clears the
	 * `ShadowRoot` content, or etc, then we want to place the stylesheet
	 * somewhere else).
	 */
	protected get styleRoot(): Node {
		return this.root
	}

	attachShadow(options: ShadowRootInit) {
		if (this.__root) console.warn('Element already has a root defined.')
		return (this.__root = super.attachShadow(options))
	}

	private declare __dispose?: () => void

	connectedCallback() {
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

	attributeChangedCallback?(name: string, oldVal: string | null, newVal: string | null): void

	private static __styleRootNodeRefCountPerTagName = new WeakMap<Node, Record<string, number>>()
	private __styleRootNode: HTMLHeadElement | ShadowRoot | null = null

	#defaultHostStyle = (hostSelector: string) => /*css*/ `${hostSelector} {
		display: block;
	}`

	private __setStyle() {
		ctor = this.constructor as typeof LumeElement
		const staticCSS = typeof ctor.css === 'function' ? (ctor.css = ctor.css()) : ctor.css || ''
		const instanceCSS = typeof this.css === 'function' ? this.css() : this.css || ''

		if (this.hasShadow) {
			const hostSelector = ':host'
			const staticStyle = document.createElement('style')

			staticStyle.innerHTML = `
				${this.#defaultHostStyle(hostSelector)}
				${staticCSS}
				${instanceCSS}
			`

			// If this element has a shadow root, put the style there. This is the
			// standard way to scope styles to a component.

			this.styleRoot.appendChild(staticStyle)

			// TODO use adoptedStyleSheets when that is supported by FF and Safari
		} else {
			// When this element doesn't have a shadow root, then we want to append the
			// style only once to the rootNode where it lives (a ShadoowRoot or
			// Document). If there are multiple of this same element in the rootNode,
			// then the style will be added only once and will style all the elements
			// in the same rootNode.

			// Because we're connected, getRootNode will return either the
			// Document, or a ShadowRoot.
			const rootNode = this.getRootNode()

			this.__styleRootNode = rootNode === document ? document.head : (rootNode as ShadowRoot)

			let refCountPerTagName = LumeElement.__styleRootNodeRefCountPerTagName.get(this.__styleRootNode)
			if (!refCountPerTagName)
				LumeElement.__styleRootNodeRefCountPerTagName.set(this.__styleRootNode, (refCountPerTagName = {}))
			const refCount = refCountPerTagName[this.tagName] || 0
			refCountPerTagName[this.tagName] = refCount + 1

			if (refCount === 0) {
				const hostSelector = this.tagName.toLowerCase()
				const staticStyle = document.createElement('style')

				staticStyle.innerHTML = `
					${this.#defaultHostStyle(hostSelector)}
					${staticCSS ? staticCSS.replaceAll(':host', hostSelector) : staticCSS}
				`

				staticStyle.id = this.tagName.toLowerCase()

				this.__styleRootNode.appendChild(staticStyle)
			}

			if (instanceCSS) {
				// For dynamic per-instance styles, make one style element per
				// element instance so it contains that element's unique styles,
				// associated to a unique attribute selector.
				const id = this.tagName.toLowerCase() + '-' + this.__id

				// Add the unique attribute that the style selector will target.
				this.setAttribute(id, '')

				// TODO Instead of creating one style element per custom
				// element, we can add the styles to a single style element. We
				// can use the CSS OM instead of innerHTML to make it faster
				// (but innerHTML is nice for dev mode because it shows the
				// content in the DOM when looking in element inspector, so
				// allow option for both).
				const instanceStyle = (this.__dynamicStyle = document.createElement('style'))

				instanceStyle.id = id
				instanceStyle.innerHTML = instanceCSS.replaceAll(':host', `[${id}]`)

				const rootNode = this.getRootNode()

				this.__styleRootNode = rootNode === document ? document.head : (rootNode as ShadowRoot)

				this.__styleRootNode.appendChild(instanceStyle)
			}
		}
	}

	private static __elementId = 0
	private __id = LumeElement.__elementId++
	private __dynamicStyle: HTMLStyleElement | null = null

	private __cleanupStyle() {
		do {
			if (this.hasShadow) break

			const refCountPerTagName = LumeElement.__styleRootNodeRefCountPerTagName.get(this.__styleRootNode!)

			if (!refCountPerTagName) break

			let refCount = refCountPerTagName[this.tagName]

			if (refCount === undefined) break

			refCountPerTagName[this.tagName] = --refCount

			if (refCount === 0) {
				delete refCountPerTagName[this.tagName]

				// TODO PERF Improve performance by saving the style
				// instance on a static var, instead of querying for it.
				const style = this.__styleRootNode!.querySelector('#' + this.tagName)
				style?.remove()
			}
		} while (false)

		if (this.__dynamicStyle) this.__dynamicStyle.remove()
	}

	// not used currently, but we'll leave this here so that child classes can
	// call super, and that way we can add an implementation later when needed.
	adoptedCallback() {}
}

// TODO rename the export to LumeElement in a breaking version bump.
export {LumeElement as Element}

// This is TypeScript-specific. Eventually Hegel would like to have better
// support for JSX. We'd need to figure how to supports types for both systems.
import type {JSX} from './jsx-runtime'
type JSXOrDOM = JSX.Element | globalThis.Element
type TemplateContent = JSXOrDOM | JSXOrDOM[]
type Template = TemplateContent | (() => TemplateContent)

/**
 * A helper for defining the JSX types of an element's attributes.
 *
 * You give it your element class and a list of properties (a string
 * union type), and it outputs a type with those properties being
 * optional and dash-cased. The output object also contains all the
 * built-in HTML attributes. You can then augment the
 * JSX.IntrinsicElements definition with the attributes for your element.
 *
 * For example, you would do the following so that your element's attribute
 * are available and type checked in the JSX of any consumers:
 *
 * ```js
 * import {Element, attribute, numberAttribute, element, ElementAttributes} from '@lume/element'
 *
 * ⁣@element('cool-element')
 * class CoolElement extends Element {
 *   ⁣@attribute foo: string | null = null
 *   ⁣@attribute bar: string | null = 'bar'
 *   ⁣@numberAttribute(123) loremIpsum = 123
 * }
 *
 * declare module 'solid-js' {
 *   namespace JSX {
 *     interface IntrinsicElements {
 *       'cool-element': ElementAttributes<CoolElement, 'foo' | 'bar'>
 *     }
 *   }
 * }
 * ```
 *
 * The result is that TypeScript will properly type-check the following
 * JSX expression (notice lorem-ipsum is dash-case):
 *
 * ```jsx
 * let coolEl = <cool-element foo={'foo'} bar={null} lorem-ipsum={456}></cool-element>
 * ```
 */
export type ElementAttributes<
	ElementType,
	SelectedProperties extends keyof ElementType,
	AdditionalProperties extends object = {},
> = WithStringValues<DashCasedProps<Partial<Pick<ElementType, SelectedProperties>>>> &
	AdditionalProperties &
	Omit<JSX.HTMLAttributes<ElementType>, SelectedProperties | keyof AdditionalProperties>

type WithStringValues<Type extends object> = {
	[Property in keyof Type]: Type[Property] extends string ? Type[Property] : Type[Property] | string
}
