// This file puts together a small hack to run React code in fake a Node.js-like
// environment in the browser, in order to re-export it to other JavaScript
// modules, because React is too lazy to update their code to run in modern
// browsers with standard JavaScript modules. This file is hooked in via the
// importmap in index.html for any code that tries to `import` `from 'react'` or
// `from 'react/jsx-runtime'` or `from 'react-dom/client'`.

const exports: any = {}
const process = {env: {}}

await fakeImport('/node_modules/react/cjs/react.development.js')
await fakeImport('/node_modules/react/cjs/react-jsx-runtime.development.js')
await fakeImport('/node_modules/scheduler/cjs/scheduler.development.js')
await fakeImport('/node_modules/react-dom/cjs/react-dom.development.js')

async function fakeImport(file: string) {
	const response = await fetch(file)
	const code = await response.text()
	new Function('exports', 'process', code.replaceAll(/\brequire\(("|')[^"']+("|')\)/g, 'exports'))(exports, process)
}

// react
export const useEffect = exports.useEffect
export const useRef = exports.useRef

// react/jsx-runtime.js
export const Fragment = exports.Fragment
export const jsx = exports.jsx
export const jsxs = exports.jsxs

// react-dom/client
export const createRoot = exports.createRoot
