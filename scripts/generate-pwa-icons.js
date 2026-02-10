/**
 * PWA Icon Generator Script
 * 
 * Gera os ícones PWA necessários a partir do favicon.svg
 * 
 * Uso: node scripts/generate-pwa-icons.js
 * 
 * Se não tiver canvas/sharp instalado, use uma ferramenta online:
 * 1. Acesse https://realfavicongenerator.net/
 * 2. Faça upload do favicon.svg
 * 3. Baixe o pacote e coloque os arquivos na pasta public/
 * 
 * Arquivos necessários na pasta public/:
 * - favicon.svg        (já existe)
 * - favicon-16.png     (16x16)
 * - favicon-32.png     (32x32)
 * - favicon-192.png    (192x192)
 * - favicon-512.png    (512x512)
 * - apple-touch-icon.png (180x180)
 * - masked-icon.svg    (monochrome SVG for Safari)
 */

// Para gerar via script, instale: npm install sharp
// Descomente o código abaixo após instalar:

/*
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = resolve(__dirname, '../public/favicon.svg');
const svgBuffer = readFileSync(svgPath);
const outputDir = resolve(__dirname, '../public');

const sizes = [
  { name: 'favicon-16.png', size: 16 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-192.png', size: 192 },
  { name: 'favicon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generate() {
  for (const { name, size } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(resolve(outputDir, name));
    console.log(`Generated: ${name} (${size}x${size})`);
  }
  console.log('Done! All PWA icons generated.');
}

generate().catch(console.error);
*/

console.log(`
╔══════════════════════════════════════════════════════════════╗
║              OlieCare PWA Icon Generator                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Para gerar os ícones PWA, você tem duas opções:            ║
║                                                              ║
║  OPÇÃO 1 - Online (recomendado):                            ║
║  1. Acesse https://realfavicongenerator.net/                ║
║  2. Upload o arquivo public/favicon.svg                     ║
║  3. Configure as cores:                                      ║
║     - Theme color: #738251                                   ║
║     - Background: #f7f8f3                                    ║
║  4. Baixe o pacote e extraia em public/                     ║
║  5. Renomeie conforme necessário:                           ║
║     - android-chrome-192x192.png → favicon-192.png          ║
║     - android-chrome-512x512.png → favicon-512.png          ║
║                                                              ║
║  OPÇÃO 2 - Via script:                                      ║
║  1. npm install sharp                                        ║
║  2. Descomente o código neste script                        ║
║  3. node scripts/generate-pwa-icons.js                      ║
║                                                              ║
║  Arquivos necessários em public/:                           ║
║  ✓ favicon.svg          (já existe)                         ║
║  □ favicon-16.png       (16x16)                             ║
║  □ favicon-32.png       (32x32)                             ║
║  □ favicon-192.png      (192x192)                           ║
║  □ favicon-512.png      (512x512)                           ║
║  □ apple-touch-icon.png (180x180)                           ║
║  ✓ masked-icon.svg      (vai ser gerado abaixo)            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
