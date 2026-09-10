import assert from "node:assert/strict";
import { access, cp, mkdir, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fixtureCollections } from "./fixtures/content.mjs";

const source = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const destination = path.join(source, "work", "fixture-site");
const marker = path.join(destination, ".qa-fixture");
const excluded = new Set(["node_modules", "work", ".next", "out", ".git", ".env.local"]);

const exists = await access(destination).then(() => true, (error) => {
  if (error.code !== "ENOENT") throw error;
  return false;
});
if (exists) {
  assert.equal(await readFile(marker, "utf8"), "isolated-homepage-rendering-fixture\n", "Refusing to replace a directory without the QA marker.");
  await rm(destination, { recursive: true });
}

await mkdir(destination, { recursive: true });
for (const entry of await readdir(source)) {
  if (!excluded.has(entry)) await cp(path.join(source, entry), path.join(destination, entry), { recursive: true });
}
await writeFile(marker, "isolated-homepage-rendering-fixture\n");
await symlink(path.join(source, "node_modules"), path.join(destination, "node_modules"), "dir");

const schema = {
  research: { filename: "research", type: "Research" },
  publications: { filename: "publications", type: "Publication" },
  experience: { filename: "experience", type: "Experience" },
  projects: { filename: "projects", type: "Project" },
  openSource: { filename: "open-source", type: "OpenSourceContribution" },
};
for (const [name, records] of Object.entries(fixtureCollections)) {
  const { filename, type } = schema[name];
  const publicationYears = name === "publications" ? "\nexport const publicationYears = [2027, 2026, 2025] as const;\n" : "";
  await writeFile(path.join(destination, "data", `${filename}.ts`),
    `// ISOLATED QA FIXTURE. This file is not production content.\nimport type { ${type} } from "./types";\nexport const ${name}: readonly ${type}[] = ${JSON.stringify(records, null, 2)};\n${publicationYears}`);
}
await cp(path.join(source, "tests/fixtures/rendering.mdx"), path.join(destination, "content/writing/rendering.mdx"));
await cp(path.join(source, "tests/fixtures/draft-safety.mdx"), path.join(destination, "content/writing/draft-safety.mdx"));
await mkdir(path.join(destination, "public"), { recursive: true });
await cp(path.join(source, "tests/fixtures/qa-fixture.svg"), path.join(destination, "public/qa-fixture.svg"));
console.log(`Prepared isolated QA site: ${destination}`);
console.log("Build this copy and run browser-check with EXPORT_DIR pointing to its out directory. Never deploy this fixture build.");
