# What this project does: 
Generates `dist/lf-documentation`, the documentation of the lf-ui-componenents, also can be used as the sample project of using the ui components via CDN. Please see top-level README for more information.

# Build: 
1. Cd to repo's root folder.
2. `npm install ./projects/ui-components --no-save` or `cd ./projects/ui-components && npm install --prefix ../../ --no-save`
3. Build ui-components using `npm run build-ui-components-prod`.
4. Build using `npm run create-lf-cdn`.
5. `npm run create-types-ui-components`
6. `npm install ./projects/lf-documentation --no-save`
7. `npm run build-lf-documentation-prod`
8. `npm run sass-lf`
