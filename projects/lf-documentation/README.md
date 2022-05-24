# lf-documentation

## What this project does

Generates `dist/lf-documentation`, the documentation for lf-ui-components, which can be used as the sample project for the ui components via CDN. Please see top-level README for more information.

## Build

1. Cd to repo's root folder.
2. `npm install ./projects/ui-components
3. Build ui-components using `npm run build-ui-components-prod`.
4. Build lf-cdn using `npm run create-lf-cdn`.
5. Create local types npm package using `npm run create-types-lf-ui-components`
6. Install local types npm package

    ```sh
    cd ./projects/lf-documentation
    npm install
    cd ../../
    ```

7. Build lf-documentation using `npm run build-lf-documentation-prod`, generating `dist/lf-documentation`
8. Build stylesheet using `npm run sass-lf`
