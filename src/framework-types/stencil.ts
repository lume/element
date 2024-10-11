import type {JSXBase} from '@stencil/core/internal'
import type {
	BooleanProps,
	EventListenersOnly,
	EventProps,
	NonBooleanProps,
	NonNumberProps,
	NonOnProps,
	NumberProps,
	RemoveAccessors,
	RemoveSetterPrefixes,
	WithBooleanStringValues,
	WithNumberStringValues,
	WithStringValues,
} from '../LumeElement.js'

// prettier-ignore
/**
 *  Similar to ElementAttributes, but for defining element attribute types for
 *  React JSX. See LUME Element's [TypeScript
 *  docs](https://docs.lume.io/#/guide/making-elements?id=typescript) for
 *  details.
 */
export type StencilElementAttributes<
	El,
	SelectedProperties extends keyof RemoveSetterPrefixes<RemoveAccessors<El>>,
	AdditionalProperties extends object = {},
> =
	// Start with the base props from React.
	& Omit<
		JSXBase.HTMLAttributes<El>,
		SelectedProperties | keyof AdditionalProperties
	>

	// TODO move this to a Svelte-specific type in element-behaviors
	& {
		/** The 'has' attribute from the 'element-behaviors' package. If element-behaviors is installed and imported (it is if you're using `lume` 3D elements) then this specifies which behaviors to instantiate on the given element. */
		has?: string
	}

	// Note, Stencil doesn't have syntax for explicitly setting attributes vs
	// properties. https://github.com/webcomponents/custom-elements-everywhere/issues/2352

	// All non-'on' non-boolean non-number properties
	& Partial<WithStringValues<NonNumberProps<NonBooleanProps<NonOnProps<El, SelectedProperties>>>>>

	// Pick the `on*` event handler types from the element type
	& Partial<WithStringValues<EventListenersOnly<EventProps<El, SelectedProperties>>>>

	// Boolean attributes
	& Partial<WithBooleanStringValues<BooleanProps<NonOnProps<El, SelectedProperties>>>>

	// Number attributes
	& Partial<WithNumberStringValues<NumberProps<NonOnProps<El, SelectedProperties>>>>

	& AdditionalProperties
