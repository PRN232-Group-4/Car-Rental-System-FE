import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localScreenshotsDir = path.resolve(__dirname, "../screenshots");
const artifactDir = "C:\\Users\\Huy\\.gemini\\antigravity\\brain\\66c5dada-325a-4e57-b1a2-2522e47e99f6\\screenshots";

for (const dir of [localScreenshotsDir, artifactDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function captureLoading(browser) {
  console.log(`\n========================================`);
  console.log(`Capturing: Cinematic Preloader (Hold State) - 1920x1080`);
  console.log(`========================================`);

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    colorScheme: "dark",
  });

  const page = await context.newPage();
  await page.goto("http://localhost:3000/?preloader=hold", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);

  const filename = "loading-preloader-1920x1080.png";
  const localPath = path.join(localScreenshotsDir, filename);
  const artifactPath = path.join(artifactDir, filename);

  await page.screenshot({ path: localPath, fullPage: false });
  fs.copyFileSync(localPath, artifactPath);
  console.log(`[SUCCESS] Preloader saved to:\n  - ${localPath}\n  - ${artifactPath}`);

  await context.close();
}

async function captureMidScrollActions(browser) {
  console.log(`\n========================================`);
  console.log(`Capturing: Mid-Scroll Action Shots - 1920x1080`);
  console.log(`========================================`);

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    colorScheme: "dark",
  });

  await context.addInitScript(() => {
    try {
      localStorage.setItem("theme", "dark");
      localStorage.setItem("vrs-admin-theme", "dark");
      sessionStorage.setItem("td_editorial_booted", "1");
      sessionStorage.setItem("td_monolith_booted", "1");
    } catch (e) {}
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.classList.add("dark");
  });

  const page = await context.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2000);

  // Action Shot 1: Section 02 Showroom Configurator Stage + Filmstrip Dock
  console.log("Navigating to Section 02 Showroom Configurator Stage...");
  const catalogEl = await page.$("#danh-muc-xe");
  if (catalogEl) {
    await catalogEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    const filename = "action-fleet-showroom-1920.png";
    const legacyName = "action-fleet-horizontal-scroll-1920.png";
    const localPath = path.join(localScreenshotsDir, filename);
    const artifactPath = path.join(artifactDir, filename);

    await page.screenshot({ path: localPath, fullPage: false });
    fs.copyFileSync(localPath, artifactPath);
    try {
      fs.copyFileSync(localPath, path.join(localScreenshotsDir, legacyName));
      fs.copyFileSync(localPath, path.join(artifactDir, legacyName));
    } catch (e) {}
    console.log(`[SUCCESS] Action Shot 1 (Showroom Configurator) saved to:\n  - ${localPath}\n  - ${artifactPath}`);
  }

  // Action Shot 2: Section 04 Interactive 3D Studio Stage
  console.log("Navigating to Section 04 Interactive 3D Studio Stage...");
  const studioEl = await page.$("#showroom-3d");
  if (studioEl) {
    await studioEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2500);

    const filename = "action-3d-studio-1920.png";
    const legacyName = "action-journey-3d-stack-1920.png";
    const localPath = path.join(localScreenshotsDir, filename);
    const artifactPath = path.join(artifactDir, filename);

    await page.screenshot({ path: localPath, fullPage: false });
    fs.copyFileSync(localPath, artifactPath);
    try {
      fs.copyFileSync(localPath, path.join(localScreenshotsDir, legacyName));
      fs.copyFileSync(localPath, path.join(artifactDir, legacyName));
    } catch (e) {}
    console.log(`[SUCCESS] Action Shot 2 (3D Studio Stage) saved to:\n  - ${localPath}\n  - ${artifactPath}`);
  }

  // Action Shot 3: Section 07 Bold Monolith Time-Vault & Interactive Tier Matrix
  console.log("Navigating to Section 07 Monolith Time-Vault...");
  const membershipEl = await page.$("#goi-thue-bao");
  if (membershipEl) {
    await membershipEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    const filename = "action-membership-monolith-1920.png";
    const localPath = path.join(localScreenshotsDir, filename);
    const artifactPath = path.join(artifactDir, filename);

    await page.screenshot({ path: localPath, fullPage: false });
    fs.copyFileSync(localPath, artifactPath);
    console.log(`[SUCCESS] Action Shot 3 (Section 07 Monolith) saved to:\n  - ${localPath}\n  - ${artifactPath}`);
  }

  await context.close();
}

async function captureViewportFullpage(browser, width, theme) {
  console.log(`\n--- Capturing ${width}px (${theme.toUpperCase()} MODE - ZERO PIN-SPACER STATIC FULLPAGE) ---`);

  const context = await browser.newContext({
    viewport: { width, height: 1080 },
    deviceScaleFactor: 1,
    colorScheme: theme,
  });

  const page = await context.newPage();
  // Open with capture=static flag to disable ScrollTrigger pin and Lenis
  await page.goto("http://localhost:3000/?capture=static", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  // Set theme attributes cleanly
  await page.evaluate((t) => {
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.dataset.theme = t;
    document.documentElement.dataset.adminTheme = t;
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, theme);

  await page.waitForTimeout(600);

  await page.addStyleTag({
    content: `
      html, body, * {
        scroll-behavior: auto !important;
      }
      header {
        position: absolute !important;
        top: 0 !important;
      }
      nav[aria-label="Điều hướng chương"] {
        display: none !important;
      }
    `,
  });

  const filename = `landing-${width}-${theme}-fullpage.png`;
  const localPath = path.join(localScreenshotsDir, filename);
  const artifactPath = path.join(artifactDir, filename);

  await page.screenshot({ path: localPath, fullPage: true });
  fs.copyFileSync(localPath, artifactPath);
  console.log(`[SAVED] ${filename} (Captured pristine via native fullPage CDP)`);

  // Maintain legacy 1920 filename aliases for artifacts
  if (width === 1920) {
    const legacyName = theme === "light" ? "landing-1920.png" : "landing-dark-1920.png";
    const legacyLocalPath = path.join(localScreenshotsDir, legacyName);
    const legacyArtifactPath = path.join(artifactDir, legacyName);
    try {
      fs.copyFileSync(localPath, legacyLocalPath);
      fs.copyFileSync(localPath, legacyArtifactPath);
    } catch (e) {}
  }

  await context.close();
}

async function run() {
  console.log("Launching Chromium browser via Playwright (Đợt 5 - Focus 100% 1920px)...");
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--enable-webgl",
      "--ignore-gpu-blocklist",
      "--use-gl=angle",
      "--use-angle=swiftshader",
    ],
  });

  try {
    // 1. Capture Loading Preloader (1920x1080)
    await captureLoading(browser);

    // 2. Capture Mid-Scroll Action Shots at 1920x1080 (pin: true intact)
    await captureMidScrollActions(browser);

    // 3. Capture 1920px Fullpage Screenshots (Dark & Light) with 0% dead pin-spacer
    await captureViewportFullpage(browser, 1920, "dark");
    await captureViewportFullpage(browser, 1920, "light");

    console.log("\n========================================");
    console.log("All 5 Đợt 5 screenshots (1920px) successfully captured!");
    console.log("========================================");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
