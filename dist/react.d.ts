import type { HTMLAttributes as ReactHTMLAttributes, DetailedHTMLProps as ReactDetailedHTMLProps } from 'react';
import type { DashCasedProps } from './_utils';
export type ReactElementAttributes<ElementType, SelectedProperties extends keyof ElementType> = ReactDetailedHTMLProps<DashCasedProps<Partial<ToStringValues<Pick<ElementType, SelectedProperties>>>> & ReactHTMLAttributes<ElementType>, ElementType>;
type ToStringValues<Type extends object> = {
    [Property in keyof Type]: Type[Property] extends string ? Type[Property] : Type[Property] extends boolean ? boolean | string : string;
};
export {};
//# sourceMappingURL=react.d.ts.map