import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (/\.(tsx?|css|jsx?)$/.test(entry.name)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const files = getAllFiles(srcDir);
const violations = [];

// Tập token màu có thật: đọc @theme trong globals.css. Rule 9 đối chiếu mọi class màu với tập này.
const globalsCss = fs.readFileSync(path.join(srcDir, 'app', 'globals.css'), 'utf-8');
const themeBlock = globalsCss.slice(globalsCss.indexOf('@theme'), globalsCss.indexOf('html {'));
const definedColorTokens = new Set(
  [...themeBlock.matchAll(/--color-([a-z0-9-]+)\s*:/g)].map((match) => match[1]),
);

// Regex definitions per DESIGN.md A13
const emojiRegex = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{2712}\u{2715}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/u;

for (const file of files) {
  const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
  const isGlobalsCss = relPath === 'src/app/globals.css';
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // Ignore comment-only lines in CSS or TS
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return;
    }

    // 1. Gradients
    if (/(linear-gradient|radial-gradient|conic-gradient|bg-gradient-|from-.*via-.*to-)/i.test(line)) {
      violations.push({
        file: relPath,
        line: lineNum,
        rule: 'NO_GRADIENTS (A4.1, A11, A13)',
        message: 'Mọi dạng gradient (linear, radial, conic, bg-gradient-*) đều bị cấm.',
        detail: trimmed
      });
    }

    // 2. Black hex / text-black / bg-black / border-black
    if (/(#000000|#000\b|\btext-black\b|\bbg-black\b|\bborder-black\b)/.test(line)) {
      // Allow if it's inside a URL or non-color context, but flag color usages
      if (!/#000[a-f0-9]/i.test(line)) {
        violations.push({
          file: relPath,
          line: lineNum,
          rule: 'NO_BLACK_HEX (A2, A11, A13)',
          message: 'Cấm #000, #000000, text-black, bg-black; dùng Garage Ink (#0E1A16) hoặc --scrim.',
          detail: trimmed
        });
      }
    }

    // 3. Emojis
    if (emojiRegex.test(line)) {
      violations.push({
        file: relPath,
        line: lineNum,
        rule: 'NO_EMOJIS (A11, A13)',
        message: 'Cấm emoji trong code và giao diện; dùng icon từ lucide-react.',
        detail: trimmed
      });
    }

    // 4. h-screen
    if (/\bh-screen\b/.test(line)) {
      violations.push({
        file: relPath,
        line: lineNum,
        rule: 'NO_H_SCREEN (A5, A11, A13)',
        message: 'Cấm h-screen; dùng min-h-[100dvh] hoặc h-full.',
        detail: trimmed
      });
    }

    // 5. Forbidden fonts (Inter, Manrope in font imports/config)
    if (/(from ['"]next\/font\/google['"].*Inter|from ['"]next\/font\/google['"].*Manrope|--font-inter|--font-manrope|font-family:.*['"]?Inter['"]?|font-family:.*['"]?Manrope['"]?)/i.test(line)) {
      violations.push({
        file: relPath,
        line: lineNum,
        rule: 'FONT_RULE (A3, A11, A13)',
        message: 'Font chính là Be Vietnam Pro + Geist Mono. Cấm Inter, Manrope.',
        detail: trimmed
      });
    }

    // 6. Scroll to explore string
    if (/Scroll to explore/i.test(line)) {
      violations.push({
        file: relPath,
        line: lineNum,
        rule: 'NO_SCROLL_EXPLORE_STRING (A5, A11, A13)',
        message: 'Cấm chuỗi "Scroll to explore" hoặc mũi tên cuộn trong hero.',
        detail: trimmed
      });
    }

    // 7. Backdrop blur / filter outside of globals.css approved classes
    if (!isGlobalsCss) {
      if (/\bbackdrop-blur-|\bbackdrop-filter\b/i.test(line)) {
        violations.push({
          file: relPath,
          line: lineNum,
          rule: 'NO_INLINE_BACKDROP_FILTER (A4.3, A4.4, A13)',
          message: 'Cấm backdrop-blur-* / backdrop-filter inline; chỉ dùng các lớp .glass-1/2/3/ink/admin đã định nghĩa trong globals.css.',
          detail: trimmed
        });
      }
    }

    // 8. Màu thô: palette Tailwind hoặc hex tuỳ ý trong class màu.
    //    A2 + A12: mọi màu phải đi qua token --color-* khai báo ở globals.css.
    if (!isGlobalsCss) {
      const rawColour = line.match(
        /(?:^|[\s"'`{])(?:[a-z-]+:)*(?:text|bg|border|ring|fill|stroke|divide|from|to|via|outline|decoration|accent|caret|placeholder)-(?:emerald|green|orange|amber|slate|gray|zinc|neutral|stone|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|lime|yellow|red)-(?:\d{2,3})(?:\/\d+)?\b/g,
      );
      const rawHex = line.match(
        /(?:^|[\s"'`{])(?:[a-z-]+:)*(?:text|bg|border|ring|fill|stroke|divide|from|to|via|outline|accent|caret|placeholder)-\[#[0-9a-fA-F]{3,8}\](?:\/\d+)?/g,
      );
      const found = [...(rawColour ?? []), ...(rawHex ?? [])].map((s) => s.trim());
      if (found.length) {
        violations.push({
          file: relPath,
          line: lineNum,
          rule: 'NO_RAW_PALETTE_COLOUR (A2, A12)',
          message: `Cấm màu palette/hex thô (${[...new Set(found)].join(', ')}); dùng token --color-* qua globals.css (text-ink, bg-primary, border-line…).`,
          detail: trimmed
        });
      }
    }

    // 9. Token không tồn tại: `border-border`, `text-ink-muted`… không có trong @theme nên Tailwind
    //    KHÔNG sinh CSS, viền chữ rơi về currentColor. Bắt tại CI thay vì phải soi bản build (A12, A13).
    if (!isGlobalsCss) {
      const unknown = line.match(
        /(?:^|[\s"'`{])(?:[a-z-]+:)*(?:text|bg|border|ring|divide|fill|stroke|from|to|via|outline|decoration|accent|caret|placeholder)-(?:border|ink|line|canvas|surface|sunken|primary|success|warning|danger|info|stage|scrim|on-ink)(?:-[a-z0-9]+)*(?:\/\d+)?(?=[\s"'`}]|$)/g,
      );
      const missing = [...new Set((unknown ?? []).map((s) => s.trim().replace(/^["'`{]+/, '')))].filter((cls) => {
        const token = cls.replace(/^([a-z-]+:)*/, '').replace(/^[a-z]+-/, '').replace(/\/\d+$/, '');
        return token && !definedColorTokens.has(token);
      });
      if (missing.length) {
        violations.push({
          file: relPath,
          line: lineNum,
          rule: 'UNKNOWN_COLOR_TOKEN (A2, A12)',
          message: `Token chưa khai báo trong @theme nên Tailwind không sinh CSS (${missing.join(', ')}); dùng token có thật hoặc khai báo mới trong globals.css.`,
          detail: trimmed
        });
      }
    }
  });
}

if (violations.length > 0) {
  console.error(`\x1b[31m[DESIGN LINT FAILED] Tìm thấy ${violations.length} lỗi vi phạm DESIGN.md v3.0 (Phần A):\x1b[0m\n`);
  for (const v of violations) {
    console.error(`  \x1b[33m${v.file}:${v.line}\x1b[0m - \x1b[31m[${v.rule}]\x1b[0m ${v.message}`);
    console.error(`    \x1b[90m${v.detail}\x1b[0m\n`);
  }
  process.exit(1);
} else {
  console.log('\x1b[32m[DESIGN LINT PASSED] Toàn bộ mã nguồn đạt 100% quy tắc DESIGN.md v3.0 Phần A.\x1b[0m');
  process.exit(0);
}
