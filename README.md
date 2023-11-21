# @lume/element

Easily create Custom Elements with simple templates and reactivity. This is an alternative to Lit, Stencil, and Fast.

<h4><code><strong>npm install @lume/element</strong></code></h4>

> :bulb:**Tip:**
>
> If you are new to Custom Elements, first [learn about the Custom
> Element
> APIs](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
> available natively in browsers. Lume Element simplifies the creation of Custom
> Elements compared to writing them with vanilla APIs, but sometimes vanilla
> APIs are all you need.

## Live demos

- [CodePen, html template tag, no decorators](https://codepen.io/trusktr/pen/zYeRqaR)
- [Stackblitz with Babel, JSX, decorators](https://stackblitz.com/edit/webpack-webpack-js-org-wdzlbb?file=src%2Findex.js)
- [Stackblitz with Vite, JSX, TypeScript, decorators](https://stackblitz.com/edit/solidjs-templates-wyjc1i?file=src%2Findex.tsx)
- [Solid Playground, TypeScript, no decorators](https://playground.solidjs.com/anonymous/0cc05f53-b665-44d2-a73c-1db9eb992a4f)

## Cliché Usage Example

Define a `<click-counter>` element:

```js
import {Element, element, numberAttribute} from '@lume/element'
import html from 'solid-js/html'
import {createEffect} from 'solid-js'

@element('click-counter')
class ClickCounter extends Element {
	@numberAttribute count = 0

	template = () => html`<button onclick=${() => this.count++}>Click! (count is: ${() => this.count})</button>`

	css = `
		button {
			border: 2px solid deeppink;
			margin: 5px;
		}
	`

	connectedCallback() {
		super.connectedCallback()

		// Log the `count` any time it changes:
		createEffect(() => {
			console.log('count is:', this.count)
		})
	}
}
```

> [!Note]
> Once decorators land in browsers, the above example will work out of the box
> as-is without compiling, but for now a compile step is needed for using decorators.
> You can also use JSX for the `template`, but that will always require
> compiling:
>
> ```jsx
> template = () => <button> Click! (count is: {this.count}) </button>
> ```
>
> Further examples below show how to define elements without decorators, which
> works today without a compiler.

Use the `<click-counter>` in a plain HTML file:

```html
<body>
	<click-counter></click-counter>

	<!-- Manually set the `count` value in HTML: -->
	<click-counter count="100"></click-counter>

	<script type="module">
		import './click-counter.js'

		// Manually set the `count` value in JS:
		document.querySelector('click-counter').count = 200
	</script>
</body>
```

Use the `<click-counter>` in another element's `template`,

```js
import {Element, element} from '@lume/element'
import html from 'solid-js/html'
import {signal} from 'classy-solid'

@element('counter-example')
class CounterExample extends Element {
	@signal count = 50 // Not an attribute, only a signal.

	template = () => html`<click-counter count=${() => this.count}></click-counter>`
}

document.body.append(new CounterExample())
```

Use `<click-counter>` in a plain function component (i.e. a Solid.js component):

```js
// At this point this, this boils down to plain Solid.js code (`@lume/element` comes
// with `solid-js`)

import {createSignal} from 'solid-js'
import html from 'solid-js/html'

function CounterExample() {
	const [count, setCount] = createSignal(50)

	return html`<click-counter count=${count()}></click-counter>`
}

document.body.append(CounterExample())
```

## Intro

[Custom](https://developers.google.com/web/fundamentals/web-components/customelements)
[Elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)
(also known as [Web
Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) are a
feature of browsers that allow us to define new HTML elements that the browser
understands in the same way as built-in elements like `<div>` or `<button>`.
They are very useful for organizaing your web app into re-usable pieces
(elements).

If that flew over your head then you might first want to try a [beginner HTML
tutorial](https://htmldog.com/guides/html/beginner/). You will also need to
some basic knowledge of
[JavaScript](https://www.google.com/search?q=JavaScript%20for%20absolute%20beginners).

`@lume/element` provides a set of features that make it easier to manipulate
elements and to define new custom elements and easily compose them together
into an application.

With `@lume/element` we can create custom elements that have the following
features:

- Reactive instance properties that receive values from element attributes of the same name (but dash-cased).
- Declarative templates, written with JSX or `html` template tag, that automatically update when reactive instance properties are used in the templates.
- Scoped styling with or without a ShadowRoot.
- Decorators for concise element definitions.

<details><summary>A more detailed feature description:</summary>

- Element attributes are defined with `@attribute` decorators on class fields.
  - Class fields decorated with `@attribute` receive values from HTML attributes
    (with the same name but dash-cased) when the HTML attribute values change.
  - Deorators are powered by
    [`classy-solid`](https://github.com/lume/classy-solid): utilities for using
    [Solid.js](https://solidjs.com) patterns on `class`es, such as the `@signal`
    decorator for making class fields reactive (backed by Solid signals).
    Decorators from `@lume/element` compose the `@signal` decorator to make
    properties be reactive.
  - As decoraators are not out in browser yet, an alternative non-decorator API
    can be used, which does not require a build.
- Each custom element can have an HTML template that automatically updates the DOM when any
  reactive variable used in the template changes.
  - Templates can be written in the form of HTML-like markup inside JavaScript
    called [JSX](https://facebook.github.io/jsx), specifically the JSX flavor from
    Solid.js. This requires a build step.
  - Templates can also be written using Solid's `html` template string tag,
    which does not require a build.
  - When a template updates, the whole template does not re-run, only the part
    of the template where a variable changed is updated, and only that particular
    piece of
    [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
    gets modified. There is no virtual DOM diffing.
  - Because changes to HTML attributes on an element map to properties backed by
    signals on the element instance, this will cause the custom element's template
    to update if its template uses those properties.
- `@lume/element` can be used to create and manipulate trees of DOM elements
  without necessarily creating new custom elements, using function-style
  components. This can be especially useful for breaking pieces of a custom
  element into a few smaller parts without necessarily making new custom elements
  for each part if they don't need to be new elements.
- Custom element styles are automatically scoped, similar to Vue, Svelte, and other systems with style scoping.
  - If you're familiar with custom elements, you know that the browser gives
    this to us for free when using ShadowDOM.
  - If you opt an element out of having a ShadowRoot, `@lume/element` applies
    its own style scoping for the element at the nearest root node.

</details>

<details><summary><h2>Install and Setup</h2></summary>

> **STUB:** This section needs expansion, but should be enough for anyone
> familiar with common build tooling in the webdev/JS ecosystem. Contributions
> very welcome!

<details><summary><h3>CDN method (no compiler or command line knowledge needed)</h3></summary>

Follow the guide on [installing `lume` from
CDN](https://docs.lume.io/guide/install/?id=cdn-easiest), but simply replace
`lume` with `@lume/element`. The process is otherwise the same.

> [!Note]
> Decorator syntax and JSX syntax are both not supported with this install
> method as it uses not build step. See more examples below for non-decorator
> property definition examples and templates using an `html` template string tag, both of
> which require no build step. In the near future, decorators will be out
> natively in browsers (but not JSX).

<!--
TODO:
Here's a live example on CodePen based on those instructions, that you can copy/paste into your own `.html` file:

https://codepen.io/trusktr/pen/zYeRqaR/0b34a31aad0c7b794433724f12ae785d?editors=1010
 -->

</details>

<details><summary><h3>Local install with build</h3></summary>

This assumes some familiarity with command lines and JavScript build tools.

First make sure you've installed Node.js so that we have the `npm` package manager avaiable.

Install the `@lume/element` package using the following in a terminal:

```sh
npm install @lume/element
```

If you want to use decorators today (recommended), you'll either need to compile
them with TypeScript 5 or higher (recommended, even if writing JS and not TS, as decorator syntax works out of the box with TypeScript), or use the
[Babel compiler](http://babeljs.io) with [`@babel/plugin-proposal-decorators`](https://babeljs.io/docs/babel-plugin-proposal-decorators).

```sh
npm install --save-dev typescript
# or
npm install --save-dev @babel/cli @babel/core @babel/plugin-proposal-decorators
```

If using TypeScript, set `allowJs` in `tsconfig.json` to allow compiling JS files, f.e.:

```json
{
	"compilerOptions": {
		"allowJs": true,
		"outDir": "dist"
	},
	"include": ["./src/**/*"]
}
```

and running `npx tsc`.

If using Babel, add the decorators plugin to `.babelrc`, f.e.

```json
{
	"plugins": ["@babel/plugin-proposal-decorators"]
}
```

and running `npx babel src --out-dir dist`.

If you want to use the HTML-like markup inside JavaScript known as "JSX",
instead of [Solid's `html` template
tag](https://github.com/solidjs/solid/tree/main/packages/solid/html), you will
need to additionally install
[`babel-preset-solid`](https://npmjs.com/babel-preset-solid):

```sh
npm install --save-dev babel-preset-solid
```

Configure Babel to use the preset inside your project's `.babelrc` file or in
your Webpack `babel-loader` config:

```json
{
	"plugins": ["@babel/plugin-proposal-decorators"],
	"presets": ["solid"]
}
```

> [!Note]
> If you compile decorators with TypeScript, you still need Babel for Solid JSX
> because TypeScript does not compile JSX into Solid.js format, only into React
> format. You can either compile decorators with TypeScript and have Babel compile
> JSX in a second step, or you can compile both decorators and JSX with Babel in a
> single step.

</details>

</details>

## Basic Usage

### Create custom elements

A great way to create re-usable components is to create Custom Elements. The
advantage of custom elements is that they follow web standards, and therefore
they can be used in any web application and manipulated by any DOM
manipulation libraries like [jQuery](https://jquery.com/),
[React](https://reactjs.org), [Vue](https://vuejs.org), [Svelte](https://svelte.dev/), or
[Angular](https://angular.io), [Solid.js](https://solidjs.com), and all the rest.

The following is a custom element definition with a reactive property
`firstName` that also accepts values from an attribute named `first-name` (the
property name is converted to dash-case for the attribute name).

```jsx
import {
	Element, // A base class for LUME custom elements
	attribute, // A property decorator to map attributes to properties, and that makes properties reactive
	css, // A no-op identity template tag function (useful to enable CSS syntax highlighting in various text editors)
} from '@lume/element'

@element('greeting-card') // defines the element tag name
class GreetingCard extends Element {
	// Make the firstName property a reactive variable, and also map any value
	// from an attribute named 'first-name' back to this property (the attribute
	// name is the dash-case version of the property name).
	@attribute firstName = 'Roger'

	// Define a DOM tree that we want rendered on screen by providing a
	// `template`. The `template` should be a function that returns a DOM
	// element or array of DOM elements (which we can create with JSX, or with
	// an `html` template tag, or with plain JS). The DOM content will be, by
	// default, appended into the ShadowRoot of our custom element.
	//
	// To take advantage of reactivity in our template, simply interpolate
	// properties that were decoratored with an attribute decorator into the
	// template.
	//
	// Here, any time the `.firstName` property's value changes, the DOM will be
	// automatically updated.
	template = () => (
		<div>
			<span>
				Hello <i>{this.firstName}</i>
			</span>
			{/* Children of a <greeting-card> element get rendered here. */}
			<slot></slot>
		</div>
	)

	// Apply styling to your element and its content with the static `css` property.
	// Because the property is static, this style is re-used across all instances of the element.
	// Styles are by default scoped to your element's content.
	static css = css`
		:host {
			background: skyblue;
		} /* Give greeting-card a background. */
		div {
			color: pink;
		}
	`

	// If you need instance-specific styling, use a non-static `css` property.
	// This style has higher precedence over styles in the `static css` property.
	// In this example, the divs in each instance of this element will have borders of random sizes.
	// Note, `css` is currently not reactive, it runs once initially, so using a
	// reactive property in the css will currently not update the style.
	css = css`
		div {
			border: ${Math.random() * 5}px solid teal;
		}
	`

	// connectedCallback is a method that fires any time this custom element is
	// connected into a web site's live DOM tree.
	connectedCallback() {
		super.connectedCallback() // Don't forget to call the super method!

		// Once the element is connected, let's update the `.firstName` prop after a
		// couple of seconds, and we'll see the change on screen.
		setTimeout(() => (this.firstName = 'Zaya'), 2000)

		// And show that it works by setting HTML attributes too, two seconds later.
		setTimeout(() => this.setAttribute('first-name', 'Raquel'), 4000)
	}

	// Use the disconnectedCallback to clean anything up when the element is removed from the DOM.
	disconnectedCallback() {
		super.disconnectedCallback()
		// ... clean up ...
	}
}
```

Now we can use it in the HTML of a web site, or in the template of another
component:

```html
<greeting-card first-name="Raynor"></greeting-card>
```

Inside an element's `template()` method we can assign bits and pieces of DOM to
variables, and we can also use other custom elements and functional components.
Similary, the `css` property can also be a method:

```jsx
@element('greeting-card')
class GreetingCard extends Element {
	// ... same as before ...

	// This time 'template' is a method that has some logic, and refers to pieces of DOM using variables.
	template() {
		const greeting = (
			<span>
				Hello <i>{this.firstName}</i>
			</span>
		)

		console.log(greeting instanceof HTMLSpanElement) // true

		// One piece of DOM can be composed into another:
		const result = <div>{greeting}</div>

		console.log(result instanceof HTMLDivElement) // true

		return result
	}

	// ... same as before ...

	css() {
		const thickness = Math.random() * 5

		return css`
			div {
				border: ${thickness}px solid teal;
			}
		`
	}

	// ... same as before ...
}
```

### Easily create and manipulate DOM

The following is just plain Solid.js at the top level of a module. This sort of
code can be useful in the `template` of a custom element, or the body of a
functional component.

```jsx
import {createSignal} from 'solid-js'

// Make a signal with an initial value of 0.
const [count, setCount] = createSignal(0)

// Increment the value of count every second.
setInterval(() => setCount(count() + 1), 1000)

// Create a <div> element with a child <h1> element. The data-count attribute
// and the text content of the <h1> element will automatically be updated whenever
// the count variable changes.
const el = (
	<div>
		<h1 data-count={count()}>The count is: {count()}</h1>
	</div>
)

// The result stored in the `el` variable a <div> element! For example,
// you can call regular DOM APIs like setAttribute on it.
el.setAttribute('foo', 'bar')

// Append the element to the body of the page, and now you'll see a
// continually-updating message on your screen.
document.body.append(el)
```

### Create functional components

Continuing with the same `count` variable from the previous example, here's how
to compose DOM trees using "functional components". This is also just plain
Solid.js, but can be useful in a custom element's `template`.

A functional component is a function that simply returns one or more DOM
elements. JSX expressions and the `html` template string tag both return the top
level elements defined in the markup.

```jsx
// This is just plain Solid.js code. See https://solidjs.com for more on writing
// functional components.

// This Label functional component uses the empty <></> tag to contain more than
// one root-level child, and the return value will be an array of DOM nodes.
const Label = props => (
	<>
		<div>{props.greeting}</div>
		{props.children}
	</>
)

// This Greeting functional component nests the content of the Label component
// in its template, and the <div> inside the <Label> gets distributed to the
// part of the Label component where we see `{props.children}`.
const Greeting = () => (
	<section>
		<Label greeting={'hello (' + count() + ')'}>
			<div>John</div>
		</Label>
	</section>
)

// You only need to call this once, and you get a reference to an element or
// multiple elements. You do NOT need to call it over and over to re-render like
// you do in some other libraries. That's what makes all of this simple and
// clean. The reactivity inside the component templates takes care of updating
// content of the created DOM tree.
// Here elem is a reference to an actual `<section>` element.
const elem = Greeting()

// It's just DOM! Use regular DOM APIs to append the element to the body.
document.body.append(elem)
```

Writing function components can sometimes be simpler, but without features that
custom elements have like style scoping (requires an additional a Solid.js
library or compiler plugin).

In contrast to custom elements, functional components only work within the
context of other functional components made with Solid.js or custom elements
made with `@lume/element`. Functional components will no longer be compatible
with React, Vue, Angular, Svelte, or all the rest. For portability across
applications and frameworks, it is preferable to create custom elements.

<!-- TODO
Custom elements are also debuggable in a browser's element inspector out of the
box, while functional components are not. See Lume's Debugging guide for info.
-->

### Use functional components inside custom elements

Continuing from above, here's a custom element that re-uses the `Greeting`
component. This shows that any regular Solid.js component can be
used in the `template` of a custom element made with `@lume/element`:

```jsx
@element('cool-element')
class CoolElement extends Element {
	template = () => (
		<>
			<h2>Here's a greeting:</h2>
			<Greeting />
		</>
	)
}

document.body.inserAdjacentHTML('beforeend', `<cool-element></cool-element>`)
```

## TypeScript

### With Solid.js JSX

Load the required JSX types in one of two ways:

1.  Import the types locally within particular files where JSX is used (this is
    useful for preventing type conflicts if you have other files that use React
    JSX types or other JSX types):

    ```ts
    /* jsxImportSource solid-js */
    ```

2.  Place the `jsxImportSource` in your tsconfig.json to have it apply to all
    files (this works great if you use only one form of JSX types in your
    project, but if you have files with different types of JSX, you'll want to
    use option 1 instead).

    ```json
    {
    	"compilerOptions": {
    		"jsxImportSource": "solid-js"
    	}
    }
    ```

In TypeScript, all JSX expressions have the type `JSX.Element`. But Solid's JSX
expressions return actual DOM nodes, and we want the JSX expression types to
reflect that fact. For this we have a set of convenience helpers to cast JSX
expressions to DOM element types in the `@lume/element/dist/type-helpers.js`
module.

Modifying the very first example from above for TypeScript, it would look
like the following.

```tsx
/* @jsxImportSource solid-js */
// ^ Alternatively, configure this in tsconfig.json instead of per-file.

import {createSignal} from 'solid-js'
import {div} from '@lume/element/dist/type-helpers.js'

const [count, setCount] = createSignal(0)

setInterval(() => setCount(count() + 1), 1000)

const el = div(
	<div>
		<h1 data-count={count()}>The count is: {count()}</h1>
	</div>,
)

el.setAttribute('foo', 'bar')

document.body.appendChild(el)
```

The main differences from plain JS are

- Use of the `@jsxImportSource` comment to place JSX types into scope. This is
  required, or TypeScript will not know what the types of elements in JSX
  markup are. Alternative to comments, configure it in tsconfig.json's
  `compilerOptions`.
- The `div()` helper function explicitly returns the type `HTMLDivElement` so
  that the `el` variable will be typed as `HTMLDivElement` instead of
  `JSX.Element`. Under the hood, the `div()` function is an identity function
  at runtime, it simply returns whatever you pass into it, and serves only as a
  convenient type cast helper.

> [!Warning]
> Keep in mind to use the correct type helper depending on what the root element
> of the JSX expression is. For for example, if the root of a JSX expression is a
> `<menu>` element then we need to use the `menu()` helper like follows.

```tsx
/* @jsxImportSource solid-js */
import {createSignal} from 'solid-js'
import {menu} from '@lume/element/dist/type-helpers.js'

// ...

// The type of `el` will be `HTMLMenuElement`.
const el = menu(
	<menu>
		<h1 data-count={count()}>The count is: {count()}</h1>
	</menu>,
)
```

If the wrong helper is used, then it will effectively cast the expression to
the wrong type. For example, in the next snippet the `el` variable will be of
type `HTMLDivElement` despite the fact that at runtime we will be have an
`HTMLMenuElement` instance.

```tsx
/* @jsxImportSource solid-js */
import {div, button} from '@lume/element/dist/type-helpers.js'

// GOOD.
const el = button(<button>...</button>)

// BAD! Don't do this! Remember to double check, because the helpers are not
// type safe, you will not get an error here, and el2 will incorrectly be type
// HTMLDivElement.
const el2 = div(<menu>...</menu>)
```

Without the type helpers, we would need to write more verbose code like the
following to have the proper types, but note that the following is also not type
safe:

```tsx
/* @jsxImportSource solid-js */

// GOOD.
const el = (<menu>...</menu>) as any as HTMLMenuElement

// BAD! Don't do this! Remember to double check, because the helpers are not
// type safe, you will not get an error here.
const el2 = (<menu>...</menu>) as any as HTMLDivElement
```

#### Type definitions for custom elements

To give your Custom Elements type checking for use with DOM APIs, and type
checking in JSX, use the following template.

```tsx
/* @jsxImportSource solid-js */

// We already use @jsxImportSource above, but if you need to reference JSX
// anywhere in non-JSX parts of the code, you also need to import it from
// solid-js:
import {Element, element, stringAttribute, numberAttribute, /*...,*/ JSX} from 'solid-js'
//                                                                   ^ We imported JSX so that...

// Define the attributes that your element accepts
export interface CoolElementAttributes extends JSX.HTMLAttributes<CoolElement> {
	//                                           ^ ...we can use it in this non-JSX code.
	'cool-type'?: 'beans' | 'hair'
	'cool-factor'?: number
	// ^ NOTE: These should be dash-case versions of your class's attribute properties.
}

@element('cool-element')
class CoolElement extends Element {
	@stringAttribute coolType: 'beans' | 'hair' = 'beans'
	@numberAttribute coolFactor = 100
	// ^ NOTE: These are the camelCase equivalents of the attributes defined above.

	// ... Define your class as described above. ...
}

export {CoolElement}

// Add your element to the list of known HTML elements. This makes it possible
// for browser APIs to have the expected return type. For example, the return
// type of `document.createElement('cool-element')` will be `CoolElement`.
declare global {
	interface HTMLElementTagNameMap {
		'cool-element': CoolElement
	}
}

// Also register the element name in the JSX types for TypeScript to recognize
// the element as a valid JSX tag.
declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements {
			'cool-element': CoolElementAttributes
		}
	}
}
```

> :bulb:**TIP:**
>
> To make code less redundant, use the `ElementAttributes` helper to
> pluck the types of properties directly from your custom element class for the
> attribute types:

```ts
import type {ElementAttributes} from '@lume/element'

// This definition is now shorter than before, and automatically maps the property names to dash-case.
export type CoolElementAttributes = ElementAttributes<CoolElement, 'coolType' | 'coolFactor'>
```

Now when you use `<cool-element>` in Solid JSX, it will be type checked:

```jsx
return (
	<cool-element
		cool-type={123} // Type error: number is not assignable to 'beans' | 'hair'
		cool-factor={'foo'} // Type error: string is not assignable to number
	></cool-element>
)
```

### With React JSX

Define the types of custom elements similarly to above, but with some small differences for React JSX:

```ts
import type {HTMLAttributes} from 'react'

// Define the attributes that your element accepts, almost the same as before:
export interface CoolElementAttributes extends HTMLAttributes<CoolElement> {
	'cool-type'?: 'beans' | 'hair'
	'cool-factor'?: number
	// ^ NOTE: These should be dash-case versions of your class's attribute properties.
}

// Add your element to the list of known HTML elements, like before.
declare global {
	interface HTMLElementTagNameMap {
		'cool-element': CoolElement
	}
}

// Also register the element name in the React JSX types, which are global in
// the case of React.
declare global {
	namespace JSX {
		interface IntrinsicElements {
			'cool-element': CoolElementAttributes
		}
	}
}
```

> :bulb:**TIP:**
>
> To make code less redundant, use the `ReactElementAttributes` helper to
> pluck the types of properties directly from your custom element class for the
> attribute types:

```ts
import type {ReactElementAttributes} from '@lume/element/src/react'

// This definition is now shorter than before, and automatically maps the property names to dash-case.
export type CoolElementAttributes = ReactElementAttributes<CoolElement, 'coolType' | 'coolFactor'>
```

## API

### `Element`

A base class for custom elements made with `@lume/element`. It provides:

#### `template`

A subclass can define a `.template` that returns a DOM node, and this DOM node
will be appened into the element's `ShadowRoot` by default, or to the element
itself if `.hasShadow` is `false`.

One way to write a `template` is using [Solid
JSX](https://www.solidjs.com/tutorial/introduction_jsx) syntax (this will always
require a build step).

```js
import {Element} from '@lume/element'
import {createSignalFunction} from 'classy-solid' // a small wrapper around Solid's createSignal that allows reading and writing from the same function.

class CoolElement extends Element {
	count = createSignalFunction(100)

	template() {
		return (
			<div>
				<span>The count is: {this.count()}!</span>
			</div>
		)
	}
	// ...
}

customElements.define('cool-element', CoolElement)
```

> [!Warning]
> If using JSX, `template` has to be a method and not an arrow function due to a
> current [bug with Solid.js JSX and arrow
> functions](https://github.com/ryansolid/dom-expressions/issues/293). The `html`
> template tag can be written as an arrow function:

Another way to write a `template` is using Solid's `html` template string tag
(which does not require a build step). Using the following `template`, the
example can run in a browser without a compile step (note, we're not using
decorators yet):

```js
// ...
template = () => html`
	<div>
		<span>The count is: ${this.count}!</span>
	</div>
`
// ...
```

> [!Note]
> When `count` changes, the template updates automatically.

We can also manually create DOM some other way, for example here we make and
return a DOM tree using DOM APIs, and using a Solid effect to update the element
when `count` changes (but you could have used React or jQuery, or anything
else):

```js
// ...
import {createEffect} from 'solid-js'

// ...

template = () => {
	const div = document.createElement('div')
	const span = document.createElement('span')

	createEffect(() => {
		// Automatically set the textContent whenever `count` changes (this is a
		// conceptually-simplified example of what Solid JSX compiles to).
		span.textContent = `The count is: ${this.count}!`
	})

	return div
}

// ...
```

#### `static css`

Use the _static_ `css` field to define a CSS string for styling all instances of
the given class. A static property allows `@lume/element` to optimize by sharing
a single `CSSStyleSheet` across all instances of the element, which could be
beneficial for performance if you have thousands of instances.

```js
import {Element} from '@lume/element'

class CoolElement extends Element {
	template() {
		return <span>This is some DOM!</span>
	}

	static css = `
    /* Style is scoped, this will only style the <span> inside our element. */
    span { color: cornflowerblue; }
  `
	// ...
}

customElements.define('cool-element', CoolElement)
```

The `static css` property can also be a function:

```js
// ...

class CoolElement extends Element {
	// ...
	static css = () => {
		const color = 'cornflowerblue'

		return `
      span { color: ${color}; }
    `
	}
	// ...
}
```

> :bulb:**Tip:**
>
> Use the `css` identity template tag to enable syntax highlighting in some IDEs:

```js
import {css} from '@lume/element'
// ...

class CoolElement extends Element {
	// ...
	static css = css`
		span {
			color: cornflowerblue;
		}
	`
	// ...
}
```

#### `css`

Use the _non-static_ `css` property to define styles that are applied _per
instance_ of the given element. This is useful for style that should differ
across instances. This will not be optimizeable as much as `static css` can be,
but it might not matter at all (it won't for most use cases).

```js
import {Element} from '@lume/element'

class CoolElement extends Element {
	template() {
		return <span>This is some DOM!</span>
	}

	// A random opacity per instance
	opacity = Math.random()

	css = `
    /* Style is scoped, this will only style the <span> inside our element. */
    span { opacity: ${this.opacity}; }
  `
	// ...
}
```

#### `connectedCallback`

Nothing new here, this is simply a part of the browser's [native Custom Elements
API](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks).
It is triggered when the element is connected into the document. Use it to
create things.

```js
import {Element} from '@lume/element'

class CoolElement extends Element {
	connectedCallback() {
		// Don't forget to call the super method from the Element class!
		super.connectedCallback()

		// ...Create things...
	}
	// ...
}
```

#### `disconnectedCallback`

Nothing new here, this is simply a part of the browser's [native Custom Elements
API](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks).
It is triggered when the element is disconnected from the document. Use it to
clean things up.

```js
import {Element} from '@lume/element'

class CoolElement extends Element {
	disconnectedCallback() {
		// Don't forget to call the super method from the Element class!
		super.disconnectedCallback()

		// ...Clean things up...
	}
	// ...
}
```

#### `adoptedCallback`

Nothing new here, this is simply a part of the browser's [native Custom Elements
API](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks).
It is triggered when the element is adopted into a new document (f.e. in an iframe).

```js
import {Element} from '@lume/element'

class CoolElement extends Element {
	adoptedCallback() {
		// Don't forget to call the super method from the Element class!
		super.adoptedCallback()

		// ...Do something when the element was transferred into another window's or iframe's document...
	}
	// ...
}
```

#### `attributeChangedCallback`

Nothing new here, this is simply a part of the browser's [native Custom Elements
API](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks).
It is triggered when an _observed attribute_ of the element is added, modified,
or removed.

```js
import {Element} from '@lume/element'

class CoolElement extends Element {
	static observedAttributes = ['foo', 'bar']

	attributeChangedCallback(attributeName, oldValue, newValue) {
		// Don't forget to call the super method from the Element class!
		super.attributeChangedCallback(attributeName, oldValue, newValue)

		// Attribute name is the name of the attribute change changed.
		// If `oldValue` is `null` and `newValue` is a string, it means the attribute was added.
		// If `oldValue` and `newValue` are both strings, it means the value changed.
		// If `oldValue` is a string and `newValue` is `null`, it means the attribute was removed.
	}
	// ...
}
```

> [!Warning]
> The `static observedAttributes` property is required, and specifies which
> attributes will trigger `attributeChangedCallback`. `attributeChangedCallback`
> will not be triggered for other attributes that are not listed.

#### `static observedAttributes`

Nothing new here, this is simply a part of the browser's [native Custom Elements
API](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes).
It defines which attributes will be observed. From the previous example:

```js
class CoolElement extends Element {
	static observedAttributes = ['foo', 'bar']
	// ...
}
```

Additionally, Lume supports defining an object form of `observedAttributes` only
when using the `@element` decorator. This can be used to map attributes to JS
properties:

```js
import {Element, element} from '@lume/element'

element('cool-element')(
	class CoolElement extends Element {
		static observedAttributes = {
			foo: {from: Number},
			bar: {from: Boolean},
		}

		// Due to the `observedAttributes` definition, any time the `"foo"` attribute
		// on the element changes, the attribute string value will be converted into a
		// `Number` and assigned to the JS `.foo` property.
		// Not only does `.foo` have an initial value of `123`, but when the element's
		// `"foo"` attribute is removed, `.foo` will be set back to the initial value
		// of `123`.
		foo = 123

		// Due to the `observedAttributes` definition, any time the `"bar"` attribute
		// on the element changes, the attribute string value will be converted into a
		// `Boolean` and assigned to the JS `.bar` property.
		// Not only does `.bar` have an initial value of `123`, but when the element's
		// `"bar"` attribute is removed, `.bar` will be set back to the initial value
		// of `false`.
		bar = false

		// ...
	},
)
```

`@lume/element` has a few types built in for this non-decorator usage format:

```js
import {Element, element, attribute} from '@lume/element'

element('cool-element')(
	class CoolElement extends Element {
		static observedAttributes = {
			lorem: {}, // Effectively the same as attribute.string()
			foo: attribute.string(), // Effectively an the same as `{}`, effectively the same as the @attribute or @stringAttribute decorators. Values get passed to the JS property as strings.
			bar: attribute.number(), // Effectively the same as the @numberAttribute decorator. Values get passed to the JS property as numbers.
			baz: attribute.boolean(), // Effectively the same as the @booleanAttribute decorator. Values get passed to the JS property as booleans.
			bespoke: {from: value => JSON.Parse(value)}, // Custom mapping of the attribute value to the JS property, f.e. besoke='{"n": 123}' -> {n: 123}
		}

		lorem = 'hello'
		foo = 'blah'
		bar = 123
		baz = false
		bespoke = {n: 123}

		// ...
	},
)
```

Each value in the `observedAttributes` objects has the following shape:

```ts
/**
 * Defines how values are mapped from an attribute to a JS property on a custom
 * element class.
 */
export type AttributeHandler<T = any> = {
	// TODO `to` handler currently does nothing. If it is present, then prop
	// changes should reflect back to the attribute. This will add a performance
	// hit.
	to?: (propValue: T) => string | null

	/**
	 * Define how to deserialize an attribute string value on its way to the
	 * respective JS property.
	 *
	 * If not defined, the attribute string value is passed to the JS property
	 * untouched.
	 */
	from?: (AttributeValue: string) => T

	/**
	 * The default value that the respective JS property should have when the
	 * attribute is removed.
	 *
	 * If not initially defined, this will be defined to whatever the initial JS
	 * property value is.
	 *
	 * When explicitly defined, an attribute's respective JS property will be set to this
	 * value when the attribute is removed, even if that is different than the JS property's initial value.
	 *
	 * If this is not explicitly defined, and the JS property has no initial
	 * value, then the JS property will receive `undefined` when the attribute is
	 * removed which matches the initial value of the JS property (this is not
	 * ideal, especially in TypeScript, you should provide initial JS property
	 * values so that shapes of your elements are well defined), just like
	 * `attributeChangedCallback` does.
	 */
	default?: T
}
```

If you will have decorator support in your app's build, it is easier to write the same using decorators.

```js
import {Element, element, numberAttribute, booleanAttribute} from '@lume/element'

@element('cool-element')
class CoolElement extends Element {
	// Due to the `@numberAttribute` decorator, any time the `"foo"` attribute
	// on the element changes, the attribute string value will be converted into a
	// `Number` and assigned to the JS `.foo` property.
	// Not only does `.foo` have an initial value of `123`, but when the element's
	// `"foo"` attribute is removed, `.foo` will be set back to the initial value
	// of `123`.
	@numberAttribute foo = 123

	// Due to the `observedAttributes` definition, any time the `"bar"` attribute
	// on the element changes, the attribute string value will be converted into a
	// `Boolean` and assigned to the JS `.bar` property.
	// Not only does `.bar` have an initial value of `123`, but when the element's
	// `"bar"` attribute is removed, `.bar` will be set back to the initial value
	// of `false`.
	@booleanAttribute bar = false

	// ...
}
```

> [!Note]
> Not only do decorators make the definition more concise, but it avoids surface
> area for human error: the non-decorator form requires defining the same-name
> property in both the `observedAttributes` object and as a class field, and if
> you miss one or the other things might not work as expected.

#### `static elementName`

The default tag name of the elements this class instantiates. When using
the `@element` decorator, this property will be set to the value defined
by the decorator.

#### `static defineElement`

Define this class for the given element `name`, or using its default name
(`elementName`) if no `name` given. Defaults to using the global
`customElements` registry unless another registry is provided (for
example a ShadowRoot-scoped registry).

If a `name` is given, then the class will be extended with an empty
subclass so that a new class is used for each new name, because otherwise
a CustomElementRegistry does not allow the same exact class to be used
more than once regardless of the name.

Returns the defined element class, which is only going to be a
different subclass of the class this is called on if passing in a custom
`name`, otherwise returns the same class this is called on.

#### `hasShadow`

When `true`, the custom element will have a `ShadowRoot`. Set to `false`
to not use a `ShadowRoot`. When `false`, styles will not be scoped via
the built-in `ShadowRoot` scoping mechanism, but by a much more simple
shared style sheet placed at the nearest root node, with `:host`
selectors converted to tag names.

#### `get/set root`

Subclasses can override this to provide an alternate Node to render into
(f.e. a subclass can `return this` to render into itself instead of
making a root) regardless of the value of `hasShadow`.

#### `get styleRoot`

Define which `Node` to append style sheets to when `hasShadow` is `true`.
Defaults to the `this.root`, which in turn defaults to the element's
`ShadowRoot`. When `hasShadow` is `true`, an alternate `styleRoot` is
sometimes needed for styles to be appended elsewhere than the root. For
example, return some other `Node` within the root to append styles to.
This is ignored if `hasShadow` is `false`.

This can be useful for fixing issues where the default append of a style
sheet into the `ShadowRoot` conflicts with how DOM is created in
`template` (f.e. if the user's DOM creation in `template` clears the
`ShadowRoot` content, or etc, then we want to place the stylesheet
somewhere else).

### `@element`

A decorator for defining a custom element.

When passed a string, it will be the element name:

```js
import {Element, element} from '@lume/element'

@element('cool-element')
class CoolElement extends Element {
	// ...
}
```

> [!Note]
> Make sure you extend from the `Element` base class from `@lume/element`.

> [!Note]
> The `Element` class from `@lume/element` extends from `HTMLElement`.
>
> Safari does not support customized built-ins, and neither does
> `@lume/element`, so at the moment we do not support extending from other classes
> such as `HTMLButtonElement`, etc.

When not passed a string, the element will not be defined, and
`customElements.define` should be used manually, which can be useful for
upcoming scoped registries:

```js
import {Element, element} from '@lume/element'

@element
class CoolElement extends Element {
	// ...
}

customElements.define('cool-element', CoolElement)
```

Finally, even if passed a string for the element name, a second boolean option
can disable automatic definition, and in this case the constructor's `.define()`
method can be used to trigger the definition using the given name:

```js
import {Element, element} from '@lume/element'

const autoDefine = false

@element('cool-element', autoDefine)
class CoolElement extends Element {
	// ...
}

CoolElement.define() // defines <cool-element>
```

A custom name can be passed to `.define()` too:

```js
CoolElement.define('other-element') // defines <other-element> (even if `<cool-element>` is already defined)
```

### `@attribute`

A decorator for defining a generic element attribute. The name of the property
is mapped from camelCase to dash-case.

```ts
import {Element, element, attribute} from '@lume/element'

@element('cool-element')
class CoolElement extends Element {
	@attribute firstName = null // the attribute name is first-name
	// ...
}
```

When an attribute is removed, the JS property will receive the default value
determined by the initial value of the JS property.

Sample usage of the attribute from the outside:

```js
const el = document.querySelector('cool-element')

el.setAttribute('first-name', 'Superman')
console.log(el.firstName) // logs "Superman"

el.removeAttribute('first-name')
console.log(el.firstName) // logs null
```

Had we defined a different default value,

```js
	@attribute firstName = 'Batman'
```

then removing the attribute will set the JS property back to the intitial value:

```js
const el = document.querySelector('cool-element')

el.setAttribute('first-name', 'Superman')
console.log(el.firstName) // logs "Superman"

el.removeAttribute('first-name')
console.log(el.firstName) // logs "Batman"
```

This is great because the intial values that you see in the class definition are
always the expected values when the element has not attributes or when all
attributes were removed, making the outcome predictable.

For TypeScript, you'll want the property type to be at least `string | null` if
the value starts `null`.

```ts
import {Element, element, attribute} from '@lume/element'

@element('cool-element')
class CoolElement extends Element {
	@attribute firstName: string | null = null
	// ...
}
```

For TypeScript, if the initial value is a string, then no type annotation is
needed because it will always receive a string (f.e. when the attribute is
removed) and the type will be inferred from the initial value:

```ts
import {Element, element, attribute} from '@lume/element'

@element('cool-element')
class CoolElement extends Element {
	@attribute firstName = 'Batman' // always a `string`
	// ...
}
```

You can of course make a broader type that accepts string from the element
attribute, but also other types via the JS property directly:

```ts
import {Element, element, attribute} from '@lume/element'

@element('cool-element')
class CoolElement extends Element {
	@attribute firstName: string | number = 'Batman' // always a `string`
	// ...
}
```

```js
const el = document.querySelector('cool-element')

el.firstName = 123 // ok
```

### `@numberAttribute`

A decorator that defines an attribute that accepts a number. Any value the
attribute receives will be converted into a number on the JS property.

```ts
import {Element, element, numberAttribute} from '@lume/element'

@element('cool-element')
class CoolElement extends Element {
	@numberAttribute age = 10
	// ...
}
```

```js
const el = document.querySelector('cool-element')

el.setAttribute('age', '20')
console.log(el.age) // logs 20
console.log(typeof el.age) // logs "number"

el.removeAttribute('age')
console.log(el.age) // logs 10
console.log(typeof el.age) // logs "number"
```

For TypeScript, you don't need a type annotation if the initial value is a
number. Add a type annotation only if you use a non-number initial value, f.e.
`number | SomeOtherType`, but that's not a recommended practice:

```ts
import {Element, element, numberAttribute} from '@lume/element'

@element('cool-element')
class CoolElement extends Element {
	@numberAttribute age: 'ten' | number = 'ten'
	// ...
}
```

```js
const el = document.querySelector('cool-element')

el.setAttribute('age', '20')
console.log(el.age) // logs 20
console.log(typeof el.age) // logs "number"

el.removeAttribute('age')
console.log(el.age) // logs "ten"
console.log(typeof el.age) // logs "string"
```

### `@booleanAttribute`

A decorator that defines a boolean attribute. Any value the attribute receives
will be converted into a boolean on the JS property.

To mimick the same behavior as boolean attributes on built-in elements where the
presence of the attribute is true, and absence of the attribute is false, start
with an initial value of `false`.

```ts
import {Element, element, booleanAttribute} from '@lume/element'

@element('cool-element')
class CoolElement extends Element {
	@booleanAttribute hasPizza = false
	// ...
}
```

If the attribute value exists, the JS property will receive `true`, except if
the value of the attribute is explicitly `"false"`:

```js
const el = document.querySelector('cool-element')

el.setAttribute('has-pizza', '')
console.log(el.age) // logs true
console.log(typeof el.age) // logs "boolean"

el.setAttribute('has-pizza', 'blah blah')
console.log(el.age) // logs true
console.log(typeof el.age) // logs "boolean"

el.removeAttribute('has-pizza')
console.log(el.age) // logs false
console.log(typeof el.age) // logs "boolean"

el.setAttribute('has-pizza', 'false')
console.log(el.age) // logs false
console.log(typeof el.age) // logs "boolean"
```

Here is the equivalent example in HTML describing the values of `has-pizza`:

```html
<!-- hasPizza == true -->
<cool-element has-pizza></cool-element>

<!-- hasPizza == true -->
<cool-element has-pizza="true"></cool-element>

<!-- hasPizza == false -->
<cool-element></cool-element>

<!-- hasPizza == false -->
<cool-element has-pizza="false"></cool-element>
```

If you start with an initial value of `true`, then when the attribute is removed
or never existed, the JS property will always be `true`, which again is useful
for predictability od default state.

```ts
import {Element, element, booleanAttribute} from '@lume/element'

@element('cool-element')
class CoolElement extends Element {
	@booleanAttribute hasPizza = true
	// ...
}
```

In this case, only an attribute value of `"false"` can set the JS property to `false`:

```js
const el = document.querySelector('cool-element')

el.setAttribute('has-pizza', '')
console.log(el.age) // logs true
console.log(typeof el.age) // logs "boolean"

el.setAttribute('has-pizza', 'blah blah')
console.log(el.age) // logs true
console.log(typeof el.age) // logs "boolean"

el.removeAttribute('has-pizza')
console.log(el.age) // logs true
console.log(typeof el.age) // logs "boolean"

el.setAttribute('has-pizza', 'false')
console.log(el.age) // logs false
console.log(typeof el.age) // logs "boolean"
```

Equivalent HTML:

```html
<!-- hasPizza == true -->
<cool-element has-pizza></cool-element>

<!-- hasPizza == true -->
<cool-element has-pizza="foo"></cool-element>

<!-- hasPizza == true -->
<cool-element></cool-element>

<!-- hasPizza == false -->
<cool-element has-pizza="false"></cool-element>
```

> :bulb:**Tip:**
>
> Avoid attribute values like `has-pizza="foo"`, because they are not semantic.
> Use the form `has-pizza` for true or no attribute for false when the
> default/initial value is `false`. Use the form `has-pizza="true"` and
> `has-pizza="false"` to be explicit, especially when the initial value is `true`.

### `@signal`

This is from [`classy-solid`](https://github.com/lume/classy-solid), but because
`@element` is composed with classy-solid's `@reactive` decorator, a
non-attribute signal property can be defined without also having to use
classy-solid's `@reactive` decorator:

```ts
import {Element, element, booleanAttribute} from '@lume/element'
import {signal} from 'classy-solid'

@element('cool-element')
class CoolElement extends Element {
	// hasPizza will be reactive but an attribute will not be observed for this
	// property, and the property can only be set via JS.
	@signal hasPizza = false

	// This property *does* get updated when a `has-drink` attributes is updated.
	@booleanAttribute hasDrink = false

	// ...
}
```

## Resources

See https://solid.js.com, https://primitives.solidjs.community, and
https://github.com/lume/classy-solid for APIs that are useful with
`@lume/element`.

Also see alternative Custom Element (i.e. Web Component) systems to
`@lume/element` like
[`solid-element`](https://github.com/solidjs/solid/tree/main/packages/solid-element),
[Lit](https://lit.dev/), [Stencil](https://stenciljs.com),
[Enhance](https://enhance.dev/), [Fast
Elements](https://www.fast.design/docs/fast-element/getting-started), [Lightning
Web Components](https://lwc.dev),
[ReadyMade](https://readymade-ui.github.io/readymade), [GitHub
Elements](https://github.com/github/github-elements),
[Atomico](https://atomicojs.dev), and [more
here](https://webcomponents.dev/new).

## Status

![](https://github.com/lume/element/workflows/Build%20and%20Test/badge.svg)
