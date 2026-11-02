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
    placement: { topPct: 3.84, leftPct: 48.85, widthPct: 43.44, heightPct: 38.52 },
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
    placement: { topPct: 33.6, leftPct: 0.44, widthPct: 99.27, heightPct: 36.93 },
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
    placement: { topPct: 26.7, leftPct: 0, widthPct: 100, heightPct: 57.57 },
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
    placement: { topPct: 75.56, leftPct: 8.72, widthPct: 73.65, heightPct: 24.40 },
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
    placement: { topPct: 17.95, leftPct: 2.92, widthPct: 91.22, heightPct: 70.38 },
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
    placement: { topPct: 24.99, leftPct: 0, widthPct: 100, heightPct: 50.02 },
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
    placement: { topPct: 35.35, leftPct: 14.61, widthPct: 85.39, heightPct: 60.02 },
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
    placement: { topPct: 0.23, leftPct: 0.47, widthPct: 99.51, heightPct: 98.94 },
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
    placement: { topPct: 19.76, leftPct: 4.82, widthPct: 90.34, heightPct: 64.88 },
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
    placement: { topPct: 24.99, leftPct: 0, widthPct: 100, heightPct: 50.02 },
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

const STANDARD_WIDTHS = [640, 960, 1280, 1920, 2880, 3840];

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
  let sourceBuffer = masterFile;
  let sourceWidth = origW;

  // For alpha layers, trim transparent padding and compute precise bounding box
  if (spec.id !== 'a0-sky' && spec.id !== 'b0-backdrop') {
    try {
      const trimmedInfo = await sharp(masterFile)
        .trim()
        .toBuffer({ resolveWithObject: true });

      if (trimmedInfo.info.trimOffsetLeft !== undefined && trimmedInfo.info.width > 0) {
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

        sourceBuffer = trimmedInfo.data;
        sourceWidth = width;
      }
    } catch {
      // Fallback to spec.placement if trim info fails
    }
  }

  // Generate responsive variants up to spec.maxWidth
  const targetMax = Math.min(sourceWidth, spec.maxWidth);
  const variantWidths = Array.from(
    new Set([
      ...STANDARD_WIDTHS.filter((w) => w < targetMax),
      targetMax,
    ])
  ).sort((a, b) => a - b);

  const variants = [];

  for (const w of variantWidths) {
    const webpName = `${spec.id}-${w}.webp`;
    const avifName = `${spec.id}-${w}.avif`;
    const webpPath = path.join(outDir, webpName);
    const avifPath = path.join(outDir, avifName);

    await sharp(sourceBuffer)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile(webpPath);

    await sharp(sourceBuffer)
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

  const b0 = path.join(srcDir, 'b0-backdrop.png');
  if (fs.existsSync(b0)) {
    console.log('Generating b0m-backdrop.webp/avif (1920x1080) for mobile/reduced-motion...');
    const b0Buffer = await sharp(b0).resize(1920, 1080).toBuffer();
    await sharp(b0Buffer).webp({ quality: 80 }).toFile(path.join(outDir, 'b0m-backdrop-1920.webp'));
    await sharp(b0Buffer).avif({ quality: 75 }).toFile(path.join(outDir, 'b0m-backdrop-1920.avif'));
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
      console.log(
        `- [ĐÃ XỬ LÝ] ${spec.file} -> BoundingBox: ${result.placement.widthPct}%×${result.placement.heightPct}% @ (${result.placement.leftPct}%, ${result.placement.topPct}%) | Sinh ${result.variants.length} biến thể`
      );
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
