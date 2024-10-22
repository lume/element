type EventDecoratorContext =
	| ClassFieldDecoratorContext
	| ClassGetterDecoratorContext
	| ClassSetterDecoratorContext
	| ClassAccessorDecoratorContext

export const eventFields = Symbol('eventFields')

export type EventMetadata = {[eventFields]: Set<string>}

/**
 * A decorator that when used on an accessor causes an event listener to be
 * registered for events with the same name (but without the "on" prefix) on
 * the element. For example, if the `@event` decorator is used on a property
 * called `onexpand`, then an event listener for the `expand` event will be
 * registered on the element using the assigned handler.
 *
 * This is useful because:
 *
 * - seeing the `@event` properties in the class definition serves as a
 * reference as to which events the element will emit.
 * - types for `on*` JSX props are derived from the types of these properties
 * (f.e. when using ElementAttributes or ReactElementAttributes to define JSX
 * types).
 * - it gives new custom elements feature parity with the `on*` event properties
 * that builtin elements have.
 */
export function event<T>(value: T, context: EventDecoratorContext): any {
	const {name, kind, private: isPrivate} = context
	const metadata = context.metadata as EventMetadata

	if (typeof name === 'symbol' || isPrivate) throw new InvalidEventDecorationError()

	const eventName = name.replace(/^on/, '')

	if (kind === 'field') {
		if (!Object.hasOwn(metadata, eventFields)) metadata[eventFields] = new Set()

		metadata[eventFields].add(name)

		return function (this: Element, handler: EventListener | null) {
			if (handler) this.addEventListener(eventName, handler)
			return handler
		}
	} else if (kind === 'getter' || kind === 'setter') {
		if (kind === 'getter') return value as () => EventListener | null
		else {
			const set = value as (v: EventListener | null) => void
			let setCalled = false

			context.addInitializer(function (this: any) {
				queueMicrotask(() => {
					if (typeof this[name] === 'function' && !setCalled)
						console.warn(
							`@event decorator: initial value for ${name} was not handled. Start the initial value as null, then set it to the desired handler in your constructor instead.`,
						)
				})
			})

			const setter = __eventSetter(name, eventName, null, set)

			return function (this: Element, handler: EventListener | null) {
				setCalled = true
				setter.call(this, handler)
			}
		}
	} else if (kind === 'accessor') {
		const {get, set} = value as {get: () => EventListener | null; set: (v: EventListener | null) => void}

		return {
			init: function (this: Element, handler: EventListener | null) {
				if (handler) this.addEventListener(eventName, handler)
				return handler
			},
			get,
			set: __eventSetter(name, eventName, get, set),
		}
	} else throw new InvalidEventDecorationError()
}

export function __eventSetter(
	name: string,
	eventName: string,
	get: (() => EventListener | null) | null,
	set: (handler: EventListener | null) => void,
) {
	return function (this: Element, handler: EventListener | null) {
		if (handler && typeof handler !== 'function') throw new Error('Event handlers must be functions.')

		const previousHandler = get ? get.call(this) : ((this as any)[name] as EventListener | null)

		if (previousHandler) this.removeEventListener(eventName, previousHandler)
		if (handler) this.addEventListener(eventName, handler)

		set.call(this, handler)
	}
}

class InvalidEventDecorationError extends Error {
	constructor() {
		super('Use @event on a public non-symbol field, getter/setter, or accessor with its name starting with "on".')
	}
}
