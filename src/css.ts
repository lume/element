import {identityTemplateTag} from './_utils'

/**
 * A no-op (identity) template tag useful for marking CSS strings for syntax
 * highlighting. For example:
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
