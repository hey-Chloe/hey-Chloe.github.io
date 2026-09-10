import assert from "node:assert/strict";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const directory = path.resolve(process.env.EXPORT_DIR || "work/fixture-site/out");
const basePath = (process.env.BASE_PATH ?? process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const artifactDirectory = path.resolve(process.env.QA_DIR || "work/qa-fixture");
const checks = [];
const failures = [];
const documents = {};
for (const route of ["", "archive", "publications", "projects", "experience", "cv", "research/layout-contract", "writing/rendering", "en", "en/publications", "en/research/layout-contract", "en/writing/rendering"]) {
  documents[route || "home"] = await readFile(path.join(directory, route, "index.html"), "utf8");
}
const visible = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
const text = (html) => html.replace(/<[^>]+>/g, "").replaceAll("&amp;", "&").trim();
function check(label, assertion) {
  try { assertion(); checks.push(label); } catch (error) { failures.push(`${label}: ${error.message}`); }
}
const research = visible(documents["research/layout-contract"]);
const note = visible(documents["writing/rendering"]);
const publications = visible(documents.publications);
const home = visible(documents.home);
const archive = visible(documents.archive);

check("Academic homepage has a Chinese identity and accessible content landmark", () => {
  assert.match(home, /<main\b(?=[^>]*\bid="main")(?=[^>]*\btabindex="-1")[^>]*>/i);
  assert.match(home, /<h1\b[^>]*>[\s\S]*?李晨悦[\s\S]*?<\/h1>/);
  for (const html of Object.values(documents)) assert.doesNotMatch(visible(html), /Chloe\s+Li|profile-initials|profile-sidebar/);
  const wordmark = home.match(/<a\b[^>]*class="wordmark"[^>]*>([\s\S]*?)<\/a>/)?.[1];
  assert.ok(wordmark?.includes("李晨悦"), "header identifies the owner by the requested name");
  assert.doesNotMatch(wordmark, /<svg\b/, "header has no decorative symbol");
});
check("Paragraph highlight hooks are present in static markup", () => {
  assert.match(home, /<p\b(?=[^>]*class="hero-bio")(?=[^>]*data-reading-highlight="")[^>]*>/);
  assert.ok((home.match(/data-reading-highlight=""/g) || []).length >= 3);
});

check("Populated editorial research cards and prefixed detail links", () => {
  assert.match(home, /class="research-card"/);
  assert.ok(home.includes(`href="${basePath}/research/layout-contract/"`));
  for (const label of ["研究问题", "方法", "主要结果"]) assert.ok(home.includes(label));
});
check("Interactive archive links stay inside the isolated research fixture", () => {
  assert.equal(archive.split(`href="${basePath}/research/layout-contract/"`).length - 1, 2);
  assert.doesNotMatch(archive, /\/research\/(?:vlm-data-selection|offline-retrieval-ranking)\//);
});
check("All eleven research detail sections", () => {
  const headings = Array.from(research.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g), (match) => text(match[1]));
  assert.deepEqual(headings, ["摘要", "问题", "方法", "系统架构", "数据集", "实验设计", "实验结果", "消融分析", "失败分析", "演示", "引用"]);
});
check("Research navigation anchors match rendered evidence sections", () => {
  for (const id of ["abstract", "problem", "method", "architecture", "dataset", "experiments", "results", "ablation", "failureAnalysis", "demo", "citation"]) {
    assert.ok(research.includes(`href="#${id}"`));
    assert.ok(research.includes(`id="${id}"`));
  }
});
check("Publication owner emphasis and native BibTeX disclosure", () => {
  assert.ok(publications.includes("<strong>李晨悦</strong>"));
  assert.match(publications, /<details class="bibtex"><summary>BibTeX<\/summary>/);
  assert.match(publications, /@misc\{renderingfixture,/);
  assert.match(publications, /复制引用/);
});
check("Requested publication year groups", () => {
  const years = Array.from(publications.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g), (match) => text(match[1]));
  assert.deepEqual(years, ["2027", "2026", "2025"]);
});
check("Populated industry timeline and ownership evidence", () => {
  const html = visible(documents.experience);
  assert.match(html, /class="timeline-entry"/);
  for (const label of ["问题", "负责范围", "方法", "规模", "结果"]) assert.ok(html.includes(label));
  assert.ok(html.includes('dateTime="2026-01"') || html.includes('datetime="2026-01"'));
});
check("Concrete open source contributions and subordinate engineering projects", () => {
  const html = visible(documents.projects);
  assert.match(html, /class="contribution"/);
  assert.match(html, /class="project-entry"/);
  for (const label of ["具体贡献", "结果", "贡献 PR", "负责范围", "成果"]) assert.ok(html.includes(label));
});
check("Both inline and block equations compile with KaTeX", () => {
  assert.ok((note.match(/class="katex"/g) || []).length >= 2);
  assert.match(note, /class="katex-display"/);
  assert.match(note, /<math\b/);
});
check("Code uses syntax-highlighted semantic markup", () => {
  assert.match(note, /data-language="typescript"/);
  assert.match(note, /data-line/);
  assert.match(note, /aria-label="代码示例"/);
});
check("Local figure dimensions, alternative text and caption", () => {
  assert.ok(note.includes(`src="${basePath}/qa-fixture.svg"`));
  assert.match(note, /width="1200"/);
  assert.match(note, /height="600"/);
  assert.match(note, /alt="Two outlined rectangles/);
  assert.match(note, /<figcaption>QA fixture:/);
});
check("Markdown table preserves semantic column headers", () => {
  assert.match(note, /<table>/);
  const table = note.match(/<thead>([\s\S]*?)<\/thead>/)?.[1];
  assert.equal((table?.match(/<th\b/g) || []).length, 4);
  assert.match(note, /aria-label="可滚动数据表"/);
});
check("MDX citations point to matching reference IDs", () => {
  assert.match(note, /href="#ref-fixture"/);
  assert.match(note, /id="ref-fixture"/);
});
check("Social metadata includes images and correct base paths", () => {
  for (const route of ["research/layout-contract", "writing/rendering"]) {
    const html = documents[route];
    assert.ok(html.includes(`${basePath}/${route}/`));
    assert.match(html, /property="og:image"/);
    assert.match(html, /name="twitter:image"/);
    assert.ok(html.includes(`${basePath}/og.png`));
  }
});
check("Structured data is valid JSON for research and writing", () => {
  for (const [route, type] of [["research/layout-contract", "CreativeWork"], ["writing/rendering", "BlogPosting"]]) {
    const blocks = Array.from(documents[route].matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g), (match) => JSON.parse(match[1]));
    assert.ok(blocks.some((item) => item["@type"] === type));
    assert.ok(blocks.some((item) => item["@type"] === "Person"));
  }
});
check("Missing real CV stays unavailable", () => {
  assert.doesNotMatch(visible(documents.cv), /<a\b[^>]*\bdownload/);
  assert.doesNotMatch(visible(documents.cv), /href="(?:#|\/cv\.pdf)"/);
});
check("Bilingual documents have server-rendered language and reciprocal alternate links", () => {
  for (const route of ["", "publications", "research/layout-contract", "writing/rendering"]) {
    const zh = documents[route || "home"];
    const en = documents[route ? `en/${route}` : "en"];
    assert.match(zh, /<html lang="zh-CN"/);
    assert.match(en, /<html lang="en"/);
    for (const html of [zh, en]) {
      assert.match(html, /hrefLang="zh-CN"/i);
      assert.match(html, /hrefLang="en"/i);
      assert.ok(html.includes(`${basePath}/en/${route ? `${route}/` : ""}`));
    }
  }
});
check("English research has the same eleven sections and translated interface", () => {
  const html = visible(documents["en/research/layout-contract"]);
  const headings = Array.from(html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g), (match) => text(match[1]));
  assert.deepEqual(headings, ["Abstract", "Problem", "Method", "Architecture", "Dataset", "Experiments", "Results", "Ablation", "Failure Analysis", "Demo", "Citation"]);
  assert.match(html, /Copy citation/);
  assert.match(visible(documents["en/publications"]), /<strong>李晨悦<\/strong>/);
});
check("MDX page links preserve language while figures keep shared asset paths", () => {
  assert.ok(note.includes(`href="${basePath}/research/layout-contract/#method"`));
  const en = visible(documents["en/writing/rendering"]);
  assert.ok(en.includes(`href="${basePath}/en/research/layout-contract/#method"`));
  assert.ok(en.includes(`src="${basePath}/qa-fixture.svg"`));
});
const sitemap = await readFile(path.join(directory, "sitemap.xml"), "utf8");
check("Sitemap includes published detail pages with base paths", () => {
  assert.ok(sitemap.includes(`${basePath}/research/layout-contract/`));
  assert.ok(sitemap.includes(`${basePath}/writing/rendering/`));
  assert.ok(sitemap.includes(`${basePath}/en/research/layout-contract/`));
  assert.ok(sitemap.includes(`${basePath}/en/writing/rendering/`));
  assert.doesNotMatch(sitemap, /_unpublished|draft-safety/);
});
const draftExportExists = await access(path.join(directory, "writing/draft-safety/index.html")).then(() => true, () => false);
check("Draft notes are excluded from pages, lists, and sitemap", () => {
  assert.equal(draftExportExists, false);
  for (const html of Object.values(documents)) assert.doesNotMatch(html, /QA_DRAFT_NOT_PUBLIC|QA draft: must never be published/);
  assert.doesNotMatch(sitemap, /draft-safety/);
});
async function cssFiles(folder) {
  return (await Promise.all((await readdir(folder, { withFileTypes: true })).map(async (entry) => {
    const filename = path.join(folder, entry.name);
    if (entry.isDirectory()) return cssFiles(filename);
    return filename.endsWith(".css") ? [filename] : [];
  }))).flat();
}
const css = (await Promise.all((await cssFiles(path.join(directory, "_next"))).map((filename) => readFile(filename, "utf8")))).join("\n");
check("Yellow hover and selection CSS compiles for pointer-capable devices", () => {
  assert.ok(css.includes("--highlight:#fffc66"));
  assert.ok(css.includes("data-reading-highlight"));
  assert.match(css, /outline:6px solid/);
  assert.ok(css.includes("::selection"));
  assert.ok(css.includes("hover:hover") && css.includes("pointer:fine"));
});

await mkdir(artifactDirectory, { recursive: true });
const report = { verification: "Static compiled HTML assertions; no browser runtime or visual checks are implied.", directory, basePath, passed: checks.length, checks, failures };
await writeFile(path.join(artifactDirectory, "fixture-render-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
