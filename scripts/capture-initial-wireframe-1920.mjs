import { chromium } from 'playwright';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';

const PORT = 3020;
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
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Fullpage 1920 screenshot (all sections in one full document)
  const fullpagePath = path.join('screenshots', 'landing-v3-initial-wireframe-full-1920.png');
  await page.screenshot({ path: fullpagePath, fullPage: true });
  console.log(`Saved fullpage 1920: ${fullpagePath}`);

  // 2. Hero Viewport
  const heroPath = path.join('screenshots', 'landing-v3-initial-hero-1920.png');
  await page.screenshot({ path: heroPath });
  console.log(`Saved hero viewport: ${heroPath}`);

  // 3. Scene B (cung-duong)
  const cungDuongTop = await page.evaluate(() => document.getElementById('cung-duong')?.offsetTop || 1080);
  await page.evaluate((top) => { document.scrollingElement.scrollTop = top; }, cungDuongTop);
  await page.waitForTimeout(600);
  const scenebPath = path.join('screenshots', 'landing-v3-initial-sceneb-1920.png');
  await page.screenshot({ path: scenebPath });
  console.log(`Saved scene B viewport (at y=${cungDuongTop}): ${scenebPath}`);

  // 4. Chapter 4 Trust (tin-cay)
  const tinCayTop = await page.evaluate(() => document.getElementById('tin-cay')?.offsetTop || 3500);
  await page.evaluate((top) => { document.scrollingElement.scrollTop = top; }, tinCayTop);
  await page.waitForTimeout(600);
  const trustPath = path.join('screenshots', 'landing-v3-initial-trust-1920.png');
  await page.screenshot({ path: trustPath });
  console.log(`Saved trust viewport (at y=${tinCayTop}): ${trustPath}`);

  // 5. Chapter 5 Booking (dat-xe)
  const datXeTop = await page.evaluate(() => document.getElementById('dat-xe')?.offsetTop || 5000);
  await page.evaluate((top) => { document.scrollingElement.scrollTop = top; }, datXeTop);
  await page.waitForTimeout(600);
  const bookingPath = path.join('screenshots', 'landing-v3-initial-booking-1920.png');
  await page.screenshot({ path: bookingPath });
  console.log(`Saved booking viewport (at y=${datXeTop}): ${bookingPath}`);

  await browser.close();
  server.close();
  console.log('Capture complete!');
}

main().catch(console.error);
