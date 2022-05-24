# What this project does: 
Generates `dist/lf-cdn/lf-ui-components.js` that can be used to import UI elements using the script tag. Please see top-level README for more information.

# Build: 
2. Cd to repo's root folder.
2. `npm install ./projects/ui-components --no-save` or 
```sh
cd ./projects/ui-components
npm install --prefix ../../ --no-save
cd ../../
```
3. Build ui-components using `npm run build-ui-components-prod`.
4. Build using `npm run create-lf-cdn`, generating `dist/lf-cdn/lf-ui-components.js`.


