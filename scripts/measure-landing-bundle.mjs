import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'out');
const indexPath = path.join(outDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('Không tìm thấy out/index.html. Hãy chạy npm run build trước.');
  process.exit(1);
}

const html = fs.readFileSync(indexPath, 'utf-8');
const scriptMatches = [...html.matchAll(/src="(\/_next\/[^"]+\.js)"/g)].map((m) => m[1]);

let totalRaw = 0;
let totalGzip = 0;
const list = [];

console.log('=== SCRIPTS LOADED BY LANDING PAGE (out/index.html) ===\n');

for (const s of scriptMatches) {
  const filePath = path.join(outDir, s.replace(/^\//, ''));
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath);
    const rawSize = content.length;
    const gzipSize = zlib.gzipSync(content).length;
    totalRaw += rawSize;
    totalGzip += gzipSize;
    list.push({
      file: path.basename(filePath),
      rawKb: (rawSize / 1024).toFixed(1),
      gzipKb: (gzipSize / 1024).toFixed(1),
      gzipRaw: gzipSize,
    });
  }
}

list.sort((a, b) => b.gzipRaw - a.gzipRaw);

console.table(list.map(({ file, rawKb, gzipKb }) => ({ 'Chunk File': file, 'Raw (KB)': `${rawKb} KB`, 'Gzip (KB)': `${gzipKb} KB` })));

console.log('-------------------------------------------------------');
console.log(`TỔNG SỐ CHUNKS: ${list.length}`);
console.log(`TỔNG DUNG LƯỢNG JS THÔ: ${(totalRaw / 1024).toFixed(1)} KB`);
console.log(`TỔNG DUNG LƯỢNG GZIP: ${(totalGzip / 1024).toFixed(1)} KB`);
console.log(`Mục tiêu Bước 6 (ADR-001) ≤ 180 KB gzip: ${totalGzip / 1024 <= 180 ? 'ĐẠT CHUẨN' : 'VƯỢT TRẦN'}`);
console.log('=======================================================\n');
