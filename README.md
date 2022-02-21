# @lume/element

Easily create Custom Elements with simple templates and reactivity.

<h4><code><strong>npm install @lume/element</strong></code></h4>

## Live demos

- [Using JSX and decorator syntax.](https://webcomponents.dev/edit/EJ5VTuaaO0Iwq3APUFMe)
- [Plain JS, template strings instead of JSX, no decorators.](https://webcomponents.dev/edit/yObgikY1CK2Ef2VUPYBA)

## Intro

[Custom](https://developers.google.com/web/fundamentals/web-components/customelements)
[Elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)
(also known as [Web
Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) are
a feature of browsers that allow us to define new HTML elements that the
browser understands in the same way as built-in elements like `<div>` or
`<button>`.

If that flew over your head then you might first want to try a [beginner HTML
tutorial](https://htmldog.com/guides/html/beginner/). You will also need to
some basic knowledge of
[JavaScript](https://www.google.com/search?q=JavaScript%20for%20absolute%20beginners).

`@lume/element` provides a set of features that make it easier to manipulate
elements and to define new custom elements and easily compose them together
into an application.

With `@lume/element` we can create custom elements that have the following
features:

- Properties are reactive variables that make it easy to react to changes in these properties.
- Each custom element has an HTML template (in the form of [HTML markup inside JavaScript, or
  JSX](https://facebook.github.io/jsx)) that automatically "re-renders" when any
  reactive variable used in the template changes.
- When a template "re-renders", the whole template doesn't render, only the
  part of the template where a variable changed is re-rendered. The term
  "re-render" is quoted because tempate don't really re-render, but instead
  reactive variables are mapped to discrete parts of the live
  [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
  generated from a template.
- Changes to HTML attributes on a custom element can be easily mapped to the
  custom element's properties. Because properties are reactive, this will cause
  the custom element's template to update.

Additionally `@lume/element` can be used to create and manipulate trees of
DOM elements without necessarily creating new custom elements.

## Install and Setup

> STUB: This section needs expansion, but should be enough for anyone
> familiar with common build tooling in the webdev/JS ecosystem.

This assumes some familiarity with JavScript build tools. (TODO, make this
more beginner-friendly.)

Install the [Babel transpiler](http://babeljs.io), and
[`babel-preset-solid`](https://npmjs.com/babel-preset-solid) which is a Babel
preset that gives us reactive HTML-like markup inside JavaScript known as
"JSX":

```sh
npm install @lume/element @babel/core babel-preset-solid
```

If you'll be compiling with the Babel cli, also install `@babel/cli`. Or if
you're using a tool like Webpack, you'll need `babel-loader`.

Configure Babel to use the preset, and tell the preset to use `@lume/element`
for runtime imports inside your project's `.babelrc` file or in your
[Webpack](http://webpack.js.org) `babel-loader` config:

```json
{
	"presets": [["solid", {"moduleName": "@lume/element"}]]
}
```

## Basic Usage

### Manipulating and composing trees of elements

The following is an example that shows how to create a tree of HTML elements
whose attributes or text content automatically update when the value of a
reactive variable changes.

```jsx
import {variable} from '@lume/element'

// Make a reactive variable with an initial value of 0.
const count = variable(0)

// Increment the value of the variable every second.
setInterval(() => count(count() + 1), 1000)

// Create a <div> element with a child <h1> element. The data-count attribute
// and the text content of the <h1> element will automatically update whenever
// the count variable changes. You will see the text content update live in your
// browser.
const el = (
	<div>
		<h1 data-count={count()}>The count is: {count()}</h1>
	</div>
)

// The result stored in the `el` variable is a regular DOM element! For example,
// you can call regular DOM APIs like setAttribute on it.
el.setAttribute('foo', 'bar')

// Append the element to the body of the page, and now you'll see a
// continually-updating message on your screen.
document.body.appendChild(el)
```

Continuing with the same `count` variable from the previous example, here's a
simple way to compose DOM trees using "functional components".

```jsx
// A functional component is a function that returns the
// The Label functional component uses the empty <></> tag to contain more than
// one root-level child; it will not render any actual element output for the
// empty tags.
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

// You only need to call this once, and you get an element reference. You do NOT
// need to call it over and over to re-render like you do in some other
// libraries. That's what makes all of this simple and clean. The reactivity
// inside the component templates takes care of updating content of the created
// DOM tree.
const elem = Greeting()

// It's just DOM! Use regular DOM APIs to append the element to the body.
document.body.prepend(elem)
```

### Create custom elements

Composing DOM trees with functions is one way that you can build an application.

Another way to create re-usable components is to create Custom Elements. The
advantage of custom elements is that they follow web standards, and therefore
they can be used in any web application and manipulated by any DOM
manipulation libraries like [jQuery](https://jquery.com/),
[React](https://reactjs.org), [Vue](https://vuejs.org), or
[Angular](https://angular.io), and many more.

In contrast to custom elements, functional components made with
`@lume/element` only work within the context of other functional components
or custom elements made with `@lume/element`. For portability across
applicatins and frameworks, it is preferable to create custom elements.

The following is a class-based web component (custom element) with a reactive
property `firstName` that also accepts values from an attribute named
`first-name` (the property name is converted to dash-case for the attribute
name).

```jsx
import {
	Element, // A base class for LUME custom elements
	attribute, // A property decorator to map attributes to properties
	reactive, // A property decorator to make a property reactive
	css, // A no-op identity function (useful to enable CSS syntax highlighting in various text editors)
} from '@lume/element'

@element('greeting-card') // defines the element tag name
class GreetingCard extends Element {
	// Make the firstName property a reactive variable, and also map any value
	// from an attribute named 'first-name' back to this property (the attribute
	// name is the dash-case version of the property name).
	@reactive @attribute firstName = 'Roger'

	// Define the structure of the DOM tree that we want rendered on screen by
	// providing a template property. This template property should simply
	// reference a DOM element (which we can create with JSX), and that DOM
	// element will be, by default, appended into the ShadowRoot of our custom
	// element.
	//
	// To take advantage of reactivity in our template, simply use the same
	// technique here as we did in the section above titled "Manipulating and
	// composing trees of elements", by using reactive variables or properties
	// in the places where they should be "rendered".
	//
	// Any time the `.firstName` reactive property's value changes, the DOM will
	// be automatically updated, thanks how the JSX works (it compiles to reactive
	// computations).
	template = (
		<div>
			<span>
				Hello <i>{this.firstName}</i>
			</span>
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
	// This style has higher specificity than styles in the static `css` property.
	// In this example, the divs in each instance of this element will have borders of random sizes.
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
		// couple of seconds, and we'll see the change on screen change.
		setTimeout(() => (this.firstName = 'Zaya'), 2000)

		// And show that it works with by setting HTML attributes too, two seconds later.
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

An element's `template` can also be a function (method). Just like in the
section [Manipulating and composing trees of
elements](#manipulating-and-composing-trees-of-elements), inside an element's
`template()` method we can assign bits and pieces of DOM to variables, and we
can also use other custom elements and functional components. Similary, the `css` property can also be a method.

The following shows an alternative way to write the previous `template` and
`css` properties as a methods.

```jsx
@element('greeting-card')
class GreetingCard extends Element {
	// ... same as before ...

	// This time 'template' is a function.
	template() {
		const greeting = (
			<span>
				Hello <i>{this.firstName}</i>
			</span>
		)

		console.log(greeting instanceof HTMLSpanElement) // true

		const result = <div>{greeting}</div>

		console.log(result instanceof HTMLDivElement) // true

		return result
	}

	// ... same as before ...

	css() {
		const thickness = Math.random() * 5 // random per instance of the element

		return css`
			div {
				border: ${thickness}px solid teal;
			}
		`
	}

	// ... same as before ...
}
```

## TypeScript

### With LUME Element JSX (Solid.js JSX)

Load the required JSX types in one of two ways:

1.  Import the types locally within particular files where JSX is used (this is
    useful for preventing type conflicts if you have other files that use React
    JSX types or other JSX types):

    ```ts
    /* jsxImportSource @lume/element */
    ```

2.  Place the `jsxImportSource` in your tsconfig.json to have it apply to all
    files (this works great if you use only one form of JSX types in your
    project, but if you have files with different types of JSX, you'll want to
    use option 1 instead).

    ```json
    {
    	"compilerOptions": {
    		"jsxImportSource": "@lume/element"
    	}
    }
    ```

In TypeScript, all JSX expressions return the type `JSX.Element`. But with
`@lume/element`, JSX expressions return actual DOM nodes, and we want the JSX
expression types to reflect that fact. For this we have a set of convenience
helpers to cast JSX expressions to DOM element types in the
`@lume/element/dist/type-helpers.js` module.

Modifying the very first example from above for TypeScript, it would look
like the following.

```tsx
/* @jsxImportSource @lume/element */
// ^ Alternatively, configure this in tsconfig.json instead of per-file.

import {variable} from '@lume/element'

// Remember to use .js extensions to be ES-Module-compliant in Node.js, systems
// like Webpack 5+, and native ES Modules in browsers out of the box.
import {div} from '@lume/element/dist/type-helpers.js'

const count = variable(0)

setInterval(() => count(count() + 1), 1000)

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

Caution! :warning: Keep in mind to use the correct type helper depending on what the root
element of the JSX expression is. For for example, if the root of a JSX is a `<menu>`
element then we need to use the `menu()` helper like follows.

```tsx
/* @jsxImportSource @lume/element */
import {variable} from '@lume/element'
import {div} from '@lume/element/dist/type-helpers.js'

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
/* @jsxImportSource @lume/element */
import {div, button} from '@lume/element/dist/type-helpers.js'

// GOOD.
const el = button(<button>...</button>)

// BAD! Don't do this! Remember to double check, because the helpers are not
// type safe, you will not get an error here.
const el2 = div(<menu>...</menu>)
```

Without the type helpers, we would need to write more verbose code like the
following to have the proper types, but note that the following equivalent
example is also not type safe:

```tsx
/* @jsxImportSource @lume/element */

// GOOD.
const el = (<menu>...</menu>) as any as HTMLMenuElement

// BAD! Don't do this! Remember to double check, because the helpers are not
// type safe, you will not get an error here.
const el2 = (<menu>...</menu>) as any as HTMLDivElement
```

#### Type definitions for custom elements

To give your Custom Elements type support for use with DOM APIs and in JSX,
use the following template.

```tsx
/* @jsxImportSource @lume/element */

// We already use @jsxImportSource above, but if you need to reference JSX
// anywhere in non-JSX parts of the code, you also need to import it:
import {Element, element, reactive, numberAttribute, ..., JSX} from '@lume/element'
                                                       // ^ We imported JSX so that...

// Define the attributes that your element accepts
export interface CoolElementAttributes extends JSX.HTMLAttributes<CoolElement> {
                                            // ^ ...we can use it in this non-JSX code.
	'cool-type'?: 'beans' | 'hair'
	'cool-factor'?: number
  // ^ NOTE: These should be dash-case versions of your class's attribute properties.
}

@element('cool-element')
export class CoolElement extends Element {
  @reactive @attribute coolType: 'beans' | 'hair' = 'beans'
  @reactive @numberAttribute(100) coolFactor = 100
  // ^ NOTE: These are the camelCase equivalents of the attributes defined above.

	// ... Define your class as described above. ...
}

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
declare module '@lume/element' {
	namespace JSX {
		interface IntrinsicElements {
			'cool-element': CoolElementAttributes
		}
	}
}
```

**TIP:** To make code less redundant, use the `ElementAttributes` helper to
pluck the types of properties directly from your custom element class for the
attribute types:

```ts
import type {ElementAttributes} from '@lume/element'

// This definition is now shorter than before, and automatically maps the property names to dash-case.
export type CoolElementAttributes = ElementAttributes<CoolElement, 'coolType' | 'coolFactor'>
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

**TIP:** To make code less redundant, use the `ReactElementAttributes` helper to
pluck the types of properties directly from your custom element class for the
attribute types:

```ts
import type {ReactElementAttributes} from '@lume/element/src/react'

// This definition is now shorter than before, and automatically maps the property names to dash-case.
export type CoolElementAttributes = ReactElementAttributes<CoolElement, 'coolType' | 'coolFactor'>
```

## Status

![](https://github.com/lume/element/workflows/Build%20and%20Test/badge.svg)
