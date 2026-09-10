import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const imagesDirectory = path.join(process.cwd(), "public", "images");
const teaserPattern = /^research-(agent|recsys|vlm)-teaser(-en)?\.png$/;
const sourceFiles = (await readdir(imagesDirectory)).filter((name) => teaserPattern.test(name)).sort();

if (sourceFiles.length !== 6) {
  throw new Error(`Expected 6 teaser PNG sources, found ${sourceFiles.length}.`);
}

for (const sourceName of sourceFiles) {
  const source = path.join(imagesDirectory, sourceName);
  const output = path.join(imagesDirectory, sourceName.replace(/\.png$/, ".webp"));

  await sharp(source)
    .resize(800, 500, { fit: "fill" })
    .webp({ quality: 82, smartSubsample: true, effort: 6 })
    .toFile(output);

  const metadata = await sharp(output).metadata();
  const file = await stat(output);
  if (metadata.width !== 800 || metadata.height !== 500 || file.size > 30_000) {
    throw new Error(`Unexpected optimized teaser output: ${output}`);
  }

  console.log(`${path.relative(process.cwd(), output)} · ${metadata.width}×${metadata.height} · ${file.size} bytes`);
}
