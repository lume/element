import type {HTMLAttributes} from 'svelte/elements'
import type {
	RemoveSetterPrefixes,
	RemoveAccessors,
	WithStringValues,
	NonNumberProps,
	NonBooleanProps,
	EventProps,
	WithBooleanStringValues,
	BooleanProps,
	WithNumberStringValues,
	NumberProps,
	EventListenersOnly,
	NonOnProps,
} from '../LumeElement.js'

// prettier-ignore
/**
 * Use this to define the attributes of a custom element that should be exposed in Svelte templates for type checking.
 */
export type SvelteElementAttributes<
	/**
	 * The element type (pass in the class of your custom element).
	 */
	El extends EventTarget,

	/**
	 * The properties of the custom element that should be exposed as attributes in Svelte templates.
	 */
	SelectedProperties extends keyof RemoveSetterPrefixes<RemoveAccessors<El>>,

	/**
	 * Additional properties that should be exposed as attributes in Svelte templates.
	 */
	AdditionalProperties extends object = {}
> =
	& Omit<
		HTMLAttributes<El>,
		SelectedProperties | keyof AdditionalProperties
	>

	// TODO move this to a Svelte-specific type in element-behaviors
	& {
		/** The 'has' attribute from the 'element-behaviors' package. If `element-behaviors` is installed and imported (it is if you're using `lume` 3D elements) then this specifies which behaviors to instantiate on the given element. */
		has?: string
	}

	// Note, Svelte doesn't have syntax for explicitly setting attributes vs
	// properties. https://github.com/webcomponents/custom-elements-everywhere/issues/2352

	// All non-'on' non-boolean non-number properties
	// Note, we do not select on* propertie that are not even listeners, as Svelte will not forward the values to JS properties, but will try to listen to events based on their name.
	// Note, Svelte does not support string values for event attributes, only functions, skipped.
	& Partial<WithStringValues<NonNumberProps<NonBooleanProps<NonOnProps<El, SelectedProperties>>>>>

	// Pick the `on*` event handler types from the element type.
	// No strings values in Svelte (f.e. no onfoo="console.log('foo')")
	& Partial<EventListenersOnly<EventProps<El, SelectedProperties>>>

	// Boolean attributes
	& Partial<WithBooleanStringValues<BooleanProps<NonOnProps<El, SelectedProperties>>>>

	// Number attributes
	& Partial<WithNumberStringValues<NumberProps<NonOnProps<El, SelectedProperties>>>>

	& AdditionalProperties
