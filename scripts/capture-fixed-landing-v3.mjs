import { chromium } from 'playwright';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';

const PORT = 3027;
const outDir = path.resolve('out');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  let filePath = path.join(outDir, reqPath);
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) filePath += '.html';
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end();
  }
});

async function main() {
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Server listening on http://localhost:${PORT}`);

  const browser = await chromium.launch({ headless: true });

  // 1. Desktop 1920x1080 Viewports
  const page1920 = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page1920.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
  await page1920.waitForTimeout(1000);

  async function getDocTop(id) {
    return page1920.evaluate((elId) => {
      const el = document.getElementById(elId);
      if (!el) return 0;
      return el.getBoundingClientRect().top + window.scrollY;
    }, id);
  }

  // Hero Viewport (y=0)
  const heroPath = path.join('screenshots', 'landing-v3-fixed-hero-1920.png');
  await page1920.screenshot({ path: heroPath });
  console.log(`Saved hero 1920: ${heroPath}`);

  // Chapter 2: Cung đường Hải Vân
  const ch2Top = await getDocTop('cung-duong');
  await page1920.evaluate((top) => { document.scrollingElement.scrollTop = top; }, ch2Top);
  await page1920.waitForTimeout(600);
  const ch2Path = path.join('screenshots', 'landing-v3-fixed-sceneb-ch2-1920.png');
  await page1920.screenshot({ path: ch2Path });
  console.log(`Saved Chapter 2 at y=${ch2Top}: ${ch2Path}`);

  // Chapter 3: Quy trình nhận xe
  const ch3Top = await getDocTop('quy-trinh');
  await page1920.evaluate((top) => { document.scrollingElement.scrollTop = top; }, ch3Top);
  await page1920.waitForTimeout(600);
  const ch3Path = path.join('screenshots', 'landing-v3-fixed-ch3-steps-1920.png');
  await page1920.screenshot({ path: ch3Path });
  console.log(`Saved Chapter 3 at y=${ch3Top}: ${ch3Path}`);

  // Chapter 4: Tin cậy bằng dữ kiện
  const ch4Top = await getDocTop('tin-cay');
  await page1920.evaluate((top) => { document.scrollingElement.scrollTop = top; }, ch4Top);
  await page1920.waitForTimeout(600);
  const ch4Path = path.join('screenshots', 'landing-v3-fixed-trust-1920.png');
  await page1920.screenshot({ path: ch4Path });
  console.log(`Saved Chapter 4 at y=${ch4Top}: ${ch4Path}`);

  // Chapter 5: Đặt xe & Chân trang
  const ch5Top = await getDocTop('dat-xe');
  await page1920.evaluate((top) => { document.scrollingElement.scrollTop = top; }, ch5Top);
  await page1920.waitForTimeout(600);
  const ch5Path = path.join('screenshots', 'landing-v3-fixed-booking-1920.png');
  await page1920.screenshot({ path: ch5Path });
  console.log(`Saved Chapter 5 at y=${ch5Top}: ${ch5Path}`);

  // Full-page 1920 Screenshot
  const fullPath = path.join('screenshots', 'landing-v3-fixed-full-1920.png');
  await page1920.screenshot({ path: fullPath, fullPage: true });
  console.log(`Saved Fullpage 1920: ${fullPath}`);
  await page1920.close();

  // 2. Laptop 1440x900
  const page1440 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page1440.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
  await page1440.waitForTimeout(800);
  const hero1440Path = path.join('screenshots', 'landing-v3-fixed-hero-1440.png');
  await page1440.screenshot({ path: hero1440Path });
  console.log(`Saved hero 1440: ${hero1440Path}`);
  const full1440Path = path.join('screenshots', 'landing-v3-fixed-full-1440.png');
  await page1440.screenshot({ path: full1440Path, fullPage: true });
  console.log(`Saved fullpage 1440: ${full1440Path}`);
  await page1440.close();

  // 3. Mobile iPhone 390x844
  const page390 = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page390.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
  await page390.waitForTimeout(800);
  const hero390Path = path.join('screenshots', 'landing-v3-fixed-hero-390.png');
  await page390.screenshot({ path: hero390Path });
  console.log(`Saved hero 390: ${hero390Path}`);
  const full390Path = path.join('screenshots', 'landing-v3-fixed-full-390.png');
  await page390.screenshot({ path: full390Path, fullPage: true });
  console.log(`Saved fullpage 390: ${full390Path}`);
  await page390.close();

  await browser.close();
  server.close();
  console.log('All fixed screenshots captured successfully!');
}

main().catch(console.error);
