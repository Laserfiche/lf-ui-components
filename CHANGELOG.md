## 13.1.2

### Features
- `[lf-repository-browser]`: Add function `openSelectedNodesAsync` to enable ability to open selected nodes, programatically
- `[lf-repository-browser]`: Improve keyboard accessibility for multi-select

### Fixes
- `[lf-repository-browser]`: Fix bug when multi select is enabled - multiselect selection was dependent on the order the entries were checked.
- Reference dependency `zone.js` from `lfxstatic.com`
  - `<script src='https://lfxstatic.com/npm/-/zone.js@0.11.4/bundles/zone.umd.min.js'></script>`
- `[lf-documentation]` reference style sheets from `lfxstatic.com`
- Reference language resources from `lfxstatic.com`

### Chore & Maintenance

## 13.1.1

### Features

### Fixes

- `[lf-selection-list]` and `[lf-repository-browser]`: Fixed the lf-selection-list from hijacking the keydown events for the whole window. https://github.com/Laserfiche/lf-ui-components/issues/60
- `[lf-repository-browser]`: Fix entrySelected event when item is clicked that is not selectable. Clicking an item that is not selectable clears previous selections unless ctrl or shift are pressed.

### Chore & Maintenance

## 13.1.0

### Features
- `[lf-repository-browser]`: Add `lf-repository-browser` component. This will replace `lf-file-explorer` and `lf-folder-browser` in the next major release

### Fixes

### Chore & Maintenance

- `[lf-documentation]`: Use Angular modules directly in documentation, instead of via the CDN
  - This adds the ability to use `--watch` with `ng build`

## 13.0.1

### Features

### Fixes

- `lf-laserfiche-lite.css`, `lf-ms-office-lite.css`
  - Make styles more specific.
  - Stop overriding the cdk-overlay z-index for material components to 9999. This means any of our elements with dialogs, dropdowns, or menus will open those components in an overlay with the default z-index for Angular Material, 1000.
- `[lf-documentation]`: add back button to go to the landing page.
- `[lf-field-container]` Fix selected template name not showing.
- `[lf-field-container]` Fix datetime picker styling issues.

### Chore & Maintenance

- `@laserfiche/lf-js-utils` upgrade to version 4.0.3
- `@laserfiche/lf-resource-library` upgrade to version 4.x

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
