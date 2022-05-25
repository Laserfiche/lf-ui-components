# @laserfiche/lf-ui-components

A collection of UI Components to be used to interact with Laserfiche.

It is a library for reusable laserfiche ui web components, as well as its documentation.
The default project is `lf-documentation`.

## Why choose @Laserfiche/lf-ui-components?

- Compatible with many web frameworks including Angular, React, Vue, or no framework at all.
- Pure client side implementation with no dependencies on specific services implementation.

## Using @laserfiche/lf-ui-components

See detailed documentation [here](https://unpkg.com/@laserfiche/lf-ui-components@12.0/cdn/index.html#/getting-started)

## Contribution

We welcome contributions and feedback. Please follow our [contributing guidelines](https://github.com/Laserfiche/lf-ui-components/blob/12.x/CONTRIBUTING.md).

## Development Setup

### Prerequisites

See .github/workflows/main.yml for Node and NPM version used.

### Build ui-components CDN script

1. Cd to repo's root folder.
1. `npm install ./projects/ui-components`
1. Build ui-components using `npm run build-ui-components-prod`.
1. Run `npm run create-lf-cdn`, which will generate `dist/lf-cdn/lf-ui-components.js`.

### Build types-lf-ui-components NPM

This will create a package with version 1.0.0. If you would like to update the version, change the version at `./types-lf-ui-components-publish/package.json`.

```sh
npm install ./projects/ui-components # if you haven't already
npm run create-types-lf-ui-components
```

to create `./types-lf-ui-components-publish/laserfiche-types-lf-ui-components-1.0.0.tgz`.

Steps if you want to run them consecutively:

1. `npm run tsc-cdn`
1. `npm run api-extractor`
1. `gulp processTypesFile`
1. `npm run move-enum-to-types`
1. `cd ./types-lf-ui-components-publish`
1. `npm pack`

### Build lf-documentation

Install lf-documentation specific dependencies (including local types package):

```sh
cd ./projects/lf-documentation
npm install
```

Build lf-documentation:

```sh
npm run build-lf-documentation-prod
```

to create `./dist/lf-documentation`.

Build style sheets:

```sh
npm run sass-lf
npm run sass-ms
```

You can then open `./dist/lf-documentation/index.html` to view the documentation. Some components won't work correctly if opened locally so we recommend create an IIS Virtual Directory and pointing it to the `./dist` folder when running locally.

This project loads the script from `./dist/lf-cdn/lf-ui-components.js`. Please [build the script locally](#CDN) or [download from the CDN](https://unpkg.com/@laserfiche/lf-ui-components@12/cdn/lf-ui-components.js) to view the documentation.

## Things to verify before creating a Pull Request

### Run tests

```sh
npm run test
```

This will launch a Chrome browser and run all projects, starting with the first. You can press Ctrl+C in the console to run the next project.
You can also run a specific project, for example: `npm run test ui-components`.
For more details on how to run specific components or tests, visit the karma test documentation.

### Run lint

```sh
npm run lint
```
