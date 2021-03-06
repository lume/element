// re-export solid-js/dom from lume/variable {{{

import {dom} from '@lume/variable/dist/dom.js'

// export * from "./client";
export const Aliases = dom.Aliases
export const Properties = dom.Properties
export const ChildProperties = dom.ChildProperties
export const DelegatedEvents = dom.DelegatedEvents
export const SVGElements = dom.SVGElements
export const SVGNamespace = dom.SVGNamespace
export const render: typeof dom.render = dom.render
export const template: typeof dom.template = dom.template
export const effect: typeof dom.effect = dom.effect
export const memo: typeof dom.memo = dom.memo
export const insert: typeof dom.insert = dom.insert
export const createComponent: typeof dom.createComponent = dom.createComponent
export const delegateEvents: typeof dom.delegateEvents = dom.delegateEvents
export const clearDelegatedEvents: typeof dom.clearDelegatedEvents = dom.clearDelegatedEvents
export const spread: typeof dom.spread = dom.spread
export const assign: typeof dom.assign = dom.assign
export const setAttribute: typeof dom.setAttribute = dom.setAttribute
export const setAttributeNS: typeof dom.setAttributeNS = dom.setAttributeNS
export const addEventListener: typeof dom.addEventListener = dom.addEventListener
export const classList: typeof dom.classList = dom.classList
export const style: typeof dom.style = dom.style
export const getOwner: typeof dom.getOwner = dom.getOwner
// export const mergeProps: typeof dom.mergeProps = dom.mergeProps // Overriden by the mergeProps down below.
export const dynamicProperty: typeof dom.dynamicProperty = dom.dynamicProperty
export const hydrate: typeof dom.hydrate = dom.hydrate
export const gatherHydratable: typeof dom.gatherHydratable = dom.gatherHydratable
export const getHydrationKey: typeof dom.getHydrationKey = dom.getHydrationKey
export const getNextElement: typeof dom.getNextElement = dom.getNextElement
export const getNextMarker: typeof dom.getNextMarker = dom.getNextMarker

// export {...} from '../..'
export const For: typeof dom.For = dom.For
export const Show: typeof dom.Show = dom.Show
export const Suspense: typeof dom.Suspense = dom.Suspense
export const SuspenseList: typeof dom.SuspenseList = dom.SuspenseList
export const Switch: typeof dom.Switch = dom.Switch
export const Match: typeof dom.Match = dom.Match
export const Index: typeof dom.Index = dom.Index
export const ErrorBoundary: typeof dom.ErrorBoundary = dom.ErrorBoundary
export const mergeProps: typeof dom.mergeProps = dom.mergeProps

// export * from "./server-mock"; // skipped

// verbatim
export const isServer = dom.isServer
export const Portal: typeof dom.Portal = dom.Portal
export const Dynamic: typeof dom.Dynamic = dom.Dynamic

// }}}
