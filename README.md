# @laserfiche/lf-ui-components

A collection of UI Components to be used to build apps that interact with Laserfiche.

UI Components are compatible with many web frameworks including Angular, React, Vue, and no framework.

## Using @laserfiche/lf-ui-components

See documentation [here](https://developer.laserfiche.com/client_reference/lf-ui-components/docs/14.x/index.html#/).

## Change Log

See CHANGELOG [here](https://github.com/Laserfiche/lf-ui-components/blob/14.x/CHANGELOG.md).

## Contribution

We welcome contributions and feedback. Please follow our [contributing guidelines](https://github.com/Laserfiche/lf-ui-components/blob/14.x/CONTRIBUTING.md).

## Development Setup

### Prerequisites

See .github/workflows/main.yml for Node and NPM version used.

### Build ui-components CDN script

1. Cd to repo's root folder.
1. `npm install ./projects/ui-components`
1. Build ui-components using: `npm run build-ui-components-prod`
1. Run: `npm run create-lf-cdn`
   - This command will generate the CDN entry file `dist/lf-cdn/lf-ui-components.js`.

### Build types-lf-ui-components NPM

This will create a package with version 14.0.0. If you would like to update the version, change the version at `./types-lf-ui-components-publish/package.json`.

```sh
npm install ./projects/ui-components # if you haven't already
npm run create-types-lf-ui-components
```

The command above will output: `./types-lf-ui-components-publish/laserfiche-types-lf-ui-components-14.0.0.tgz`.

### Build lf-documentation

You can use the lf-documentation project for testing changes.

Build lf-documentation:

```sh
cd repo-root-folder
npm run build-ui-components-prod
npm run build-lf-documentation-prod
```

to create `./dist/lf-documentation`.

Build style sheets:

```sh
npm run sass-lf
npm run sass-ms
```

### For interactive development: Build lf-documentation in watch mode

This allows you to see changes you make to the ui components quickly. You can run the two commands in different windows so that you can see any changes in the browser, even those that are shared across components.

```sh
cd repo-root-folder
npm run build-ui-components-dev-watch
npm run build-lf-documentation-dev-watch
```

to create `./dist/lf-documentation`.

### View the interactive documentation

1. Configure a web server to serve `./dist` (e.g. IIS on WIndows).

2. Browse to `http://localhost/dist-folder/lf-documentation/index.html` to view the documentation (assuming that `dist-folder` is mapped to `./dist`).

   - Note that index.html loads the UI components using `<script src="./../lf-cdn/lf-ui-components.js" defer></script>`

## Things to verify before creating a Pull Request

### Run tests

```sh
npm run test
```

This will launch a Chrome browser and run all projects.
Press Ctrl+C in the console to run the next project.

You can also run a specific project, for example: `npm run test ui-components`.
For more details on how to run specific components or tests, visit the karma test documentation.

### Run lint

```sh
npm run lint
```
