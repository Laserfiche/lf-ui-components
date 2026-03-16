// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

const { src, dest } = require('gulp');
const replace = require('gulp-replace');
const fs = require('fs');

const argv = require('yargs')(process.argv.slice(2)).parserConfiguration({
  'parse-numbers': false,
}).argv;

// Strings for replacement
const BUILD_NUMBER = 'PIPELINE_VERSION';
const NPM_VERSION = 'NPM_VERSION';
const TYPE_FILE_PATH = './types-lf-ui-components-publish/index.d.ts';
const TYPES_IMPORTS = /import.*/g;
const TYPES_EXPORTS = /export.*{.*}.*/g;
const TYPES_EVENTEMITTER = 'EventEmitter';
const TYPES_CUSTOMEVENT = 'CustomEvent';
const TYPES_IMPLEMENTS = /implements.*{/g;
const TYPES_NO_IMPLEMENTS = '{';
const NPM_PUBLISH = './types-lf-ui-components-publish/';
const LF_CDN_BROWSER_DIR = './dist/lf-cdn/browser/';
const MAIN_SCRIPT_FILE = 'main.js';
const MAIN_SCRIPT_MAP_FILE = 'main.js.map';
const LF_CDN_INDEX_FILE = 'index.html';
const CDN_UI_COMPONENTS_FILE = 'lf-ui-components.js';
const CDN_UI_COMPONENTS_MAP_FILE = 'lf-ui-components.js.map';
const COMPILED_GETTING_STARTED_FILE_PATH = './dist/lf-documentation/browser/main.js';
const BUILT_INDEX_HTML_FILEPATH = './dist/lf-documentation/browser/index.html';
const OLD_LF_STYLE_SHEET_PATH = './lf-laserfiche-lite.css';
const NEW_LF_STYLE_SHEET_PATH =
  'https://lfxstatic.com/npm/@laserfiche/lf-ui-components@NPM_VERSION/cdn/lf-laserfiche-lite.css';
const OLD_MS_OFFICE_STYLE_SHEET_PATH = './lf-ms-office-lite.css';
const NEW_MS_OFFICE_STYLE_SHEET_PATH =
  'https://lfxstatic.com/npm/@laserfiche/lf-ui-components@NPM_VERSION/cdn/lf-ms-office-lite.css';

async function replacePlaceholdersInDocumentation() {
  src(COMPILED_GETTING_STARTED_FILE_PATH, { base: './' })
    .pipe(replace(OLD_LF_STYLE_SHEET_PATH, NEW_LF_STYLE_SHEET_PATH))
    .pipe(replace(OLD_MS_OFFICE_STYLE_SHEET_PATH, NEW_MS_OFFICE_STYLE_SHEET_PATH))
    .pipe(dest('./'));
}

async function replaceVersionInDocumentation() {
  src(COMPILED_GETTING_STARTED_FILE_PATH, { base: './' }).pipe(replace(NPM_VERSION, getNpmVersion())).pipe(dest('./'));
}

async function replaceVersionInIndexHtml() {
  src(BUILT_INDEX_HTML_FILEPATH, { base: './' })
    .pipe(replace(BUILD_NUMBER, getNpmVersion()))
    .pipe(replace(NPM_VERSION, getNpmVersion()))
    .pipe(dest('./'));
}

function getNpmVersion() {
  const npmVersion = argv.npmVersion;
  return npmVersion;
}

async function processTypesFile() {
  src([TYPE_FILE_PATH])
    .pipe(replace(TYPES_IMPORTS, ''))
    .pipe(replace(TYPES_EXPORTS, ''))
    .pipe(replace(TYPES_EVENTEMITTER, TYPES_CUSTOMEVENT))
    .pipe(replace(TYPES_IMPLEMENTS, TYPES_NO_IMPLEMENTS))
    .pipe(dest(NPM_PUBLISH));
}

async function renameLfCdn() {
  const mainJsPath = LF_CDN_BROWSER_DIR + MAIN_SCRIPT_FILE;
  const mainJsMapPath = LF_CDN_BROWSER_DIR + MAIN_SCRIPT_MAP_FILE;
  const lfCdnIndexPath = LF_CDN_BROWSER_DIR + LF_CDN_INDEX_FILE;
  const cdnJsPath = LF_CDN_BROWSER_DIR + CDN_UI_COMPONENTS_FILE;
  const cdnJsMapPath = LF_CDN_BROWSER_DIR + CDN_UI_COMPONENTS_MAP_FILE;

  if (fs.existsSync(mainJsPath)) {
    const content = fs.readFileSync(mainJsPath, 'utf8');
    fs.writeFileSync(cdnJsPath, content.replace(MAIN_SCRIPT_MAP_FILE, CDN_UI_COMPONENTS_MAP_FILE));
    fs.unlinkSync(mainJsPath);
  }

  if (fs.existsSync(mainJsMapPath)) {
    fs.renameSync(mainJsMapPath, cdnJsMapPath);
  }

  const indexHtmlContent = fs.readFileSync(lfCdnIndexPath, 'utf8');
  fs.writeFileSync(lfCdnIndexPath, indexHtmlContent.replace(/src="main\.js"/g, `src="${CDN_UI_COMPONENTS_FILE}"`));
}

exports.processTypesFile = processTypesFile;
exports.replacePlaceholdersInDocumentation = replacePlaceholdersInDocumentation;
exports.replaceVersionInIndexHtml = replaceVersionInIndexHtml;
exports.replaceVersionInDocumentation = replaceVersionInDocumentation;
exports.renameLfCdn = renameLfCdn;
