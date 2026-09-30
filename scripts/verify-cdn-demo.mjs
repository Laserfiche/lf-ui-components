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
  const origin = `http://127.0.0.1:${port}`;
  // A fixed locale, so the run does not depend on the machine it runs on.
  const page = await browser.newPage({ locale: "en-US" });
  const pageErrors = [];
  const externalErrors = [];
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const url = message.location().url;
    // A failed load of an external resource (the demo's icon sprite, the themes' fonts) is logged as
    // a console error too. It says nothing about the bundle, so it is reported but does not fail.
    if (url && !url.startsWith(origin)) {
      externalErrors.push(`${message.text()} (${url})`);
    } else {
      pageErrors.push(url ? `${message.text()} (${url})` : message.text());
    }
  });

  await page.goto(`${origin}/${DEMO_PAGE}?theme=${theme}`, { waitUntil: "load" });

  let result;
  try {
    await page.waitForFunction(() => window.__lfDemoResult !== undefined, null, { timeout: 30_000 });
    result = await page.evaluate(() => window.__lfDemoResult);
  } catch {
    result = { pass: false, error: "the page never reported a result", checks: [] };
  }

  await page.close();
  return { theme, result, pageErrors, externalErrors };
}

// Globals the bundle's dependencies assign to window on purpose, rather than leaking a declaration.
// flatpickr sets window.flatpickr itself, and the date and time picker plugins read it from there.
const EXPECTED_GLOBALS = ["flatpickr"];

/**
 * Loads the bundle alone, as the classic script hosts load it, and returns every property it added
 * to window. Top-level declarations of an unwrapped bundle land there, so this is what fails if the
 * function-scope wrapper in gulpfile.js renameLfCdn is ever lost.
 */
async function findLeakedGlobals(browser, port) {
  const page = await browser.newPage();
  await page.route("**/leaked-globals.html", (route) =>
    route.fulfill({
      contentType: "text/html",
      body:
        "<!doctype html>" +
        "<script>window.__lfGlobalsBefore = Object.getOwnPropertyNames(window);</script>" +
        '<script src="./lf-ui-components.js"></script>',
    })
  );

  try {
    await page.goto(`http://127.0.0.1:${port}/leaked-globals.html`, { waitUntil: "load" });
    // Registration completes once the Angular application is created, after the script has run.
    await page.waitForFunction(() => customElements.get("lf-tags") !== undefined, null, { timeout: 30_000 });
    const leaked = await page.evaluate((expected) => {
      const before = new Set(window.__lfGlobalsBefore);
      return Object.getOwnPropertyNames(window).filter(
        (name) => !before.has(name) && name !== "__lfGlobalsBefore" && !expected.includes(name)
      );
    }, EXPECTED_GLOBALS);
    return { leaked };
  } catch (error) {
    return { leaked: [], error: `the bundle never registered its elements (${String(error).split("\n")[0]})` };
  } finally {
    await page.close();
  }
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
    const { result, pageErrors, externalErrors } = await checkTheme(browser, port, theme);

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
    for (const error of externalErrors) {
      console.log(`  note: external resource failed, not counted: ${error}`);
    }

    // A page error means the element build threw, which is a failure even if the counts are right.
    if (!result.pass || pageErrors.length > 0) {
      failed = true;
    }
  }

  const { leaked, error } = await findLeakedGlobals(browser, port);
  console.log("\nglobals");
  if (error) {
    console.log(`  FAIL  ${error}`);
    failed = true;
  } else if (leaked.length > 0) {
    console.log(`  FAIL  the bundle added ${leaked.length} global(s): ${leaked.slice(0, 20).join(", ")}`);
    failed = true;
  } else {
    console.log("  ok    the bundle added no globals");
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
