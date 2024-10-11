import type {EmitFn, HTMLAttributes, PublicProps} from 'vue'
import type {
	AsValues,
	BooleanProps,
	EventListenersOnly,
	EventProps,
	NonBooleanProps,
	NonEventProps,
	NonNumberProps,
	NumberProps,
	OmitFromUnion,
	RemoveAccessors,
	RemoveSetterPrefixes,
	WithBooleanStringValues,
	WithNumberStringValues,
	WithStringValues,
} from '../LumeElement.js'

// prettier-ignore
export type VueElementAttributes<
	El,
	SelectedAttributes extends keyof RemoveSetterPrefixes<RemoveAccessors<El>>,
	AdditionalProperties extends object = {},
> = new () => El & {
	/**
	 * @deprecated Do not use the $props property on a Custom Element ref, this
	 * is for template prop types only.
	 */
	$props: Omit<HTMLAttributes & PublicProps, SelectedAttributes | keyof AdditionalProperties>

		// TODO move this to a Vue-specific type in element-behaviors
		& {
			/** The 'has' attribute from the 'element-behaviors' package. If element-behaviors is installed and imported (it is if you're using `lume` 3D elements) then this specifies which behaviors to instantiate on the given element. */
			has?: string
		}

		// All non-'on' non-boolean non-number properties
		& Partial<WithStringValues<NonNumberProps<NonBooleanProps<NonEventProps<El, SelectedAttributes>>>>>

		// Boolean attributes
		& Partial<WithBooleanStringValues<BooleanProps<NonEventProps<El, SelectedAttributes>>>>

		// Number attributes
		& Partial<WithNumberStringValues<NumberProps<NonEventProps<El, SelectedAttributes>>>>

		// Allow onsomeevent="code" attributes for event properties, as Vue will set the an attribute to the string value.
		& Partial<AsValues<EventListenersOnly<EventProps<El, SelectedAttributes>>, string>>

		& AdditionalProperties

	// We mark this as deprecated because it shows up on the element ref in Vue, but elements won't actually have a $emit property.
	/**
	 * @deprecated Do not use the $emit property on a Custom Element ref, this
	 * is for template prop types only.
	 */
	// Pick the `on*` event handler types from the element type, without string values (only functions)
	$emit: EmitFn<RemoveOnPrefixes<NonNullValues<EventListenersOnly<EventProps<El, SelectedAttributes>>>>>
}

type RemoveOnPrefixes<T> = {
	[K in keyof T as K extends `on${infer EventName}` ? EventName : never]: T[K]
}

type NonNullValues<T> = {
	[K in keyof T]: OmitFromUnion<T[K], null>
}
