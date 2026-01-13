import './metadata-shim.js'
import {untrack} from 'solid-js'
import {signalify, untracked, isSignalGetter__} from 'classy-solid'
import {getInheritedDescriptor} from 'lowclass/dist/getInheritedDescriptor.js'
import {Element, type AttributeHandlerMap} from '../LumeElement.js'
import {
	classFinishers__,
	setUpAttribute__,
	attributesToProps__,
	type AttributeHandler,
	type AttributePropSpec,
	type AttributeDecoratorMetadata,
} from './attribute.js'
import type {AnyConstructor} from 'lowclass/dist/Constructor.js'
import type {PropKey} from 'classy-solid/dist/decorators/types.js'
import {camelCaseToDash} from '../utils.js'

type PossibleStatics = {
	observedAttributes?: string[]
	observedAttributeHandlers?: AttributeHandlerMap
	elementName?: string
	events?: string[]
	__proto__: PossibleStatics // used in attribute.ts
}
export type ElementCtor = typeof Element & PossibleStatics

const isAttributeHandler = Symbol('isAttributeHandler')

export interface ElementDecoratorOptions {
	elementName?: string
	autoDefine?: boolean
}

type ElementClassDecorator = <T extends AnyConstructor<HTMLElement>>(Class: T, context?: ClassDecoratorContext) => T

/**
 * A class decorator that defines the target class as a custom element with the
 * given `tagName`. The `tagName` must contain a hyphen, as per standard Custom
 * Element rules.
 *
 * If called with a name, it defines a custom element with that name automatically:
 *
 * ```js
 * ⁣@element('cool-element')
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
 * ⁣@element('cool-element', false)
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
 * however the decorator is still needed for key functionality.
 * To accomplish this, call it with `autoDefine` set to false,
 *
 * ```js
 * ⁣@element({ autoDefine: false })
 * class CoolElement extends HTMLElement {
 *   // ...
 * }
 * ```
 * or
 * ```js
 * ⁣@element('', false)
 * class CoolElement extends HTMLElement {
 *   // ...
 * }
 * ```
 * Then you can manually define the element later with a name of your choosing:
 * ```js
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
 * If you call it with an empty string, an empty options object, or as a
 * decorator directly, it will fall back to using the class name as the element
 * name:
 *
 * ```js
 * ⁣@element('')
 * class CoolElement extends HTMLElement {...}
 *
 * // is the same as
 *
 * ⁣@element()
 * class CoolElement extends HTMLElement {...}
 *
 * // is the same as
 *
 * ⁣@element
 * class CoolElement extends HTMLElement {...}
 *
 * // is the same as
 *
 * ⁣@element('cool-element')
 * class CoolElement extends HTMLElement {...}
 *
 * // is the same as
 *
 * ⁣@element
 * class CoolElement extends HTMLElement {
 *   static elementName = 'cool-element'
 * }
 *
 * // is the same as
 *
 * ⁣@element({ elementName: 'cool-element' })
 * class CoolElement extends HTMLElement {...}
 *
 * // is the same as
 *
 * @element('', false)
 * class CoolElement extends HTMLElement {...}
 * customElements.define('cool-element', CoolElement)
 *
 * // is the same as
 *
 * @element('', false)
 * class CoolElement extends HTMLElement {...}
 * CoolElement.defineElement('cool-element')
 *
 * // is the same as
 *
 * @element({autoDefine: false})
 * class CoolElement extends HTMLElement {
 *   static elementName = 'cool-element'
 * }
 * CoolElement.defineElement()
 * ```
 *
 * If using `@attribute` decorators, make sure `@element` is the first
 * decorator applied to the class so that it can set up the attributes
 * properly.
 *
 * @param tagName - The custom element name to define the class as.
 * @param autoDefine - If `true`, the element will be defined automatically
 * when the class is declared. If `false`, you must manually call
 *
 */
export function element(tagName: string, autoDefine?: boolean): ElementClassDecorator
/**
 * @param Class - The class to decorate.
 * @param context - The decorator context.
 */
export function element<T extends AnyConstructor<HTMLElement>>(Class: T, context?: ClassDecoratorContext): T
/**
 * @param options - Options object.
 */
export function element(options: ElementDecoratorOptions): ElementClassDecorator
/**
 * @param tagNameOrClassOrOptions - Either the tag name to define the element as, or
 * the class to decorate, or an options object.
 * @param autoDefineOrContext - Either whether to auto-define the element,
 * or the decorator context if the first arg was the class.
 */
export function element(
	tagNameOrClassOrOptions?: string | ElementDecoratorOptions | AnyConstructor<HTMLElement>,
	autoDefineOrContext?: boolean | ClassDecoratorContext,
): any {
	// when called as a decorator factory with tagName and autoDefine, f.e. `@element('my-el') class MyEl ...` or `element('my-el', false)(class MyEl ...)`
	if (typeof tagNameOrClassOrOptions === 'string') {
		const elementName = tagNameOrClassOrOptions
		const autoDefine = !!(autoDefineOrContext ?? true)
		return (Class: AnyConstructor<HTMLElement>, context: ClassDecoratorContext) =>
			applyElementDecoration(Class as ElementCtor, context, {elementName, autoDefine})
	}

	// when called as a decorator factory with or without an options object, f.e. `@element() class MyEl ...` or `@element({tagName: 'my-el'}) class MyEl ...` or `element({tagName: 'my-el', autoDefine: false})(class MyEl ...)`
	if (!tagNameOrClassOrOptions || typeof tagNameOrClassOrOptions === 'object') {
		return (Class: AnyConstructor<HTMLElement>, context: ClassDecoratorContext) =>
			applyElementDecoration(Class as ElementCtor, context, tagNameOrClassOrOptions)
	}

	// Otherwise called as a decorator, f.e. `@element class MyEl ...` or `element(class MyEl ...)`
	const Class = tagNameOrClassOrOptions
	const context = autoDefineOrContext as DecoratorContext | undefined
	return applyElementDecoration(Class as ElementCtor, context)
}

function applyElementDecoration(
	Class: ElementCtor,
	context: DecoratorContext | undefined,
	options?: ElementDecoratorOptions,
): any {
	if (typeof Class !== 'function' || (context && context.kind !== 'class'))
		throw new Error('@element is only for use on classes.')

	const usedAsDecorator = !!context

	const metadata = context?.metadata as AttributeDecoratorMetadata | undefined // context may be undefined with plain-JS element() usage.
	// Check only own metadata.noSignal, we don't want to use the one inherited from a base class.
	const noSignal = (metadata && Object.hasOwn(metadata, 'noSignal') && metadata.noSignal) || undefined

	const attrs = Class.observedAttributes

	if (Array.isArray(attrs)) {
		// Nothing to do here: either the user provided a regular
		// observedAttributes array like with plain Custom Elements, or
		// they used our decorators which happen to create the array for
		// them.
	} else if (attrs && typeof attrs === 'object') {
		// When we're not using decorators, our users have the option to provide
		// an observedAttributes object (instead of the usual array) to specify
		// attribute types (deprecated, use observedAttributeHandlers instead).
		// In this case, we need to track the types, and convert
		// observedAttributes to an array so the browser will understand it like
		// usual.

		// Delete it, so that it will be re-created as an array by the
		// following __setUpAttribute calls.
		Class.observedAttributes = undefined

		const stack = new Error().stack
		console.warn(
			'Defining the static observedAttributes property as a map of attribute names to attribute handlers is now deprecated, please use the static observedAttributeHandlers property to define the map instead.\n' +
				stack,
		)

		const _attrs = attrs as AttributeHandlerMap

		for (const prop in _attrs) {
			const handler = _attrs[prop]!
			const attrName = (handler.name ?? (handler.dashcase === false ? prop : camelCaseToDash(prop))).toLowerCase()
			setUpAttribute__(Class, attrName, prop, handler)
		}
	}

	const handlers = Object.hasOwn(Class, 'observedAttributeHandlers') ? Class.observedAttributeHandlers : undefined

	if (handlers) {
		for (const [prop, handler] of Object.entries(handlers)) {
			const attrName = (handler.name ?? (handler.dashcase === false ? prop : camelCaseToDash(prop))).toLowerCase()
			setUpAttribute__(Class, attrName, prop, handlers[prop]!)
		}
	}

	// @prod-prune
	queueMicrotask(() => {
		// If mixing @element with static observedAttributeHandlers, warn the user.
		const handlers2 = Object.hasOwn(Class, 'observedAttributeHandlers') ? Class.observedAttributeHandlers : undefined
		if (usedAsDecorator && !handlers && handlers2) {
			console.warn(
				`When using 'static observedAttributeHandlers' do not use the 'element' function as a decorator, instead call it as a plain function, otherwise 'static observedAttributeHandlers' will not handled because class static fields are initialized after class decorators.`,
			)
		}
	})

	const Untracked: ElementCtor = untracked(Class, context)

	class ElementDecorated extends Untracked {
		constructor(...args: any[]) {
			// @ts-expect-error we don't know what the user's args will be, just pass them all.
			super(...args)

			// Untrack to be sure we don't cause dependencies during creation of
			// objects (super() is already untracked by the reactive decorator).
			untrack(() => {
				const handlerKeys = Object.keys(Class.observedAttributeHandlers ?? {})
				for (const prop of handlerKeys) {
					const fieldDesc = Object.getOwnPropertyDescriptor(this, prop)
					const protoDesc = Object.getOwnPropertyDescriptor(Class.prototype, prop)

					// The decorated property is either on the instance (field), or the decorated class's prototype (getter/setter).
					if (!(fieldDesc ?? protoDesc)) descriptorError(prop)
				}

				const leafAttrsToProps = this[attributesToProps__] ?? {}
				const protoInheritedAttrsToProps = ElementDecorated.prototype[attributesToProps__] ?? {}
				const protoOwnAttrsToProps =
					Object.getOwnPropertyDescriptor(ElementDecorated.prototype, attributesToProps__)?.value ?? {}

				// Handle only props for the current class, not super classes
				// (when using the decorator syntax, not observedAttributeHandlers).
				if (!Class.observedAttributeHandlers && protoInheritedAttrsToProps !== protoOwnAttrsToProps) return

				// We're using Object.values here for *own* properties so
				// we handle properties of the current decorated class (not
				// of the super classes).
				const protoPropSpecKeys = Object.keys(protoInheritedAttrsToProps)

				// This is signalifying any attribute props that may have been
				// defined in `static observedAttributes` or `static
				// observedAttributeHandlers` rather than with an attribute
				// decorator (which composes `@signal`), so that we also cover
				// non-decorator usage until native decorators are out.
				//
				// Note, `signalify()` returns early if a property was already
				// signalified by @attribute (@signal), so this isn't going to
				// double-signalify.
				//
				// TODO: Once native decorators are out, remove this, and remove
				// non-decorator usage because everyone will be able to use
				// decorators. We can also then delete `noSignal` from `metadata`
				// here in the class as it is no longer needed at class
				// instantiation time.
				//
				// Having to duplicate keys in observedAttributes as well as class
				// fields is more room for human error, so it'll be nice to remove
				// non-decorator usage.
				// (Set up only the current class's props, subclasses will subsequently set up their own.)
				for (const key of protoPropSpecKeys) {
					const propSpec = leafAttrsToProps[key]!
					const prop = propSpec.name as keyof this
					const useSignal = !noSignal?.has(prop as PropKey)

					if (!useSignal) continue

					const fieldDesc = Object.getOwnPropertyDescriptor(this, prop)
					const isField = !!fieldDesc
					// const isAutoAccessor = prop === 'ontestevent'
					// const protoDesc = isAutoAccessor
					// 	? getInheritedDescriptor(Class.prototype, prop as keyof Element)
					// 	: Object.getOwnPropertyDescriptor(Class.prototype, prop)
					const protoDesc = getInheritedDescriptor(Class.prototype, prop as keyof Element)

					// The decorated property is either on the instance (field), or the decorated class's prototype (getter/setter).
					let descriptor = fieldDesc ?? protoDesc
					if (!descriptor) descriptorError(prop)

					const {get, set} = descriptor
					if (get && isSignalGetter__.has(get)) continue

					const isAccessor = !!(descriptor && (get || set))
					const initialValue = isAccessor && get ? get.call(this) : this[prop]

					signalify(isField ? this : (Class.prototype as this), [prop, initialValue as unknown] as const)
				}

				// Intercept JS values to run attribute handlers.
				// (Set up only the current class's props, subclasses will subsequently set up their own.)
				for (const key of protoPropSpecKeys) {
					const leafPropSpec = leafAttrsToProps[key]!
					const protoPropSpec = protoInheritedAttrsToProps[key]!

					// `key` may be some-prop while `prop` will be someProp
					const prop = protoPropSpec.name as keyof this
					const leafHandler = leafPropSpec.attributeHandler
					const protoHandler = protoPropSpec.attributeHandler

					if (!protoHandler || !leafHandler) {
						console.warn(`Attribute handler missing for property "${String(prop)}".`)
						continue
					}

					const fieldDesc = Object.getOwnPropertyDescriptor(this, prop)
					const isField = !!fieldDesc
					// const isAutoAccessor = prop === 'ontestevent'
					// const protoDesc = isAutoAccessor
					// 	? getInheritedDescriptor(Class.prototype, prop as keyof Element)
					// 	: Object.getOwnPropertyDescriptor(Class.prototype, prop)
					const protoDesc = getInheritedDescriptor(Class.prototype, prop as keyof Element)

					// The decorated property is either on the instance (field), or the decorated class's prototype (getter/setter).
					let descriptor = fieldDesc ?? protoDesc
					if (!descriptor) descriptorError(prop)

					const {get, set, writable} = descriptor
					const isAccessor = !!(get || set)

					if ((isAccessor && !set) || (!isAccessor && !writable))
						throw new Error(`An attribute decorator cannot be used on readonly property "${String(prop)}".`)

					// TODO the initial value shouldn't come from this[prop], it
					// should come from the attribute initializer, but for now
					// we have things working well enough.
					const initialValue = isAccessor && get ? get.call(this) : this[prop]

					// Default values for fields are handled in their initializer,
					// and this catches default values for getters/setters.
					if (!('default' in protoPropSpec))
						protoPropSpec.default = 'default' in protoHandler ? protoHandler.default : initialValue

					protoHandler.sideEffect?.(this, prop as string, initialValue)

					let storage: symbol | undefined

					// We check if we have an non-field accessor, because
					// sometimes we don't if the property is not signalified
					// (f.e. if `@attribute @noSignal` was used, then we have a
					// regular field.), and sometimes we have a field that's
					// already been converted into an attribute handler from a
					// super class but a subclass handler will override it.
					if (isAccessor) {
						// Re-use an existing attribute handler if detected.
						if ((set as any)?.[isAttributeHandler]) continue
					} else {
						// We must be patching a field

						storage = Symbol('attributeHandlerStorage:' + String(prop))
						// @ts-expect-error indexed access with symbol
						this[storage] = this[prop]
					}

					const location = isField ? this : Class.prototype

					type IsHandler = {[isAttributeHandler]: boolean}
					type HandlerGetter = IsHandler & {(): unknown}
					type HandlerSetter = IsHandler & {(v: unknown): void}

					const newGetter = isAccessor
						? (get as HandlerGetter | undefined)
						: (function (this: Element) {
								// @ts-expect-error indexed access with symbol
								return this[storage!]
							} as HandlerGetter)

					const newSetter = isAccessor
						? // function because it will be on the prototype, needs dynamic `this`
							(function (this: Element, value: any) {
								if (typeof value === 'string' || value === null)
									value = handleAttributeValue__(value, leafHandler, leafPropSpec)
								untrack(() => leafHandler.sideEffect?.(this, prop as string, value))
								set!.call(this, value)
							} as HandlerSetter)
						: (function (this: Element, value: any) {
								if (typeof value === 'string' || value === null)
									value = handleAttributeValue__(value, leafHandler, leafPropSpec)
								untrack(() => leafHandler.sideEffect?.(this, prop as string, value))
								// @ts-expect-error indexed access with symbol
								this[storage!] = value
							} as HandlerSetter)

					if (newGetter) newGetter[isAttributeHandler] = true
					newSetter[isAttributeHandler] = true

					Object.defineProperty(location, prop, {
						enumerable: descriptor.enumerable,
						configurable: descriptor.configurable,
						get: newGetter,
						set: newSetter,
					})
				}

				handlePreUpgradeValues(this)
			})
		}
	}

	if (metadata) {
		const count = Object.getOwnPropertyDescriptor(metadata, 'attributeCount')?.value as number | undefined
		const usingDecoratorsAndHasAttrs = count !== undefined

		if (usingDecoratorsAndHasAttrs && count !== classFinishers__.length) {
			throw new Error(
				`Expected ${count} attribute decorators to be applied, but got ${classFinishers__.length}. Make sure the @element decorator is used on any class that also uses @attribute decorators.`,
			)
		}
	}

	const classFinishers = [...classFinishers__]
	classFinishers__.length = 0

	function finishClass() {
		// This needs to be here in the finisher because it will run *after*
		// static class fields (the decorator function itself runs before static
		// class fields are ready).
		Class.elementName = options?.elementName || Class.elementName || camelCaseToDash(Class.name)
		Class.autoDefine = options?.autoDefine ?? Class.autoDefine

		for (const finisher of classFinishers) finisher(ElementDecorated)

		if (Class.elementName && Class.autoDefine)
			// guard against missing DOM API (f.e. SSR)
			globalThis.window?.customElements?.define(Class.elementName, ElementDecorated)
	}

	if (context?.addInitializer) {
		// Use addInitializer to run logic after the class is fully defined
		// (after class static initializers have ran, otherwise the class
		// decorator runs before any static members are initialized)
		context.addInitializer(finishClass)
	} else {
		// For JS without decorator support fall back manually running the
		// initializer because `context` will be `undefined` in that scenario,
		// so there won't be a `context.addInitializer` function to call.
		// In this case all static members are already initialized too.
		//
		// TODO: Once decorators are out natively, deprecate and remove this
		// non-decorator support
		finishClass()
	}

	return ElementDecorated
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
		// or own accessor to operate on it).
		// @ts-expect-error dynamic decorator stuff, has no impact on user types.
		self[key] = value
	}
}

function handleAttributeValue__(value: string | null, handler: AttributeHandler, propSpec: AttributePropSpec) {
	return !handler
		? value
		: value === null // attribute removed
			? propSpec.default
			: handler.from
				? handler.from(value)
				: value
}

function descriptorError(prop: PropertyKey): never {
	throw new TypeError(
		`Missing descriptor for property "${String(
			prop,
		)}" while mapping attributes to properties. Make sure the @element decorator is the first decorator on your element class, and if you're using 'static observedAttributes' or 'static observedAttributeHandlers' make sure you also define the respective class fields for the initial values. If a pre-existing class is already decoratored with other decorators, extend from it, then use @element directly on the subclass.`,
	)
}
