import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(process.cwd(), 'public', 'images', 'blog');

function generateOptimizedPrompt(title, content = '') {
  const fullContext = `${title}. ${content}`.substring(0, 280);
  
  return `Professional, warm and emotional blog cover image for maternal health article. 
Title: "${title}"
Theme: Breastfeeding, motherhood, newborn care, gentle parenting.

Visual style: Soft natural lighting, pastel color palette (warm cream, blush pink, sage green, beige), serene and empowering atmosphere. 
Show a loving young mother breastfeeding or holding her baby tenderly. Peaceful home environment with soft window light.

Text on image (elegant modern typography):
- Large title: "${title.toUpperCase()}"
- Subtitle: "Dicas Práticas para Mães"

High resolution, 16:9 aspect ratio (1200x675), cinematic photography style, heartwarming, hopeful and professional. 
Perfect for a parenting blog. Emotional connection, soft bokeh background.`;
}

async function generateImageWithPollinations(prompt, outputFilename) {
  const encodedPrompt = encodeURIComponent(prompt);
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=675&seed=42&nologo=true&enhance=true`;
  
  console.log('🌐 Gerando imagem via Pollinations.ai (gratuito)...');
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const outputPath = path.join(BLOG_DIR, outputFilename);
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✅ Imagem salva: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('❌ Erro ao gerar imagem:', error.message);
    throw error;
  }
}

async function optimizeImage(inputPath, baseName) {
  const jpegPath = path.join(BLOG_DIR, `${baseName}.jpg`);
  const webpPath = path.join(BLOG_DIR, `${baseName}.webp`);
  
  await sharp(inputPath)
    .resize(1200, 675, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 88, progressive: true })
    .toFile(jpegPath);
  
  await sharp(inputPath)
    .resize(1200, 675, { fit: 'cover', position: 'center' })
    .webp({ quality: 85 })
    .toFile(webpPath);
  
  console.log(`✨ Otimizada: ${baseName}.jpg + ${baseName}.webp`);
  return { jpegPath, webpPath };
}

async function main() {
  const title = process.argv[2];
  const content = process.argv[3] || '';
  
  if (!title) {
    console.error('\n❌ Uso: node scripts/generate-blog-cover.mjs "Título" "Resumo"');
    process.exit(1);
  }

  console.log('\n🎨 === GERADOR DE CAPA PARA BLOG (GRATUITO) ===\n');
  console.log(`📝 Título: ${title}`);
  
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
  }

  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const timestamp = Date.now();
  const filename = `post-${timestamp}-${slug}.png`;
  const baseName = `post-${timestamp}-${slug}`;

  const prompt = generateOptimizedPrompt(title, content);
  
  console.log('\n📋 Prompt gerado:');
  console.log('─'.repeat(60));
  console.log(prompt);
  console.log('─'.repeat(60));

  try {
    const imagePath = await generateImageWithPollinations(prompt, filename);
    await optimizeImage(imagePath, baseName);
    
    console.log('\n🎉 SUCESSO! Imagem gerada e otimizada.');
    console.log(`\n🔗 URL: https://oliecare.cloud/images/blog/${baseName}.jpg`);
    
  } catch (error) {
    console.error('\n❌ Falha:', error.message);
    process.exit(1);
  }
}

main();
