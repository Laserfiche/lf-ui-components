# Copyright (c) Laserfiche.
# Licensed under the MIT License. See LICENSE in the project root for license information.

# build-test-locally.ps1
# Verifies Node 24, then runs all dev build/test steps as defined in README.md.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── 1. Verify Node 24 ──────────────────────────────────────────────────────────
$nodeMajor = [int](node --version).TrimStart('v').Split('.')[0]
if ($nodeMajor -ne 24) {
  Write-Error "Node 24 is required (found: $(node --version)). Aborting."
  exit 1
}
Write-Host "Node version OK: $(node --version)" -ForegroundColor Green

# Build/test steps (step numbers are generated dynamically).
$steps = @(
  [PSCustomObject]@{
    Name = 'npm install ./projects/ui-components'
    Command = { npm install ./projects/ui-components }
  }
  [PSCustomObject]@{
    Name = 'npm run build-ui-components-prod'
    Command = { npm run build-ui-components-prod }
  }
  [PSCustomObject]@{
    Name = 'npm run lint'
    Command = { npm run lint }
  }
  [PSCustomObject]@{
    Name = 'npm run format:check'
    Command = { npm run format:check }
  }
  [PSCustomObject]@{
    Name = 'npm run create-lf-cdn'
    Command = { npm run create-lf-cdn }
  }
  [PSCustomObject]@{
    Name = 'npm run sass-lf'
    Command = { npm run sass-lf }
  }
  [PSCustomObject]@{
    Name = 'npm run sass-ms'
    Command = { npm run sass-ms }
  }
  [PSCustomObject]@{
    Name = 'npm run build-lf-documentation-prod'
    Command = { npm run build-lf-documentation-prod }
  }
  [PSCustomObject]@{
    Name = 'npm run create-types-lf-ui-components'
    Command = { npm run create-types-lf-ui-components }
  }
  [PSCustomObject]@{
    Name = 'npx playwright install chromium'
    Command = { npx playwright install chromium }
  }
  [PSCustomObject]@{
    Name = 'npm run test:ci'
    Command = { npm run test:ci }
  }
)

$totalSteps = $steps.Count
$stepIndex = 0

foreach ($step in $steps) {
  $stepIndex++
  Write-Host "`n[Step $stepIndex/$totalSteps] $($step.Name)" -ForegroundColor Cyan
  & $step.Command
  if ($LASTEXITCODE -ne 0) {
    Write-Error "$($step.Name) failed with exit code $LASTEXITCODE. Aborting."
    exit $LASTEXITCODE
  }

  Write-Host "$($step.Name) succeeded." -ForegroundColor Green
}

Write-Host "`nAll steps completed successfully." -ForegroundColor Green
