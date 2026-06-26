import { existsSync } from 'node:fs';
const required = ['README_PHASE2_MIGRATION.md', 'index.html', 'backend/Code.gs', 'backend/Api.gs'];
const missing = required.filter((file) => !existsSync(file));
if (missing.length) {
  console.error('Missing files: ' + missing.join(', '));
  process.exit(1);
}
console.log('Smoke PASS');
