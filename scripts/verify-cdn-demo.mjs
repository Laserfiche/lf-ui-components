// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

/**
 * Loads the framework-agnostic demo page against the built CDN bundle in a real browser and fails
 * if any view rendered a number of times other than once.
 *
 * Unit tests on the Angular components cannot catch this class of defect: they never register a
 * custom element, so the element upgrade that produces a duplicate instance never happens. This
 * runs the element build the way an integrating host does, once per shipped theme.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// The bundle and the demo page are built into lf-cdn; the themes are compiled separately by
// sass-lf/sass-ms and are only copied next to the bundle later in packaging. Serving both means
// this runs straight after `create-lf-cdn` with no staging step.
const SERVE_ROOTS = [path.join(REPO_ROOT, "dist/lf-cdn/browser"), path.join(REPO_ROOT, "dist/generated-assets")];
const DEMO_PAGE = "framework-agnostic-ui-component-demo.html";
const THEMES = ["lf-laserfiche-lite.css", "lf-ms-office-lite.css"];

/** Resolves a request against the serve roots in order, or undefined when nothing matches. */
function resolveFile(relative) {
  for (const root of SERVE_ROOTS) {
    const file = path.join(root, relative);
    if (file.startsWith(root) && fs.existsSync(file)) {
      return file;
    }
  }
  return undefined;
}

const CONTENT_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".map": "application/json",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function startServer() {
  const server = http.createServer((req, res) => {
    const relative = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
    const file = resolveFile(relative);
    if (!file) {
      res.writeHead(404).end(`not found: ${relative}`);
      return;
    }
    fs.readFile(file, (err, buffer) => {
      if (err) {
        res.writeHead(404).end(`not found: ${relative}`);
        return;
      }
      res.writeHead(200, { "Content-Type": CONTENT_TYPES[path.extname(file)] ?? "application/octet-stream" });
      res.end(buffer);
    });
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

async function checkTheme(browser, port, theme) {
  const page = await browser.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") pageErrors.push(message.text());
  });

  await page.goto(`http://127.0.0.1:${port}/${DEMO_PAGE}?theme=${theme}`, { waitUntil: "load" });

  let result;
  try {
    await page.waitForFunction(() => window.__lfDemoResult !== undefined, null, { timeout: 30_000 });
    result = await page.evaluate(() => window.__lfDemoResult);
  } catch {
    result = { pass: false, error: "the page never reported a result", checks: [] };
  }

  await page.close();
  return { theme, result, pageErrors };
}

const themes = THEMES.filter((theme) => resolveFile(theme));

if (!resolveFile("lf-ui-components.js")) {
  console.error('No CDN bundle found. Run "npm run create-lf-cdn" first.');
  process.exit(1);
}

// Every shipped theme has to be exercised: whichever one the demo covers is the one that gets
// attention, so a missing theme is a gap in the matrix rather than something to skip past.
const missingThemes = THEMES.filter((theme) => !themes.includes(theme));
if (missingThemes.length > 0) {
  console.error(`Missing theme(s): ${missingThemes.join(", ")}. Run "npm run sass-lf" and "npm run sass-ms".`);
  process.exit(1);
}

const { server, port } = await startServer();
const browser = await chromium.launch({ args: ["--no-sandbox"] });

let failed = false;
try {
  for (const theme of themes) {
    const { result, pageErrors } = await checkTheme(browser, port, theme);

    console.log(`\n${theme}`);
    for (const check of result.checks ?? []) {
      console.log(`  ${check.pass ? "ok  " : "FAIL"}  ${check.name}: expected ${check.expected}, got ${check.actual}`);
    }
    if (result.error) {
      console.log(`  FAIL  ${result.error}`);
    }
    for (const error of pageErrors) {
      console.log(`  page error: ${error}`);
    }

    // A page error means the element build threw, which is a failure even if the counts are right.
    if (!result.pass || pageErrors.length > 0) {
      failed = true;
    }
  }
} finally {
  await browser.close();
  server.close();
}

if (failed) {
  console.error("\nCDN demo verification failed.");
  process.exit(1);
}

console.log(`\nCDN demo verification passed for ${themes.length} theme(s).`);
