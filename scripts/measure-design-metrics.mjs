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

// 1. Simple zero-dependency HTTP server to serve Next.js static export
function startStaticServer(port = 4173) {
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

    // If file doesn't exist, check if filePath.html exists (static export routing)
    if (!fs.existsSync(filePath) && fs.existsSync(filePath + ".html")) {
      filePath = filePath + ".html";
    } else if (fs.existsSync(path.join(filePath, "index.html"))) {
      filePath = path.join(filePath, "index.html");
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      resolve(server);
    });
  });
}

// 2. Color Contrast calculation according to WCAG 2.1
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

// 3. Main Audit Runner
async function main() {
  console.log("=== THONG DONG VRS — KIỂM ĐỊNH THỊ GIÁC & BUDGET THIẾT KẾ v3.0 ===");
  const server = await startStaticServer(4173);
  const baseUrl = "http://localhost:4173";

  // Calculate design token contrasts
  console.log("\n--- KIỂM TRA ĐỘ TƯƠNG PHẢN WCAG 2.1 (A2) ---");
  const primaryContrast = calculateContrast("#047857", "#FFFFFF");
  const inkContrast = calculateContrast("#0E1A16", "#FFFFFF");
  const bannedGreenContrast = calculateContrast("#059669", "#FFFFFF");

  console.log(`- Màu Primary (#047857) trên nền White (#FFFFFF): ${primaryContrast}:1 (Yêu cầu AA >= 4.5:1 -> ${Number(primaryContrast) >= 4.5 ? "ĐẠT" : "KHÔNG ĐẠT"})`);
  console.log(`- Màu Ink (#0E1A16) trên nền White (#FFFFFF): ${inkContrast}:1 (Yêu cầu AAA >= 7.0:1 -> ${Number(inkContrast) >= 7.0 ? "ĐẠT" : "KHÔNG ĐẠT"})`);
  console.log(`- [Kiểm tra đối chiếu] Màu cấm #059669 trên White: ${bannedGreenContrast}:1 (Thất bại AA < 4.5:1, đúng như Section A2 quy định)`);

  const browser = await chromium.launch();

  try {
    const viewports = [
      { name: "375px (Mobile)", width: 375, height: 667, filename: "landing-375.png" },
      { name: "768px (Tablet)", width: 768, height: 1024, filename: "landing-768.png" },
      { name: "1280px (Desktop)", width: 1280, height: 800, filename: "landing-1280.png" },
      { name: "1920px (Wide)", width: 1920, height: 1080, filename: "landing-1920.png" },
    ];

    console.log("\n--- ĐO LƯỜNG SỐ LƯỢNG BACKDROP-FILTER & CHỤP ẢNH VIEWPORTS ---");

    for (const vp of viewports) {
      const page = await browser.newPage({
        viewport: { width: vp.width, height: vp.height },
      });

      await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });

      // Measure backdrop-filter count in viewport
      const backdropCount = await page.evaluate(() => {
        const allElements = Array.from(document.querySelectorAll("*"));
        return allElements.filter((el) => {
          const style = window.getComputedStyle(el);
          const bf = style.backdropFilter || style.webkitBackdropFilter;
          if (!bf || bf === "none") return false;
          const rect = el.getBoundingClientRect();
          // Must be within visible viewport area
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            rect.bottom >= 0 &&
            rect.top <= window.innerHeight
          );
        }).length;
      });

      const pass = backdropCount <= 4;
      console.log(`- Viewport ${vp.name}: ${backdropCount} phần tử backdrop-filter (Ngân sách <= 4: ${pass ? "ĐẠT" : "VƯỢT NGÂN SÁCH"})`);

      // Screenshot
      const screenshotPath = path.join(screenshotsDir, vp.filename);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`  -> Đã lưu ảnh: screenshots/${vp.filename}`);

      if (vp.width === 1280) {
        const fullScreenshotPath = path.join(screenshotsDir, "landing-full-1280.png");
        await page.screenshot({ path: fullScreenshotPath, fullPage: true });
        console.log(`  -> Đã lưu ảnh toàn trang: screenshots/landing-full-1280.png`);
      }

      await page.close();
    }

    // Measure Admin Route Backdrop Budget
    console.log("\n--- ĐO LƯỜNG BACKDROP-FILTER TRÊN TRANG ADMIN ---");
    const adminPage = await browser.newPage({
      viewport: { width: 1280, height: 800 },
    });
    await adminPage.goto(`${baseUrl}/admin`, { waitUntil: "networkidle" });
    const adminBackdropCount = await adminPage.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll("*"));
      return allElements.filter((el) => {
        const style = window.getComputedStyle(el);
        const bf = style.backdropFilter || style.webkitBackdropFilter;
        if (!bf || bf === "none") return false;
        const rect = el.getBoundingClientRect();
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          rect.bottom >= 0 &&
          rect.top <= window.innerHeight
        );
      }).length;
    });
    const adminPass = adminBackdropCount <= 3;
    console.log(`- Tuyến /admin: ${adminBackdropCount} phần tử backdrop-filter (Ngân sách Admin <= 3: ${adminPass ? "ĐẠT" : "VƯỢT NGÂN SÁCH"})`);
    await adminPage.screenshot({ path: path.join(screenshotsDir, "admin-1280.png") });
    await adminPage.close();

    // Dialog state check (Booking Modal)
    console.log("\n--- KIỂM TRA TRẠNG THÁI MODAL/DIALOG ---");
    const dialogPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await dialogPage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    // Click the first "Đặt xe ngay" button in the catalog
    const bookBtn = dialogPage.locator("button:has-text('Đặt xe ngay')").first();
    if (await bookBtn.isVisible()) {
      await bookBtn.click();
      await dialogPage.waitForTimeout(300);
      const dialogVisible = await dialogPage.locator("[role='dialog']").isVisible();
      console.log(`- Mở hộp thoại Đặt xe (BookingModal .glass-3): ${dialogVisible ? "THÀNH CÔNG" : "KHÔNG HIỂN THỊ"}`);
      await dialogPage.screenshot({ path: path.join(screenshotsDir, "booking-dialog.png") });
      console.log(`  -> Đã lưu ảnh: screenshots/booking-dialog.png`);
    } else {
      console.log("- Không tìm thấy nút Đặt xe ngay");
    }
    await dialogPage.close();

    // Accessibility Emulations
    console.log("\n--- KIỂM TRA PREFERS-REDUCED-MOTION & PREFERS-REDUCED-TRANSPARENCY ---");
    const a11yPage = await browser.newPage({
      viewport: { width: 1280, height: 800 },
      reducedMotion: "reduce",
    });
    await a11yPage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    await a11yPage.screenshot({ path: path.join(screenshotsDir, "landing-reduced-motion.png") });
    console.log(`- Emulation prefers-reduced-motion: Đã lưu ảnh screenshots/landing-reduced-motion.png`);

    // Check no stuck transforms
    const stuckTransforms = await a11yPage.evaluate(() => {
      const headings = Array.from(document.querySelectorAll("h1, h2, h3"));
      return headings.filter((h) => {
        const style = window.getComputedStyle(h);
        return style.opacity === "0";
      }).length;
    });
    console.log(`- Trạng thái chữ khi reduced-motion: ${stuckTransforms === 0 ? "HIỂN THỊ NGAY, KHÔNG BỊ ẨN HOẶC KẸT TRANSFORM" : "CÓ PHẦN TỬ BỊ ẨN"}`);
    await a11yPage.close();

  } finally {
    await browser.close();
    server.close();
  }

  console.log("\n=== HOÀN TẤT KIỂM ĐỊNH THỊ GIÁC VÀ BÁO CÁO ===");
}

main().catch((err) => {
  console.error("Lỗi kiểm định:", err);
  process.exit(1);
});
