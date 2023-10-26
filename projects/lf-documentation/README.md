<!--Copyright (c) Laserfiche.
Licensed under the MIT License. See LICENSE in the project root for license information.-->

# lf-documentation

## What this project does

Generates `dist/lf-documentation`, the documentation for lf-ui-components, which can be used as the sample project for the ui components via CDN. Please see top-level README for more information.

## Build

1. Cd to repo's root folder.
2. `npm install ./projects/ui-components
3. Build ui-components using `npm run build-ui-components-prod`.
4. Build lf-documentation using `npm run build-lf-documentation-prod`, generating `dist/lf-documentation`
5. Build stylesheet using `npm run sass-lf`
