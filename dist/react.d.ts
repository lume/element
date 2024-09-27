import type { HTMLAttributes as ReactHTMLAttributes, DetailedHTMLProps as ReactDetailedHTMLProps } from 'react';
import type { DashCasedProps } from './utils';
/**
 *  Similar to ElementAttributes, but for defining element attribute types for
 *  React JSX. See LUME Element's [TypeScript
 *  docs](https://docs.lume.io/#/guide/making-elements?id=typescript) for
 *  details.
 */
export type ReactElementAttributes<ElementType, SelectedProperties extends keyof ElementType> = ReactDetailedHTMLProps<DashCasedProps<Partial<ToStringValues<Pick<ElementType, SelectedProperties>>>> & ReactHTMLAttributes<ElementType>, ElementType>;
type ToStringValues<Type extends object> = {
    [Property in keyof Type]: Type[Property] extends string ? Type[Property] : Type[Property] extends boolean ? boolean | string : string;
};
export {};
//# sourceMappingURL=react.d.ts.map