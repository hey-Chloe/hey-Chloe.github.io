import assert from "node:assert/strict";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const site = (process.env.SITE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const basePath = (process.env.BASE_PATH ?? process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const exportDirectory = path.resolve(process.env.EXPORT_DIR || "out");
const artifactDirectory = path.resolve(process.env.QA_DIR || "work/qa");
const failures = [];
const checks = [];
const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
  { name: "small-mobile", width: 320, height: 740 },
];

async function findPages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return findPages(filename);
    if (!entry.name.endsWith(".html") || /(?:^|\/)(?:404|_not-found)(?:\/|\.html)/.test(filename)) return [];
    const relative = path.relative(exportDirectory, filename).split(path.sep).join("/");
    const route = `/${relative.replace(/(?:^|\/)index\.html$/, "/").replace(/\.html$/, "/")}`.replace(/\/+/g, "/");
    return route;
  }))).flat();
}

await mkdir(artifactDirectory, { recursive: true });
const routes = [...new Set(await findPages(exportDirectory))].sort();
assert.ok(routes.includes("/"), "Build the static export before running browser checks.");
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}),
});

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
      isMobile: viewport.width < 768,
      hasTouch: viewport.name !== "desktop",
    });
    const page = await context.newPage();
    let currentRoute = "/";
    const record = (message) => failures.push(`${viewport.name} ${currentRoute}: ${message}`);
    page.on("pageerror", (error) => record(`runtime error: ${error.message}`));
    page.on("console", (message) => { if (message.type() === "error") record(`console error: ${message.text()}`); });
    page.on("requestfailed", (request) => {
      if (!request.failure()?.errorText.includes("ERR_ABORTED")) record(`request failed: ${request.url()} ${request.failure()?.errorText}`);
    });
    page.on("response", (response) => { if (response.status() >= 400) record(`HTTP ${response.status()}: ${response.url()}`); });

    for (const route of routes) {
      currentRoute = route;
      const english = route.startsWith("/en/");
      const contentRoute = english ? route.slice(3) : route;
      try {
        const response = await page.goto(`${site}${basePath}${route}`, { waitUntil: "networkidle" });
        assert.equal(response?.status(), 200, "page must serve HTTP 200");
        await page.evaluate(() => document.fonts.ready);
        for (const image of await page.locator("img").all()) {
          await image.scrollIntoViewIfNeeded();
          await image.evaluate((element) => element.complete ? undefined : new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error(`Image did not load: ${element.src}`)), 10000);
            element.addEventListener("load", () => { clearTimeout(timeout); resolve(); }, { once: true });
            element.addEventListener("error", () => { clearTimeout(timeout); reject(new Error(`Image failed: ${element.src}`)); }, { once: true });
          }));
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        assert.equal(await page.locator("main").count(), 1, "exactly one main landmark");
        assert.equal(await page.locator("h1").count(), 1, "exactly one primary heading");
        assert.ok((await page.title()).trim().length > 0, "document title exists");
        assert.equal(await page.locator("html").getAttribute("lang"), english ? "en" : "zh-CN", "language is present in server-rendered markup");
        assert.ok(await page.locator('link[rel="alternate"][hreflang="zh-CN"]').count(), "Chinese alternate URL exists");
        assert.ok(await page.locator('link[rel="alternate"][hreflang="en"]').count(), "English alternate URL exists");
        assert.doesNotMatch(await page.locator("body").innerText(), /Chloe\s+Li/, "the removed English personal name is not displayed");
        const metadata = await page.locator('meta[name="description"]').getAttribute("content");
        assert.ok(metadata?.trim(), "page description exists");
        assert.ok(await page.locator('meta[property="og:title"]').count(), "OpenGraph title exists");
        assert.ok(await page.locator('meta[property="og:image"]').count(), "OpenGraph image exists");
        assert.ok(await page.locator('meta[name="twitter:card"]').count(), "Twitter card exists");

        const layout = await page.evaluate(() => {
          const viewportWidth = document.documentElement.clientWidth;
          const wideElements = Array.from(document.querySelectorAll("body *")).filter((element) => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            if (!rect.width || style.position === "fixed" || style.visibility === "hidden") return false;
            // KaTeX keeps a deliberately clipped MathML copy for screen readers.
            if (element.closest(".katex-mathml")) return false;
            // Code, tables, and equations may scroll within their own containers.
            const scrollContainer = element.closest("pre, .table-scroll, .mdx-table-scroll, .katex-display, [data-scrollable]");
            if (scrollContainer && scrollContainer.scrollWidth > scrollContainer.clientWidth) return false;
            return rect.right > viewportWidth + 2 || rect.left < -2;
          }).slice(0, 8).map((element) => `${element.tagName}.${element.className}`);
          const brokenImages = Array.from(document.images).filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src);
          const placeholderLinks = Array.from(document.querySelectorAll("a[href]")).filter((link) => {
            const href = link.getAttribute("href")?.trim();
            return !href || href === "#" || href.startsWith("javascript:");
          }).map((link) => link.textContent);
          return { viewportWidth, pageWidth: document.documentElement.scrollWidth, wideElements, brokenImages, placeholderLinks };
        });
        assert.ok(layout.pageWidth <= layout.viewportWidth + 1, `page overflows: ${JSON.stringify(layout)}`);
        assert.deepEqual(layout.wideElements, [], "content remains inside the viewport or an intentional scroll container");
        assert.deepEqual(layout.brokenImages, [], "all images load");
        assert.deepEqual(layout.placeholderLinks, [], "no fake clickable links");
        const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
        for (const violation of audit.violations) record(`accessibility ${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`);

        if (contentRoute === "/") {
          assert.equal(await page.locator(".hero-links .contact-icon").count(), 4, "CV, GitHub, Scholar, and email each have a small icon");
          assert.equal(await page.locator(".wordmark svg").count(), 0, "the removed top-left decorative symbol stays absent");
          assert.match(await page.locator(".hero-bio").innerText(), english ? /Jiangnan University/ : /江南大学/, "the concise biography includes verified education");
          if (await page.locator(".hero-portrait").count()) {
            const portrait = await page.locator(".hero-portrait").boundingBox();
            const name = await page.locator(".profile-header h1").boundingBox();
            assert.ok(portrait && name && portrait.x + portrait.width <= name.x + 2, "portrait sits to the left of the name on every screen size");
          }
          await page.keyboard.press("Tab");
          const focusedLink = page.locator(":focus");
          const skipHref = await focusedLink.getAttribute("href");
          assert.ok(skipHref?.startsWith("#"), "first keyboard focus should be the skip-to-content link");
          await page.keyboard.press("Enter");
          assert.equal(await page.evaluate(() => document.activeElement?.tagName), "MAIN", "skip link focuses main");

          const menu = page.locator('button[aria-expanded][aria-controls]').first();
          if (await menu.count() && await menu.isVisible()) {
            await menu.click();
            assert.equal(await menu.getAttribute("aria-expanded"), "true", "mobile navigation opens");
            const controlledId = await menu.getAttribute("aria-controls");
            const navigation = page.locator(`[id="${controlledId}"]`);
            assert.ok(await navigation.isVisible(), "mobile nav is visible");
            await navigation.getByRole("link").first().focus();
            await page.keyboard.press("Escape");
            assert.equal(await menu.getAttribute("aria-expanded"), "false", "Escape closes mobile navigation");
            assert.ok(await menu.evaluate((element) => document.activeElement === element), "Escape returns focus to the menu toggle");
            await menu.click();
            await menu.click();
            assert.equal(await menu.getAttribute("aria-expanded"), "false", "mobile navigation closes");
          }
        }

        if (viewport.name === "desktop") {
          const highlight = page.locator("main [data-reading-highlight]").first();
          if (contentRoute === "/") assert.ok(await highlight.count(), "homepage exposes paragraph reading highlights");
          if (await highlight.count()) {
            await highlight.scrollIntoViewIfNeeded();
            const before = await highlight.boundingBox();
            await highlight.hover();
            const style = await highlight.evaluate((element) => {
              const computed = getComputedStyle(element);
              return { background: computed.backgroundColor, outline: computed.outlineColor, width: computed.outlineWidth };
            });
            assert.equal(style.background, "rgb(255, 252, 102)", "paragraph hover uses the requested yellow");
            assert.equal(style.outline, "rgb(255, 252, 102)", "paragraph highlight outline matches its fill");
            assert.equal(style.width, "6px", "highlight uses the reference's 6px outline");
            const after = await highlight.boundingBox();
            assert.deepEqual(after, before, "paragraph highlighting does not shift surrounding layout");
            const selection = await highlight.evaluate((element) => getComputedStyle(element, "::selection").backgroundColor);
            assert.equal(selection, "rgb(255, 252, 102)", "text selection uses the same yellow");
            if (contentRoute === "/") await page.screenshot({ path: path.join(artifactDirectory, `${english ? "en-" : ""}desktop-home-highlight.png`) });
            await page.mouse.move(0, 0);
          }
        }

        const bibtex = page.locator("details.bibtex").first();
        if (await bibtex.count()) {
          await bibtex.locator("summary").click();
          assert.equal(await bibtex.getAttribute("open"), "", "BibTeX disclosure opens");
          assert.ok(await bibtex.locator("pre").isVisible(), "BibTeX text is visible");
          assert.match(await bibtex.locator("pre").textContent(), /@\w+\s*\{/, "citation has BibTeX format");
          for (const author of await page.locator(".publication-entry .authors strong").all()) {
            assert.ok(Number(await author.evaluate((element) => getComputedStyle(element).fontWeight)) >= 600, "owner author is visibly emphasized");
          }
        }
        const copyButton = page.locator(".copy-button").filter({ visible: true }).first();
        if (await copyButton.count()) {
          const displayedCitation = await copyButton.evaluate((element) => element.closest(".citation-block, .bibtex-content")?.querySelector("pre")?.textContent);
          assert.ok(displayedCitation?.trim(), "a copy action has a readable citation");
          // Test both clipboard branches without overwriting the owner's system clipboard.
          await page.evaluate(() => Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: { writeText: async (text) => { window.__qaCopiedCitation = text; } },
          }));
          await copyButton.click();
          assert.equal(await copyButton.innerText(), english ? "Copied" : "已复制", "copy success is announced");
          assert.equal(await page.evaluate(() => window.__qaCopiedCitation), displayedCitation, "copy sends the actual displayed citation text");
          await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error("QA clipboard denial"); }; });
          await copyButton.click();
          assert.match(await copyButton.innerText(), /select and copy|手动复制/i, "clipboard denial gives a manual-copy fallback");
        }
        if (contentRoute === "/writing/rendering/") {
          assert.ok(await page.locator(".katex").count() >= 2, "inline and display mathematics render");
          const equation = page.locator(".katex-display").first();
          if (await equation.evaluate((element) => element.scrollWidth > element.clientWidth + 1)) {
            assert.equal(await equation.getAttribute("tabindex"), "0", "a long equation can receive keyboard focus");
            await equation.focus();
            await page.keyboard.press("ArrowRight");
            await page.waitForFunction(() => document.querySelector(".katex-display")?.scrollLeft > 0);
          }
          assert.ok(await page.locator("pre code span").count(), "code receives syntax highlighting");
          assert.equal(await page.getByRole("link", { name: "research fixture", exact: true }).getAttribute("href"), `${basePath}${english ? "/en" : ""}/research/layout-contract/#method`, "MDX internal links preserve the current language and anchor");
          assert.equal(await page.locator("figure img").count(), 1, "MDX Figure renders an image");
          assert.ok((await page.locator("figcaption").textContent())?.includes("QA fixture"), "figure has a visible caption");
          assert.equal(await page.locator("table thead th").count(), 4, "GFM table renders semantic column headers");
          await page.locator('a[href="#ref-fixture"]').click();
          assert.equal(new URL(page.url()).hash, "#ref-fixture", "citation links reach their references");
          await page.evaluate(() => window.scrollTo(0, 0));
        }
        if (contentRoute.startsWith("/research/") && contentRoute !== "/research/") {
          const headings = await page.locator("main h2").allTextContents();
          assert.deepEqual(headings, english ? ["Abstract", "Problem", "Method", "Architecture", "Dataset", "Experiments", "Results", "Ablation", "Failure Analysis", "Demo", "Citation"] : ["摘要", "问题", "方法", "系统架构", "数据集", "实验设计", "实验结果", "消融分析", "失败分析", "演示", "引用"], "research detail includes the complete requested evidence structure");
          await page.getByRole("navigation", { name: english ? "On this page" : "本页目录" }).getByRole("link", { name: english ? "Failure Analysis" : "失败分析", exact: true }).click();
          assert.equal(new URL(page.url()).hash, "#failureAnalysis", "research section navigation works");
          await page.evaluate(() => window.scrollTo(0, 0));
        }
        // Capture the resting layout after keyboard, hover, and disclosure checks.
        await page.evaluate(() => {
          document.activeElement?.blur?.();
          window.scrollTo(0, 0);
        });
        await page.mouse.move(0, 0);
        const screenshotName = `${viewport.name}-${route === "/" ? "home" : route.replace(/^\/|\/$/g, "").replaceAll("/", "-")}.png`;
        await page.screenshot({ path: path.join(artifactDirectory, screenshotName), fullPage: true });
        if (contentRoute === "/") await page.screenshot({ path: path.join(artifactDirectory, `${english ? "en-" : ""}${viewport.name}-home-viewport.png`) });
        checks.push({ viewport: viewport.name, route, width: layout.viewportWidth, contentWidth: layout.pageWidth, wideElements: layout.wideElements, accessibilityViolations: audit.violations.length });
      } catch (error) { record(error.message); }
    }

    for (const prefix of ["", "/en"]) {
      currentRoute = `${prefix}/ navigation`;
      const english = prefix === "/en";
      try {
        await page.goto(`${site}${basePath}${prefix}/`, { waitUntil: "networkidle" });
        const navigationMenu = page.locator('button[aria-expanded][aria-controls]').first();
        if (await navigationMenu.count() && await navigationMenu.isVisible()) {
          await navigationMenu.click();
          const navigation = page.locator(`[id="${await navigationMenu.getAttribute("aria-controls")}"]`);
          await navigation.getByRole("link", { name: english ? "Research" : "研究", exact: true }).click();
          await page.waitForURL(`**${basePath}${prefix}/research/`);
          assert.equal(await navigationMenu.getAttribute("aria-expanded"), "false", "following a mobile navigation link closes the menu");
          assert.equal(await navigation.getByRole("link", { name: english ? "Research" : "研究", exact: true, includeHidden: true }).getAttribute("aria-current"), "page", "navigation identifies the current route");
          await page.reload({ waitUntil: "networkidle" });
          assert.equal(await page.locator("h1").count(), 1, "a navigated route survives a direct refresh");
          await page.goto(`${site}${basePath}${prefix}/`, { waitUntil: "networkidle" });
        }
        const cvLink = page.locator(`a[href="${basePath}${prefix}/cv/"]`).filter({ visible: true }).first();
        assert.ok(await cvLink.count(), "a visible internal CV navigation link exists");
        await cvLink.click();
        await page.waitForURL(`**${basePath}${prefix}/cv/`);
        assert.ok(await page.locator("h1").isVisible(), "navigation reaches the CV page");
        await page.goto(`${site}${basePath}${prefix}/research/?view=all#main`, { waitUntil: "networkidle" });
        await page.locator(`.language-switch a[hreflang="${english ? "zh-CN" : "en"}"]`).click();
        const target = english ? "/research/" : "/en/research/";
        await page.waitForURL(`**${basePath}${target}?view=all#main`);
        assert.equal(await page.locator("html").getAttribute("lang"), english ? "zh-CN" : "en", "language switch loads the target document language");
        await page.reload({ waitUntil: "networkidle" });
        assert.equal(new URL(page.url()).pathname, `${basePath}${target}`, "language choice survives refresh in the URL");
      } catch (error) { record(error.message); }
    }
    await context.close();
  }
} finally {
  await browser.close();
  const report = { site, basePath, routes, checks, failures };
  await writeFile(path.join(artifactDirectory, "browser-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ routes: routes.length, responsiveChecks: checks.length, artifacts: artifactDirectory, failures }, null, 2));
}
if (failures.length) process.exitCode = 1;
