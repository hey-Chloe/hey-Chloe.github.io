import assert from "node:assert/strict";
import test from "node:test";
import { profile } from "../data/profile";
import type { ContentData, Experience, Publication, Research } from "../data/types";
import { assertValidContent, isSafeContentUrl, parseContentDate, validateContent } from "../lib/content-validation";

// Synthetic fixtures live only in tests. They are never imported by public pages.
function emptyContent(): ContentData {
  return {
    profile: { ...profile },
    research: [], publications: [], experience: [], projects: [], openSource: [],
  };
}

function researchFixture(): Research {
  return {
    slug: "validation-fixture",
    title: "Validation fixture",
    question: "Test-only research question.",
    method: "Test-only method.",
    keyResults: ["Test-only result text."],
    venue: "Test-only venue",
    status: "Test-only status",
    thumbnail: { src: "/images/fixture.svg", alt: "Test-only fixture", width: 1200, height: 720 },
    resultFigure: { src: "/images/fixture.svg", alt: "Test-only result figure", width: 1200, height: 720 },
    links: { project: "/research/validation-fixture/" },
    sections: {
      abstract: "Fixture abstract.", problem: "Fixture problem.", method: "Fixture method.",
      architecture: "Fixture architecture.", dataset: "Fixture dataset.", experiments: "Fixture experiments.",
      results: "Fixture results.", ablation: "Fixture ablation.", failureAnalysis: "Fixture failure analysis.",
      demo: "Fixture demo.", citation: "Fixture citation.",
    },
  };
}

function publicationFixture(): Publication {
  return {
    id: "publication-fixture", year: 2026, title: "Validation fixture",
    authors: [{ name: "Fixture author", isSelf: true }], venue: "Test-only venue",
    links: { project: "/research/validation-fixture/" },
    bibtex: "@article{fixture, title={Validation fixture}}",
  };
}

function experienceFixture(): Experience {
  return {
    id: "experience-fixture", company: "Fixture organization", role: "Fixture role", team: "Fixture team",
    startDate: "2025-09", endDate: "2026-09", problem: "Fixture problem", ownership: "Fixture ownership",
    method: "Fixture method", scale: "Fixture scale", result: "Fixture result",
  };
}

test("actual content with no invented records passes validation", () => {
  assert.deepEqual(validateContent(), []);
  assert.doesNotThrow(() => assertValidContent());
});

test("safe content links allow HTTPS and absolute local paths", () => {
  for (const value of ["https://github.com", "https://arxiv.org/abs/1706.03762", "/cv.pdf", "/research/work/#method"]) {
    assert.equal(isSafeContentUrl(value), true, value);
  }
});

test("content links reject unsafe protocols, credentials, traversal, and encoded separators", () => {
  for (const value of [
    "", "#", "javascript:alert(1)", "data:text/html,<script>", "http://github.com", "//evil.com",
    "/\\evil.com", "/%5cevil.com", "/%2fexample.com", "/../secret", "/%2e%2e/secret",
    "https://user:password@github.com", "https://github.com\n", "https://github.com/%00",
    "https://github.com/%zz", " ./cv.pdf",
  ]) assert.equal(isSafeContentUrl(value), false, value);
});

test("content links reject reserved example domains and private development hosts", () => {
  for (const value of [
    "https://example.com", "https://example.org", "https://papers.example.net", "https://chloe.example",
    "https://research.test", "https://research.invalid", "https://localhost", "https://app.localhost",
    "https://127.0.0.1", "https://192.168.1.10", "https://10.0.0.2", "https://172.16.0.1",
  ]) assert.equal(isSafeContentUrl(value), false, value);
});

test("calendar dates validate real month/day combinations and leap years", () => {
  for (const value of ["2024-02-29", "2026-09", "2026-09-30"]) assert.notEqual(parseContentDate(value), null, value);
  for (const value of ["2025-02-29", "2026-02-30", "2026-13", "2026-00", "2026-04-31", "2026-9", "September 2026", "1899-01", "2101-01"]) {
    assert.equal(parseContentDate(value), null, value);
  }
});

test("duplicate slugs cannot produce colliding research pages", () => {
  const fixture = researchFixture();
  const issues = validateContent({ ...emptyContent(), research: [fixture, fixture] });
  assert.equal(issues.filter((issue) => issue.message.includes("Duplicate identifier")).length, 1);
  assert.equal(issues[0].path, "research[1].slug");
});

test("unsafe or noncanonical slugs are rejected", () => {
  for (const slug of ["../work", "Uppercase", "with space", "with_underbar", "two--hyphens", "-leading", "trailing-"]) {
    const issues = validateContent({ ...emptyContent(), research: [{ ...researchFixture(), slug }] });
    assert(issues.some((issue) => issue.path === "research[0].slug"), slug);
  }
});

test("complete research schema passes and omitted sections or invalid images fail", () => {
  const fixture = researchFixture();
  assert.deepEqual(validateContent({ ...emptyContent(), research: [fixture] }), []);
  const broken = {
    ...fixture,
    thumbnail: { ...fixture.thumbnail, width: 0, alt: "" },
    resultFigure: { ...fixture.resultFigure, height: 0, alt: "" },
    sections: { ...fixture.sections, failureAnalysis: "" },
  };
  const paths = validateContent({ ...emptyContent(), research: [broken] }).map((issue) => issue.path);
  assert(paths.includes("research[0].thumbnail.width"));
  assert(paths.includes("research[0].thumbnail.alt"));
  assert(paths.includes("research[0].resultFigure.height"));
  assert(paths.includes("research[0].resultFigure.alt"));
  assert(paths.includes("research[0].sections.failureAnalysis"));
});

test("draft placeholders and unsupported link keys cannot be published", () => {
  const fixture = { ...researchFixture(), title: "TODO: title", links: { unknown: "https://github.com" } };
  const issues = validateContent({ ...emptyContent(), research: [fixture] });
  assert(issues.some((issue) => issue.path === "research[0].title"));
  assert(issues.some((issue) => issue.path === "research[0].links.unknown"));
  assert(issues.some((issue) => issue.message.includes("evidence link")));
});

test("publication requires one self author and complete BibTeX", () => {
  const fixture = publicationFixture();
  assert.deepEqual(validateContent({ ...emptyContent(), publications: [fixture] }), []);
  for (const authors of [[], [{ name: "Fixture author" }], [{ name: "One", isSelf: true }, { name: "Two", isSelf: true }]]) {
    assert(validateContent({ ...emptyContent(), publications: [{ ...fixture, authors }] }).some((issue) => issue.path === "publications[0].authors"));
  }
  assert(validateContent({ ...emptyContent(), publications: [{ ...fixture, bibtex: "incomplete" }] }).some((issue) => issue.path === "publications[0].bibtex"));
});

test("requested future publication group is allowed without inventing publication records", () => {
  assert.deepEqual(validateContent({ ...emptyContent(), publications: [{ ...publicationFixture(), year: 2027 }] }), []);
  assert(validateContent({ ...emptyContent(), publications: [{ ...publicationFixture(), year: 2026.5 }] }).some((issue) => issue.path === "publications[0].year"));
});

test("experience dates reject reversed periods and accept a month containing the start day", () => {
  const fixture = experienceFixture();
  assert.deepEqual(validateContent({ ...emptyContent(), experience: [fixture] }), []);
  assert(validateContent({ ...emptyContent(), experience: [{ ...fixture, endDate: "2024-09" }] }).some((issue) => issue.path === "experience[0].endDate"));
  assert.deepEqual(validateContent({ ...emptyContent(), experience: [{ ...fixture, startDate: "2026-09-30", endDate: "2026-09" }] }), []);
  assert.deepEqual(validateContent({ ...emptyContent(), experience: [{ ...fixture, endDate: undefined }] }), []);
  assert.deepEqual(validateContent({ ...emptyContent(), experience: [{ id: "confirmed-role", company: "Confirmed company", role: "Confirmed role" }] }), []);
  assert(validateContent({ ...emptyContent(), experience: [{ id: "bad-date", company: "Confirmed company", role: "Confirmed role", endDate: "2026-09" }] }).some((issue) => issue.path === "experience[0].startDate"));
});

test("optional profile links are omitted, never fake links or mailto query strings", () => {
  const content = emptyContent();
  assert.deepEqual(validateContent(content), []);
  for (const email of ["mailto:owner@domain.org", "owner@domain.org?subject=test", "owner domain.org"]) {
    const issues = validateContent({ ...content, profile: { ...content.profile, email } });
    assert(issues.some((issue) => issue.path === "profile.email"), email);
  }
  assert(validateContent({ ...content, profile: { ...content.profile, github: "#" } }).some((issue) => issue.path === "profile.github"));
  assert.deepEqual(validateContent({ ...content, profile: { ...content.profile, portrait: undefined } }), []);
  const invalidPortrait = { src: "javascript:alert(1)", alt: "", width: -1, height: 0 };
  const portraitIssues = validateContent({ ...content, profile: { ...content.profile, portrait: invalidPortrait } });
  for (const key of ["src", "alt", "width", "height"]) assert(portraitIssues.some(issue => issue.path === `profile.portrait.${key}`));
});

test("pull-request contributions require a PR evidence link", () => {
  const fixture = {
    id: "pr-fixture", title: "Fixture PR", kind: "pull-request", repository: "Fixture repository",
    description: "Fixture description", contribution: "Fixture contribution", result: "Fixture result",
    status: "Fixture status", links: { repository: "https://github.com" },
  };
  assert(validateContent({ ...emptyContent(), openSource: [fixture] }).some((issue) => issue.path === "openSource[0].links.pullRequest"));
});

test("malformed runtime input produces actionable issues rather than crashing", () => {
  assert.deepEqual(validateContent(null), [{ path: "content", message: "Content must be an object." }]);
  assert(validateContent({ ...emptyContent(), research: [null] }).some((issue) => issue.path === "research[0]"));
  assert(validateContent({ ...emptyContent(), experience: null }).some((issue) => issue.path === "experience"));
  assert.throws(() => assertValidContent({ ...emptyContent(), research: [{ slug: "incomplete" }] }), /research\[0\]\.sections/);
});
