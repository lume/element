// define the slot element type, for use with ShadowDOM
export interface HTMLSlotElementAttributes<T = HTMLSlotElement> extends JSX.HTMLAttributes<T> {
	name?: string
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			slot: HTMLSlotElementAttributes
		}
	}
}
