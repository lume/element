export function defer(func) {
    return Promise.resolve().then(func);
}
export function identityTemplateTag(stringsParts, ...values) {
    let str = '';
    for (let i = 0; i < values.length; i++)
        str += stringsParts[i] + String(values[i]);
    return str + stringsParts[stringsParts.length - 1];
}
export function camelCaseToDash(str) {
    return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
}
export function defineProp(obj, prop, value) {
    Object.defineProperty(obj, prop, {
        value,
        writable: true,
        configurable: true,
        enumerable: true,
    });
}
export function getGlobal() {
    if (typeof globalThis !== 'undefined')
        return globalThis;
    else if (typeof window !== 'undefined')
        return window;
    else if (typeof global !== 'undefined')
        return global;
    else
        return Function('return this')();
}
//# sourceMappingURL=_utils.js.map