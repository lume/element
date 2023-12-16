// Until decorators land natively, we need this shim so that we can use
// decorator metadata. https://github.com/microsoft/TypeScript/issues/53461
export {}; // we don't export anything, but this denotes the file as a module to TypeScript
// @ts-expect-error readonly
Symbol.metadata ??= Symbol.for('Symbol.metadata');
//# sourceMappingURL=metadata-shim.js.map