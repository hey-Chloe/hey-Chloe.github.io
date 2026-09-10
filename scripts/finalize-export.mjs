import { rm, writeFile } from 'node:fs/promises';

// Next.js requires one static param for otherwise empty dynamic exports.
// The reserved params render notFound(), and must not become HTTP-200 files.
for (const prefix of ['', 'en/']) {
  for (const collection of ['research', 'writing']) {
    await rm(`out/${prefix}${collection}/_unpublished`, { recursive: true, force: true });
  }
}
await writeFile('out/.nojekyll', '');
