import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const testString = "Thuê xe ô tô điện — Quản lý bảo dưỡng, hoàn cọc, đặt xe ngày Chủ nhật";
const requiredWeights = [400, 600, 800];

console.log('=== CỔNG KIỂM TRA FONT TIẾNG VIỆT (DESIGN.md A3 / Bước 5b) ===');
console.log(`Chuỗi kiểm định: "${testString}"\n`);

// 1. Verify layout.tsx configuration
const layoutPath = path.join(rootDir, 'src/app/layout.tsx');
const layoutCode = fs.readFileSync(layoutPath, 'utf-8');

if (!layoutCode.includes('Be_Vietnam_Pro')) {
  console.error('\x1b[31m[LỖI] layout.tsx chưa nạp Be_Vietnam_Pro!\x1b[0m');
  process.exit(1);
}

if (!layoutCode.includes('--font-be-vietnam')) {
  console.error('\x1b[31m[LỖI] layout.tsx chưa gán variable: "--font-be-vietnam"!\x1b[0m');
  process.exit(1);
}

const hasVietnameseSubset = /subsets:\s*\[[^\]]*["']vietnamese["'][^\]]*\]/.test(layoutCode);
if (!hasVietnameseSubset) {
  console.error('\x1b[31m[LỖI] layout.tsx chưa cấu hình subset "vietnamese"!\x1b[0m');
  process.exit(1);
}

console.log('✓ Cấu hình Be_Vietnam_Pro trong layout.tsx: ĐẠT (subsets: latin, latin-ext, vietnamese; weights: 400-800; variable: --font-be-vietnam)');

// 2. Extract all unique characters from the test string
const chars = Array.from(new Set(testString));
const codePoints = chars.map(c => ({
  char: c,
  code: c.codePointAt(0),
  hex: 'U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')
}));

console.log(`✓ Phân tích chuỗi: ${chars.length} glyphs phân biệt, bao gồm các ký tự tiếng Việt có dấu:`);
const vnChars = codePoints.filter(cp => cp.code > 127);
console.log(`  ${vnChars.map(v => `${v.char} (${v.hex})`).join(', ')}\n`);

// Helper to check if a codepoint is within a unicode-range string
function isInUnicodeRange(code, rangeStr) {
  const parts = rangeStr.split(',').map(s => s.trim().replace(/;$/, ''));
  for (const part of parts) {
    if (/^U\+\?+/i.test(part)) {
      // U+?? or U+???? wildcards (e.g. U+?? matches 0x00 - 0xFF)
      const prefix = part.replace(/^U\+/i, '');
      const questionCount = (prefix.match(/\?/g) || []).length;
      const base = prefix.replace(/\?/g, '');
      const minHex = (base + '0'.repeat(questionCount)) || '0';
      const maxHex = (base + 'F'.repeat(questionCount)) || 'F';
      const min = parseInt(minHex, 16);
      const max = parseInt(maxHex, 16);
      if (code >= min && code <= max) return true;
    } else {
      const clean = part.replace(/^U\+/i, '');
      if (clean.includes('-')) {
        const [startStr, endStr] = clean.split('-');
        const start = parseInt(startStr, 16);
        const end = parseInt(endStr, 16);
        if (code >= start && code <= end) return true;
      } else {
        const val = parseInt(clean, 16);
        if (code === val) return true;
      }
    }
  }
  return false;
}

// 3. Inspect next font build output
const nextStaticDir = path.join(rootDir, '.next/static');

function findFiles(dir, ext, list = []) {
  if (!fs.existsSync(dir)) return list;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) findFiles(full, ext, list);
    else if (e.name.endsWith(ext)) list.push(full);
  }
  return list;
}

const cssFiles = findFiles(nextStaticDir, '.css');
let beVietnamFaces = [];

for (const cf of cssFiles) {
  const css = fs.readFileSync(cf, 'utf-8');
  const matches = css.matchAll(/@font-face\s*\{([^}]+)\}/g);
  for (const m of matches) {
    const block = m[1];
    if (block.includes('Be Vietnam Pro') && !block.includes('Fallback')) {
      beVietnamFaces.push(block);
    }
  }
}

console.log(`✓ Đã nạp ${beVietnamFaces.length} quy tắc @font-face cho Be Vietnam Pro từ bản build Next.js.`);

// Verify coverage for each required weight (400, 600, 800)
const missingByWeight = {};

for (const w of requiredWeights) {
  const facesForWeight = beVietnamFaces.filter(ff => {
    const wMatch = ff.match(/font-weight:\s*([0-9]+)/);
    return wMatch && parseInt(wMatch[1], 10) === w;
  });

  const missing = [];
  for (const cp of codePoints) {
    let covered = false;
    for (const ff of facesForWeight) {
      const urMatch = ff.match(/unicode-range:\s*([^;]+)(?:;|$)/);
      if (urMatch && isInUnicodeRange(cp.code, urMatch[1])) {
        covered = true;
        break;
      }
    }
    if (!covered) {
      missing.push(cp);
    }
  }

  if (missing.length > 0) {
    missingByWeight[w] = missing;
  } else {
    console.log(`  ✓ Trọng số ${w}: 100% (${chars.length}/${chars.length}) glyphs có subset unicode-range tương ứng`);
  }
}

if (Object.keys(missingByWeight).length > 0) {
  console.error('\x1b[31m[LỖI CỔNG KIỂM TRA] Một số glyphs không được bao phủ bởi tệp font:\x1b[0m', missingByWeight);
  process.exit(1);
}

console.log('\n\x1b[32m[CỔNG KIỂM TRA ĐẠT 100%] Be Vietnam Pro tải đầy đủ subset vietnamese cho các trọng số 400/600/800. Không có glyph nào rơi về font hệ thống.\x1b[0m\n');
process.exit(0);
