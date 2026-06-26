import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const findings = [];
function walk(dir) {
  for (const item of readdirSync(dir)) {
    const p = join(dir, item);
    if (p.includes('.git') || p.includes('Archive')) continue;
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(js|gs|html|md|json|yml)$/.test(p)) scan(p);
  }
}
function scan(p) {
  const s = readFileSync(p, 'utf8');
  const patterns = [/AKfycb[a-zA-Z0-9_-]+/, /password\s*[:=]\s*['\"][^'\"]{4,}/i];
  for (const pat of patterns) if (pat.test(s)) findings.push(`${p}: ${pat}`);
}
walk('.');
if (findings.length) {
  console.error(findings.join('\n'));
  process.exit(1);
}
console.log('Security smoke PASS');
