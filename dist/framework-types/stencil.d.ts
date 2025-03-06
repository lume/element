import type { JSXBase } from '@stencil/core/internal';
import type { BooleanProps, EventListenersOnly, EventProps, NonBooleanProps, NonNumberProps, NonOnProps, NumberProps, RemoveAccessors, RemoveSetterPrefixes, WithBooleanStringValues, WithNumberStringValues, WithStringValues } from '../LumeElement.js';
/**
 *  Similar to ElementAttributes, but for defining element attribute types for
 *  React JSX. See LUME Element's [TypeScript
 *  docs](https://docs.lume.io/#/guide/making-elements?id=typescript) for
 *  details.
 */
export type StencilElementAttributes<El, SelectedProperties extends keyof RemoveSetterPrefixes<RemoveAccessors<El>>, AdditionalProperties extends object = {}> = Omit<JSXBase.HTMLAttributes<El>, SelectedProperties | keyof AdditionalProperties> & {
    /** The 'has' attribute from the 'element-behaviors' package. If element-behaviors is installed and imported (it is if you're using `lume` 3D elements) then this specifies which behaviors to instantiate on the given element. */
    has?: string;
} & Partial<WithStringValues<NonNumberProps<NonBooleanProps<NonOnProps<El, SelectedProperties>>>>> & Partial<WithStringValues<EventListenersOnly<EventProps<El, SelectedProperties>>>> & Partial<WithBooleanStringValues<BooleanProps<NonOnProps<El, SelectedProperties>>>> & Partial<WithNumberStringValues<NumberProps<NonOnProps<El, SelectedProperties>>>> & AdditionalProperties;
//# sourceMappingURL=stencil.d.ts.map