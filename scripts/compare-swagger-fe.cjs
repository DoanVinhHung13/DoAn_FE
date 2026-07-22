const fs = require('fs');
const path = require('path');

const apis = JSON.parse(fs.readFileSync('swagger_apis.json', 'utf8'));
const svcDir = 'src/services';
const svcFiles = [];

function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name === 'urls.js' || f.name === 'index.js') svcFiles.push(p);
  }
}
walk(svcDir);

let svcText = '';
for (const f of svcFiles) svcText += fs.readFileSync(f, 'utf8') + '\n';

function norm(p) {
  return p.replace(/^\/api/, '').replace(/\{[^}]+\}/g, '{id}');
}

function isUsedInFe(api) {
  const p = norm(api.path);
  const short = p.replace(/^\//, '');
  const checks = [
    api.path,
    p,
    short,
    '/api' + p,
    api.path.replace('/api/', '/'),
    short.replace(/\//g, '-'),
  ];
  for (const c of checks) {
    if (svcText.includes(c)) return true;
    const noId = c.replace('{id}', '');
    if (noId.length > 3 && svcText.includes(noId)) return true;
  }
  // segment match e.g. cultivation-daily-logs
  const segments = short.split('/').filter(Boolean);
  if (segments.length >= 2) {
    const key = segments.slice(0, 2).join('/');
    if (svcText.includes(key)) return true;
  }
  return false;
}

const rows = apis.map((a) => ({
  ...a,
  feStatus: isUsedInFe(a) ? 'service-defined' : 'not-in-service',
}));

const used = rows.filter((r) => r.feStatus === 'service-defined');
const unused = rows.filter((r) => r.feStatus === 'not-in-service');

fs.writeFileSync('swagger_fe_compare.json', JSON.stringify(rows, null, 2));

console.log('TOTAL', apis.length);
console.log('In FE services', used.length);
console.log('Not in FE services', unused.length);

const byTag = {};
for (const u of unused) {
  byTag[u.tag] = (byTag[u.tag] || 0) + 1;
}
console.log('\nUnused by tag:', JSON.stringify(byTag, null, 2));
