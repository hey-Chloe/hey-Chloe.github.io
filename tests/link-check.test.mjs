import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const scanner = fileURLToPath(new URL("../scripts/check-links.mjs", import.meta.url));

async function withExport(basePath, callback) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "homepage-links-"));
  try {
    const html = `<html><body><main id="main"><a href="#main">Jump</a><a href="${basePath}/research/#details">Research</a><img src="${basePath}/image.svg" alt="Fixture"/></main></body></html>`;
    await writeFile(path.join(directory, "index.html"), html);
    await writeFile(path.join(directory, "image.svg"), "<svg/>");
    await writeFile(path.join(directory, "robots.txt"), "User-agent: *\n");
    await writeFile(path.join(directory, "sitemap.xml"), "<urlset/>\n");
    for (const route of ["research", "publications", "projects", "experience", "writing", "cv"]) {
      await mkdir(path.join(directory, route));
      await writeFile(path.join(directory, route, "index.html"), '<html><main id="details">Fixture</main></html>');
    }
    const run = () => spawnSync(process.execPath, [scanner], {
      encoding: "utf8",
      env: { ...process.env, EXPORT_DIR: directory, BASE_PATH: basePath, CHECK_EXTERNAL_LINKS: "0" },
    });
    await callback(directory, run);
  } finally { await rm(directory, { recursive: true, force: true }); }
}

test("export checker resolves routes, assets, and local anchor targets", async () => {
  await withExport("", async (_directory, run) => {
    const result = run();
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.deepEqual(JSON.parse(result.stdout).failures, []);
  });
});

test("export checker reports broken images and missing fragment targets", async () => {
  await withExport("", async (directory, run) => {
    await rm(path.join(directory, "image.svg"));
    await writeFile(path.join(directory, "research/index.html"), "<html><main>Fixture</main></html>");
    const result = run();
    assert.equal(result.status, 1);
    assert.match(result.stdout, /missing export target \/image\.svg/);
    assert.match(result.stdout, /missing fragment \/research\/#details/);
  });
});

test("export checker rejects fake clickable destinations", async () => {
  await withExport("", async (directory, run) => {
    await writeFile(path.join(directory, "cv/index.html"), '<html><main><a href="#">Unavailable CV</a></main></html>');
    const result = run();
    assert.equal(result.status, 1);
    assert.match(result.stdout, /empty or placeholder reference/);
  });
});

test("GitHub Pages base paths resolve and root-relative leaks fail", async () => {
  await withExport("/homepage", async (directory, run) => {
    const valid = run();
    assert.equal(valid.status, 0, valid.stdout + valid.stderr);
    await writeFile(path.join(directory, "cv/index.html"), '<html><main><img src="/image.svg" alt="Fixture"/></main></html>');
    const invalid = run();
    assert.equal(invalid.status, 1);
    assert.match(invalid.stdout, /missing export target \/image\.svg/);
  });
});
