import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const names = ["agent", "recsys", "vlm"];
const figureDataDir = path.join(root, "scripts", "paper_figures", "data");
const retiredGreenHexes = [
  "#146c60",
  "#176c61",
  "#1f6b5c",
  "#246b60",
  "#bcd7d1",
  "#dcebe7",
];

async function readJson(filename) {
  return JSON.parse(await readFile(path.join(figureDataDir, filename), "utf8"));
}

test("paper figures retain the reported Agent study evidence", async () => {
  const data = await readJson("agent_credit.json");
  assert.equal(data.case_count, 40);
  assert.equal(data.families.length, 5);
  assert.equal(Object.keys(data.method_aggregate).length, 6);
  assert.equal(data.invalid_coalitions.mean_impossible_coalition_rate, 0.71875);
  assert.equal(data.representative_case.methods.precedence_shapley.linear_extensions, 6);
});

test("paper figures retain the frozen RecSys comparison", async () => {
  const data = await readJson("recsys_figure.json");
  assert.equal(data.dev_candidates.length, 5);
  assert.deepEqual(data.protocol.ks, [20, 50, 100]);
  assert.equal(data.protocol.seeds.length, 3);
  assert.equal(data.selected_candidate, "exact-din-uniform-64-32");
  const primary = data.test.paired_ndcg["100"];
  assert(primary.confidence_interval.lower_bound > 0);
  assert.equal(primary.wins + primary.ties + primary.losses, primary.query_count);
});

test("paper figures retain the paired VLM evidence and claim boundary", async () => {
  const data = await readJson("vlm_figure_data.json");
  assert.equal(data.selection_overlap.count, 133);
  assert.equal(data.paired_seed_results.length, 3);
  assert.equal(data.base_exact_match, 0.7421875);
  assert.equal(data.paired_error_audit.improved_samples, 20);
  assert.equal(data.paired_error_audit.harmed_samples, 35);
  assert(data.paired_delta.ci95_low < 0);
  assert(data.paired_delta.ci95_high > 0);
});

for (const name of names) {
  for (const suffix of ["", "-en"]) {
    const stem = `research-${name}-teaser${suffix}`;

    test(`${stem} is a safe, editable paper vector`, async () => {
      const svg = await readFile(path.join(root, "public", "images", `${stem}.svg`), "utf8");
      const normalizedSvg = svg.toLowerCase();
      assert.match(svg, /<svg\b[^>]*\bwidth="1200"[^>]*\bheight="750"/);
      assert.match(svg, /\bviewBox="[^"]+"/);
      assert.match(svg, /<text\b/, "SVG labels must remain editable text");
      assert.doesNotMatch(svg, /<script\b/i);
      assert.doesNotMatch(svg, /\bon(?:load|error|click)\s*=/i);
      for (const retiredColor of retiredGreenHexes) {
        assert.equal(
          normalizedSvg.includes(retiredColor),
          false,
          `${stem} still contains the retired green ${retiredColor}`,
        );
      }
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

test("research list and Results use the same publication figure", async () => {
  for (const dataFile of ["data/research.ts", "data/en.ts"]) {
    const source = await readFile(path.join(root, dataFile), "utf8");
    for (const name of names) {
      const matches = source.match(new RegExp(`/images/research-${name}-teaser(?:-en)?\\.svg`, "g"));
      assert.equal(matches?.length, 2, `${dataFile} should reuse the ${name} figure exactly twice`);
    }
  }
});
