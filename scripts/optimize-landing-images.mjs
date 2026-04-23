import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ASSETS_DIR = path.join(process.cwd(), 'public', 'assets');

const IMAGE_CONFIG = {
  'hero-mother-baby-app.jpg': { widths: [640, 1024, 1920], quality: 80 },
  'tired-mom-relieved-app.jpg': { widths: [480, 856, 1024], quality: 80 },
  'family-sharing-app.jpg':    { widths: [480, 856, 1024], quality: 80 },
  'baby-sleeping-hand.jpg':    { widths: [480, 768, 1024], quality: 80 },
  'app-dashboard-mockup.png':  { widths: [480, 642, 768],  quality: 82 },
  'app-feeding-mockup.png':    { widths: [480, 642, 768],  quality: 82 },
  'app-sleep-chart-mockup.png':{ widths: [480, 642, 768],  quality: 82 },
};

async function optimizeLandingImages() {
  console.log('Otimizando imagens da landing page...\n');

  if (!fs.existsSync(ASSETS_DIR)) {
    console.error('Diretorio nao encontrado:', ASSETS_DIR);
    process.exit(1);
  }

  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const [filename, config] of Object.entries(IMAGE_CONFIG)) {
    const inputPath = path.join(ASSETS_DIR, filename);
    if (!fs.existsSync(inputPath)) {
      console.warn(`SKIP: ${filename} nao encontrado`);
      continue;
    }

    const originalSize = fs.statSync(inputPath).size;
    totalOriginal += originalSize;
    const baseName = path.basename(filename, path.extname(filename));

    console.log(`Processing: ${filename} (${(originalSize / 1024).toFixed(0)} KB)`);

    for (const width of config.widths) {
      const webpOut = path.join(ASSETS_DIR, `${baseName}-${width}w.webp`);

      const info = await sharp(inputPath)
        .resize(width, null, { withoutEnlargement: true })
        .webp({ quality: config.quality, effort: 6 })
        .toFile(webpOut);

      totalOptimized += info.size;
      console.log(`  -> ${baseName}-${width}w.webp (${(info.size / 1024).toFixed(0)} KB)`);
    }

    const fallbackWebp = path.join(ASSETS_DIR, `${baseName}.webp`);
    const largestWidth = config.widths[config.widths.length - 1];
    const fallbackInfo = await sharp(inputPath)
      .resize(largestWidth, null, { withoutEnlargement: true })
      .webp({ quality: config.quality, effort: 6 })
      .toFile(fallbackWebp);

    totalOptimized += fallbackInfo.size;
    console.log(`  -> ${baseName}.webp fallback (${(fallbackInfo.size / 1024).toFixed(0)} KB)\n`);
  }

  console.log('='.repeat(50));
  console.log(`Original total:  ${(totalOriginal / 1024).toFixed(0)} KB`);
  console.log(`Optimized total: ${(totalOptimized / 1024).toFixed(0)} KB`);
  console.log(`Savings:         ${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));
  console.log('\nDone! Commit the new .webp files in public/assets/');
}

optimizeLandingImages().catch(console.error);
