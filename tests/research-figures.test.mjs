import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const names = ["agent", "recsys", "vlm"];

for (const name of names) {
  for (const suffix of ["", "-en"]) {
    const stem = `research-${name}-teaser${suffix}`;

    test(`${stem} is a safe, editable paper vector`, async () => {
      const svg = await readFile(path.join(root, "public", "images", `${stem}.svg`), "utf8");
      assert.match(svg, /<svg\b[^>]*\bwidth="1200"[^>]*\bheight="750"/);
      assert.match(svg, /\bviewBox="[^"]+"/);
      assert.match(svg, /<text\b/, "SVG labels must remain editable text");
      assert.doesNotMatch(svg, /<script\b/i);
      assert.doesNotMatch(svg, /\bon(?:load|error|click)\s*=/i);
    });

    test(`${stem} includes a paper-ready PDF export`, async () => {
      const pdfPath = path.join(root, "public", "images", `${stem}.pdf`);
      const [info, pdf] = await Promise.all([stat(pdfPath), readFile(pdfPath)]);
      assert(info.size > 10_000, "PDF export is unexpectedly small");
      assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
    });

    test(`${stem} includes a 2400 by 1500 high-resolution PNG`, async () => {
      const png = await readFile(path.join(root, "public", "images", `${stem}-2x.png`));
      assert.equal(png.subarray(1, 4).toString(), "PNG");
      assert.equal(png.readUInt32BE(16), 2400);
      assert.equal(png.readUInt32BE(20), 1500);
    });
  }
}
