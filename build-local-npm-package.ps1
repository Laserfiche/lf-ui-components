npm run build-ui-components-prod
npm run create-lf-cdn
npm run build-lf-documentation-prod

New-Item -ItemType Directory -Force -Path dist/ui-components/cdn | Out-Null

cp node_modules/@angular/material/prebuilt-themes/indigo-pink.css dist/ui-components/cdn/
mv dist/lf-cdn/browser/lf-ui-components.js dist/ui-components/cdn/
mv dist/lf-cdn/browser/lf-ui-components.js.map dist/ui-components/cdn/
cp dist/lf-documentation/browser/lf-laserfiche-lite.css dist/ui-components/cdn/
cp dist/lf-documentation/browser/lf-laserfiche-lite.css.map dist/ui-components/cdn/
cp dist/lf-documentation/browser/lf-ms-office-lite.css dist/ui-components/cdn/
cp dist/lf-documentation/browser/lf-ms-office-lite.css.map dist/ui-components/cdn/

cp README.md dist/ui-components/

cd dist/ui-components
npm pack
cd ../..
