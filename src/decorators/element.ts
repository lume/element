import './metadata-shim.js'
import {untrack} from 'solid-js'
import {reactive, signalify} from 'classy-solid'
import {Element, type AttributeHandlerMap} from '../LumeElement.js'
import {
	__classFinishers,
	__setUpAttribute,
	__attributesToProps,
	type AttributeHandler,
	type AttributePropSpec,
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
 * however the decorator is still needed for key functionality. In
 * this case use the decorator without calling it first, then you can
 * manually define the element in another way as needed:
 *
 * ```js
 * ⁣@element
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
 * ⁣@element('')
 * class CoolElement extends HTMLElement {...}
 *
 * // is the same as
 *
 * ⁣@element
 * class CoolElement extends HTMLElement {...}
 * ```
 */
export function element(tagName: string, autoDefine?: boolean): ElementClassDecorator
export function element<T extends AnyConstructor<HTMLElement>>(Class: T, context?: ClassDecoratorContext): T
export function element(options: ElementDecoratorOptions): ElementClassDecorator
export function element(
	tagNameOrClassOrOptions: string | ElementDecoratorOptions | AnyConstructor<HTMLElement> = {},
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
	if (typeof tagNameOrClassOrOptions === 'object') {
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
	options: ElementDecoratorOptions = {},
): any {
	if (typeof Class !== 'function' || (context && context.kind !== 'class'))
		throw new Error('@element is only for use on classes.')

	const usedAsDecorator = !!context

	const {metadata = {}} = context ?? {} // context may be undefined with plain-JS element() usage.
	// Check only own metadata.noSignal, we don't want to use the one inherited from a base class.
	const noSignal = (Object.hasOwn(metadata, 'noSignal') && (metadata.noSignal as Set<PropKey>)) || undefined

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
			__setUpAttribute(Class, attrName, prop, handler)
		}
	}

	const handlers = Object.hasOwn(Class, 'observedAttributeHandlers') ? Class.observedAttributeHandlers : undefined

	if (handlers) {
		for (const [prop, handler] of Object.entries(handlers)) {
			const attrName = (handler.name ?? (handler.dashcase === false ? prop : camelCaseToDash(prop))).toLowerCase()
			__setUpAttribute(Class, attrName, prop, handlers[prop]!)
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

	// We need to compose with @reactive so that it will signalify any @signal properties.
	const ReactiveDecorated: ElementCtor = reactive(Class, context)

	class ElementDecorated extends ReactiveDecorated {
		constructor(...args: any[]) {
			// @ts-expect-error we don't know what the user's args will be, just pass them all.
			super(...args)

			// Untrack to be sure we don't cause dependencies during creation of
			// objects (super() is already untracked by the reactive decorator).
			untrack(() => {
				handlePreUpgradeValues(this)

				const attrsToProps = ElementDecorated.prototype[__attributesToProps] ?? {}

				// We're using Object.values here for *own* properties so
				// we handle properties of the current decorated class (not
				// of the super classes).
				const propSpecs = Object.values(attrsToProps)

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
				for (const propSpec of propSpecs) {
					const prop = propSpec.name as keyof this
					const useSignal = !noSignal?.has(prop as PropKey)

					if (!useSignal) continue

					const fieldDesc = Object.getOwnPropertyDescriptor(this, prop)
					const protoDesc = Object.getOwnPropertyDescriptor(Class.prototype, prop)
					const isField = !!fieldDesc

					// The decorated property is either on the instance (field), or the decorated class's prototype (getter/setter).
					let descriptor = fieldDesc ?? protoDesc
					if (!descriptor) descriptorError(prop)

					const {get, set} = descriptor
					const isAccessor = !!(descriptor && (get || set))
					const initialValue = isAccessor && get ? get.call(this) : this[prop]

					signalify(isField ? this : (Class.prototype as this), [prop, initialValue as unknown] as const)
				}

				// Intercept JS values to run attribute handlers.
				for (const propSpec of propSpecs) {
					const prop = propSpec.name as keyof this
					const handler = propSpec.attributeHandler

					if (!handler) continue

					const fieldDesc = Object.getOwnPropertyDescriptor(this, prop)
					const protoDesc = Object.getOwnPropertyDescriptor(Class.prototype, prop)
					const isField = !!fieldDesc

					// The decorated property is either on the instance (field), or the decorated class's prototype (getter/setter).
					let descriptor = fieldDesc ?? protoDesc
					if (!descriptor) descriptorError(prop)

					const {get, set, writable} = descriptor
					const isAccessor = !!(get || set)

					if (!isAccessor && !isField)
						throw new Error(
							`Cannot map attribute to prototype value property "${String(
								prop,
							)}". Only prototype getters/setters are supported. Either make the property a class field, or make two separate properties: one for the attribute as a class field, one for the prototype value property.`,
						)

					if ((isAccessor && !set) || (!isAccessor && !writable))
						throw new Error(`An attribute decorator cannot be used on readonly property "${String(prop)}".`)

					const initialValue = isAccessor && get ? get.call(this) : this[prop]

					// Default values for fields are handled in their initializer,
					// and this catches default values for getters/setters.
					if (!('default' in propSpec)) propSpec.default = 'default' in handler ? handler.default : initialValue
					handler.sideEffect?.(this, prop as string, initialValue)

					let storage: symbol | undefined

					// We check if we have an accessor, because sometimes we
					// don't if the property is not signalified (f.e. if
					// `@attribute @noSignal` was used, then we have a regular
					// field.)
					if (isAccessor) {
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
									value = __handleAttributeValue(value, handler, propSpec)
								untrack(() => handler.sideEffect?.(this, prop as string, value))
								set!.call(this, value)
							} as HandlerSetter)
						: (function (this: Element, value: any) {
								if (typeof value === 'string' || value === null)
									value = __handleAttributeValue(value, handler, propSpec)
								untrack(() => handler.sideEffect?.(this, prop as string, value))
								// @ts-expect-error indexed access with symbol
								this[storage!] = value
							} as HandlerSetter)

					newGetter && (newGetter[isAttributeHandler] = true)
					newSetter[isAttributeHandler] = true

					Object.defineProperty(location, prop, {
						enumerable: descriptor.enumerable,
						configurable: descriptor.configurable,
						get: newGetter,
						set: newSetter,
					})
				}
			})
		}
	}

	const classFinishers = [...__classFinishers]
	__classFinishers.length = 0

	function finishClass() {
		// This need to be here in the finisher because it will run *after*
		// static class fields (the decorator function itself runs before static
		// class fields are ready).
		options.elementName ||= Class.elementName || camelCaseToDash(Class.name)
		options.autoDefine ??= Class.autoDefine
		Object.assign(Class, options)

		for (const finisher of classFinishers) finisher(ElementDecorated)

		if (options.elementName && options.autoDefine)
			// guard against missing DOM API (f.e. SSR)
			globalThis.window?.customElements?.define(options.elementName, ElementDecorated)
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

function __handleAttributeValue(value: string | null, handler?: AttributeHandler, propSpec?: AttributePropSpec) {
	// prettier-ignore
	return !handler
		? value
		: value === null // attribute removed
			// ? 'default' in handler
			// 	? handler.default
			// 	: null
			// ? 'default' in propSpec!
			// 	? propSpec!.default
			// 	: null
			? propSpec!.default
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
