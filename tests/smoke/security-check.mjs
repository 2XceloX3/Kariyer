import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const findings = [];
const roots = ['backend', 'tests', '.github'];
const badPrefix = ['AK', 'fy', 'cb'].join('');
const secretWord = ['pass', 'word'].join('');

function walk(dir) {
  try {
    for (const item of readdirSync(dir)) {
      const p = join(dir, item);
      if (p.includes('.git')) continue;
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(js|gs|mjs|yml|yaml)$/.test(p)) scan(p);
    }
  } catch {}
}

function scan(p) {
  const s = readFileSync(p, 'utf8');
  const deploymentPattern = new RegExp(badPrefix + '[a-zA-Z0-9_-]+');
  const credentialPattern = new RegExp(secretWord + "\\s*[:=]\\s*['\\\"][^'\\\"]{4,}", 'i');
  if (deploymentPattern.test(s)) findings.push(`${p}: deployment literal`);
  if (credentialPattern.test(s)) findings.push(`${p}: credential literal`);
}

roots.forEach(walk);

if (findings.length) {
  console.error(findings.join('\n'));
  process.exit(1);
}

console.log('Security smoke PASS');
