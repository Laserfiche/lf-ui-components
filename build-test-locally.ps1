# Copyright (c) Laserfiche.
# Licensed under the MIT License. See LICENSE in the project root for license information.

# build-test-locally.ps1
# Verifies Node 24, then runs all dev build/test steps as defined in README.md.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Pause-ForUser {
  Write-Host "`nPress Enter to continue..." -ForegroundColor Yellow
  $null = Read-Host
}

# ── 1. Verify Node 24 ──────────────────────────────────────────────────────────
$nodeMajor = [int](node --version).TrimStart('v').Split('.')[0]
if ($nodeMajor -ne 24) {
  Write-Error "Node 24 is required (found: $(node --version)). Aborting."
  exit 1
}
Write-Host "Node version OK: $(node --version)" -ForegroundColor Green
Pause-ForUser

# ── 2. Install ui-components ───────────────────────────────────────────────────
Write-Host "`n[Step 1/9] npm install ./projects/ui-components" -ForegroundColor Cyan
npm install ./projects/ui-components
Pause-ForUser

# ── 3. Build ui-components (production) ───────────────────────────────────────
Write-Host "`n[Step 2/9] npm run build-ui-components-prod" -ForegroundColor Cyan
npm run build-ui-components-prod
Pause-ForUser

# ── 4. Create CDN script ───────────────────────────────────────────────────────
Write-Host "`n[Step 3/9] npm run create-lf-cdn" -ForegroundColor Cyan
npm run create-lf-cdn
Pause-ForUser

# ── 5. Build stylesheets ───────────────────────────────────────────────────────
Write-Host "`n[Step 4/9] npm run sass-lf" -ForegroundColor Cyan
npm run sass-lf
Pause-ForUser

Write-Host "`n[Step 5/9] npm run sass-ms" -ForegroundColor Cyan
npm run sass-ms
Pause-ForUser

# ── 6. Build lf-documentation (production) ────────────────────────────────────
Write-Host "`n[Step 6/9] npm run build-lf-documentation-prod" -ForegroundColor Cyan
npm run build-lf-documentation-prod
Pause-ForUser

# ── 7. Build types package ────────────────────────────────────────────────────
Write-Host "`n[Step 7/9] npm run create-types-lf-ui-components" -ForegroundColor Cyan
npm run create-types-lf-ui-components
Pause-ForUser

# ── 8. Run tests ──────────────────────────────────────────────────────────────
Write-Host "`n[Step 8/9] npm run test" -ForegroundColor Cyan
npm run test
Pause-ForUser

# ── 9. Run lint ───────────────────────────────────────────────────────────────
Write-Host "`n[Step 9/9] npm run lint" -ForegroundColor Cyan
npm run lint
Pause-ForUser

Write-Host "`nAll steps completed successfully." -ForegroundColor Green
