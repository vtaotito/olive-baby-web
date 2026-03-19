import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public');
const svgBuffer = readFileSync(resolve(publicDir, 'favicon.svg'));

const sizes = [
  { name: 'favicon-16.png', size: 16 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-72.png', size: 72 },
  { name: 'favicon-192.png', size: 192 },
  { name: 'favicon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const { name, size } of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(resolve(publicDir, name));
  console.log(`Generated ${name} (${size}x${size})`);
}

// OG Image (1200x630)
const ogSvg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f7f8f3"/>
      <stop offset="50%" style="stop-color:#ffffff"/>
      <stop offset="100%" style="stop-color:#e8ecd8"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#738251"/>
      <stop offset="100%" style="stop-color:#5a6940"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="590" width="1200" height="40" fill="url(#accent)"/>
  <circle cx="950" cy="315" r="200" fill="#738251" opacity="0.06"/>
  <circle cx="1050" cy="215" r="120" fill="#738251" opacity="0.04"/>
  <rect x="80" y="80" width="90" height="90" rx="22" fill="#738251"/>
  <path d="M125 105 C115 105 108 113 108 125 C108 137 115 145 125 145 C135 145 142 137 142 125 C142 113 135 105 125 105 Z M125 141 C117 141 112 136 112 125 C112 114 117 109 125 109 C133 109 138 114 138 125 C138 136 133 141 125 141 Z" fill="white" opacity="0.9" transform="translate(0,0)"/>
  <path d="M121 121 C119 121 118 123 118 125 C118 127 119 129 121 129 L129 129 C131 129 132 127 132 125 C132 123 131 121 129 121 Z M125 116 C124 116 123 117 123 118 L123 121 L127 121 L127 118 C127 117 126 116 125 116 Z M119 127 L118 131 C117 133 119 134 120 133 L123 131 L123 129 Z M131 127 L132 131 C133 133 131 134 130 133 L127 131 L127 129 Z" fill="white"/>
  <text x="190" y="145" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="700" fill="#2c2c2c">OlieCare</text>
  <text x="80" y="260" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="700" fill="#1a1a1a">Acompanhe a rotina</text>
  <text x="80" y="325" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="700" fill="#1a1a1a">do seu bebê com</text>
  <text x="80" y="390" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="700" fill="#738251">tranquilidade.</text>
  <text x="80" y="450" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#666666">Alimentação · Sono · Fraldas · Crescimento · Insights com IA</text>
  <rect x="80" y="490" width="220" height="56" rx="16" fill="#738251"/>
  <text x="130" y="526" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="white">Comece grátis</text>
  <text x="80" y="580" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#999999">oliecare.cloud</text>
</svg>`;

await sharp(Buffer.from(ogSvg))
  .resize(1200, 630)
  .png()
  .toFile(resolve(publicDir, 'og-image.png'));
console.log('Generated og-image.png (1200x630)');

console.log('\nAll icons generated successfully!');
