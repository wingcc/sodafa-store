const fs = require('fs');
const path = require('path');
function walk(d) {
  let r = [];
  if (!fs.existsSync(d)) return r;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.next' || e.name === '.git') continue;
      r = r.concat(walk(p));
    } else if (/\.tsx?$/.test(e.name)) {
      r.push(p);
    }
  }
  return r;
}
const root = process.cwd();
const files = walk(root);
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  lines.forEach((l, i) => {
    if (/import.*ProductCard/.test(l)) {
      console.log(f.replace(root + '\\', '') + ':' + (i + 1) + ': ' + l.trim());
    }
  });
}
