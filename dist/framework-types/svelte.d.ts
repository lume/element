import type { HTMLAttributes } from 'svelte/elements';
import type { RemoveSetterPrefixes, RemoveAccessors, WithStringValues, NonNumberProps, NonBooleanProps, EventProps, WithBooleanStringValues, BooleanProps, WithNumberStringValues, NumberProps, EventListenersOnly, NonOnProps } from '../LumeElement.js';
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
AdditionalProperties extends object = {}> = Omit<HTMLAttributes<El>, SelectedProperties | keyof AdditionalProperties> & {
    /** The 'has' attribute from the 'element-behaviors' package. If `element-behaviors` is installed and imported (it is if you're using `lume` 3D elements) then this specifies which behaviors to instantiate on the given element. */
    has?: string;
} & Partial<WithStringValues<NonNumberProps<NonBooleanProps<NonOnProps<El, SelectedProperties>>>>> & Partial<EventListenersOnly<EventProps<El, SelectedProperties>>> & Partial<WithBooleanStringValues<BooleanProps<NonOnProps<El, SelectedProperties>>>> & Partial<WithNumberStringValues<NumberProps<NonOnProps<El, SelectedProperties>>>> & AdditionalProperties;
//# sourceMappingURL=svelte.d.ts.map