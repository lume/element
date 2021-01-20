import {identityTemplateTag} from './_utils.js'

/**
 * A no-op (identity) template tag that does nothing, useful merely for marking CSS strings for syntax
 * highlighting in various text editors. For example:
 *
 * ```js
 * const style = css`
 *   .el {
 *     background: skyblue;
 *   }
 * `
 * ```
 */
export const css = identityTemplateTag
