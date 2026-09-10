import { experience, openSource, profile, projects, publications, research } from "../data";

export interface ContentIssue {
  path: string;
  message: string;
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const sectionKeys = [
  "abstract", "problem", "method", "architecture", "dataset", "experiments",
  "results", "ablation", "failureAnalysis", "demo", "citation",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** External URLs must use HTTPS; local paths must be absolute and traversal-free. */
export function isSafeContentUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() !== value || /[\s\\\u0000-\u001f\u007f]/u.test(value)) return false;
  if (!value || value.startsWith("//")) return false;
  try {
    const decoded = decodeURIComponent(value);
    if (/[\\\u0000-\u001f\u007f]/u.test(decoded)) return false;
    if (decoded.startsWith("//")) return false;
    if (decoded.split(/[/?#]/u).includes("..")) return false;
    if (value.startsWith("/")) return true;
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return false;
    const host = url.hostname.toLowerCase();
    if (!host.includes(".") || /(^|\.)(?:example\.(?:com|org|net)|example|localhost|invalid|test)$/u.test(host)) return false;
    if (/^(?:127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.)/u.test(host)) return false;
    return true;
  } catch {
    return false;
  }
}

/** Parse a real ISO calendar month/day, rejecting dates such as 2026-02-30. */
export function parseContentDate(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}(?:-\d{2})?$/u.test(value)) return null;
  const [year, month, day = 1] = value.split("-").map(Number);
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const time = Date.UTC(year, month - 1, day);
  const date = new Date(time);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? time : null;
}

/** Empty collections are intentional. Every populated record must be ready to publish. */
export function validateContent(input: unknown = { profile, research, publications, experience, projects, openSource }): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const fail = (path: string, message: string) => { issues.push({ path, message }); };
  const text = (value: unknown, path: string) => {
    if (typeof value !== "string" || !value.trim()) fail(path, "A non-empty, verified value is required.");
    else if (/^(?:TODO|TBD|REPLACE_ME|YOUR[_ -]|Lorem ipsum)(?:\b|_)/iu.test(value.trim())) fail(path, "Draft placeholders must stay in content/TODO.json, not public data.");
  };
  const texts = (record: Record<string, unknown>, path: string, keys: readonly string[]) => keys.forEach((key) => text(record[key], `${path}.${key}`));
  const url = (value: unknown, path: string) => {
    if (!isSafeContentUrl(value)) fail(path, "Use a real HTTPS URL or a safe absolute local path; placeholder URLs are not allowed.");
  };
  const links = (value: unknown, path: string, keys: readonly string[], requireEvidence = false) => {
    if (!isRecord(value)) { fail(path, "A links object is required; unavailable links should be omitted."); return; }
    Object.keys(value).forEach((key) => {
      if (!keys.includes(key)) fail(`${path}.${key}`, "Unknown link key.");
      else if (value[key] !== undefined) url(value[key], `${path}.${key}`);
    });
    if (requireEvidence && !keys.some((key) => typeof value[key] === "string" && isSafeContentUrl(value[key]))) fail(path, "At least one verified evidence link is required.");
  };
  const year = (value: unknown, path: string) => {
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1900 || value > 2100) fail(path, "Use a four-digit calendar year between 1900 and 2100.");
  };
  const stringArray = (value: unknown, path: string, allowEmpty = false) => {
    if (!Array.isArray(value) || (!allowEmpty && !value.length)) { fail(path, "A non-empty array of verified text is required."); return; }
    value.forEach((item, index) => text(item, `${path}[${index}]`));
  };
  if (!isRecord(input)) return [{ path: "content", message: "Content must be an object." }];

  if (!isRecord(input.profile)) fail("profile", "A profile object is required.");
  else {
    const item = input.profile;
    texts(item, "profile", ["name", "chineseName", "role", "description"]);
    stringArray(item.topics, "profile.topics");
    if (item.biography !== undefined) {
      if (!isRecord(item.biography)) fail("profile.biography", "Provide verified biography text by locale.");
      else texts(item.biography, "profile.biography", ["zh", "en"]);
    }
    if (item.education !== undefined) {
      if (!isRecord(item.education)) fail("profile.education", "Provide verified education information.");
      else {
        texts(item.education, "profile.education", ["institution", "institutionEn", "degree", "degreeEn"]);
        url(item.education.source, "profile.education.source");
        if (typeof item.education.expectedGraduation !== "string" || !/^(19|20)\d{2}$/.test(item.education.expectedGraduation)) fail("profile.education.expectedGraduation", "Use the verified expected graduation year.");
      }
    }
    for (const key of ["github", "scholar", "cv"]) if (item[key] !== undefined) url(item[key], `profile.${key}`);
    if (item.portrait !== undefined) {
      if (!isRecord(item.portrait)) fail("profile.portrait", "Use an image with source, alt text and intrinsic dimensions.");
      else {
        url(item.portrait.src, "profile.portrait.src");
        text(item.portrait.alt, "profile.portrait.alt");
        for (const key of ["width", "height"]) {
          const dimension = item.portrait[key];
          if (typeof dimension !== "number" || !Number.isInteger(dimension) || dimension <= 0) fail(`profile.portrait.${key}`, "Use a positive integer intrinsic image dimension.");
        }
      }
    }
    if (item.email !== undefined && (typeof item.email !== "string" || !/^[^\s@?&#:]+@[^\s@?&#:]+\.[^\s@?&#:]+$/u.test(item.email))) fail("profile.email", "Use a plain email address without a mailto prefix or query parameters.");
  }

  const collection = (key: string, identifier: string, check: (record: Record<string, unknown>, path: string) => void) => {
    const items = input[key];
    if (!Array.isArray(items)) { fail(key, "A collection array is required; use [] until verified entries are available."); return; }
    const seen = new Set<string>();
    items.forEach((item, index) => {
      const path = `${key}[${index}]`;
      if (!isRecord(item)) { fail(path, "Each entry must be an object."); return; }
      const id = item[identifier];
      if (typeof id !== "string" || !slugPattern.test(id)) fail(`${path}.${identifier}`, "Use a lowercase kebab-case identifier.");
      else if (seen.has(id)) fail(`${path}.${identifier}`, `Duplicate identifier: ${id}.`);
      else seen.add(id);
      check(item, path);
    });
  };

  collection("research", "slug", (item, path) => {
    texts(item, path, ["title", "question", "method", "venue", "status"]);
    stringArray(item.keyResults, `${path}.keyResults`);
    links(item.links, `${path}.links`, ["paper", "code", "dataset", "demo", "project"], true);
    for (const imageKey of ["thumbnail", "resultFigure"] as const) {
      const image = item[imageKey];
      if (!isRecord(image)) fail(`${path}.${imageKey}`, "A source, alt text, and intrinsic dimensions are required.");
      else {
        url(image.src, `${path}.${imageKey}.src`);
        text(image.alt, `${path}.${imageKey}.alt`);
        for (const key of ["width", "height"]) {
          const dimension = image[key];
          if (typeof dimension !== "number" || !Number.isInteger(dimension) || dimension <= 0) fail(`${path}.${imageKey}.${key}`, "Use a positive integer intrinsic image dimension.");
        }
      }
    }
    if (!isRecord(item.sections)) fail(`${path}.sections`, "All research detail sections are required.");
    else texts(item.sections, `${path}.sections`, sectionKeys);
  });

  collection("publications", "id", (item, path) => {
    texts(item, path, ["title", "venue", "bibtex"]);
    year(item.year, `${path}.year`);
    links(item.links, `${path}.links`, ["paper", "code", "project"], true);
    if (typeof item.bibtex === "string" && !/^@[A-Za-z]+\s*\{[^,\s]+\s*,[\s\S]+\}\s*$/u.test(item.bibtex.trim())) fail(`${path}.bibtex`, "Provide a complete BibTeX entry with an entry type, citation key, and fields.");
    if (!Array.isArray(item.authors) || !item.authors.length) fail(`${path}.authors`, "At least one author in the original publication order is required.");
    else {
      let selfCount = 0;
      item.authors.forEach((author: unknown, index: number) => {
        if (!isRecord(author)) { fail(`${path}.authors[${index}]`, "Each author needs a name."); return; }
        text(author.name, `${path}.authors[${index}].name`);
        if (author.isSelf !== undefined && typeof author.isSelf !== "boolean") fail(`${path}.authors[${index}].isSelf`, "isSelf must be a boolean.");
        if (author.isSelf === true) selfCount += 1;
      });
      if (selfCount !== 1) fail(`${path}.authors`, "Mark exactly one owner author with isSelf: true so the name can be emphasized.");
    }
  });

  collection("experience", "id", (item, path) => {
    texts(item, path, ["company", "role", "team", "problem", "ownership", "method", "scale", "result"]);
    const start = parseContentDate(item.startDate);
    const end = item.endDate === undefined ? null : parseContentDate(item.endDate);
    if (start === null) fail(`${path}.startDate`, "Use a valid ISO calendar month or day.");
    if (item.endDate !== undefined && end === null) fail(`${path}.endDate`, "Use a valid ISO calendar month or day; omit for a confirmed current role.");
    const endBoundary = end !== null && typeof item.endDate === "string" && item.endDate.length === 7
      ? Date.UTC(new Date(end).getUTCFullYear(), new Date(end).getUTCMonth() + 1, 0)
      : end;
    if (start !== null && endBoundary !== null && endBoundary < start) fail(`${path}.endDate`, "The end date must not precede the start date.");
  });

  collection("projects", "slug", (item, path) => {
    texts(item, path, ["title", "description", "problem", "ownership", "outcome"]);
    year(item.year, `${path}.year`);
    stringArray(item.tags, `${path}.tags`, true);
    links(item.links, `${path}.links`, ["code", "demo", "project"], true);
  });

  collection("openSource", "id", (item, path) => {
    texts(item, path, ["title", "repository", "description", "contribution", "result", "status"]);
    if (!["pull-request", "repository", "infrastructure"].includes(String(item.kind))) fail(`${path}.kind`, "Use pull-request, repository, or infrastructure.");
    links(item.links, `${path}.links`, ["code", "pullRequest", "repository", "docs"], true);
    if (item.kind === "pull-request" && (!isRecord(item.links) || !isSafeContentUrl(item.links.pullRequest))) fail(`${path}.links.pullRequest`, "Pull-request contributions require their actual PR URL.");
  });

  return issues;
}

/** Run during the build to prevent incomplete or unsafe data from being published. */
export function assertValidContent(input?: unknown): void {
  const issues = validateContent(input);
  if (issues.length) throw new Error(`Content validation failed:\n${issues.map((issue) => `- ${issue.path}: ${issue.message}`).join("\n")}`);
}
