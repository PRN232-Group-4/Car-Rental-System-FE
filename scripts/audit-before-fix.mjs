import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, "../out");
const axePath = path.resolve(__dirname, "../node_modules/axe-core/axe.min.js");

// 1. Zero-dependency HTTP static server
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
      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

async function main() {
  console.log("======================================================================");
  console.log("  THONG DONG VRS — BƯỚC 1: ĐO LƯỜNG VÀ KIỂM ĐỊNH HIỆN TRẠNG (TRƯỚC SỬA)");
  console.log("======================================================================\n");

  const server = await startStaticServer(4173);
  const baseUrl = "http://localhost:4173";
  const browser = await chromium.launch();

  const routesToTest = [
    { path: "/", name: "Trang chủ (Landing)", area: "public", budget: 4 },
    { path: "/find", name: "Tìm kiếm xe (/find)", area: "public", budget: 4 },
    { path: "/vehicles", name: "Danh mục xe (/vehicles)", area: "public", budget: 4 },
    { path: "/vehicles/detail", name: "Chi tiết xe (/vehicles/detail)", area: "public", budget: 4 },
    { path: "/facilities", name: "Hệ thống trạm (/facilities)", area: "public", budget: 4 },
    { path: "/subscriptions", name: "Gói hội viên (/subscriptions)", area: "public", budget: 4 },
    { path: "/account/trips", name: "Chuyến của tôi (/account/trips)", area: "public", budget: 4 },
    { path: "/booking", name: "Đặt xe (/booking)", area: "public", budget: 4 },
    { path: "/admin", name: "Admin Tổng quan (/admin)", area: "admin", budget: 3 },
    { path: "/admin/dashboard", name: "Admin Dashboard (/admin/dashboard)", area: "admin", budget: 3 },
    { path: "/admin/vehicles", name: "Admin Đội xe (/admin/vehicles)", area: "admin", budget: 3 },
    { path: "/admin/rentals", name: "Admin Đơn thuê (/admin/rentals)", area: "admin", budget: 3 },
  ];

  const results = [];

  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

    console.log("--- 1. ĐO LƯỜNG BACKDROP-FILTER & AXE ACCESSIBILITY TRÊN TẤT CẢ ROUTE CHÍNH ---");

    for (const r of routesToTest) {
      const url = `${baseUrl}${r.path}`;
      let navigationSuccess = true;
      let loadTimeMs = 0;

      try {
        const start = Date.now();
        await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
        loadTimeMs = Date.now() - start;
      } catch (err) {
        navigationSuccess = false;
        console.warn(`[WARN] Lỗi tải trang ${r.path}: ${err.message}`);
      }

      let backdropCount = 0;
      let axeViolations = [];

      if (navigationSuccess) {
        // Measure backdrop-filter count in viewport
        backdropCount = await page.evaluate(() => {
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

        // Run axe-core
        if (fs.existsSync(axePath)) {
          await page.addScriptTag({ path: axePath });
          const axeResults = await page.evaluate(async () => {
            // @ts-expect-error window.axe is injected dynamically
            return await window.axe.run({
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
              },
            });
          });

          axeViolations = (axeResults.violations || []).filter(
            (v) => v.impact === "serious" || v.impact === "critical"
          );
        }
      }

      const backdropPass = backdropCount <= r.budget;
      const axePass = axeViolations.length === 0;

      results.push({
        route: r.path,
        name: r.name,
        area: r.area,
        loadTimeMs,
        backdropCount,
        backdropBudget: r.budget,
        backdropPass,
        axeCriticalSerious: axeViolations.length,
        axePass,
        axeDetails: axeViolations.map((v) => `${v.id} (${v.impact})`).join(", "),
      });

      console.log(
        `> ${r.path.padEnd(20)} | Backdrop: ${backdropCount}/${r.budget} (${backdropPass ? "ĐẠT" : "VƯỢT"}) | Axe Serious/Critical: ${axeViolations.length} (${axePass ? "ĐẠT" : "VI PHẠM: " + axeViolations.map((v) => v.id).join(", ")})`
      );
    }

    console.log("\n--- 2. KIỂM ĐỊNH RÒ RỈ MOTION / SCROLLTRIGGER QUA 30 VÒNG CHUYỂN ROUTE ---");
    // Test cycling between / and /find 30 times
    let initialST = 0;
    let finalST = 0;
    let initialTweens = 0;
    let finalTweens = 0;

    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    const initialCounts = await page.evaluate(() => {
      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      return {
        st: ScrollTrigger ? ScrollTrigger.getAll().length : 0,
        tweens: gsap && gsap.globalTimeline ? gsap.globalTimeline.getChildren().length : 0,
      };
    });
    initialST = initialCounts.st;
    initialTweens = initialCounts.tweens;

    console.log(`- Vòng 0: ScrollTrigger = ${initialST}, Active Tweens = ${initialTweens}`);

    for (let cycle = 1; cycle <= 30; cycle++) {
      const target = cycle % 2 === 0 ? "/" : "/find";
      await page.goto(`${baseUrl}${target}`, { waitUntil: "domcontentloaded" });
      if (cycle % 10 === 0) {
        const counts = await page.evaluate(() => {
          const gsap = window.gsap;
          const ScrollTrigger = window.ScrollTrigger;
          return {
            st: ScrollTrigger ? ScrollTrigger.getAll().length : 0,
            tweens: gsap && gsap.globalTimeline ? gsap.globalTimeline.getChildren().length : 0,
          };
        });
        console.log(`- Vòng ${cycle}: ScrollTrigger = ${counts.st}, Active Tweens = ${counts.tweens}`);
      }
    }

    const finalCounts = await page.evaluate(() => {
      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      return {
        st: ScrollTrigger ? ScrollTrigger.getAll().length : 0,
        tweens: gsap && gsap.globalTimeline ? gsap.globalTimeline.getChildren().length : 0,
      };
    });
    finalST = finalCounts.st;
    finalTweens = finalCounts.tweens;

    const leakST = finalST - initialST;
    const leakTweens = finalTweens - initialTweens;
    console.log(`- Kết quả sau 30 vòng lặp: ScrollTrigger Delta = ${leakST}, Tweens Delta = ${leakTweens}`);
    console.log(`- Đánh giá rò rỉ Motion: ${leakST <= 2 && leakTweens <= 2 ? "ĐẠT (Không rò rỉ)" : "CÓ RÒ RỈ CẦN DỌN DẸP"}`);

    console.log("\n--- 3. ĐO LƯỜNG CHỈ SỐ CORE WEB VITALS TRÊN CÁC ROUTE CÔNG KHAI TRỌNG YẾU ---");
    const perfRoutes = ["/", "/find", "/vehicles/detail", "/account/trips"];
    const perfResults = [];

    for (const p of perfRoutes) {
      await page.goto(`${baseUrl}${p}`, { waitUntil: "networkidle" });
      const metrics = await page.evaluate(() => {
        const nav = performance.getEntriesByType("navigation")[0];
        const paint = performance.getEntriesByType("paint");
        const fcp = paint.find((e) => e.name === "first-contentful-paint")?.startTime || 0;
        return {
          domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : 0,
          loadComplete: nav ? Math.round(nav.loadEventEnd - nav.startTime) : 0,
          fcp: Math.round(fcp),
          domNodes: document.querySelectorAll("*").length,
        };
      });

      perfResults.push({ path: p, ...metrics });
      console.log(`> Route ${p.padEnd(20)} | FCP: ${metrics.fcp}ms | DCL: ${metrics.domContentLoaded}ms | DOM Nodes: ${metrics.domNodes}`);
    }

    // Export raw JSON results for reporting
    fs.writeFileSync(
      path.resolve(__dirname, "../docs/ux/audit-before-fix.json"),
      JSON.stringify({ routes: results, motionLeak: { initialST, finalST, leakST, leakTweens }, perf: perfResults }, null, 2),
      "utf8"
    );
    console.log("\n[XUẤT KẾT QUẢ] Đã ghi chi tiết vào docs/ux/audit-before-fix.json");

  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((e) => {
  console.error("Lỗi audit BƯỚC 1:", e);
  process.exit(1);
});
