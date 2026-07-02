# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See [AGENTS.md](AGENTS.md) for detailed workspace structure, validation guidance, edit boundaries, and naming conventions.

## Commands

```powershell
# Install dependencies
npm ci

# Build
npm run build-ui-components-prod     # library (production)
npm run build-ui-components-dev      # library (development, faster)
npm run build-ui-components-dev-watch  # library watch mode
npm run build-lf-documentation-prod  # documentation app
npm run build-lf-cdn-prod            # CDN bundle

# Serve documentation locally (interactive development)
npm run serve                        # http://127.0.0.1:4200

# Watch mode for active UI development (run both in separate terminals)
npm run build-ui-components-dev-watch
npm run build-lf-documentation-dev-watch

# Test (Vitest + Playwright Chromium)
npm run test
npx playwright install chromium      # if browser is missing

# Lint & format
npm run lint
npm run format:check

# Full local CI parity
.\build-test-locally.ps1

# Build and pack for local install in another repo
.\build-local-npm-package.ps1
# Output: dist/ui-components/laserfiche-lf-ui-components-*.tgz
```

To run a single test file:
```powershell
npx vitest --browser.enabled path/to/file.spec.ts
```

## Architecture

This is an Angular monorepo workspace with three projects:

### `projects/ui-components` — publishable library (`@laserfiche/lf-ui-components`)

The primary package entry point (`entry.ts`) is a dummy export. The real public API is split across **secondary entry points**, each with its own `ng-package.json` and `*-public-api.ts` barrel file:

| Entry point | Import path |
|---|---|
| lf-login | `@laserfiche/lf-ui-components/lf-login` |
| lf-checklist | `@laserfiche/lf-ui-components/lf-checklist` |
| lf-metadata | `@laserfiche/lf-ui-components/lf-metadata` |
| lf-repository-browser | `@laserfiche/lf-ui-components/lf-repository-browser` |
| lf-tags | `@laserfiche/lf-ui-components/lf-tags` |
| lf-user-feedback | `@laserfiche/lf-ui-components/lf-user-feedback` |
| lf-selection-list | `@laserfiche/lf-ui-components/lf-selection-list` |
| shared | `@laserfiche/lf-ui-components/shared` |

`internal-shared/` contains shared components and localization services that are consumed internally but not exposed in the published package.

### `projects/lf-cdn` — CDN bundle

Registers all ui-components as Angular Elements (custom HTML elements) and bundles them into a single `lf-ui-components.js` for CDN delivery. This enables usage in non-Angular frameworks (React, Vue, plain HTML).

### `projects/lf-documentation` — documentation app

Interactive demo and manual validation surface for all components. Prefer this project for verifying UI changes visually before submitting a PR.

### `projects/styles` — SCSS themes

Two themes compiled to CSS:
- `lf-laserfiche-lite.scss` → Laserfiche branding
- `lf-ms-office-lite.scss` → Microsoft Office styling

These are compiled separately via `npm run sass-lf` / `npm run sass-ms` and are included in both the CDN bundle and the documentation app.
