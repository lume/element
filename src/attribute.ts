import type {Element as LumeElement} from './LumeElement.js'
import type {Constructor} from 'lowclass'
import {camelCaseToDash, defineProp} from './_utils.js'

/**
 * A property or accessor decorator that maps an HTML attribute with the
 * dash-case version of the property, to the property. For example, if the
 * attribute decorator is used on a property called firstName, then the
 * property will be mapped to an attribute called first-name. Any time that the
 * attribute value changes (f.e. with setAttribute), then the property will
 * have this value set onto it.
 */
export function attribute(prototype: any, propName: string, descriptor?: PropertyDescriptor): any
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

export function _attribute(
	prototype: any,
	propName: string,
	descriptor?: PropertyDescriptor,
	attributeHandler?: AttributeHandler,
): any {
	const ctor = prototype.constructor as typeof LumeElement & {__proto__: any}

	if (!ctor.observedAttributes || !ctor.hasOwnProperty('observedAttributes')) {
		const inheritedAttrs = ctor.__proto__.observedAttributes

		// @prod-prune
		if (inheritedAttrs && !Array.isArray(inheritedAttrs)) {
			throw new TypeError(
				'observedAttributes is in the wrong format. Maybe you forgot to decorate your custom element class with the `element` decorator.',
			)
		}

		defineProp(ctor, 'observedAttributes', [...(inheritedAttrs || [])])
	}

	// @prod-prune
	if (!Array.isArray(ctor.observedAttributes)) {
		throw new TypeError(
			'observedAttributes is in the wrong format. Maybe you forgot to decorate your custom element class with the `element` decorator.',
		)
	}

	const attrName = camelCaseToDash(propName)

	if (!ctor.observedAttributes!.includes(attrName)) ctor.observedAttributes!.push(attrName)

	if (!ctor.reactiveProperties || !ctor.hasOwnProperty('reactiveProperties'))
		defineProp(ctor, 'reactiveProperties', [...(ctor.reactiveProperties || [])])

	if (!ctor.reactiveProperties!.includes(propName)) ctor.reactiveProperties!.push(propName)

	mapAttributeToProp(prototype, attrName, propName, attributeHandler)

	if (descriptor) return descriptor
}

// TODO this stores attributes as an inheritance chain on the constructor. It'd
// be more fool-proof (not publicly exposed) to store attribute-prop mappings in
// WeakMaps, but then we'd need to implement our own inheritance
// (prototype-like) lookup for the attributes.
function mapAttributeToProp(prototype: any, attr: string, prop: string, handler?: AttributeHandler): void {
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
				prototype.__proto__?.attributeChangedCallback?.call(this, attr, oldVal, newVal)
				// prototype.__proto__ &&
				// 	prototype.__proto__.attributeChangedCallback &&
				// 	prototype.__proto__.attributeChangedCallback.call(this, attr, oldVal, newVal)
			}

			// map from attribute to property
			const prop = this.__attributesToProps && this.__attributesToProps[attr]

			if (prop) {
				const handler = prop.attributeHandler
				this[prop.name] = handler && handler.from ? handler.from(newVal) : newVal
			}
		}
	}
	// Extend the current prototype's __attributesToProps object from the super
	// prototypes __attributesToProps object.
	if (!prototype.hasOwnProperty('__attributesToProps')) {
		// using defineProperty so that it is non-writable, non-enumerable, non-configurable
		Object.defineProperty(prototype, '__attributesToProps', {
			value: {
				__proto__: prototype.__attributesToProps || Object.prototype,
			},
		})
	}

	// TODO throw helpful warning if overriding an already-existing attribute-prop mapping
	if (prototype.__attributesToProps![attr]) {
		console.warn(
			'The `@attribute` decorator is overriding an already-existing attribute-to-property mapping for the "' +
				attr +
				'" attribute.',
		)
	}

	prototype.__attributesToProps![attr] = {name: prop, attributeHandler: handler}
}

// TODO We need a way for the default value to be set from class
// fields/properties initial values, instead of having to have them supplied to the
// decorator. But at the moment, these attribute decorators do not create
// accessors, so in a legacy decorator environment they have no way of seeing
// the initial values (new decorators can supply initializers). So for legacy
// decorators we need either a way to hook onto initial sets of @reactive
// accessors during construction, or to define @attribute's own accessors. New
// decorators can easily use initializers. Our test setup will ensure that the
// decorators work in all decorator environments.

export type AttributeHandler<T = any> = {
	// TODO `to` handler currently does nothing. If it is present, then prop
	// changes should reflect back to the attribute. In most cases, this is
	// undesirable (for performance).
	to?: (propValue: T) => string | null
	from?: (AttributeValue: string | null) => T
	default?: T
}

type AttributeType<T> = (defaultValue?: T) => AttributeHandler<T>

attribute.string = (def => ({
	default: def,
	from(str) {
		return str == null ? this.default : str
	},
})) as AttributeType<string>

export function stringAttribute(defaultValue = '') {
	return attribute(attribute.string(defaultValue))
}

attribute.number = (def => ({
	default: def,
	from(str) {
		return str == null ? this.default : +str
	},
})) as AttributeType<number>

export function numberAttribute(defaultValue = 0) {
	return attribute(attribute.number(defaultValue))
}

attribute.boolean = (def => ({
	default: def,
	from(str) {
		return str == null ? this.default : str !== 'false'
	},
})) as AttributeType<boolean>

export function booleanAttribute(defaultValue = false) {
	return attribute(attribute.boolean(defaultValue))
}
