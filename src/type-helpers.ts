import type {JSX} from './jsx-runtime'

/* eslint-disable typescript/explicit-function-return-type */

// These are for use in TypeScript to cast JSX to certain DOM types. They are
// not needed in plain JavaScript.
export const div = (e: JSX.Element) => e as any as HTMLDivElement
export const h1 = (e: JSX.Element) => e as any as HTMLHeadingElement
export const h2 = (e: JSX.Element) => e as any as HTMLHeadingElement
export const h3 = (e: JSX.Element) => e as any as HTMLHeadingElement
export const h4 = (e: JSX.Element) => e as any as HTMLHeadingElement
export const h5 = (e: JSX.Element) => e as any as HTMLHeadingElement
export const h6 = (e: JSX.Element) => e as any as HTMLHeadingElement
export const p = (e: JSX.Element) => e as any as HTMLParagraphElement
export const span = (e: JSX.Element) => e as any as HTMLSpanElement
export const br = (e: JSX.Element) => e as any as HTMLBRElement
export const pre = (e: JSX.Element) => e as any as HTMLPreElement
export const code = (e: JSX.Element) => e as any as HTMLElement
export const canvas = (e: JSX.Element) => e as any as HTMLCanvasElement
export const img = (e: JSX.Element) => e as any as HTMLImageElement
export const video = (e: JSX.Element) => e as any as HTMLVideoElement
export const object = (e: JSX.Element) => e as any as HTMLVideoElement
export const select = (e: JSX.Element) => e as any as HTMLSelectElement
export const option = (e: JSX.Element) => e as any as HTMLOptionElement
export const ul = (e: JSX.Element) => e as any as HTMLUListElement
export const ol = (e: JSX.Element) => e as any as HTMLOListElement
export const li = (e: JSX.Element) => e as any as HTMLLIElement
export const iframe = (e: JSX.Element) => e as any as HTMLIFrameElement
export const button = (e: JSX.Element) => e as any as HTMLButtonElement
export const form = (e: JSX.Element) => e as any as HTMLFormElement
export const input = (e: JSX.Element) => e as any as HTMLInputElement
export const a = (e: JSX.Element) => e as any as HTMLAnchorElement
export const link = (e: JSX.Element) => e as any as HTMLLinkElement
export const script = (e: JSX.Element) => e as any as HTMLScriptElement
export const section = (e: JSX.Element) => e as any as HTMLElement
export const menu = (e: JSX.Element) => e as any as HTMLMenuElement
export const svg = (e: JSX.Element) => e as any as SVGSVGElement
export const q = (e: JSX.Element) => e as any as HTMLQuoteElement
export const blockquote = (e: JSX.Element) => e as any as HTMLQuoteElement

export function elm<T>(e: JSX.Element) {
	return e as any as T
}
