import fs from 'node:fs';
import path from 'node:path';

const outDir = path.join(process.cwd(), 'out');

if (!fs.existsSync(outDir)) {
  throw new Error('Build output directory "out" was not found. Run next build first.');
}

fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
