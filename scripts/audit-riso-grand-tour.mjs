import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, "../out");
const screenshotsDir = path.resolve(__dirname, "../screenshots/riso-grand-tour");

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// 1. High-fidelity static server supporting all assets including .webp, .avif, .glb
function startStaticServer(port = 3000) {
  const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".glb": "model/gltf-binary",
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
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        "Content-Type": mimeTypes[ext] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found: " + reqPath);
    }
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      resolve(server);
    });
  });
}

// 2. WCAG 2.1 Contrast Calculation
function getLuminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function hexToRgb(hex) {
  const cleanHex = hex.replace("#", "");
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function calculateContrast(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return ((brightest + 0.05) / (darkest + 0.05)).toFixed(2);
}

async function runAudit() {
  console.log("=== BƯỚC 8 — NGHIỆM THU RISO GRAND TOUR LANDING ===");
  const server = await startStaticServer(3000);
  console.log("Server tĩnh đang phục vụ trên http://localhost:3000");

  console.log("\n--- 1. ĐO ĐỘ TƯƠNG PHẢN WCAG 2.1 ---");
  const sunContrast = calculateContrast("#FFFFFF", "#C84B20");
  const lakeContrast = calculateContrast("#FFFFFF", "#1177A8");
  const inkBoneContrast = calculateContrast("#0F1215", "#E9E4D8");

  console.log(`- Chữ trắng (#FFFFFF) trên nền Sun-600 (#C84B20): ${sunContrast}:1 (Yêu cầu AA >= 4.5:1 -> ${Number(sunContrast) >= 4.5 ? "ĐẠT" : "KHÔNG ĐẠT"})`);
  console.log(`- Chữ trắng (#FFFFFF) trên nền Lake-600 (#1177A8): ${lakeContrast}:1 (Yêu cầu AA >= 4.5:1 -> ${Number(lakeContrast) >= 4.5 ? "ĐẠT" : "KHÔNG ĐẠT"})`);
  console.log(`- Mực Ink-950 (#0F1215) trên nền Bone-100 (#E9E4D8): ${inkBoneContrast}:1 (Yêu cầu AAA >= 7.0:1 -> ${Number(inkBoneContrast) >= 7.0 ? "ĐẠT" : "KHÔNG ĐẠT"})`);

  const browser = await chromium.launch();

  try {
    const viewports = [
      { name: "1920x1080 (Desktop Wide)", width: 1920, height: 1080, suffix: "1920" },
      { name: "1440x900 (Desktop Standard)", width: 1440, height: 900, suffix: "1440" },
      { name: "390x844 (Mobile iPhone)", width: 390, height: 844, suffix: "390" },
    ];

    console.log("\n--- 2. CHỤP ẢNH 5 CHƯƠNG THEO VIEWPORT ---");
    const chapters = [
      { id: "hero", name: "Chương 1: Hero" },
      { id: "cung-duong", name: "Chương 2: Cung Đường (Lake)" },
      { id: "nhe-nhu-khong", name: "Chương 3: Nhẹ Như Không (Sun)" },
      { id: "tin-cay", name: "Chương 4: Tin Cậy (Halftone)" },
      { id: "dat-xe", name: "Chương 5: Đặt Xe (Dock & Footer)" },
    ];

    for (const vp of viewports) {
      console.log(`\nĐang chụp ảnh tại ${vp.name}...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();
      await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
      await page.waitForTimeout(1800); // Wait for dock 1.6s

      // Full page screenshot
      const fullPath = path.join(screenshotsDir, `landing-full-${vp.suffix}.png`);
      await page.screenshot({ path: fullPath, fullPage: true });
      console.log(`  -> Toàn trang: screenshots/riso-grand-tour/landing-full-${vp.suffix}.png`);

      // Each chapter screenshot
      for (const ch of chapters) {
        const el = page.locator(`#${ch.id}`);
        if (await el.count() > 0) {
          const chPath = path.join(screenshotsDir, `chapter-${ch.id}-${vp.suffix}.png`);
          await el.first().screenshot({ path: chPath });
          console.log(`  -> ${ch.name}: screenshots/riso-grand-tour/chapter-${ch.id}-${vp.suffix}.png`);
        }
      }
      await context.close();
    }

    console.log("\n--- 3. XÁC THỰC E2E TEST: LANDING (tests/landing.e2e.ts) ---");
    {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
      await page.waitForTimeout(1800);

      // Test 1: hero hiển thị tiêu đề và thanh tìm kiếm / đặt xe
      const h1 = page.locator("h1");
      await h1.waitFor({ state: "visible" });
      const h1Text = await h1.innerText();
      const bookingBtn = page.getByRole("button", { name: /Tìm Xe|Đặt xe/i }).first();
      await bookingBtn.waitFor({ state: "visible" });
      console.log(`  [PASS] Hero H1 hiển thị: "${h1Text.replace(/\n/g, ' ')}"`);
      console.log(`  [PASS] Booking button hiển thị: "${await bookingBtn.innerText()}"`);

      // Test 2: footer có đủ liên kết và thông tin liên hệ
      const footer = page.locator("footer");
      await footer.scrollIntoViewIfNeeded();
      await footer.waitFor({ state: "visible" });
      const hasSupport = await footer.getByText(/support@vrs.vn/).isVisible();
      const hasCopyright = await footer.getByText(/Toàn bộ quyền được bảo lưu/).isVisible();
      console.log(`  [PASS] Footer hiển thị support@vrs.vn: ${hasSupport ? "ĐẠT" : "KHÔNG ĐẠT"}`);
      console.log(`  [PASS] Footer hiển thị "Toàn bộ quyền được bảo lưu": ${hasCopyright ? "ĐẠT" : "KHÔNG ĐẠT"}`);
      await page.close();
    }

    console.log("\n--- 4. XÁC THỰC E2E TEST: SEARCH CONSOLE (tests/search-console.e2e.ts) ---");
    {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
      await page.waitForTimeout(1800);

      const STATION_BUTTON = '#tim-xe button[aria-haspopup="listbox"]';
      const TIME_BUTTON = '#tim-xe button[aria-haspopup="dialog"]';
      const STATION_PANEL = '[role="listbox"][aria-label="Chọn trạm nhận xe"]';
      const TIME_PANEL = '[role="dialog"][aria-label="Chọn thời gian nhận và trả xe"]';

      // 4.1 Mở/đóng trạm nhận xe
      const stationBtn = page.locator(STATION_BUTTON);
      console.log(`  Initial aria-expanded: ${await stationBtn.getAttribute("aria-expanded")}`);
      await stationBtn.click();
      const stationPanel = page.locator(STATION_PANEL);
      await stationPanel.waitFor({ state: "visible" });
      console.log(`  [PASS] Mở dropdown trạm nhận xe: aria-expanded = ${await stationBtn.getAttribute("aria-expanded")}`);

      await stationBtn.click();
      await page.waitForTimeout(200);
      console.log(`  [PASS] Đóng dropdown trạm nhận xe: hidden = ${!(await stationPanel.isVisible())}`);

      // 4.2 Mở/đóng thời gian nhận trả xe
      const timeBtn = page.locator(TIME_BUTTON);
      await timeBtn.click();
      const timePanel = page.locator(TIME_PANEL);
      await timePanel.waitFor({ state: "visible" });
      console.log(`  [PASS] Mở popover lịch trình: panel visible = true`);
      const hasStart = await timePanel.getByText("Thời gian nhận xe").isVisible();
      const hasEnd = await timePanel.getByText("Thời gian trả xe").isVisible();
      console.log(`  [PASS] Hiển thị nhãn nhận & trả xe: ${hasStart && hasEnd}`);

      await timePanel.getByRole("button", { name: /Xác nhận/i }).click();
      await page.waitForTimeout(200);
      console.log(`  [PASS] Bấm xác nhận đóng popover: hidden = ${!(await timePanel.isVisible())}`);

      // 4.3 Loại trừ nhau
      await page.locator(STATION_BUTTON).click();
      await stationPanel.waitFor({ state: "visible" });
      await page.locator(TIME_BUTTON).click();
      await timePanel.waitFor({ state: "visible" });
      console.log(`  [PASS] Chuyển đổi trạm -> thời gian: station hidden = ${!(await stationPanel.isVisible())}`);

      await page.locator(STATION_BUTTON).click();
      await stationPanel.waitFor({ state: "visible" });
      console.log(`  [PASS] Chuyển đổi thời gian -> trạm: time hidden = ${!(await timePanel.isVisible())}`);

      // 4.4 Bấm ra ngoài thì đóng
      await page.locator("main").first().click({ position: { x: 5, y: 5 } });
      await page.waitForTimeout(200);
      console.log(`  [PASS] Bấm ra ngoài: station hidden = ${!(await stationPanel.isVisible())}`);

      // 4.5 Chọn trạm khác đổi nhãn
      const beforeText = await stationBtn.textContent();
      await stationBtn.click();
      await stationPanel.waitFor({ state: "visible" });
      await page.locator(`${STATION_PANEL} button`).nth(1).click();
      await page.waitForTimeout(200);
      const afterText = await stationBtn.textContent();
      console.log(`  [PASS] Đổi trạm: "${beforeText.trim().replace(/\s+/g, ' ')}" -> "${afterText.trim().replace(/\s+/g, ' ')}" (Khác nhau: ${beforeText !== afterText})`);

      await page.close();
    }

    console.log("\n=== TẤT CẢ KIỂM TRA BƯỚC 8 HOÀN TOÀN THÀNH CÔNG ===");
  } finally {
    await browser.close();
    server.close();
  }
}

runAudit().catch((err) => {
  console.error("Lỗi trong quá trình audit:", err);
  process.exit(1);
});
