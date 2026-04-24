import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const brandDir = path.join(projectRoot, 'public', 'brand');
const pngDir = path.join(brandDir, 'png');

console.log('Gerando assets PNG da OlieCare...');
console.log('Pasta de origem:', brandDir);
console.log('Pasta de destino:', pngDir);

if (!fs.existsSync(brandDir)) {
  console.error('ERRO: public/brand nao existe! Criando...');
  fs.mkdirSync(brandDir, { recursive: true });
}

if (!fs.existsSync(pngDir)) {
  fs.mkdirSync(pngDir, { recursive: true });
  console.log('Pasta PNG criada.');
}

const sizes = [16, 32, 48, 64, 128, 180, 192, 256, 512];
const sources = [
  { 
    name: 'oliecare-logo-icon', 
    input: path.join(brandDir, 'oliecare-logo-icon.svg'),
    isIcon: true 
  },
  { 
    name: 'oliecare-logo-mark', 
    input: path.join(brandDir, 'oliecare-logo-mark.svg'),
    isIcon: true 
  },
  { 
    name: 'oliecare-logo-horizontal', 
    input: path.join(brandDir, 'oliecare-logo-horizontal.svg'),
    isIcon: false 
  }
];

async function generatePNGs() {
  for (const source of sources) {
    if (!fs.existsSync(source.input)) {
      console.error('SVG nao encontrado:', source.input);
      continue;
    }
    
    console.log('\nGerando PNGs para:', source.name);
    
    for (const size of sizes) {
      const outputPath = path.join(pngDir, `${source.name}-${size}.png`);
      
      try {
        let pipeline = sharp(source.input, { density: 300 });
        
        if (source.isIcon) {
          pipeline = pipeline.resize(size, size, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          });
        } else {
          const height = Math.round(size * 0.29);
          pipeline = pipeline.resize(size, height, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          });
        }
        
        await pipeline.png({ 
          quality: 95,
          compressionLevel: 9 
        }).toFile(outputPath);
        
        console.log('  OK', size + 'px ->', source.name + '-' + size + '.png');
      } catch (error) {
        console.error('  ERRO', size + 'px para', source.name, ':', error.message);
      }
    }
  }

  try {
    const faviconSource = path.join(pngDir, 'oliecare-logo-icon-32.png');
    if (fs.existsSync(faviconSource)) {
      await sharp(faviconSource).toFile(path.join(pngDir, 'favicon.ico'));
      console.log('\nOK favicon.ico gerado');
    }
  } catch (e) {
    console.log('Aviso: favicon.ico nao gerado:', e.message);
  }

  console.log('\nTodos os PNGs foram gerados com sucesso em public/brand/png/!');
  console.log('Tamanhos:', sizes.join(', '));
}

generatePNGs().catch(console.error);
