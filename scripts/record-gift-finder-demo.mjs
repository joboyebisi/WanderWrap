import { mkdir, rename, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.WANDERWRAP_DEMO_URL ?? "http://127.0.0.1:3000";
const edgeExecutable =
  process.env.WANDERWRAP_BROWSER_PATH ??
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const outputDirectory = resolve("artifacts");
const temporaryDirectory = resolve("artifacts", ".recording");
const outputPath = resolve(outputDirectory, "wanderwrap-gift-confidence-demo.webm");

const pause = (milliseconds) => new Promise((resolvePause) => setTimeout(resolvePause, milliseconds));

await mkdir(temporaryDirectory, { recursive: true });
await rm(outputPath, { force: true });

const browser = await chromium.launch({
  executablePath: edgeExecutable,
  headless: true,
});

const context = await browser.newContext({
  colorScheme: "light",
  viewport: { width: 1920, height: 1080 },
  recordVideo: {
    dir: temporaryDirectory,
    size: { width: 1920, height: 1080 },
  },
});

const page = await context.newPage();
const video = page.video();

try {
  await page.goto(`${baseUrl}/gift-finder`, { waitUntil: "networkidle" });
  await pause(3500);

  await page.getByRole("button", { name: /Build the moment/ }).click();
  await pause(3000);

  await page.getByRole("button", { name: /Fill with a fictional example/ }).click();
  await page.getByRole("checkbox", { name: /allowed to use these excerpts/i }).check();
  await pause(2500);

  await page.getByRole("button", { name: /Find thoughtful signals/ }).click();
  await page.getByRole("heading", { name: /What feels true/ }).waitFor();
  await pause(3500);

  await page.getByRole("button", { name: /Create the Gift Brief/ }).click();
  await page.getByRole("heading", { name: /Understanding before shopping/i }).waitFor();
  await pause(5000);

  await page.getByRole("button", { name: /Explore gift directions/ }).click();
  await page.getByRole("heading", { name: /Four ways to make them feel seen/i }).waitFor();
  await page.locator(".directionGrid").scrollIntoViewIfNeeded();
  await pause(6500);

  await page.locator(".directionGrid button").filter({ hasText: /ceramic/i }).first().click();
  await page.getByRole("heading", { name: /More than a shopping link/i }).waitFor();
  await pause(5500);

  await page.getByRole("button", { name: /Prepare Amazon matches/ }).click();
  await page.getByRole("heading", { name: /A thoughtful choice/i }).waitFor();
  await page.getByRole("heading", { name: /Every specialist leaves evidence/i }).scrollIntoViewIfNeeded();
  await pause(6000);
} finally {
  await context.close();
  await browser.close();
}

const recordedPath = await video.path();
await rename(recordedPath, outputPath);
await rm(temporaryDirectory, { recursive: true, force: true });

console.log(`Recorded demo: ${outputPath}`);
