import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const origin = (process.env.SITE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const basePath = (process.env.BASE_PATH ?? process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');
const url = `${origin}${basePath}/`;
const reportDirectory = process.env.QA_DIR || 'work/qa';
const chrome = await launch({ chromePath: process.env.BROWSER_EXECUTABLE || chromium.executablePath(), chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'] });
try {
  await mkdir(reportDirectory, { recursive: true });
  const results = [];
  for (const mode of ['mobile', 'desktop']) {
    const report = await lighthouse(url, { port: chrome.port, output: ['html', 'json'], logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'], ...(mode === 'desktop' ? { formFactor: 'desktop', screenEmulation: { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 } } : {}) });
    if (!report) throw new Error('Lighthouse did not produce a report');
    await writeFile(`${reportDirectory}/lighthouse-${mode}.html`, report.report[0]);
    await writeFile(`${reportDirectory}/lighthouse-${mode}.json`, report.report[1]);
    const scores = Object.fromEntries(Object.entries(report.lhr.categories).map(([name, value]) => [name, Math.round((value.score ?? 0) * 100)]));
    results.push({ mode, url, scores });
    console.log(mode, scores);
  }
  await writeFile(`${reportDirectory}/lighthouse-summary.json`, JSON.stringify(results, null, 2));
  if (results.some(({ scores }) => Object.values(scores).some(value => value <= 95))) process.exitCode = 1;
} finally { await chrome.kill(); }
