import { readdirSync, statSync } from 'fs';
import { join, basename } from 'path';

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const SASS_DIRS = ['projects/styles/lf-laserfiche-lite/sass', 'projects/styles/lf-ms-office/sass'];

const errors = [];

for (const dir of SASS_DIRS) {
  for (const file of walk(dir)) {
    const name = basename(file);
    if (!name.startsWith('_') && !name.startsWith('rwc-')) {
      errors.push(`  ${file}: must start with '_' (common element partial) or 'rwc-' (component)`);
    }
  }
}

if (errors.length > 0) {
  console.error('Sass filename violations:\n' + errors.join('\n'));
  process.exit(1);
}

const total = SASS_DIRS.reduce((n, dir) => n + walk(dir).length, 0);
console.log(`Checked ${total} Sass files — all filenames OK`);
