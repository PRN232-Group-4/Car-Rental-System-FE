import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'assets-src', 'landing');
const outDir = path.join(rootDir, 'public', 'assets', 'landing');
const manifestPath = path.join(outDir, 'manifest.json');
const libManifestPath = path.join(rootDir, 'src', 'features', 'landing', 'data', 'manifest.json');

// Table 11.4 and Section 14.3 Specification
export const LAYER_SPECS = [
  // Scene A (Hero & Outro)
  {
    id: 'a0-sky',
    file: 'a0-sky.png',
    scene: 'A',
    z: 10,
    speed: 0.02,
    blend: 'normal',
    loading: 'eager',
    fetchPriority: 'high',
    maxWidth: 2880,
    placement: { topPct: 0, leftPct: 0, widthPct: 100, heightPct: 100 },
  },
  {
    id: 'a1-sun',
    file: 'a1-sun.png',
    scene: 'A',
    z: 15,
    speed: 0.05,
    blend: 'normal',
    loading: 'eager',
    maxWidth: 1800,
    placement: { topPct: 18, leftPct: 35, widthPct: 30, heightPct: 30 },
  },
  {
    id: 'a2-far-mountains',
    file: 'a2-far-mountains.png',
    scene: 'A',
    z: 18,
    speed: 0.08,
    blend: 'normal',
    loading: 'eager',
    maxWidth: 3840,
    placement: { topPct: 36, leftPct: 0, widthPct: 100, heightPct: 28 },
  },
  {
    id: 'a3-mid-pines',
    file: 'a3-mid-pines.png',
    scene: 'A',
    z: 20,
    speed: 0.20,
    blend: 'normal',
    loading: 'eager',
    maxWidth: 3840,
    placement: { topPct: 44, leftPct: 0, widthPct: 100, heightPct: 30 },
  },
  {
    id: 'a4-road',
    file: 'a4-road.png',
    scene: 'A',
    z: 40,
    speed: 0.30,
    blend: 'normal',
    loading: 'lazy',
    maxWidth: 3840,
    placement: { topPct: 58, leftPct: 0, widthPct: 100, heightPct: 42 },
  },
  {
    id: 'a4-car',
    file: 'a4-car.png',
    scene: 'A',
    z: 41,
    speed: 0.35,
    blend: 'normal',
    loading: 'lazy',
    maxWidth: 2000,
    placement: { topPct: 50, leftPct: 30, widthPct: 40, heightPct: 28 },
  },
  {
    id: 'a5-mist',
    file: 'a5-mist.png',
    scene: 'A',
    z: 45,
    speed: 0.40,
    blend: 'screen',
    loading: 'lazy',
    maxWidth: 2880,
    placement: { topPct: 60, leftPct: 0, widthPct: 100, heightPct: 30 },
  },
  {
    id: 'a6-fg-branch',
    file: 'a6-fg-branch.png',
    scene: 'A',
    z: 50,
    speed: 0.45,
    blend: 'normal',
    loading: 'lazy',
    maxWidth: 1600,
    placement: { topPct: 65, leftPct: 65, widthPct: 35, heightPct: 35 },
  },
  {
    id: 'a7-dust',
    file: 'a7-dust.png',
    scene: 'A',
    z: 55,
    speed: 0.05,
    blend: 'screen',
    loading: 'lazy',
    maxWidth: 2880,
    placement: { topPct: 0, leftPct: 0, widthPct: 100, heightPct: 100 },
  },

  // Scene B (Chapters 2 & 3)
  {
    id: 'b0-backdrop',
    file: 'b0-backdrop.png',
    scene: 'B',
    z: 10,
    speed: 0.08,
    blend: 'normal',
    loading: 'lazy',
    maxWidth: 3840,
    placement: { topPct: 0, leftPct: 0, widthPct: 100, heightPct: 100 },
  },
  {
    id: 'b3-cliff-road',
    file: 'b3-cliff-road.png',
    scene: 'B',
    z: 20,
    speed: 0.25,
    blend: 'normal',
    loading: 'lazy',
    maxWidth: 3840,
    placement: { topPct: 40, leftPct: 0, widthPct: 100, heightPct: 60 },
  },
  {
    id: 'b4-car',
    file: 'b4-car.png',
    scene: 'B',
    z: 40,
    speed: 0.30,
    blend: 'normal',
    loading: 'lazy',
    maxWidth: 2000,
    placement: { topPct: 52, leftPct: 32, widthPct: 36, heightPct: 26 },
  },
  {
    id: 'b5-mist',
    file: 'b5-mist.png',
    scene: 'B',
    z: 45,
    speed: 0.35,
    blend: 'screen',
    loading: 'lazy',
    maxWidth: 2880,
    placement: { topPct: 50, leftPct: 0, widthPct: 100, heightPct: 40 },
  },
  {
    id: 'b6-fg-rocks',
    file: 'b6-fg-rocks.png',
    scene: 'B',
    z: 50,
    speed: 0.45,
    blend: 'normal',
    loading: 'lazy',
    maxWidth: 2400,
    placement: { topPct: 60, leftPct: 0, widthPct: 40, heightPct: 40 },
  },

  // Scene C (Chapter 4 - Trust)
  {
    id: 'c4-trust-car',
    file: 'c4-trust-car.png',
    scene: 'C',
    z: 20,
    speed: 0,
    blend: 'normal',
    loading: 'lazy',
    maxWidth: 2000,
    placement: { topPct: 15, leftPct: 10, widthPct: 80, heightPct: 70 },
  },
];

const TARGET_WIDTHS = [1280, 1920, 2880, 3840];

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function processLayer(spec) {
  const masterFile = path.join(srcDir, spec.file);
  const exists = fs.existsSync(masterFile);

  if (!exists) {
    return {
      ...spec,
      isPlaceholder: true,
      variants: [],
    };
  }

  const image = sharp(masterFile);
  const metadata = await image.metadata();
  const origW = metadata.width || 3840;
  const origH = metadata.height || 2160;

  let placement = { ...spec.placement };

  // For alpha layers, compute bounding box to trim and record placement
  if (spec.blend !== 'screen' && spec.id !== 'a0-sky' && spec.id !== 'b0-backdrop') {
    try {
      const trimmedInfo = await sharp(masterFile)
        .trim()
        .toBuffer({ resolveWithObject: true });

      if (trimmedInfo.info.trimOffsetLeft !== undefined) {
        const left = -trimmedInfo.info.trimOffsetLeft;
        const top = -trimmedInfo.info.trimOffsetTop;
        const width = trimmedInfo.info.width;
        const height = trimmedInfo.info.height;

        placement = {
          leftPct: Number(((left / origW) * 100).toFixed(2)),
          topPct: Number(((top / origH) * 100).toFixed(2)),
          widthPct: Number(((width / origW) * 100).toFixed(2)),
          heightPct: Number(((height / origH) * 100).toFixed(2)),
        };
      }
    } catch {
      // Fallback to spec.placement if trim info fails
    }
  }

  // Generate responsive variants up to spec.maxWidth
  const variants = [];
  const validWidths = TARGET_WIDTHS.filter((w) => w <= spec.maxWidth || w === 1280);

  for (const w of validWidths) {
    const webpName = `${spec.id}-${w}.webp`;
    const avifName = `${spec.id}-${w}.avif`;
    const webpPath = path.join(outDir, webpName);
    const avifPath = path.join(outDir, avifName);

    await sharp(masterFile)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile(webpPath);

    await sharp(masterFile)
      .resize({ width: w, withoutEnlargement: true })
      .avif({ quality: 75, effort: 4 })
      .toFile(avifPath);

    variants.push({ width: w, webp: `/assets/landing/${webpName}`, avif: `/assets/landing/${avifName}` });
  }

  return {
    ...spec,
    isPlaceholder: false,
    placement,
    variants,
  };
}

async function buildCompositeBackdrop() {
  const a0 = path.join(srcDir, 'a0-sky.png');
  const a1 = path.join(srcDir, 'a1-sun.png');
  const a2 = path.join(srcDir, 'a2-far-mountains.png');

  if (fs.existsSync(a0) && fs.existsSync(a1) && fs.existsSync(a2)) {
    console.log('Generating a0m-backdrop.webp/avif (1920x1080) for mobile/reduced-motion...');
    const compositeBuffer = await sharp(a0)
      .resize(1920, 1080)
      .composite([
        { input: await sharp(a1).resize(1920, 1080).toBuffer(), blend: 'over' },
        { input: await sharp(a2).resize(1920, 1080).toBuffer(), blend: 'over' },
      ])
      .toBuffer();

    await sharp(compositeBuffer).webp({ quality: 80 }).toFile(path.join(outDir, 'a0m-backdrop-1920.webp'));
    await sharp(compositeBuffer).avif({ quality: 75 }).toFile(path.join(outDir, 'a0m-backdrop-1920.avif'));
  }
}

async function main() {
  console.log('=== BUILD LANDING ASSETS PIPELINE (Bản 3.2 Sharp) ===');
  await ensureDir(srcDir);
  await ensureDir(outDir);
  await ensureDir(path.dirname(libManifestPath));

  await buildCompositeBackdrop();

  const manifestLayers = [];
  let missingCount = 0;

  for (const spec of LAYER_SPECS) {
    const result = await processLayer(spec);
    manifestLayers.push(result);
    if (result.isPlaceholder) {
      missingCount += 1;
      console.log(`- [CHƯA CÓ MASTER] ${spec.file} -> Ghi nhận Placeholder: [THIẾU ASSET: ${spec.file}]`);
    } else {
      console.log(`- [ĐÃ XỬ LÝ] ${spec.file} -> Sinh ${result.variants.length} biến thể AVIF/WebP`);
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    totalLayers: manifestLayers.length,
    missingCount,
    layers: manifestLayers,
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  fs.writeFileSync(libManifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log(`\nManifest đã lưu: ${manifestPath}`);
  console.log(`Tổng lớp: ${manifestLayers.length} | Thiếu asset: ${missingCount}`);
  console.log('========================================================\n');
}

main().catch((err) => {
  console.error('Lỗi build landing assets:', err);
  process.exit(1);
});
