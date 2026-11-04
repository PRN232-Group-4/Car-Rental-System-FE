import { chromium } from 'playwright';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';

const PORT = 3009;
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

function createStaticServer() {
  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
    let filePath = path.join(outDir, reqPath);

    if (!fs.existsSync(filePath)) {
      if (fs.existsSync(filePath + '.html')) {
        filePath = filePath + '.html';
      } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
        filePath = path.join(filePath, 'index.html');
      }
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found: ' + reqPath);
    }
  });
}

async function capture() {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Static server running on http://localhost:${PORT}`);

  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: '1920x1080', width: 1920, height: 1080 },
    { name: '1440x900', width: 1440, height: 900 },
    { name: '390x844', width: 390, height: 844 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    const heroPath = path.join('screenshots', `landing-v3-hero-${vp.name}.png`);
    await page.screenshot({ path: heroPath });
    console.log(`Captured hero: ${heroPath}`);

    if (vp.name === '1920x1080') {
      await page.evaluate(() => {
        const el = document.getElementById('chuong-2-3');
        if (el) el.scrollIntoView();
      });
      await page.waitForTimeout(1000);
      const scenebPath = path.join('screenshots', 'landing-v3-sceneb-1920.png');
      await page.screenshot({ path: scenebPath });
      console.log(`Captured scene B: ${scenebPath}`);

      await page.evaluate(() => {
        const el = document.getElementById('doi-xe');
        if (el) el.scrollIntoView();
      });
      await page.waitForTimeout(1000);
      const trustPath = path.join('screenshots', 'landing-v3-trust-1920.png');
      await page.screenshot({ path: trustPath });
      console.log(`Captured trust: ${trustPath}`);

      const fullPath = path.join('screenshots', 'landing-v3-full-1920.png');
      await page.screenshot({ path: fullPath, fullPage: true });
      console.log(`Captured fullpage: ${fullPath}`);
    }

    await page.close();
  }

  await browser.close();
  server.close();
  console.log('All visual proof screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
