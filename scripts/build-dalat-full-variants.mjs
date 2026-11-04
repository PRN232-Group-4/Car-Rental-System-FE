import sharp from 'sharp';
import path from 'node:path';

async function genDalatVariants() {
  const src = path.join('assets-src', 'landing', 'scene-a-dalat-full.png');
  const outDir = path.join('public', 'assets', 'landing');
  const widths = [640, 960, 1280, 1920, 2880, 3840];
  for (const w of widths) {
    const webp = path.join(outDir, `scene-a-dalat-full-${w}.webp`);
    const avif = path.join(outDir, `scene-a-dalat-full-${w}.avif`);
    console.log(`Generating width ${w}...`);
    await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 82 }).toFile(webp);
    await sharp(src).resize({ width: w, withoutEnlargement: true }).avif({ quality: 75 }).toFile(avif);
  }
  console.log('Done generating scene-a-dalat-full variants!');
}

genDalatVariants().catch(console.error);
