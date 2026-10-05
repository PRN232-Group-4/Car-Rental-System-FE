import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, "../out");
const screenshotsDir = path.resolve(__dirname, "../screenshots");

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

function startStaticServer(port = 4174) {
  const mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
  };

  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split("?")[0]);
    if (reqPath === "/") reqPath = "/index.html";

    let filePath = path.join(outDir, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      if (fs.existsSync(path.join(filePath, "index.html"))) {
        filePath = path.join(filePath, "index.html");
      } else if (fs.existsSync(filePath + ".html")) {
        filePath = filePath + ".html";
      }
    } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + ".html")) {
      filePath = filePath + ".html";
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end("Not Found");
    }
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

async function verifyLayout() {
  console.log("--- BẮT ĐẦU KIỂM TRA CHỤP ẢNH LAYOUT VÀ DROPDOWNS ---");
  const server = await startStaticServer(4174);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  await page.goto("http://localhost:4174", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // 1. Kiểm tra dropdown Trạm nhận xe
  console.log("1. Mở dropdown Trạm nhận xe...");
  const stationBtn = page.locator('button[aria-haspopup="listbox"]');
  if (await stationBtn.count() > 0) {
    await stationBtn.first().click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(screenshotsDir, "station-dropdown-open.png") });
    console.log("-> Đã lưu screenshots/station-dropdown-open.png");
    // Click ngoài để đóng
    await page.mouse.click(10, 10);
    await page.waitForTimeout(300);
  }

  // 2. Kiểm tra popover Lịch trình di chuyển
  console.log("2. Mở popover Lịch trình di chuyển...");
  const timeBtn = page.locator('button[aria-haspopup="dialog"]');
  if (await timeBtn.count() > 0) {
    await timeBtn.first().click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(screenshotsDir, "time-popover-open.png") });
    console.log("-> Đã lưu screenshots/time-popover-open.png");
    // Đóng popover
    await page.mouse.click(10, 10);
    await page.waitForTimeout(300);
  }

  // 3. Scroll tới Fleet Catalog
  console.log("3. Kiểm tra phân vùng Đội xe (MultiFleetCatalog)...");
  await page.evaluate(() => {
    const el = document.getElementById("doi-xe") || document.getElementById("chi-nhanh");
    if (el) el.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, "fleet-catalog-blueprint.png") });
  console.log("-> Đã lưu screenshots/fleet-catalog-blueprint.png");

  // 4. Scroll tới InspectionSection
  console.log("4. Kiểm tra phân vùng Kiểm định (InspectionSection)...");
  await page.evaluate(() => {
    const el = document.getElementById("kiem-dinh") || document.getElementById("cong-nghe");
    if (el) el.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, "inspection-blueprint.png") });
  console.log("-> Đã lưu screenshots/inspection-blueprint.png");

  // 5. Scroll tới PinnedJourney
  console.log("5. Kiểm tra phân vùng Hành trình tối giản (PinnedJourney)...");
  await page.evaluate(() => {
    const el = document.getElementById("hanh-trinh") || document.getElementById("quy-trinh");
    if (el) el.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, "journey-blueprint.png") });
  console.log("-> Đã lưu screenshots/journey-blueprint.png");

  // 6. Scroll tới MembershipPasses
  console.log("6. Kiểm tra phân vùng Thẻ hội viên (MembershipPasses)...");
  await page.evaluate(() => {
    const el = document.getElementById("goi-thue-bao");
    if (el) el.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, "membership-blueprint.png") });
  console.log("-> Đã lưu screenshots/membership-blueprint.png");

  // 7. Chụp ảnh toàn trang
  await page.screenshot({ path: path.join(screenshotsDir, "blueprint-full-page.png"), fullPage: true });
  console.log("-> Đã lưu screenshots/blueprint-full-page.png (Full page)");

  await browser.close();
  server.close();
  console.log("=== HOÀN TẤT CHỤP ẢNH XÁC NHẬN LAYOUT ===");
}

verifyLayout().catch((err) => {
  console.error("Lỗi khi kiểm tra layout:", err);
  process.exit(1);
});
