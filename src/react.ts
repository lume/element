/**
 * @deprecated - This file is deprecated. Use `@lume/element/framework-types/react` instead.
 */

export type * from './framework-types/react.js'

console.warn(
	`If you see this message, you should be doing a type - only import of this file,
as it has no runtime.

Plus this file is now deprecated. Replace 'import type {ReactElementAttributes} from "@lume/element/react"'
with 'import type {ReactElementAttributes} from "@lume/element/framework-types/react"'.
`,
)
