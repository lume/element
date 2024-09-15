import './metadata-shim.js' // TODO remove this shim once decorators land natively.
import {signal} from 'classy-solid'
import {camelCaseToDash, defineProp} from './_utils.js'
import type {ElementCtor} from './element.js'
import type {PropKey} from 'classy-solid/dist/decorators/types.js'

export const __classFinishers: ((Class: ElementCtor) => void)[] = []

/** The `@attribute` decorator currently works only on fields, getters, and setters. */
type AttributeDecoratorContext<This = unknown, Value = unknown> =
	| ClassFieldDecoratorContext<This, Value>
	| ClassGetterDecoratorContext<This, Value>
	| ClassSetterDecoratorContext<This, Value>

/**
 * A decorator that when used on a property or accessor causes an HTML attribute
 * with the same name (but dash-cased instead of camelCased) to be mapped to the
 * decorated property. For example, if the `@attribute` decorator is used on a
 * property called `firstName`, then an attribute called `first-name` will be
 * mapped to the property. Any time that the attribute value changes (f.e. with
 * `el.setAttribute`), the attribute value will propgate to the property a
 * trigger an update.
 *
 * The decorated property is backed by a Solid.js signal, thus useful in effects
 * or templates.
 *
 * Example:
 *
 * ```js
 * ⁣@element('my-el')
 * class MyEl extends Element {
 *   ⁣@attribute name = 'Lazayah'
 *
 *   template = () => <p>Name: {this.name}</p>
 * }
 * ```
 */
export function attribute(value: unknown, context: AttributeDecoratorContext): any
export function attribute(handler?: AttributeHandler): (value: unknown, context: AttributeDecoratorContext) => any
export function attribute(handlerOrValue: AttributeHandler | unknown, context?: AttributeDecoratorContext) {
	// if used as a decorator directly with no options
	if (arguments.length === 2) return handleAttributeDecoration(handlerOrValue, context!, undefined)

	// otherwise used as a decorator factory, possibly being passed options, like `@attribute({...})`
	const handler = handlerOrValue as AttributeHandler | undefined
	return <T>(value: T, context: AttributeDecoratorContext): any => handleAttributeDecoration(value, context, handler)

	// TODO throw an error for cases when @element is not used on a class with @attribute decorations, similar to classy-solid @signal/@reactive.
}

/**
 * Place this decorator before `@element` to avoid the property from being
 * backed by a Solid signal. I.e. the property will not be reactive, but will
 * still receive values from the HTML attribute.
 */
export const noSignal = (_value: unknown, context: AttributeDecoratorContext) => {
	if (!Object.hasOwn(context.metadata, 'noSignal')) context.metadata.noSignal = new Set<PropKey>()
	;(context.metadata.noSignal as Set<PropKey>).add(context.name)
}

function handleAttributeDecoration(
	value: unknown,
	context: AttributeDecoratorContext,
	attributeHandler: AttributeHandler = {},
) {
	const {kind, name, private: isPrivate, static: isStatic, metadata} = context
	// Check only own metadata.noSignal, we don't want to use the one inherited from a base class.
	const noSignal = (Object.hasOwn(metadata, 'noSignal') && (metadata.noSignal as Set<PropKey>)) || undefined
	const useSignal = !noSignal?.has(name)

	if (typeof name === 'symbol') throw new Error('@attribute is not supported on symbol fields yet.')
	if (isPrivate) throw new Error('@attribute is not supported on private fields yet.')
	if (isStatic) throw new Error('@attribute is not supported on static fields.')

	// TODO decorate on prototype? Or decorate on instance?
	__classFinishers.push((Class: ElementCtor) => __setUpAttribute(Class, name, attributeHandler))

	if (kind === 'field') {
		const signalInitializer = useSignal ? signal(value, context) : (v: unknown) => v

		return function <T extends unknown>(this: object, initialValue: T): T {
			initialValue = signalInitializer(initialValue)

			// Typically the first initializer to run for a class field (on
			// instantiation of the first instance of its class) will be our
			// source of truth for our default attribute value, but we check for
			// 'default' in attributeHandler just in case that a an attribute
			// decorator was passed an explicit default, f.e.
			// `@attribute({default: 123})`.
			if (!('default' in attributeHandler)) attributeHandler.default = initialValue

			return initialValue
		}
	} else if (kind === 'getter' || kind === 'setter') {
		if (useSignal) signal(value, context)
	} else {
		throw new Error(
			'@attribute is only for use on fields, getters, and setters. Auto accessor support is coming next if there is demand for it.',
		)
	}

	return undefined // shush TS
}

// TODO Do similar as with the following attributeChangedCallback prototype
// patch, but also with (dis)connected callbacks which can call an instance's
// template method, so users don't have to extend from the LumeElement base class.
// Extending from the LumeElement base class will be the method that non-decorator
// users must use.

export function __setUpAttribute(ctor: ElementCtor, propName: string, attributeHandler: AttributeHandler): any {
	if (
		//
		!ctor.observedAttributes ||
		!ctor.hasOwnProperty('observedAttributes')
	) {
		const inheritedAttrs = ctor.__proto__.observedAttributes

		// @prod-prune
		if (inheritedAttrs && !Array.isArray(inheritedAttrs)) {
			throw new TypeError(
				'observedAttributes is in the wrong format. Did you forget to decorate your custom element class with the `@element` decorator?',
			)
		}

		defineProp(ctor, 'observedAttributes', [...(inheritedAttrs || [])])
	}

	// @prod-prune
	if (!Array.isArray(ctor.observedAttributes)) {
		throw new TypeError(
			'observedAttributes is in the wrong format. Maybe you forgot to decorate your custom element class with the `@element` decorator.',
		)
	}

	const attrName = camelCaseToDash(propName)

	if (!ctor.observedAttributes!.includes(attrName)) ctor.observedAttributes!.push(attrName)

	mapAttributeToProp(ctor.prototype, attrName, propName, attributeHandler)
}

const hasAttributeChangedCallback = Symbol('hasAttributeChangedCallback')
export const attributesToProps = Symbol('attributesToProps')

// This stores attribute definitions as an inheritance chain on the constructor.
function mapAttributeToProp(prototype: any, attr: string, prop: string, attributeHandler: AttributeHandler): void {
	// Only define attributeChangedCallback once.
	if (!prototype[hasAttributeChangedCallback]) {
		prototype[hasAttributeChangedCallback] = true

		const originalAttrChanged = prototype.attributeChangedCallback

		prototype.attributeChangedCallback = function (attr: string, oldVal: string | null, newVal: string | null) {
			// If the class already has an attributeChangedCallback, let is run,
			// and let it call or not call super.attributeChangedCallback.
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
			const prop = this[attributesToProps]?.[attr]

			if (prop) {
				const handler = prop.attributeHandler
				// prettier-ignore
				this[prop.name] = !handler
					? newVal
					: newVal === null // attribute removed
						? 'default' in handler
							? handler.default
							: null
						: handler.from
							? handler.from(newVal)
							: newVal
			}
		}
	}

	// Extend the current prototype's attributesToProps object from the super
	// prototype's attributesToProps object.
	//
	// We use inheritance here or else all classes would pile their
	// attribute-prop definitions on a shared base class (they can clash,
	// override each other willy nilly and seemingly randomly).
	if (!prototype.hasOwnProperty(attributesToProps)) {
		// using defineProperty so that it is non-writable, non-enumerable, non-configurable
		Object.defineProperty(prototype, attributesToProps, {
			value: {
				__proto__: prototype[attributesToProps] || Object.prototype,
			},
		})

		// Object.create(prototype[attributesToProps] || Object.prototype)
	}

	prototype[attributesToProps]![attr] = {name: prop, attributeHandler}
}

/**
 * Defines how values are mapped from an attribute to a JS property on a custom
 * element class.
 */
export type AttributeHandler<T = any> = {
	// TODO `to` handler currently does nothing. If it is present, then prop
	// changes should reflect back to the attribute. This will add a performance
	// hit.
	to?: (propValue: T) => string | null

	/**
	 * Define how to deserialize an attribute string value on its way to the
	 * respective JS property.
	 *
	 * If not defined, the attribute string value is passed to the JS property
	 * untouched.
	 */
	from?: (AttributeValue: string) => T

	/**
	 * The default value that the respective JS property should have when the
	 * attribute is removed.
	 *
	 * When defined, an attribute's respective JS property will be set to this
	 * value when the attribute is removed. If not defined, then the JS property
	 * will receive `null` when the attribute is removed, just like
	 * `attributeChangedCallback` does.
	 */
	default?: T
}

type AttributeType<T> = () => AttributeHandler<T>

const toString = (str: string) => str

/**
 * An attribute type for use in the `static observedAttributeHandlers` map
 * when not using decorators.
 *
 * Example usage without decorators:
 *
 * ```js
 * element('my-el')(
 *   class MyEl extends LumeElement {
 *     static observedAttributeHandlers = {
 *       name: attribute.string()
 *     }
 *
 *     name = "honeybun" // default value when attribute removed
 *   }
 * )
 * ```
 */
attribute.string = (() => ({from: toString})) as AttributeType<string>

/**
 * This is essentially an alias for `@attribute`. You can just use `@attribute`
 * if you want a more concise definition.
 *
 * A decorator for mapping a string-valued attribute to a JS property. All
 * attribute values get passed as-is, except for `null` (i.e. when an attribute
 * is removed) which gets converted into an empty string or the default value of
 * the class field. The handling of `null` (on attribute removed) is the only
 * difference between this and plain `@attribute`, where `@attribute` will pass
 * along `null`.
 *
 * Example decorator usage:
 *
 * ```js
 * ⁣@element('my-el')
 * class MyEl extends LumeElement {
 *   ⁣@stringAttribute color = "skyblue"
 * }
 * ```
 *
 * Example HTML attribute usage:
 *
 * ```html
 * <!-- el.color === "", because an attribute without a written value has an empty string value. -->
 * <my-el color></my-el>
 *
 * <!-- el.color === "skyblue", based on the default value defined on the class field. -->
 * <my-el></my-el>
 *
 * <!-- el.color === "deeppink" -->
 * <my-el color="deeppink"></my-el>
 *
 * <!-- el.color === "4.5" -->
 * <my-el color="4.5"></my-el>
 *
 * <!-- el.color === "any string in here" -->
 * <my-el color="any string in here"></my-el>
 * ```
 */
export function stringAttribute(value: unknown, context: AttributeDecoratorContext) {
	return attribute(attribute.string())(value, context)
}

const toNumber = (str: string) => +str

/**
 * An attribute type for use in the `static observedAttributeHandlers` map
 * when not using decorators.
 *
 * Example usage without decorators:
 *
 * ```js
 * element('my-el')(
 *   class MyEl extends LumeElement {
 *     static observedAttributeHandlers = {
 *       money: attribute.number()
 *     }
 *
 *     money = 1000 // default value when attribute removed
 *   }
 * )
 * ```
 */
attribute.number = (() => ({from: toNumber})) as AttributeType<number>

/**
 * A decorator for mapping a number attribute to a JS property. The string value
 * of the attribute will be parsed into a number.
 *
 * Example decorator usage:
 *
 * ```js
 * ⁣@element('my-el')
 * class MyEl extends LumeElement {
 *   ⁣@numberAttribute money = 123
 * }
 * ```
 *
 * Example HTML attribute usage:
 *
 * ```html
 * <!-- el.money === 0, because an empty string gets coerced into 0. -->
 * <my-el money></my-el>
 *
 * <!-- el.money === 123, based on the default value defined on the class field. -->
 * <my-el></my-el>
 *
 * <!-- el.money === 10 -->
 * <my-el money="10"></my-el>
 *
 * <!-- el.money === 4.5 -->
 * <my-el money="4.5"></my-el>
 *
 * <!-- el.money === Infinity -->
 * <my-el money="Infinity"></my-el>
 *
 * <!-- el.money === NaN -->
 * <my-el money="NaN"></my-el>
 *
 * <!-- el.money === NaN -->
 * <my-el money="blahblah"></my-el>
 * ```
 */
export function numberAttribute(value: unknown, context: AttributeDecoratorContext) {
	return attribute(attribute.number())(value, context)
}

const toBoolean = (str: string) => str !== 'false'

/**
 * An attribute type for use in the `static observedAttributeHandlers` map
 * when not using decorators.
 *
 * Example usage without decorators:
 *
 * ```js
 * element('my-el')(
 *   class MyEl extends LumeElement {
 *     static observedAttributeHandlers = {
 *       hasCash: attribute.boolean()
 *     }
 *
 *     hasCash = true // default value when attribute removed
 *   }
 * )
 * ```
 */
attribute.boolean = (() => ({from: toBoolean})) as AttributeType<boolean>

/**
 * A decorator for mapping a boolean attribute to a JS property. The string
 * value of the attribute will be converted into a boolean value on the JS
 * property. A string value of `"false"` and a value of `null` (attribute
 * removed) will be converted into a `false` value on the JS property. All other
 * attribute values (strings) will be converted into `true`.
 *
 * Example decorator usage:
 *
 * ```js
 * ⁣@element('my-el')
 * class MyEl extends LumeElement {
 *   ⁣@booleanAttribute hasMoney = true
 *   ⁣@booleanAttribute excited = false
 * }
 * ```
 *
 * Example HTML attribute usage:
 *
 * ```html
 * <!-- el.hasMoney === true, el.excited === true -->
 * <my-el has-money excited></my-el>
 *
 * <!-- el.hasMoney === true, el.excited === false, based on the default values defined
 * on the class fields. Start the a class field with a value of `false` to have
 * behavior similar to traditional DOM boolean attributes where the presence of
 * the attribute determines the boolean value of its respective JS property. -->
 * <my-el></my-el>
 *
 * <!-- el.hasMoney === false, el.excited === true -->
 * <my-el has-money="false"></my-el>
 *
 * <!-- el.hasMoney === true, el.excited === true -->
 * <my-el has-money="true"></my-el>
 *
 * <!-- el.hasMoney === true, el.excited === true -->
 * <my-el has-money=""></my-el>
 *
 * <!-- el.hasMoney === true, el.excited === true -->
 * <my-el has-money="blahblah"></my-el>
 * ```
 */
export function booleanAttribute(value: unknown, context: AttributeDecoratorContext) {
	return attribute(attribute.boolean())(value, context)
}
