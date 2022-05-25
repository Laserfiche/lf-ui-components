# lf-cdn

## What this project does

Generates `dist/lf-cdn/lf-ui-components.js` that can be used to import UI elements using the script tag. Please see top-level README for more information.

## Build

1. Cd to repo's root folder.
2. `npm install ./projects/ui-components`
3. Build ui-components using `npm run build-ui-components-prod`.
4. Run `npm run create-lf-cdn`, which will generate `dist/lf-cdn/lf-ui-components.js`.
