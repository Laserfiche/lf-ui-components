## 13.0.1

### Features

### Fixes
- `lf-laserfiche-lite.css`, `lf-ms-office-lite.css` 
  - Made styles more specific.
  - Stopped overriding the cdk-overlay z-index for material components to 9999. This means any of our elements with dialogs, dropdowns, or menus will open those components in an overlay with the default z-index for Angular Material, 1000.
- `[lf-documentation]`: add back button to go to the landing page.
- `[lf-field-container]` Fix selected template name not showing.

### Chore & Maintenance

## 13.0.0

### Features

### Fixes

### Chore & Maintenance

- Update to use @angular@13.
- Add dependency to `zone.js`.
    - For CDN usage, add a script tag to load `zone.js`
    - `<script src='https://cdn.jsdelivr.net/npm/zone.js@0.11.4/bundles/zone.umd.min.js'></script>`
- NPM package's module format is now ECMAScript Modules (ESM).

## 12.0.2

### Features

### Fixes

- `lf-ms-office-lite.css` Fix `lf-button` style.
- `<lf-field-adhoc-container>` Fix localization of field types.

### Chore & Maintenance

- Add dependency to `@laserfiche/lf-api-client-core`.
- `docs` Change documentation to point to released package/url.

## 12.0.1

### Features

### Fixes

- `<lf-field-container>` Fix no template selected styles.
- `<lf-checklist>` Fix icons not disappearing right away.


### Chore & Maintenance


## 12.0.0

### Features

### Fixes

### Chore & Maintenance

- Initial release to NPM. 
- Built using Angular 12.
