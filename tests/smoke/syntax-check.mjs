import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
const files = [];
function walk(dir) {
  for (const item of readdirSync(dir)) {
    const p = join(dir, item);
    if (p.includes('.git')) continue;
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(js|gs)$/.test(p)) files.push(p);
  }
}
for (const dir of ['backend', 'tests']) {
  try { walk(dir); } catch {}
}
for (const file of files) {
  new vm.Script(readFileSync(file, 'utf8'), { filename: file });
}
console.log(`Syntax PASS (${files.length} files)`);
