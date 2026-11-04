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

function startStaticServer(port = 3005) {
  const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
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

async function runExperience() {
  console.log("=== TỰ TRẢI NGHIỆM VÀ SCREENSHOT FULLPAGE 1920PX ===");
  const server = await startStaticServer(3005);
  console.log("[1] Static server online on http://localhost:3005");

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  const consoleLogs = [];
  page.on("console", (msg) => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  try {
    console.log("[2] Đang mở landing page tại 1920x1080...");
    await page.goto("http://localhost:3005/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Trải nghiệm Hero & 3D Canvas
    console.log("[3] Trải nghiệm Chương 1 (Hero)...");
    const h1 = await page.locator("h1").innerText();
    console.log(`    -> H1 Display: "${h1.replace(/\n/g, ' ')}"`);
    
    // Di chuột để trải nghiệm Car Yaw Spring & Cursor Disc
    console.log("    -> Tương tác con chuột kích hoạt Car Yaw Spring & Cursor Disc 14px...");
    await page.mouse.move(300, 300);
    await page.waitForTimeout(300);
    await page.mouse.move(1600, 400);
    await page.waitForTimeout(400);
    await page.mouse.move(960, 540);
    await page.waitForTimeout(500);

    // Chờ Booking Dock xuất hiện sau 1.6s
    console.log("    -> Chờ Booking Dock xuất hiện...");
    const dock = page.locator("#tim-xe");
    await dock.waitFor({ state: "visible" });
    console.log("    -> Booking Dock đã trồi lên màn hình");

    // Thử tương tác Menu Overlay
    console.log("[4] Trải nghiệm Menu Overlay...");
    const menuBtn = page.getByRole("button", { name: /MENU/i });
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(500);
      console.log("    -> Đã mở Menu Overlay toàn màn hình (nền ink-950, đĩa bo góc)");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
      console.log("    -> Đã đóng Menu Overlay bằng phím Escape");
    }

    // Thử tương tác Booking Dock Popover
    console.log("[5] Trải nghiệm tương tác Booking Dock...");
    const stationBtn = page.locator('#tim-xe button[aria-haspopup="listbox"]');
    await stationBtn.click();
    await page.waitForTimeout(300);
    console.log("    -> Mở trạm tiếp nhận: OK");
    await page.mouse.click(500, 200); // Click ra ngoài
    await page.waitForTimeout(300);

    // Cuộn trang mượt mà qua các chương để trải nghiệm hiệu ứng scroll & parallax
    console.log("[6] Trải nghiệm cuộn trang qua 5 chương...");
    const totalHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log(`    -> Tổng chiều cao trang: ${totalHeight}px`);

    const scrollSteps = [
      { pct: 0.2, name: "Chương 2: Cung Đường (Lake Theme)" },
      { pct: 0.45, name: "Chương 3: Nhẹ Như Không (Sun Theme)" },
      { pct: 0.7, name: "Chương 4: Tin Cậy (Halftone)" },
      { pct: 0.95, name: "Chương 5: Đặt Xe (Sunset Disc)" },
    ];

    for (const step of scrollSteps) {
      const targetY = totalHeight * step.pct;
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: "smooth" }), targetY);
      await page.waitForTimeout(800);
      console.log(`    -> Đã cuộn tới ${step.name} (Y = ${Math.round(targetY)}px)`);
    }

    // Cuộn về lại đáy trang (Footer)
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }));
    await page.waitForTimeout(1000);

    // Cuộn mượt về đỉnh để chụp ảnh hoàn hảo
    console.log("[7] Chuẩn bị chụp ảnh Fullpage 1920px...");
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    // Chụp ảnh fullpage 1920
    const fullpagePath = path.join(screenshotsDir, "landing-1920-fullpage.png");
    await page.screenshot({
      path: fullpagePath,
      fullPage: true,
    });
    console.log(`[8] Đã lưu ảnh chụp toàn trang tại: ${fullpagePath}`);

    // Thu thập một số metrics trực quan từ DOM
    const evaluationData = await page.evaluate(() => {
      const chapters = Array.from(document.querySelectorAll("section[id]")).map((s) => ({
        id: s.id,
        height: s.getBoundingClientRect().height,
      }));
      const headings = Array.from(document.querySelectorAll("h1, h2, h3")).map((h) => ({
        tag: h.tagName,
        text: h.textContent?.trim().replace(/\s+/g, " "),
      }));
      const links = Array.from(document.querySelectorAll("a")).map((a) => a.href);
      return { chapters, headings, linkCount: links.length };
    });

    console.log("[9] Dữ liệu phân tích cấu trúc DOM:", JSON.stringify(evaluationData, null, 2));
    if (consoleLogs.length > 0) {
      console.log("[10] Nhật ký Console trong phiên trải nghiệm:");
      consoleLogs.slice(-10).forEach((l) => console.log("    " + l));
    } else {
      console.log("[10] Không có cảnh báo hay lỗi console nào phát sinh!");
    }

  } finally {
    await browser.close();
    server.close();
  }
}

runExperience().catch((err) => {
  console.error("Lỗi khi chạy trải nghiệm:", err);
  process.exit(1);
});
