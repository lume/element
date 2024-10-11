type EventDecoratorContext = ClassFieldDecoratorContext | ClassGetterDecoratorContext | ClassSetterDecoratorContext | ClassAccessorDecoratorContext;
export declare const eventFields: unique symbol;
export type EventMetadata = {
    [eventFields]: Set<string>;
};
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
export declare function event<T>(value: T, context: EventDecoratorContext): any;
export declare function __eventSetter(name: string, eventName: string, get: (() => EventListener | null) | null, set: (handler: EventListener | null) => void): (this: Element, handler: EventListener | null) => void;
export {};
//# sourceMappingURL=event.d.ts.map