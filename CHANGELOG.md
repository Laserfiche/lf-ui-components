## 13.0.1

### Features

### Fixes
- `lf-laserfiche-lite.css`, `lf-ms-office-lite.css` - Made styles more specific
- `<lf-user-feedback>`, `<lf-login>`, `<lf-breadcrumbs>`, `<lf-file-explorer>`, `<lf-folder-browser>`, `<lf-toolbar>`, `<lf-field-container>`, `<lf-field-adhoc-container>`, `<lf-field-template-container>`:
    These elements have dialogs, dropdowns, or menus. When they are opened, an overlay element is attached to the body of the hosting application that contains the contents of the dialogs, dropdowns, or menus. We changed the z-index of the overlay element to 1000 from 9999.

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
