import type { HTMLAttributes as ReactHTMLAttributes, DetailedHTMLProps as ReactDetailedHTMLProps } from 'react';
import type { RemoveAccessors, RemovePrefixes, SetterTypePrefix, WithStringValues } from './LumeElement.js';
/**
 *  Similar to ElementAttributes, but for defining element attribute types for
 *  React JSX. See LUME Element's [TypeScript
 *  docs](https://docs.lume.io/#/guide/making-elements?id=typescript) for
 *  details.
 */
export type ReactElementAttributes<ElementType extends HTMLElement, SelectedProperties extends keyof RemovePrefixes<RemoveAccessors<ElementType>, SetterTypePrefix>, AdditionalProperties extends object = {}> = Omit<ReactDetailedHTMLProps<ReactHTMLAttributes<ElementType>, ElementType>, SelectedProperties | keyof AdditionalProperties> & {
    /** The 'has' attribute from the 'element-behaviors' package. If element-behaviors is installed and imported (it is if you're using `lume` 3D elements) then this specifies which behaviors to instantiate on the given element. */
    has?: string;
} & Partial<WithStringValues<Pick<RemovePrefixes<RemoveAccessors<ElementType>, SetterTypePrefix>, SelectedProperties>>> & AdditionalProperties;
//# sourceMappingURL=react.d.ts.map