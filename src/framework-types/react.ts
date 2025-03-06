import type {HTMLAttributes as ReactHTMLAttributes, DetailedHTMLProps as ReactDetailedHTMLProps} from 'react'
import type {
	BooleanProps,
	EventListenersOnly,
	EventProps,
	NonBooleanProps,
	NonEventProps,
	NonNumberProps,
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
export type ReactElementAttributes<
	El,
	SelectedProperties extends keyof RemoveSetterPrefixes<RemoveAccessors<El>>,
	AdditionalProperties extends object = {},
> =
	// Start with the base props from React.
	& Omit<
		ReactDetailedHTMLProps<ReactHTMLAttributes<El>, El>,
		SelectedProperties | keyof AdditionalProperties
	>

	// TODO move this to a React-specific type in element-behaviors
	& {
		/** The 'has' attribute from the 'element-behaviors' package. If element-behaviors is installed and imported (it is if you're using `lume` 3D elements) then this specifies which behaviors to instantiate on the given element. */
		has?: string
	}

	// Note, React doesn't have syntax for explicitly setting attributes vs
	// properties. https://github.com/webcomponents/custom-elements-everywhere/issues/2352

	// All non-'on' non-boolean non-number properties
	& Partial<WithStringValues<NonNumberProps<NonBooleanProps<NonEventProps<El, SelectedProperties>>>>>

	// Pick the `on*` event handler types from the element type
	// Note, React built-in events are SyntheticEvent, but React custom element
	// events are not, the listeners receive the actual events, so we do not
	// need to map event attribute types to have SyntheticEvent event
	// parameters.
	& Partial<WithStringValues<EventListenersOnly<EventProps<El, SelectedProperties>>>>

	// Boolean attributes
	& Partial<WithBooleanStringValues<BooleanProps<NonEventProps<El, SelectedProperties>>>>

	// Number attributes
	& Partial<WithNumberStringValues<NumberProps<NonEventProps<El, SelectedProperties>>>>

	& AdditionalProperties
