import { mkdir, rename, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.WANDERWRAP_DEMO_URL ?? "https://www.wanderwrap.co.uk";
const edgeExecutable =
  process.env.WANDERWRAP_BROWSER_PATH ??
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const outputDirectory = resolve("artifacts");
const temporaryDirectory = resolve("artifacts", ".narration-recording");
const outputPath = resolve(outputDirectory, "wanderwrap-demo-narration-ready.webm");
const pause = (milliseconds) => new Promise((resolvePause) => setTimeout(resolvePause, milliseconds));

await mkdir(temporaryDirectory, { recursive: true });
await rm(outputPath, { force: true });

const browser = await chromium.launch({ executablePath: edgeExecutable, headless: true });
const context = await browser.newContext({
  colorScheme: "light",
  viewport: { width: 1920, height: 1080 },
  recordVideo: { dir: temporaryDirectory, size: { width: 1920, height: 1080 } },
});
const page = await context.newPage();
const video = page.video();

try {
  // 0:00–0:20 — problem and landing page
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await pause(12000);
  await page.getByRole("link", { name: /Gift Finder/i }).first().click();
  await page.getByRole("heading", { name: /What should this gift say/i }).waitFor();
  await pause(8000);

  // 0:20–0:42 — define the moment
  await page.getByRole("button", { name: /Build the moment/ }).click();
  await page.getByRole("heading", { name: /What have they chosen to share/i }).waitFor();
  await pause(21000);

  // 0:42–1:05 — selected evidence and permission
  await page.getByRole("button", { name: /Fill with a fictional example/ }).click();
  await page.getByRole("checkbox", { name: /allowed to use these excerpts/i }).check();
  await pause(12000);
  await page.getByRole("button", { name: /Find thoughtful signals/ }).click();
  await page.getByRole("heading", { name: /What feels true/ }).waitFor();
  await pause(11000);

  // 1:05–1:27 — confirmation and adaptive questions
  await pause(10000);
  await page.getByRole("button", { name: /Create the Gift Brief/ }).click();
  await page.getByRole("heading", { name: /Understanding before shopping/i }).waitFor();
  await pause(12000);

  // 1:27–1:52 — shared Gift Brief
  await pause(12000);
  await page.getByRole("button", { name: /Explore gift directions/ }).click();
  await page.getByRole("heading", { name: /Four ways to make them feel seen/i }).waitFor();
  await page.locator(".directionGrid").scrollIntoViewIfNeeded();
  await pause(13000);

  // 1:52–2:20 — compare four genuinely different directions
  await pause(15000);
  await page.locator(".directionGrid button").filter({ hasText: /ceramic/i }).first().click();
  await page.getByRole("heading", { name: /More than a shopping link/i }).waitFor();
  await pause(13000);

  // 2:20–2:40 — complete gift plan
  await pause(7000);
  await page.getByRole("button", { name: /Prepare Amazon matches/ }).click();
  await page.getByRole("heading", { name: /A thoughtful choice/i }).waitFor();
  await pause(13000);

  // 2:40–2:58 — safe Amazon handoff and agent close
  await page.getByRole("heading", { name: /Every specialist leaves evidence/i }).scrollIntoViewIfNeeded();
  await pause(8000);
} finally {
  await context.close();
  await browser.close();
}

const recordedPath = await video.path();
await rename(recordedPath, outputPath);
await rm(temporaryDirectory, { recursive: true, force: true });
console.log(`Narration-ready demo: ${outputPath}`);
