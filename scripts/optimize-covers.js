const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(process.cwd(), 'public', 'images', 'blog');
const DIST_DIR = path.join(process.cwd(), 'dist', 'images', 'blog');

async function optimizeCovers() {
  console.log('🖼️  Otimizando imagens de capa do blog...\n');

  if (!fs.existsSync(BLOG_DIR)) {
    console.error('❌ Diretório não encontrado:', BLOG_DIR);
    return;
  }

  const files = fs.readdirSync(BLOG_DIR).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  
  if (files.length === 0) {
    console.log('ℹ️  Nenhuma imagem encontrada.');
    return;
  }

  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  for (const file of files) {
    const inputPath = path.join(BLOG_DIR, file);
    const baseName = path.basename(file, path.extname(file));
    
    try {
      const stats = fs.statSync(inputPath);
      console.log(`📸 Processando: ${file} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`);

      const jpegPath = path.join(BLOG_DIR, `${baseName}.jpg`);
      await sharp(inputPath)
        .resize(1200, 675, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 88, progressive: true })
        .toFile(jpegPath);

      const webpPath = path.join(BLOG_DIR, `${baseName}.webp`);
      await sharp(inputPath)
        .resize(1200, 675, { fit: 'cover', position: 'center' })
        .webp({ quality: 85 })
        .toFile(webpPath);

      const distJpeg = path.join(DIST_DIR, `${baseName}.jpg`);
      await sharp(jpegPath).toFile(distJpeg);

      console.log(`✅ Concluído: ${baseName}.jpg + ${baseName}.webp`);
    } catch (err) {
      console.error(`❌ Erro com ${file}:`, err.message);
    }
  }

  console.log('\n🎉 Otimização finalizada!');
  console.log('📍 URL: https://oliecare.cloud/images/blog/post-1-dicas-amamentacao.jpg');
}

optimizeCovers().catch(console.error);
