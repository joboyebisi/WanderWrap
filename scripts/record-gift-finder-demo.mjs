import { mkdir, rename, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.WANDERWRAP_DEMO_URL ?? "http://127.0.0.1:3000";
const edgeExecutable = process.env.WANDERWRAP_BROWSER_PATH ?? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const outputDirectory = resolve("artifacts");
const temporaryDirectory = resolve(outputDirectory, ".recording");
const outputPath = resolve(outputDirectory, "wanderwrap-gift-confidence-demo.webm");
const pause = milliseconds => new Promise(resolvePause => setTimeout(resolvePause, milliseconds));

await mkdir(temporaryDirectory, { recursive: true });
await rm(outputPath, { force: true });
const browser = await chromium.launch({ executablePath: edgeExecutable, headless: true });
const context = await browser.newContext({ colorScheme: "light", viewport: { width: 1920, height: 1080 }, recordVideo: { dir: temporaryDirectory, size: { width: 1920, height: 1080 } } });
const page = await context.newPage();
const video = page.video();

try {
  await page.goto(`${baseUrl}/gift-finder`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: /Let’s find something that feels like them/i }).waitFor();
  await page.getByLabel("Your message").fill("I need a birthday gift for my partner Maya under £80. She loves literary fiction, tea, quiet Sundays and beautiful useful objects for a small flat. Please find current options.");
  await page.getByRole("button", { name: /Send/ }).click();
  await page.locator(".amazonOffers button").first().waitFor({ timeout: 60_000 });
  await pause(4000);
  const assistantCount = await page.locator(".giftChatTranscript article.assistant").count();
  await page.getByRole("button", { name: "More unusual" }).click();
  await page.waitForFunction(expected => document.querySelectorAll(".giftChatTranscript article.assistant").length > expected, assistantCount, { timeout: 60_000 });
  await page.screenshot({ path: resolve(outputDirectory, "wanderwrap-gift-finder.png"), fullPage: true });
  await page.locator(".amazonOffers button").first().click();
  await page.getByRole("dialog", { name: /Continue with/i }).waitFor();
  await pause(3500);
  await page.getByRole("button", { name: /Stay and compare/i }).click();
  await pause(3000);
} finally {
  await context.close();
  await browser.close();
}

const recordedPath = await video.path();
await rename(recordedPath, outputPath);
await rm(temporaryDirectory, { recursive: true, force: true });
console.log(`Recorded demo: ${outputPath}`);
