import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localScreenshotsDir = path.resolve(__dirname, "../screenshots");
const artifactDir = "C:\\Users\\Huy\\.gemini\\antigravity\\brain\\3017172e-f254-4836-9ec0-ccb6451e9240\\screenshots";

for (const dir of [localScreenshotsDir, artifactDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function captureLanding(browser, theme) {
  console.log(`\n========================================`);
  console.log(`Starting capture: 1920px Full Page - ${theme.toUpperCase()} MODE`);
  console.log(`========================================`);

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    colorScheme: theme,
  });

  await context.addInitScript((t) => {
    try {
      localStorage.setItem("theme", t);
      localStorage.setItem("vrs-admin-theme", t);
      sessionStorage.setItem("td_editorial_booted", "1");
      sessionStorage.setItem("td_monolith_booted", "1");
    } catch (e) {}
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.setAttribute("data-admin-theme", t);
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, theme);

  const page = await context.newPage();

  console.log(`Navigating to http://localhost:3000...`);
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  // Hide dev overlay badges (Next.js portal and TanStack devtools) for clean screenshot
  await page.addStyleTag({
    content: `
      nextjs-portal, .tsqd-open-btn-container {
        display: none !important;
      }
    `,
  });

  // Re-verify theme in DOM
  await page.evaluate((t) => {
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.dataset.theme = t;
    document.documentElement.dataset.adminTheme = t;
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.dispatchEvent(new Event("vrs-admin-theme-change"));
    window.dispatchEvent(new Event("thong_dong_theme_change"));
  }, theme);

  await page.waitForTimeout(800);

  // Scroll through the entire page smoothly to trigger lazy-loads, GSAP ScrollTriggers, and 3D Studio
  console.log("Scrolling through page to trigger lazy components & animations...");
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  const step = 600;
  for (let y = 0; y < scrollHeight; y += step) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(150);
  }

  // Scroll to 3D showroom specifically if exists and give it time to load/render WebGL
  const showroom = await page.$("#showroom-3d");
  if (showroom) {
    await showroom.scrollIntoViewIfNeeded();
    console.log("Waiting 3s for 3D showroom WebGL canvas to settle...");
    await page.waitForTimeout(3000);
  }

  // Scroll back to top
  console.log("Scrolling back to top...");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);

  const filename = `landing-1920-${theme}-fullpage.png`;
  const localPath = path.join(localScreenshotsDir, filename);
  const artifactPath = path.join(artifactDir, filename);

  console.log(`Capturing full page screenshot: ${filename}...`);
  await page.screenshot({
    path: localPath,
    fullPage: true,
  });

  fs.copyFileSync(localPath, artifactPath);
  console.log(`[SUCCESS] Saved to:\n  - ${localPath}\n  - ${artifactPath}`);

  // Overwrite legacy filenames as requested to replace older files
  const legacyFilenames = theme === "light" 
    ? ["landing-1920.png", "fullpage-desktop-light.png"] 
    : ["landing-dark-1920.png", "fullpage-desktop-dark.png"];

  for (const legacyName of legacyFilenames) {
    const legacyLocalPath = path.join(localScreenshotsDir, legacyName);
    const legacyArtifactPath = path.join(artifactDir, legacyName);
    try {
      fs.copyFileSync(localPath, legacyLocalPath);
      fs.copyFileSync(localPath, legacyArtifactPath);
      console.log(`[OVERWRITTEN] Replaced legacy file: ${legacyName}`);
    } catch (e) {
      console.warn(`Could not overwrite ${legacyName}:`, e.message);
    }
  }

  await context.close();
}

async function run() {
  console.log("Launching Chromium browser via Playwright...");
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--enable-webgl",
      "--ignore-gpu-blocklist",
    ],
  });

  try {
    // 1. Capture Light Mode
    await captureLanding(browser, "light");

    // 2. Capture Dark Mode
    await captureLanding(browser, "dark");

    console.log("\nAll 1920px fullpage screenshots completed successfully!");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
