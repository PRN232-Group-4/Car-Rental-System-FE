import { chromium } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const PORT = 3355;
const CWD = process.cwd();
const OUT_DIR = path.join(CWD, 'public/assets/hero-car');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const MIME_MAP = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.glb': 'model/gltf-binary',
  '.png': 'image/png',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  const safePath = path.normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(CWD, safePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_MAP[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

async function run() {
  console.log('=== KHỞI ĐỘNG KỊCH BẢN KẾT XUẤT POSTER XE HERO SHOWROOM ===');
  
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`[1/5] Máy chủ HTTP nội bộ đã mở tại http://localhost:${PORT}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 2560, height: 1440 },
    deviceScaleFactor: 1
  });

  page.on('console', msg => {
    if (msg.type() === 'error') console.error('Browser error:', msg.text());
  });

  console.log('[2/5] Đang nạp studio 3D tại scripts/studio/render-hero-poster.html...');
  await page.goto(`http://localhost:${PORT}/scripts/studio/render-hero-poster.html`);
  await page.waitForFunction(() => window.__ready === true, { timeout: 20000 });
  console.log('       Studio 3D đã sẵn sàng.');

  // Helper to capture a pass
  async function capturePass(mode, filename) {
    console.log(`[3/5] Đang kết xuất pass: "${mode}"...`);
    await page.evaluate((m) => window.switchMode(m), mode);
    // Cho khung hình ổn định
    await page.waitForTimeout(500);

    const base64Data = await page.evaluate(() => {
      // Kết xuất ở độ phân giải 2560 x 1440
      return window.captureDataUrl(2560, 1440);
    });

    const buffer = Buffer.from(base64Data.replace(/^data:image\/png;base64,/, ''), 'base64');
    const outPath = path.join(OUT_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`       -> Đã lưu ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return buffer;
  }

  const compositeBuf = await capturePass('composite', 'hero-car-composite-master.png');
  const bodyBuf = await capturePass('body', 'hero-car-body-master.png');
  const shadowBuf = await capturePass('shadow', 'hero-car-shadow-master.png');

  await browser.close();
  server.close();
  console.log('[3/5] Hoàn thành kết xuất 3 ảnh Master trong suốt.');

  // Kích thước responsive yêu cầu: 640, 960, 1280, 1920
  const SIZES = [640, 960, 1280, 1920];
  const PASSES = [
    { name: 'hero-car-composite', buffer: compositeBuf },
    { name: 'hero-car-body', buffer: bodyBuf },
    { name: 'hero-car-shadow', buffer: shadowBuf }
  ];

  console.log('[4/5] Đang tạo các biến thể ảnh WebP & AVIF đa kích thước (sharp)...');
  const statsTable = [];

  for (const pass of PASSES) {
    for (const width of SIZES) {
      // 1. WebP
      const webpFileName = `${pass.name}-${width}.webp`;
      const webpPath = path.join(OUT_DIR, webpFileName);
      await sharp(pass.buffer)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 86, effort: 6 })
        .toFile(webpPath);
      const webpStat = fs.statSync(webpPath);

      // 2. AVIF
      const avifFileName = `${pass.name}-${width}.avif`;
      const avifPath = path.join(OUT_DIR, avifFileName);
      await sharp(pass.buffer)
        .resize({ width, withoutEnlargement: true })
        .avif({ quality: 78, effort: 6 })
        .toFile(avifPath);
      const avifStat = fs.statSync(avifPath);

      statsTable.push({
        Pass: pass.name,
        Width: `${width}px`,
        'WebP (KB)': (webpStat.size / 1024).toFixed(1),
        'AVIF (KB)': (avifStat.size / 1024).toFixed(1),
        'AVIF Target <=150KB': avifStat.size <= 150 * 1024 ? 'PASS' : 'FAIL'
      });
    }
  }

  console.table(statsTable);

  // [5/5] Anti-halo (Viền sáng) Automated Verification
  console.log('[5/5] Kiểm tra viền sáng (Anti-halo check) trên nền sáng #F2F3F5 và tối #090D14...');
  const testWidth = 1280;
  const testHeight = Math.round(1280 * (1440 / 2560));

  // Tạo nền sáng và nền tối
  const lightBg = await sharp({
    create: { width: testWidth, height: testHeight, channels: 4, background: { r: 242, g: 243, b: 245, alpha: 1 } }
  }).png().toBuffer();

  const darkBg = await sharp({
    create: { width: testWidth, height: testHeight, channels: 4, background: { r: 9, g: 13, b: 20, alpha: 1 } }
  }).png().toBuffer();

  const resizedBody = await sharp(bodyBuf).resize(testWidth).png().toBuffer();

  const haloLightPath = path.join(CWD, 'scratch/halo-test-light.png');
  const haloDarkPath = path.join(CWD, 'scratch/halo-test-dark.png');

  await sharp(lightBg)
    .composite([{ input: resizedBody, blend: 'over' }])
    .png()
    .toFile(haloLightPath);

  await sharp(darkBg)
    .composite([{ input: resizedBody, blend: 'over' }])
    .png()
    .toFile(haloDarkPath);

  // Quét điểm ảnh kiểm tra halo
  const rawBody = await sharp(resizedBody).raw().toBuffer({ resolveWithObject: true });
  const rawDark = await sharp(haloDarkPath).raw().toBuffer({ resolveWithObject: true });

  let edgePixelCount = 0;
  let haloArtifactCount = 0;

  for (let i = 0; i < rawBody.data.length; i += 4) {
    const alpha = rawBody.data[i + 3];
    // Chỉ kiểm tra các pixel viền bán trong suốt (anti-aliased edge)
    if (alpha >= 20 && alpha <= 235) {
      edgePixelCount++;
      const darkR = rawDark.data[i];
      const darkG = rawDark.data[i + 1];
      const darkB = rawDark.data[i + 2];

      // Nếu pixel trên nền tối (nền gốc 9, 13, 20) bị đẩy lên màu trắng/sáng bất thường (> 210) trong khi alpha thấp
      if (alpha < 100 && (darkR > 190 && darkG > 190 && darkB > 190)) {
        haloArtifactCount++;
      }
    }
  }

  const haloRatio = edgePixelCount > 0 ? (haloArtifactCount / edgePixelCount) * 100 : 0;
  console.log(`       - Tổng số pixel biên bán trong suốt (anti-aliased edge): ${edgePixelCount.toLocaleString()}`);
  console.log(`       - Số pixel viền sáng bất thường (halo artifacts): ${haloArtifactCount} (${haloRatio.toFixed(2)}%)`);
  
  if (haloRatio < 0.05) {
    console.log('       -> KẾT QUẢ ANTI-HALO: PASS (Hoàn toàn không có viền sáng trên nền tối!)');
  } else {
    console.warn('       -> CẢNH BÁO: Phát hiện viền sáng bất thường, cần tinh chỉnh premultiplied alpha.');
  }

  console.log('\n=== HOÀN TẤT KẾT XUẤT TÀI SẢN HERO CAR THÀNH CÔNG ===');
}

run().catch((err) => {
  console.error('Lỗi thực thi:', err);
  server.close();
  process.exit(1);
});
