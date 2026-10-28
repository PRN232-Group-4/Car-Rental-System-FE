import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const targetDirs = [
  path.resolve(process.cwd(), "..", "GRAPHITE-GLASS-DECK-A1.1-SCREENSHOTS"),
  path.resolve("C:\\Users\\Huy\\.gemini\\antigravity\\brain\\20c95a8f-ab5a-40e4-8ca7-4ef62d971f61\\GRAPHITE-GLASS-DECK-A1.1-SCREENSHOTS"),
  path.resolve(process.cwd(), "GRAPHITE-GLASS-DECK-A1.1-SCREENSHOTS"),
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
      // ignore copy error
    }
  }
}

const protoDir = path.resolve(process.cwd(), "..", "design-explorations", "phase-3e-graphite-glass-deck");
const a11File = path.join(protoDir, "variant-a1.1-refined-frosted-editorial-deck.html");
const a11Url = "file:///" + a11File.replace(/\\/g, "/");

test.describe("Graphite Glass Deck A1.1 Refined Frosted Editorial Deck Capture", () => {
  test("A1.1 - Desktop 1920x1080 Dark Theme", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(a11Url);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await saveMultiScreenshot(page, "a1-1-editorial-deck-1920x1080-dark.png", { fullPage: true });
  });

  test("A1.1 - Desktop 1920x1080 Light Theme", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(a11Url);
    await page.waitForLoadState("networkidle");
    await page.click("#themeBtn");
    await page.waitForTimeout(500);
    await saveMultiScreenshot(page, "a1-1-editorial-deck-1920x1080-light.png", { fullPage: true });
  });

  test("A1.1 - Laptop 1366x768 Dark Theme", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(a11Url);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await saveMultiScreenshot(page, "a1-1-editorial-deck-1366x768-dark.png", { fullPage: false });
    await saveMultiScreenshot(page, "a1-1-editorial-deck-1366x768-dark-full.png", { fullPage: true });
  });

  test("A1.1 - Laptop 1366x768 Light Theme", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(a11Url);
    await page.waitForLoadState("networkidle");
    await page.click("#themeBtn");
    await page.waitForTimeout(500);
    await saveMultiScreenshot(page, "a1-1-editorial-deck-1366x768-light.png", { fullPage: false });
  });

  test("A1.1 - Tablet 1024x768 Dark Theme", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(a11Url);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await saveMultiScreenshot(page, "a1-1-editorial-deck-1024x768-dark.png", { fullPage: true });
  });

  test("A1.1 - Compact Reflow 960x540", async ({ page }) => {
    await page.setViewportSize({ width: 960, height: 540 });
    await page.goto(a11Url);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await saveMultiScreenshot(page, "a1-1-editorial-deck-960x540-reflow.png", { fullPage: true });
  });

  test("A1.1 - Manual Override Closed State", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(a11Url);
    await page.waitForLoadState("networkidle");
    await saveMultiScreenshot(page, "a1-1-editorial-deck-override-closed.png", { fullPage: false });
  });

  test("A1.1 - Manual Override Open State", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(a11Url);
    await page.waitForLoadState("networkidle");
    await page.click("details summary");
    await page.waitForTimeout(300);
    await saveMultiScreenshot(page, "a1-1-editorial-deck-override-open.png", { fullPage: false });
  });

  test("A1.1 - Reduced Motion Emulation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(a11Url);
    await page.waitForLoadState("networkidle");
    await saveMultiScreenshot(page, "a1-1-editorial-deck-reduced-motion.png", { fullPage: false });
  });

  test("A1.1 - Reduced Transparency Fallback", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(a11Url);
    await page.waitForLoadState("networkidle");
    // Inject prefers-reduced-transparency style emulation
    await page.addStyleTag({
      content: `
        .workspaceStage {
          background: var(--bg-stage-solid) !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }
        .queuePanel, .commandPanel {
          background: var(--peripheral-solid) !important;
        }
      `,
    });
    await page.waitForTimeout(300);
    await saveMultiScreenshot(page, "a1-1-editorial-deck-reduced-transparency.png", { fullPage: false });
  });
});
