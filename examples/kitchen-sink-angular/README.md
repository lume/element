# Angular example

An example that shows how to write a custom element and then use it in an Angular
component's template including type checking, autocompletion, and intellisense.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.10.

# Running the example

## install dependencies

For this example, use the following command to install dependencies if you will
run it inside of a cloned `@lume/element` repo:

```sh
npm clean-install --no-workspaces --install-links
```

If that doesn't work due to the package-lock (sometimes it fails when the linked
package changes), run

```sh
npm install --no-workspaces --install-links
```

If you will copy this example to a standalone folder, outside of the
`@lume/elemenet` code repository, modify the `package.json` file so that this
dependency,

```js
"@lume/element": "../.."
```

is replaced with the latest version range of the `@lume/element` package, for example:

```js
"@lume/element": "^0.15.0"
```

and then run

```sh
npm install
```

## Run the example

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

You can now publish the files onto a web server for production.

If any questions, reach out on the Lume [chat server](https://discord.com/invite/PgeyevP)
or the [forum](https://lume.community) (preferred, but you should join both to get the best help).
