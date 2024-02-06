## 14.1.8

### Chore & Maintenance

- Updated version of `@laserfiche/lf-api-client-core` to `1.1.10` due to transitive dependency vulnerability of `jsrsasign`

## 14.1.7

### Features

### Fixes

- `[AppLocalizationService]`: Do not console.warn on every message event

### Chore & Maintenance

- Update `@babel/traverse` dependency

## 14.1.6

### Features

### Fixes

- Fixed bug where LfMetadataValidationUtils.isNullOrEmpty was being passed a `Moment` Object, when it only expected types `String`, `null` and `undefined`
  Made sure to only pass in String types by casing Moment object to a `String`.

### Chore & Maintenance

## 14.1.5

### Features

### Fixes

- Fixed bug where required input field was not recognizing the character "s" as a valid input because of Regex issues.
  Changed to use LfMetadataValidationUtils.isNullOrEmpty to in the requiredValidator function in [validation-utils.ts](projects\ui-components\internal-shared\validation-utils.ts) instead of Regex.

### Chore & Maintenance

- Updated `@laserfiche/lf-js-utils` to version `4.0.8` to use newly added LfMetadataValidationUtils.isNullOrEmpty for field validation.
- `karma` update to 6.4.2
- `@angular/cli` switched to devDependency from peerDependency

## 14.1.4

### Features

- `[lf-login]`: Add property `authorizationRequestHandler` to lf-login component and added related types `LfHttpRequestHandler` and `LfBeforeFetchResult`
  - This property is a default `LfHttpRequestHandler` which can be used with the Laserfiche JS api client

### Fixes

### Chore & Maintenance

- Update `@laserfiche/lf-resource-library` to version 5.0.0
- Trimmed string resources of whitespace
- Changed the key `DO_YOU_WANT_TO_YOUR_APPLY_FIELD_CHANGES` to `DO_YOU_WANT_TO_APPLY_YOUR_FIELD_CHANGES` in order to match expectation in lf-resource-library

## 14.1.3

### Features

- `[lf-repository-browser]`: Add function `getTreeNodeByIdentifierAsync` to `LfTreeNodeService` interface
- `[lf-repository-browser]`: Add ability to open the browser to a specific folder by calling `initAsync` with a string identifier. That identifier will be used to call `getTreeNodeByIdentifierAsync`.

### Fixes

- `[lf-repository-browser]`: Add fixes for various bugs surrounding setting the column width to auto
- `[lf-repository-browser]`: Add fix for bug in which sorting creates an empty page when insufficient entries returned from service
- `[lf-repository-browser]`: Add fix for bug in which sorting after scrolling doesn't reset the scroll bar to the top.
- `[lf-repository-browser]`: Add fix for bug in which data entry width exceeding total header width

### Chore & Maintenance

## 14.1.2

### Features

- `[lf-user-feedback]`: Add ability to upload an image up to 3MB.

### Fixes

### Chore & Maintenance

## 14.1.1

### Features

### Fixes

- `[lf-repository-browser]`: Fix issue with column resizer event handlers
- `[lf-repository-browser]`: Fix overflow when displaying column contents

### Chore & Maintenance

- Update `@laserfiche/lf-resource-library` to version `4.0.6`: Add additional localized strings

## 14.1.0

### Features

- `[lf-repository-browser]`: add support for displaying column and sorting by column value
- `[lf-repository-browser]`: updated interface (no breaking change)
  - added method/properties
    - method `setColumnsToDisplay` to set columns
    - property `column_order_by`
    - property `page_size` for number of items rendered
    - property `always_show_header` for whether or not to show header if there is only one column
  - updated method `refreshAsync`: interface updated to `(clearSelectedValues?: boolean) => Promise<void>`. Added an option to opt out of clearing currently selected values when refreshes the current folder.
  - updated interface `LfTreeNNodeService`:
    `getFolderChildrenAsync` interface updated to `folder: LfTreeNode, nextPage?: string, orderBy?: ColumnOrderBy) => Promise<LfTreeNodePage>`. Added an option to pass in the column sorting preference.
- `[lf-user-feedback]`: add empower context and set Business Intelligence environment to production for feedback submitted in the empower environment.

### Fixes

### Chore & Maintenance

- Update `@laserfiche/lf-js-utils` to version `4.0.7`: Support localization based on Language cookie, if exists

## 13.1.8

### Features

- `[lf-user-feedback]`: add empower context and set Business Intelligence environment to production for feedback submitted in the empower environment.

### Fixes

### Chore & Maintenance

- Update `@laserfiche/lf-js-utils` to version `4.0.7`

## 14.0.0

### Features

### Fixes

### Chore & Maintenance

- **[BREAKING]**: Remove `lf-tree`, `lf-folder-browser`, `lf-file-explorer`
- **[BREAKING]**: Breaking change if using the npm package. Move `lf-toolbar` to `@laserfiche/lf-ui-components/shared`, and created it's own module `LfToolbarModule`
- **[BREAKING]**: Moved some internal utilities to `@laserfiche/lf-ui-components/internal-shared`. You should NOT import from this sub-entry-point. Everything in `@laserfiche/lf-ui-components/shared` is now reviewed and available for public use.
- **[BREAKING]**: Update to Angular 14
- Update build pipeline tasks to use Node 16

## 13.1.7

### Features

### Fixes

- `[LfLocalizationService]`: get resources locally rather than CDN so there is no delay in loading translations

### Chore & Maintenance

## 13.1.6

### Features

- `[LfLocalizationService]`: add ability to set debug mode on localization service via window.postMessage
- `[lf-field-container]`, `[lf-field-template-container]`, `[lf-field-adhoc-container]`: add displayName property to field and template definitions to allow for different changing displayName based on locale
- `[lf-field-template-container]`: add loading and error UIs
- `[lf-field-adhoc-container]`: add loading and error UIs and client-side paging to field selection for more responsive UI

### Fixes

### Chore & Maintenance

- `[lf-user-feedback]`: add support for localized strings
- `[lf-login]`: add support for localized string

## 13.1.5

### Features

- `[lf-repository-browser]`: add error handling when `getParentTreeNodeAsync` throws
- **[BREAKING]** `[lf-repository-browser]` method `setSelectedValuesAsync`:
  - change interface to
    ```
    setSelectedNodesAsync: (nodesToSelect: LfTreeNode[], maxFetchIterations: number) => Promise<void>;
    ```
  - clears previously selected items that are not included in `nodesToSelect` argument

### Fixes

- `[lf-repository-browser]`: fix `entryDblClicked` event firing timing
- `[lf-checklist]`: update style

### Chore & Maintenance

## 13.1.4

### Features

- `[lf-repository-browser]`: add `entryFocused` event, add `openFocusedNodeAsync` function to open currently focused node
- `[lf-login]` emits loginCompleted event if previously logged in
- `[lf-login]` utilizes domain provided in redirect url queryString, and remembers last app login region

### Fixes

### Chore & Maintenance

## 13.1.3

### Features

### Fixes

### Chore & Maintenance

- `@laserfiche/lf-js-utils` upgrade to version 4.0.4
- `rxjs` add compatibility with ^6.5

## 13.1.2

### Features

- `[lf-repository-browser]`: Add function `openSelectedNodesAsync` to enable ability to open selected nodes, programatically
- `[lf-repository-browser]`: Improve keyboard accessibility for multi-select

### Fixes

- `[lf-repository-browser]`: Fix bug when multi select is enabled - multiselect selection was dependent on the order the entries were checked.
- `[lf-user-feedback]`: Update 'Thank you' panel string
- Reference dependency `zone.js` from `lfxstatic.com`
  - `<script src='https://lfxstatic.com/npm/-/zone.js@0.11.4/bundles/zone.umd.min.js'></script>`
- `[lf-documentation]` reference style sheets from `lfxstatic.com`
- Reference language resources from `lfxstatic.com`
- `[lf-field-container]`, `[lf-field-template-container]`, `[lf-field-adhoc-container]`: Do not display fields of `FieldType` `Blob`.

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
