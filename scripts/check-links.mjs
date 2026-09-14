import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const exportDirectory = path.resolve(process.env.EXPORT_DIR || "out");
const basePath = (process.env.BASE_PATH ?? process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const origin = new URL(process.env.SITE_URL || "http://127.0.0.1:3000").origin;
const failures = [];
const externalLinks = new Set();
const checked = new Set();

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(filename) : filename;
  }));
  return nested.flat();
}

function decode(value) {
  return value.replace(/&amp;/g, "&").replace(/&#(?:x([\da-f]+)|(\d+));/gi,
    (_, hex, decimal) => String.fromCodePoint(parseInt(hex || decimal, hex ? 16 : 10)));
}

function routeFor(filename) {
  const relative = path.relative(exportDirectory, filename).split(path.sep).join("/");
  return `${basePath}/${relative.replace(/(?:^|\/)index\.html$/, "/").replace(/\.html$/, "")}`.replace(/\/+/g, "/");
}

async function localTarget(url) {
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { return null; }
  if (basePath && pathname !== basePath && !pathname.startsWith(`${basePath}/`)) return null;
  pathname = pathname.slice(basePath.length).replace(/^\/+/, "");
  const candidate = path.resolve(exportDirectory, pathname);
  if (candidate !== exportDirectory && !candidate.startsWith(`${exportDirectory}${path.sep}`)) return null;
  for (const filename of [candidate, path.join(candidate, "index.html"), `${candidate}.html`]) {
    try { if ((await stat(filename)).isFile()) return filename; } catch { /* Try the next export layout. */ }
  }
  return null;
}

async function checkReference(raw, source, route, { fragment = true } = {}) {
  const value = decode(raw.trim());
  if (/^(?:mailto:|tel:|data:|blob:)/i.test(value)) return;
  if (!value || value === "#" || /^javascript:/i.test(value)) {
    failures.push(`${source}: empty or placeholder reference ${JSON.stringify(value)}`);
    return;
  }
  let url;
  try { url = new URL(value, `${origin}${route}`); } catch {
    failures.push(`${source}: invalid URL ${value}`);
    return;
  }
  if (!/^https?:$/.test(url.protocol)) {
    failures.push(`${source}: unsupported URL protocol ${value}`);
    return;
  }
  if (url.origin !== origin) {
    externalLinks.add(url.href);
    return;
  }
  const key = `${url.pathname}${fragment ? url.hash : ""}`;
  if (checked.has(key)) return;
  checked.add(key);
  const filename = await localTarget(url);
  if (!filename) {
    failures.push(`${source}: missing export target ${url.pathname}`);
    return;
  }
  if (fragment && url.hash && filename.endsWith(".html")) {
    const content = await readFile(filename, "utf8");
    const identifiers = Array.from(content.matchAll(/\b(?:id|name)=["']([^"']+)["']/g), (match) => decode(match[1]));
    if (!identifiers.includes(decodeURIComponent(url.hash.slice(1)))) {
      failures.push(`${source}: missing fragment ${url.pathname}${url.hash}`);
    }
  }
}

const filenames = await walk(exportDirectory);
const htmlFiles = filenames.filter((filename) => filename.endsWith(".html"));
assert.ok(htmlFiles.length > 0, `No exported HTML found in ${exportDirectory}; run npm run build first.`);

for (const filename of htmlFiles) {
  const html = await readFile(filename, "utf8");
  const source = path.relative(exportDirectory, filename);
  const route = routeFor(filename);
  for (const match of html.matchAll(/\b(?:href|src|poster)=["']([^"']*)["']/g)) {
    await checkReference(match[1], source, route);
  }
  for (const match of html.matchAll(/\bsrcset=["']([^"']*)["']/g)) {
    if (match[1].startsWith("data:")) continue;
    for (const item of match[1].split(",")) await checkReference(item.trim().split(/\s+/)[0], source, route);
  }
}

for (const filename of filenames.filter((item) => item.endsWith(".css"))) {
  const css = await readFile(filename, "utf8");
  const route = `${basePath}/${path.relative(exportDirectory, filename).split(path.sep).join("/")}`;
  for (const match of css.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) {
    if (!match[1].startsWith("#")) await checkReference(match[1], path.relative(exportDirectory, filename), route, { fragment: false });
  }
}

for (const route of ["/", "/research/", "/projects/", "/experience/", "/writing/", "/cv/"]) {
  await checkReference(`${basePath}${route}`, "required routes", `${basePath}/`);
}

for (const name of ["robots.txt", "sitemap.xml"]) {
  try { await stat(path.join(exportDirectory, name)); } catch { failures.push(`Missing SEO export: ${name}`); }
}

if (process.env.CHECK_EXTERNAL_LINKS === "1") {
  for (const url of externalLinks) {
    try {
      const response = await fetch(url, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(15000) });
      if (!response.ok) failures.push(`External URL returned ${response.status}: ${url}`);
      await response.body?.cancel();
    } catch (error) { failures.push(`External URL failed: ${url}: ${error.message}`); }
  }
}

console.log(JSON.stringify({
  htmlPages: htmlFiles.length,
  internalTargetsChecked: checked.size,
  externalReferences: externalLinks.size,
  externalNetworkCheck: process.env.CHECK_EXTERNAL_LINKS === "1",
  failures,
}, null, 2));
if (failures.length) process.exitCode = 1;
