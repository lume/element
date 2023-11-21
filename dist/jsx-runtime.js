// It is strange that this file is named "jsx-runtime" although
// there is no runtime and it exports only types.
//
// This is how TypeScript chose for JSX to operate: not only is `import {JSX}`
// not supported (JSX expressions will fail to see the JSX type as noted in
// https://github.com/microsoft/TypeScript/issues/41813) but jsx-runtime (which
// we are required to use instead of import syntax) is the required file that
// `jsxImportSource` mechanics look for in the directory that you supply to the
// `jsxImportSource` option.
export {};
//# sourceMappingURL=jsx-runtime.js.map