import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const targetDirs = [
  path.resolve(process.cwd(), "..", "GRAPHITE-GLASS-DECK-SCREENSHOTS"),
  path.resolve("C:\\Users\\Huy\\.gemini\\antigravity\\brain\\20c95a8f-ab5a-40e4-8ca7-4ef62d971f61\\GRAPHITE-GLASS-DECK-SCREENSHOTS"),
  path.resolve(process.cwd(), "GRAPHITE-GLASS-DECK-SCREENSHOTS"),
];

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function saveMultiScreenshot(page: any, filename: string, options?: any) {
  const primaryPath = path.join(targetDirs[0], filename);
  await page.screenshot({ path: primaryPath, ...options });
  for (let i = 1; i < targetDirs.length; i++) {
    const dest = path.join(targetDirs[i], filename);
    try {
      fs.copyFileSync(primaryPath, dest);
    } catch (e) {
      // ignore copy error if dir inaccessible
    }
  }
}

const protoDir = path.resolve(process.cwd(), "..", "design-explorations", "phase-3e-graphite-glass-deck");
const a1File = path.join(protoDir, "variant-a1-frosted-deck.html");
const a2File = path.join(protoDir, "variant-a2-satin-console.html");

const a1Url = "file:///" + a1File.replace(/\\/g, "/");
const a2Url = "file:///" + a2File.replace(/\\/g, "/");

test.describe("Graphite Glass Deck Design Exploration Capture", () => {
  // VARIANT A1: Frosted Instrument Deck
  test("Variant A1 - Desktop 1920x1080 Dark Theme", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(a1Url);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await saveMultiScreenshot(page, "a1-frosted-deck-1920x1080-dark.png", { fullPage: true });
  });

  test("Variant A1 - Desktop 1920x1080 Light Theme", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(a1Url);
    await page.waitForLoadState("networkidle");
    await page.click("#themeBtn");
    await page.waitForTimeout(500);
    await saveMultiScreenshot(page, "a1-frosted-deck-1920x1080-light.png", { fullPage: true });
  });

  test("Variant A1 - Laptop 1366x768 Dark Theme", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(a1Url);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await saveMultiScreenshot(page, "a1-frosted-deck-1366x768-dark.png", { fullPage: false });
    await saveMultiScreenshot(page, "a1-frosted-deck-1366x768-dark-full.png", { fullPage: true });
  });

  test("Variant A1 - Laptop 1366x768 Light Theme", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(a1Url);
    await page.waitForLoadState("networkidle");
    await page.click("#themeBtn");
    await page.waitForTimeout(500);
    await saveMultiScreenshot(page, "a1-frosted-deck-1366x768-light.png", { fullPage: false });
  });

  test("Variant A1 - Tablet 1024x768 Dark Theme", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(a1Url);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await saveMultiScreenshot(page, "a1-frosted-deck-1024x768-dark.png", { fullPage: true });
  });

  test("Variant A1 - Compact Reflow 960x540", async ({ page }) => {
    await page.setViewportSize({ width: 960, height: 540 });
    await page.goto(a1Url);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await saveMultiScreenshot(page, "a1-frosted-deck-960x540-reflow.png", { fullPage: true });
  });

  test("Variant A1 - Decision Deck Interaction (Manual Override & Action)", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(a1Url);
    await page.waitForLoadState("networkidle");
    // Open manual override
    await page.click("details summary");
    await page.waitForTimeout(300);
    await saveMultiScreenshot(page, "a1-frosted-deck-manual-override-open.png", { fullPage: false });
  });

  // VARIANT A2: Satin Editorial Console
  test("Variant A2 - Desktop 1920x1080 Dark Theme", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(a2Url);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await saveMultiScreenshot(page, "a2-satin-console-1920x1080-dark.png", { fullPage: true });
  });

  test("Variant A2 - Desktop 1920x1080 Light Theme", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(a2Url);
    await page.waitForLoadState("networkidle");
    await page.click("#themeBtn");
    await page.waitForTimeout(500);
    await saveMultiScreenshot(page, "a2-satin-console-1920x1080-light.png", { fullPage: true });
  });

  test("Variant A2 - Laptop 1366x768 Dark Theme", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(a2Url);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await saveMultiScreenshot(page, "a2-satin-console-1366x768-dark.png", { fullPage: false });
    await saveMultiScreenshot(page, "a2-satin-console-1366x768-dark-full.png", { fullPage: true });
  });

  test("Variant A2 - Laptop 1366x768 Light Theme", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(a2Url);
    await page.waitForLoadState("networkidle");
    await page.click("#themeBtn");
    await page.waitForTimeout(500);
    await saveMultiScreenshot(page, "a2-satin-console-1366x768-light.png", { fullPage: false });
  });

  test("Variant A2 - Tablet 1024x768 Dark Theme", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(a2Url);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await saveMultiScreenshot(page, "a2-satin-console-1024x768-dark.png", { fullPage: true });
  });

  test("Variant A2 - Compact Reflow 960x540", async ({ page }) => {
    await page.setViewportSize({ width: 960, height: 540 });
    await page.goto(a2Url);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await saveMultiScreenshot(page, "a2-satin-console-960x540-reflow.png", { fullPage: true });
  });

  test("Variant A2 - Decision Deck Interaction (Manual Override)", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(a2Url);
    await page.waitForLoadState("networkidle");
    await page.click("details summary");
    await page.waitForTimeout(300);
    await saveMultiScreenshot(page, "a2-satin-console-manual-override-open.png", { fullPage: false });
  });
});
