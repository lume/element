import type {Element as LumeElement} from './LumeElement.js'
import type {Constructor} from 'lowclass'
import {camelCaseToDash} from './_utils.js'

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
				// return classElement.finisher?.(Class) ?? Class
				return (classElement.finisher && classElement.finisher(Class)) ?? Class
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
					// return classElement.finisher?.(Class) ?? Class
					return (classElement.finisher && classElement.finisher(Class)) ?? Class
				},
			}
		}

		return _attribute(protoOrClassElement, propName!, descriptor, handler)
	}
}

// TODO Do similar as with the following attributeChangedCallback prototype
// patch, but also with (dis)connected callbacks which can call an instance's
// template method, so users don't have to extend from the LumeElement base class.
// Extending from the LumeElement base class will be the method that non-decorator
// users must use.

function _attribute(
	prototype: any /*CustomElementPrototype*/,
	propName: string,
	descriptor?: PropertyDescriptor,
	attributeHandler?: AttributeHandler,
): any {
	const ctor = prototype.constructor as typeof LumeElement

	if (!prototype.__hasAttributeChangedCallback) {
		prototype.__hasAttributeChangedCallback = true

		const originalAttrChanged = prototype.attributeChangedCallback

		prototype.attributeChangedCallback = function (attr: string, oldVal: string | null, newVal: string | null) {
			// If the class already has an attributeChangedCallback, let is run,
			// and let is call or not call super.attributeChangedCallback.
			if (originalAttrChanged) {
				originalAttrChanged.call(this, attr, oldVal, newVal)
			}
			// Otherwise, let's not intentionally break inheritance and be sure
			// we call the super method (if it exists).
			else {
				// This is equivalent to `super.attributeChangedCallback?()`
				// prototype.__proto__?.attributeChangedCallback?.call(this, attr, oldVal, newVal)
				prototype.__proto__ &&
					prototype.__proto__.attributeChangedCallback &&
					prototype.__proto__.attributeChangedCallback.call(this, attr, oldVal, newVal)
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

// TODO this stores attributes as an inheritance chain on the constructor. It'd
// be more fool-proof (not publicly exposed) to store attribute-prop mappings in
// WeakMaps, but then we'd need to implement our own inheritance
// (prototype-like) lookup for the attributes.
function mapAttributeToProp(ctor: typeof LumeElement, attr: string, prop: string, handler?: AttributeHandler): void {
	// Extend the current prototype's __attributesToProps object from the super
	// prototypes __attributesToProps object.
	if (!ctor.prototype.hasOwnProperty('__attributesToProps')) {
		// using defineProperty so that it is non-writable, non-enumerable, non-configurable
		Object.defineProperty(ctor.prototype, '__attributesToProps', {
			value: {
				// prettier-ignore
				__proto__: ctor.prototype.
					// @ts-ignore, private access
					__attributesToProps
						|| Object.prototype,
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

export function numberAttribute(defaultValue: number) {
	return attribute({from: str => (str == null ? defaultValue : +str)})
}

export function booleanAttribute(defaultValue: boolean) {
	return attribute({from: str => (str == null ? defaultValue : str !== 'false')})
}

// type CustomElementPrototype = {
//   constructor: CustomElementCtor
// }

export type AttributeHandler = {
	// TODO `to` handler currently does nothing. If it is present, then prop
	// changes should reflect back to the attribute. In most cases, this is
	// undesirable (for performance).
	to?: (prop: unknown) => string | null
	from?: (v: string | null) => unknown
}
