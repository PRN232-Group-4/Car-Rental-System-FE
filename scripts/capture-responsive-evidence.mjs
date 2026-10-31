import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localScreenshotsDir = path.resolve(__dirname, "../screenshots/responsive");
const artifactScreenshotsDir = "C:\\Users\\Huy\\.gemini\\antigravity\\brain\\d91f2991-2099-4785-bdf4-d2c824d1351c\\screenshots\\responsive";

for (const dir of [localScreenshotsDir, artifactScreenshotsDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function saveScreenshot(page, filename, options = {}) {
  const localPath = path.join(localScreenshotsDir, filename);
  const artifactPath = path.join(artifactScreenshotsDir, filename);
  await page.screenshot({ path: localPath, ...options });
  fs.copyFileSync(localPath, artifactPath);
  console.log(`[CAPTURED] ${filename}`);
}

async function run() {
  console.log("=== BẮT ĐẦU CHỤP BẰNG CHỨNG THỊ GIÁC ĐA ĐỘ PHÂN GIẢI (PLAYWRIGHT) ===");
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: "375-mobile", width: 375, height: 812, isMobile: true },
    { name: "768-tablet", width: 768, height: 1024, isMobile: false },
    { name: "1024-laptop", width: 1024, height: 768, isMobile: false },
    { name: "1440-desktop-light", width: 1440, height: 900, isMobile: false, colorScheme: "light" },
    { name: "1440-desktop-dark", width: 1440, height: 900, isMobile: false, colorScheme: "dark" },
    { name: "1920-ultrawide", width: 1920, height: 1080, isMobile: false, colorScheme: "light" },
  ];

  for (const vp of viewports) {
    console.log(`\n--- Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      colorScheme: vp.colorScheme || "light",
    });
    const page = await context.newPage();

    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500);

    // Safeguard 3: Strict Dark mode toggle via data-theme and verify body background color
    if (vp.colorScheme === "dark") {
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "dark");
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      });
      await page.waitForFunction(() => {
        const bg = window.getComputedStyle(document.body).backgroundColor;
        return bg === "rgb(23, 22, 27)" || bg.includes("23, 22, 27");
      }, { timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(600);
    }

    // Scroll down to showroom-3d and wait for 3D model to load so fullpage captures it
    const showroom = await page.$("#showroom-3d");
    if (showroom) {
      await showroom.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1800);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(600);
    }

    // Capture Fullpage
    await saveScreenshot(page, `fullpage-${vp.name}.png`, { fullPage: true });

    // For 1440 desktop and 1920 ultrawide, capture critical sections
    if (vp.name.includes("1440") || vp.name.includes("1920")) {
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

      for (const sec of sections) {
        const el = await page.$(sec.id);
        if (el) {
          await el.scrollIntoViewIfNeeded();
          if (sec.id === "#showroom-3d") {
            await page.waitForTimeout(2000); // Extra time for 3D WebGL render
          } else {
            await page.waitForTimeout(800);
          }
          await saveScreenshot(page, `${sec.name}-${vp.name}.png`);
        }
      }
    }

    await context.close();
  }

  await browser.close();
  console.log("\n=== HOÀN TẤT CHỤP BẰNG CHỨNG THỊ GIÁC ===");
}

run().catch((err) => {
  console.error("Lỗi chụp Playwright:", err);
  process.exit(1);
});
