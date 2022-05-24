# What this project does: 
Generates `dist/ui-components` that can be published as an NPM package and be used to import UI elements via NPM. Please see top-level README for more information.

# Build: 
1. Cd to repo's root folder.
2. `npm install ./projects/ui-components --no-save` or 
```sh
cd ./projects/ui-components
npm install --prefix ../../ --no-save
cd ../../
```
3. Build ui-components using `npm run build-ui-components-prod`, generating `dist/ui-components`.

