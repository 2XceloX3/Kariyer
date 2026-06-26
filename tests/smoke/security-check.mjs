import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const findings = [];
const skip = ['.git', 'Archive'];
function walk(dir) {
  for (const item of readdirSync(dir)) {
    const p = join(dir, item);
    if (skip.some((x) => p.includes(x))) continue;
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(js|gs|html|md|json|yml)$/.test(p)) scan(p);
  }
}
function scan(p) {
  const s = readFileSync(p, 'utf8');
  const deploymentPattern = /AKfycb[a-zA-Z0-9_-]+/;
  const credentialWord = 'pass' + 'word';
  if (deploymentPattern.test(s)) findings.push(`${p}: deployment id`);
  if (new RegExp(credentialWord + "\\s*[:=]\\s*['\\\"][^'\\\"]{4,}", 'i').test(s)) findings.push(`${p}: credential literal`);
}
walk('.');
if (findings.length) {
  console.error(findings.join('\n'));
  process.exit(1);
}
console.log('Security smoke PASS');
