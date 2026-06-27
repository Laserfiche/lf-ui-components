# AGENTS

## Workspace

- This repo is an Angular workspace with the following projects:
  - [projects/lf-cdn/](projects/lf-cdn): app — packages all UI components into a single JS file hosted on the CDN
  - [projects/lf-documentation/](projects/lf-documentation): app — interactive documentation and manual validation app
  - [projects/ui-components/](projects/ui-components): library modules — the individual UI components; publishable as `@laserfiche/lf-ui-components`
    - [projects/ui-components/shared/](projects/ui-components/shared): library modules — UI components shared by other UI components (public)
    - [projects/ui-components/internal-shared/](projects/ui-components/internal-shared): library modules — UI components not intended for public use; also contains non-public utility functions and localization services
  - [projects/styles/](projects/styles): style sheets providing styling
    - Laserfiche style: [projects/styles/lf-laserfiche-lite/lf-laserfiche-lite.scss](projects/styles/lf-laserfiche-lite/lf-laserfiche-lite.scss)
    - Microsoft Office style: [projects/styles/lf-ms-office-lite/lf-ms-office-lite.scss](projects/styles/lf-ms-office-lite/lf-ms-office-lite.scss)
- Generated and packaging-related outputs live under [types-lf-ui-components-publish/](types-lf-ui-components-publish), [projects/styles/](projects/styles), and `dist/`.
- Start with the root docs for project intent and contribution expectations: [README.md](README.md), [CONTRIBUTING.md](CONTRIBUTING.md), and [.github/workflows/main.yml](.github/workflows/main.yml).

## Environment And Validation

- Use Node 24. The canonical local script in [build-test-locally.ps1](build-test-locally.ps1) aborts on any other major version.
- The cheapest validation should match the slice you changed:
  - library code: `npm run build-ui-components-prod` or `npm run build-ui-components-dev`
  - repo checks: `npm run lint` and `npm run format:check`
  - browser tests: `npm run test`
- Browser tests run through Vitest browser mode with Playwright Chromium. If the browser is missing, install it with `npx playwright install chromium`.
- For full local parity with CI and packaging, run [build-test-locally.ps1](build-test-locally.ps1). It performs install, build, lint, formatting, CDN generation, stylesheet generation, type package generation, Playwright install, and tests.
- Avoid `npm run format:write` unless the user asked for repo-wide formatting or you are intentionally accepting formatting churn. CI checks formatting with `npm run format:check`.

## Edit Boundaries

- The primary package entry point in [projects/ui-components/entry.ts](projects/ui-components/entry.ts) is intentionally a dummy export. Do not treat it as the main surface for new components; feature packages are exposed through their own entry points and `*-public-api.ts` files.
- When changing a public surface in [projects/ui-components/](projects/ui-components), update the relevant `*-public-api.ts` export path in the same feature area.
- Use [projects/ui-components/shared/](projects/ui-components/shared) for public shared code and [projects/ui-components/internal-shared/](projects/ui-components/internal-shared) for internal-only shared code.
- For UI work, prefer [projects/lf-documentation/](projects/lf-documentation) as the manual verification surface.
- Use `npx ng serve lf-documentation --configuration development --host 127.0.0.1 --port 4200` to serve the documentation and use VS Code `Browser: Open Integrated Browser` command to interact with documentation pages containing live components.

## Conventions

- Add or update unit tests for each bug fix or feature change, following [CONTRIBUTING.md](CONTRIBUTING.md).
- Library selectors use the `lf` prefix. App code in [projects/lf-documentation/](projects/lf-documentation) and [projects/lf-cdn/](projects/lf-cdn) uses the `app` prefix.
- Keep edits narrow and avoid changing generated or packaging outputs unless the task specifically requires them.

### Naming Conventions

#### Class Names

- Common elements: `lf-element-name` (e.g. `lf-button`, `lf-checkbox`)
- Components: `lf-component-name` (e.g. `lf-tree`, `lf-checklist`)
- Element subtypes: `subtype-element-name` (e.g. `primary-button`, `sec-button`)

#### File Names

- Common elements: `_element-name-style.scss` (e.g. `_button-lf.scss`, `_button-mo.scss`)
- Components: `rwc-component-name-style.scss` (e.g. `rwc-tree-lf.scss`, `rwc-tree-mo.scss`)

### Sass File Structure

Styling is kept modular so that individual components/elements can be found and altered without affecting the rest.

- **Common elements**: separate `.scss` files for elements that can appear outside of RWC (buttons, checkboxes, text fields). Users access this styling by adding a class to the HTML element.
- **Components**: `.scss` files that import the common-element styling they use, then define component-specific styling (e.g. padding for `lf-tree`). CSS that applies regardless of style (icons, scroll/overflow) belongs in the component's own `.css` source file.
- **Global Sass file**: all of the above are imported into one main `.scss` file that is processed. No CSS should be defined in the global file. The output `.css` is referenced via `<link>` in HTML or imported at the top of the project's CSS.
