import http from 'http';
import fs from 'fs';
import path from 'path';
import { chromium } from '@playwright/test';

const PORT = 3405;
const CWD = process.cwd();
const RENDERS_DIR = path.join(CWD, 'public/assets/renders');
const ASSETS_SRC_DIR = path.join(CWD, 'assets-src/landing');
const ARTIFACT_DIR = 'C:/Users/Huy/.gemini/antigravity/brain/cb19b557-2956-44c2-b400-502de53d899e';

if (!fs.existsSync(RENDERS_DIR)) fs.mkdirSync(RENDERS_DIR, { recursive: true });
if (!fs.existsSync(ASSETS_SRC_DIR)) fs.mkdirSync(ASSETS_SRC_DIR, { recursive: true });

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
    res.end('Not found: ' + safePath);
  }
});

async function main() {
  console.log('=== BẮT ĐẦU KẾT XUẤT VÀ CHỤP MÀN HÌNH 3D TIẾP ĐẤT CHUẨN XÁC ===');
  
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`[1/4] Máy chủ HTTP 3D Studio đã mở tại http://localhost:${PORT}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 2560, height: 1440 },
    deviceScaleFactor: 1
  });

  page.on('console', msg => {
    if (msg.type() === 'error') console.error('Browser Error:', msg.text());
  });

  console.log('[2/4] Đang mở trình xem 3D Porsche 911 Carrera 4S...');
  await page.goto(`http://localhost:${PORT}/scripts/studio/render-hero-poster.html`);
  await page.waitForFunction(() => window.__ready === true, { timeout: 25000 });
  console.log('       Trình xem 3D đã sẵn sàng.');

  // ==========================================
  // CẢNH A: GÓC 3/4 TRƯỚC THẤP (TIẾP ĐẤT CHUẨN)
  // ==========================================
  console.log('\n[3/4] Đang chụp CẢNH A (Góc 3/4 trước thấp, bánh tiếp đất chuẩn)...');
  await page.evaluate(() => {
    window.switchScene('scene-a');
    window.switchMode('composite');
  });
  await page.waitForTimeout(600);

  // 1. Chụp màn hình giao diện trình xem 3D (Full Viewport Screenshot 2560x1440)
  const viewerA_Path = path.join(RENDERS_DIR, 'viewer-canh-a-3-4-truoc-thap.png');
  await page.screenshot({ path: viewerA_Path });
  console.log(`       -> Đã chụp ảnh trình xem Cảnh A: ${viewerA_Path}`);

  // 2. Kết xuất 4K Master Composite (Xe + Bóng trên nền trong suốt)
  const dataUrlA_comp = await page.evaluate(() => window.captureDataUrl(3840, 2160));
  const bufA_comp = Buffer.from(dataUrlA_comp.replace(/^data:image\/png;base64,/, ''), 'base64');
  const pathA_comp = path.join(RENDERS_DIR, 'canh-a-composite-4k.png');
  fs.writeFileSync(pathA_comp, bufA_comp);
  console.log(`       -> Đã lưu ảnh 4K Composite Cảnh A (3840x2160): ${(bufA_comp.length / 1024).toFixed(1)} KB`);

  // 3. Kết xuất 4K Body (Chỉ thân xe trên nền trong suốt)
  await page.evaluate(() => window.switchMode('body'));
  await page.waitForTimeout(300);
  const dataUrlA_body = await page.evaluate(() => window.captureDataUrl(3840, 2160));
  const bufA_body = Buffer.from(dataUrlA_body.replace(/^data:image\/png;base64,/, ''), 'base64');
  const pathA_body = path.join(RENDERS_DIR, 'canh-a-body-4k.png');
  fs.writeFileSync(pathA_body, bufA_body);
  console.log(`       -> Đã lưu ảnh 4K Body Cảnh A (3840x2160): ${(bufA_body.length / 1024).toFixed(1)} KB`);

  // Lưu làm a4-car.png cho assets-src/landing/
  fs.writeFileSync(path.join(ASSETS_SRC_DIR, 'a4-car.png'), bufA_comp);
  fs.writeFileSync(path.join(RENDERS_DIR, 'a4-car-master.png'), bufA_comp);

  // ==========================================
  // CẢNH B: GÓC 3/4 ÔM CUA (NGHIÊNG NHẸ 2.8°, TIẾP ĐẤT CHUẨN)
  // ==========================================
  console.log('\n[4/4] Đang chụp CẢNH B (Góc 3/4 ôm cua, thân nghiêng nhẹ, bánh tiếp đất chuẩn)...');
  await page.evaluate(() => {
    window.switchScene('scene-b');
    window.switchMode('composite');
  });
  await page.waitForTimeout(600);

  // 1. Chụp màn hình giao diện trình xem 3D (Full Viewport Screenshot 2560x1440)
  const viewerB_Path = path.join(RENDERS_DIR, 'viewer-canh-b-3-4-om-cua.png');
  await page.screenshot({ path: viewerB_Path });
  console.log(`       -> Đã chụp ảnh trình xem Cảnh B: ${viewerB_Path}`);

  // 2. Kết xuất 4K Master Composite (Xe + Bóng trên nền trong suốt)
  const dataUrlB_comp = await page.evaluate(() => window.captureDataUrl(3840, 2160));
  const bufB_comp = Buffer.from(dataUrlB_comp.replace(/^data:image\/png;base64,/, ''), 'base64');
  const pathB_comp = path.join(RENDERS_DIR, 'canh-b-composite-4k.png');
  fs.writeFileSync(pathB_comp, bufB_comp);
  console.log(`       -> Đã lưu ảnh 4K Composite Cảnh B (3840x2160): ${(bufB_comp.length / 1024).toFixed(1)} KB`);

  // 3. Kết xuất 4K Body (Chỉ thân xe trên nền trong suốt)
  await page.evaluate(() => window.switchMode('body'));
  await page.waitForTimeout(300);
  const dataUrlB_body = await page.evaluate(() => window.captureDataUrl(3840, 2160));
  const bufB_body = Buffer.from(dataUrlB_body.replace(/^data:image\/png;base64,/, ''), 'base64');
  const pathB_body = path.join(RENDERS_DIR, 'canh-b-body-4k.png');
  fs.writeFileSync(pathB_body, bufB_body);
  console.log(`       -> Đã lưu ảnh 4K Body Cảnh B (3840x2160): ${(bufB_body.length / 1024).toFixed(1)} KB`);

  // Lưu làm b4-car.png cho assets-src/landing/
  fs.writeFileSync(path.join(ASSETS_SRC_DIR, 'b4-car.png'), bufB_comp);
  fs.writeFileSync(path.join(RENDERS_DIR, 'b4-car-master.png'), bufB_comp);

  // Copy các ảnh chính sang Artifacts directory để hiển thị trong chat
  if (fs.existsSync(ARTIFACT_DIR)) {
    fs.copyFileSync(viewerA_Path, path.join(ARTIFACT_DIR, 'viewer-canh-a-3-4-truoc-thap.png'));
    fs.copyFileSync(viewerB_Path, path.join(ARTIFACT_DIR, 'viewer-canh-b-3-4-om-cua.png'));
    fs.copyFileSync(pathA_comp, path.join(ARTIFACT_DIR, 'canh-a-composite-4k.png'));
    fs.copyFileSync(pathB_comp, path.join(ARTIFACT_DIR, 'canh-b-composite-4k.png'));
    console.log('       -> Đã đồng bộ ảnh mới sang Artifacts directory.');
  }

  await browser.close();
  server.close();
  console.log('\n=== HOÀN TẤT CHỤP MÀN HÌNH VÀ KẾT XUẤT 3D THÀNH CÔNG ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  server.close();
  process.exit(1);
});
