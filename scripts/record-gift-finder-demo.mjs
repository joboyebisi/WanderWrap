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
  await page.goto(`${baseUrl}/gift-finder`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: /Who are you celebrating/i }).waitFor();
  await pause(3500);
  await page.getByLabel("First name or nickname").fill("Maya");
  await page.getByRole("button", { name: /Tell us about them/ }).click();
  await page.getByRole("heading", { name: /What do they genuinely enjoy/ }).waitFor();
  await page.getByRole("button", { name: "Books" }).click();
  await page.getByRole("button", { name: "Wellness" }).click();
  await page.getByLabel("Anything else that would help?").fill("She loves literary fiction, quiet Sunday mornings and beautiful, useful objects for a small flat.");
  await pause(3000);
  await page.getByRole("button", { name: /Review Gift Brief/ }).click();
  await page.getByRole("heading", { name: /One clear brief for our gift agents/ }).waitFor();
  await pause(4000);
  await page.getByRole("button", { name: /Find gifts with our agents/ }).click();
  await page.getByRole("heading", { name: /Thoughtful options for Maya/i }).waitFor();
  const retailerChoice = page.locator(".amazonOffers button").first();
  if (await retailerChoice.count()) {
    await retailerChoice.click();
  } else {
    await page.getByRole("button", { name: /See matching gifts/ }).click();
  }
  await page.getByRole("dialog", { name: /Continue with/i }).waitFor();
  await pause(3500);
  await page.getByRole("button", { name: /Stay and compare/i }).click();
  await pause(6000);
} finally {
  await context.close();
  await browser.close();
}

const recordedPath = await video.path();
await rename(recordedPath, outputPath);
await rm(temporaryDirectory, { recursive: true, force: true });

console.log(`Recorded demo: ${outputPath}`);
