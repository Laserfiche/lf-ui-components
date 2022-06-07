const { src, dest } = require('gulp');
const replace = require('gulp-replace');
const concat = require('gulp-concat');
const yargs = require('yargs');

yargs.parserConfiguration({
  "parse-numbers": false,
})

// File paths
const INDEX_HTML_FILEPATH = './dist/lf-documentation/index.html';
// Strings for replacement
const RUNTIME = 'runtime.js';
const REMAINING_INDEX_SCRIPT_TAGS = '<script src="polyfills.js" defer></script><script src="main.js" defer></script>';
const BUILD_NUMBER = 'PIPELINE_VERSION';
const NPM_VERSION = 'NPM_VERSION';
const LF_DOCUMENTATION = 'lf-documentation.js'
const TYPE_FILE_PATH = './types-lf-ui-components-publish/index.d.ts';
const TYPES_IMPORTS = /import.*/g;
const TYPES_EXPORTS = /export.*{.*}.*/g;
const TYPES_EVENTEMITTER = 'EventEmitter';
const TYPES_CUSTOMEVENT = 'CustomEvent';
const TYPES_IMPLEMENTS = /implements.*{/g;
const TYPES_NO_IMPLEMENTS = '{';
const NPM_PUBLISH = './types-lf-ui-components-publish/';
const LF_CDN_MAINJS_FILEPATH = './dist/lf-cdn/main.js';
const LF_CDN_RUNTIMEJS_FILEPATH = './dist/lf-cdn/runtime.js';
const LF_CDN_POLYFILLSJS_FILEPATH = './dist/lf-cdn/polyfills.js';
const OLD_WEBPACK_CHUNK_NAME = 'webpackChunklf_ui_components';
const NEW_WEBPACK_CHUNK_NAME = 'webpackChunklf_components_ui';
const OLD_SCRIPT_NAME = './../lf-cdn/lf-ui-components.js';
const NEW_SCRIPT_NAME = 'https://cdn.jsdelivr.net/npm/@laserfiche/lf-ui-components@NPM_VERSION/cdn/lf-ui-components.js';
const SCRIPT_DEST = './dist/lf-cdn';
const SCRIPT_FILE = 'lf-ui-components.js';
const SOURCEMAP_MAIN_URL = '//# sourceMappingURL=main.js.map';
const SOURCEMAP_POLYFILLS_URL = '//# sourceMappingURL=polyfills.js.map';
const COMPILED_GETTING_STARTED_FILE_PATH = './dist/lf-documentation/lf-documentation.js';
const BUILT_INDEX_HTML_FILEPATH = './dist/lf-documentation/index.html';
const LF_DOCUMENTATION_MAIN_TS_FILEPATH = './projects/lf-documentation/src/main.ts';
const OLD_LF_STYLE_SHEET_PATH = './lf-laserfiche-lite.css';
const NEW_LF_STYLE_SHEET_PATH = 'https://cdn.jsdelivr.net/npm/@laserfiche/lf-ui-components@NPM_VERSION/cdn/lf-laserfiche-lite.css';
const LF_DOCUMENTATION_THEMESERVICE_FILEPATH = './projects/lf-documentation/src/app/theme.service.ts';
const OLD_MS_OFFICE_STYLE_SHEET_PATH = './lf-ms-office-lite.css';
const NEW_MS_OFFICE_STYLE_SHEET_PATH = 'https://cdn.jsdelivr.net/npm/@laserfiche/lf-ui-components@NPM_VERSION/cdn/lf-ms-office-lite.css';


async function replaceScriptsInIndexHtml(){
    src(INDEX_HTML_FILEPATH, {base: './'})
        .pipe(replace(RUNTIME, LF_DOCUMENTATION))
        .pipe(replace(REMAINING_INDEX_SCRIPT_TAGS, ''))
        .pipe(replace(OLD_SCRIPT_NAME, NEW_SCRIPT_NAME))
        .pipe(dest('./'));
};

async function replaceScriptsInIndexHtml(){
  src(INDEX_HTML_FILEPATH, {base: './'})
      .pipe(replace(RUNTIME, LF_DOCUMENTATION))
      .pipe(replace(REMAINING_INDEX_SCRIPT_TAGS, ''))
      .pipe(replace(OLD_SCRIPT_NAME, NEW_SCRIPT_NAME))
      .pipe(dest('./'));
};

async function replacePlaceholdersInDocumentation(){
  src(COMPILED_GETTING_STARTED_FILE_PATH, {base: './'})
      .pipe(replace(OLD_LF_STYLE_SHEET_PATH, NEW_LF_STYLE_SHEET_PATH))
      .pipe(replace(OLD_MS_OFFICE_STYLE_SHEET_PATH, NEW_MS_OFFICE_STYLE_SHEET_PATH))
      .pipe(replace(NPM_VERSION, getNpmVersion()))
      .pipe(dest('./'));
};

async function replaceVersionInIndexHtml(){
  src(BUILT_INDEX_HTML_FILEPATH, {base: './'})
      .pipe(replace(BUILD_NUMBER, getNpmVersion()))
      .pipe(replace(NPM_VERSION, getNpmVersion()))
      .pipe(dest('./'));
};

function getNpmVersion() {
  const npmVersion = yargs.argv.npmVersion;
  return npmVersion;
}

async function renameMainWebpackChunk(){
  src(LF_CDN_MAINJS_FILEPATH, {base: './'})
      .pipe(replace(OLD_WEBPACK_CHUNK_NAME, NEW_WEBPACK_CHUNK_NAME))
      .pipe(dest('./'));
}

async function renameRuntimeWebpackChunk(){
  src(LF_CDN_RUNTIMEJS_FILEPATH, {base: './'})
      .pipe(replace(OLD_WEBPACK_CHUNK_NAME, NEW_WEBPACK_CHUNK_NAME))
      .pipe(dest('./'));
}

async function renamePolyfillsWebpackChunk(){
  src(LF_CDN_POLYFILLSJS_FILEPATH, {base: './'})
      .pipe(replace(OLD_WEBPACK_CHUNK_NAME, NEW_WEBPACK_CHUNK_NAME))
      .pipe(dest('./'));
}

async function processTypesFile() {
  src([TYPE_FILE_PATH])
  .pipe(replace(TYPES_IMPORTS, ''))
  .pipe(replace(TYPES_EXPORTS, ''))
  .pipe(replace(TYPES_EVENTEMITTER, TYPES_CUSTOMEVENT))
  .pipe(replace(TYPES_IMPLEMENTS, TYPES_NO_IMPLEMENTS))
  .pipe(dest(NPM_PUBLISH));
}

async function concateLfCdnToScript() {
  src([LF_CDN_MAINJS_FILEPATH, LF_CDN_RUNTIMEJS_FILEPATH, LF_CDN_POLYFILLSJS_FILEPATH])
  .pipe(concat(SCRIPT_FILE))
  .pipe(replace(SOURCEMAP_POLYFILLS_URL,SOURCEMAP_MAIN_URL))
  .pipe(dest(SCRIPT_DEST))
}

exports.replaceScriptsInIndexHtml = replaceScriptsInIndexHtml;
exports.processTypesFile = processTypesFile;
exports.replacePlaceholdersInDocumentation = replacePlaceholdersInDocumentation;
exports.renameMainWebpackChunk = renameMainWebpackChunk;
exports.renameRuntimeWebpackChunk = renameRuntimeWebpackChunk;
exports.renamePolyfillsWebpackChunk = renamePolyfillsWebpackChunk;
exports.concateLfCdnToScript = concateLfCdnToScript;
exports.replaceVersionInIndexHtml = replaceVersionInIndexHtml;
