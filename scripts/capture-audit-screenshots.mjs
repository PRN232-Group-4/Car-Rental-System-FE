import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories
const localScreenshotsDir = path.resolve(__dirname, "../screenshots");
const artifactDir = "C:\\Users\\Huy\\.gemini\\antigravity\\brain\\d91f2991-2099-4785-bdf4-d2c824d1351c\\screenshots";

for (const dir of [localScreenshotsDir, artifactDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function saveScreenshot(page, filename, options = {}) {
  const localPath = path.join(localScreenshotsDir, filename);
  const artifactPath = path.join(artifactDir, filename);
  await page.screenshot({ path: localPath, ...options });
  fs.copyFileSync(localPath, artifactPath);
  console.log(`Saved screenshot: ${filename}`);
}

async function run() {
  console.log("Launching Chromium via Playwright...");
  const browser = await chromium.launch({ headless: true });

  const sections = [
    { id: "#gioi-thieu", name: "section-01-hero" },
    { id: "#showroom-3d", name: "section-02-showroom3d" },
    { id: "#danh-muc-xe", name: "section-03-catalog" },
    { id: "#chi-nhanh", name: "section-04-facility" },
    { id: "#cong-nghe", name: "section-05-inspection" },
    { id: "#quy-trinh", name: "section-06-journey" },
    { id: "#goi-thue-bao", name: "section-07-membership" },
    { id: "#lien-he", name: "section-08-footer" },
  ];

  // ==========================================
  // 1. DESKTOP VIEWPORT (1440 x 900) - LIGHT MODE
  // ==========================================
  console.log("\n--- Capturing Desktop 1440x900 (Light Mode) ---");
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await desktopContext.newPage();

  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);

  // Trigger 3D studio load if present
  try {
    const btn3d = await page.$('#showroom-3d button');
    if (btn3d) {
      console.log("Found 3D trigger button in #showroom-3d, clicking to mount canvas...");
      await btn3d.click();
      await page.waitForTimeout(3000); // Allow Three.js to initialize & model to load
    }
  } catch (err) {
    console.log("3D button click note:", err.message);
  }

  // Settle animations
  await page.waitForTimeout(1000);

  // Capture Fullpage Desktop Light
  await saveScreenshot(page, "fullpage-desktop-light.png", { fullPage: true });

  // Capture individual sections
  for (const sec of sections) {
    try {
      const el = await page.$(sec.id);
      if (el) {
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(800); // Allow scroll triggers / pins to settle
        await saveScreenshot(page, `${sec.name}-desktop.png`);
      } else {
        console.warn(`Section not found: ${sec.id}`);
      }
    } catch (e) {
      console.error(`Failed to capture ${sec.name}:`, e.message);
    }
  }

  // ==========================================
  // 2. DESKTOP VIEWPORT (1440 x 900) - DARK MODE
  // ==========================================
  console.log("\n--- Capturing Desktop 1440x900 (Dark Mode) ---");
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.dataset.adminTheme = "dark";
    document.documentElement.classList.add("dark");
  });
  await page.waitForTimeout(1000);
  await saveScreenshot(page, "fullpage-desktop-dark.png", { fullPage: true });
  await saveScreenshot(page, "section-01-hero-desktop-dark.png");
  await desktopContext.close();

  // ==========================================
  // 3. MOBILE VIEWPORT (390 x 844) - LIGHT MODE
  // ==========================================
  console.log("\n--- Capturing Mobile 390x844 (Light Mode) ---");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();

  await mobilePage.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await mobilePage.evaluate(() => document.fonts.ready);
  await mobilePage.waitForTimeout(1500);

  // Capture Fullpage Mobile Light
  await saveScreenshot(mobilePage, "fullpage-mobile-light.png", { fullPage: true });

  // Capture mobile sections
  for (const sec of sections) {
    try {
      const el = await mobilePage.$(sec.id);
      if (el) {
        await el.scrollIntoViewIfNeeded();
        await mobilePage.waitForTimeout(800);
        await saveScreenshot(mobilePage, `${sec.name}-mobile.png`);
      } else {
        console.warn(`Mobile section not found: ${sec.id}`);
      }
    } catch (e) {
      console.error(`Failed mobile capture ${sec.name}:`, e.message);
    }
  }
  await mobileContext.close();

  await browser.close();
  console.log("\nAll Playwright screenshots successfully captured!");
}

run().catch((err) => {
  console.error("Playwright audit error:", err);
  process.exit(1);
});
