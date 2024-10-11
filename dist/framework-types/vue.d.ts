import type { EmitFn, HTMLAttributes, PublicProps } from 'vue';
import type { AsValues, BooleanProps, EventListenersOnly, EventProps, NonBooleanProps, NonEventProps, NonNumberProps, NumberProps, OmitFromUnion, RemoveAccessors, RemoveSetterPrefixes, WithBooleanStringValues, WithNumberStringValues, WithStringValues } from '../LumeElement.js';
export type VueElementAttributes<El, SelectedAttributes extends keyof RemoveSetterPrefixes<RemoveAccessors<El>>, AdditionalProperties extends object = {}> = new () => El & {
    /**
     * @deprecated Do not use the $props property on a Custom Element ref, this
     * is for template prop types only.
     */
    $props: Omit<HTMLAttributes & PublicProps, SelectedAttributes | keyof AdditionalProperties> & {
        /** The 'has' attribute from the 'element-behaviors' package. If element-behaviors is installed and imported (it is if you're using `lume` 3D elements) then this specifies which behaviors to instantiate on the given element. */
        has?: string;
    } & Partial<WithStringValues<NonNumberProps<NonBooleanProps<NonEventProps<El, SelectedAttributes>>>>> & Partial<WithBooleanStringValues<BooleanProps<NonEventProps<El, SelectedAttributes>>>> & Partial<WithNumberStringValues<NumberProps<NonEventProps<El, SelectedAttributes>>>> & Partial<AsValues<EventListenersOnly<EventProps<El, SelectedAttributes>>, string>> & AdditionalProperties;
    /**
     * @deprecated Do not use the $emit property on a Custom Element ref, this
     * is for template prop types only.
     */
    $emit: EmitFn<RemoveOnPrefixes<NonNullValues<EventListenersOnly<EventProps<El, SelectedAttributes>>>>>;
};
type RemoveOnPrefixes<T> = {
    [K in keyof T as K extends `on${infer EventName}` ? EventName : never]: T[K];
};
type NonNullValues<T> = {
    [K in keyof T]: OmitFromUnion<T[K], null>;
};
export {};
//# sourceMappingURL=vue.d.ts.map