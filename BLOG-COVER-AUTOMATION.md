# 🎨 Sistema Automatizado de Capas para Blog (Olive Baby)

Novo fluxo simplificado e automatizado para gerar imagens de capa.

## Como Usar

### 1. Gerar Imagem
```bash
# 1. Gere a imagem usando a ferramenta de IA (Grok)
# Use o prompt gerado pelo sistema

# 2. Otimize a imagem
npm run optimize:cover
```

### 2. Deploy
```bash
git add public/images/blog/
git commit --trailer "Made-with: Cursor" -m "feat: adiciona e otimiza capa do post sobre amamentação"
git push
```

## URLs

**Imagem Otimizada:**
- **JPG**: https://oliecare.cloud/images/blog/capa-amamentacao-dicas.jpg
- **WebP**: https://oliecare.cloud/images/blog/capa-amamentacao-dicas.webp

## Scripts Criados

- `scripts/optimize-covers.mjs` - Otimiza imagens (1200x675, JPEG + WebP)
- `package.json` - Novos comandos (`npm run optimize:cover`)

## Vantagens

- Imagens otimizadas (menor tamanho, melhor performance)
- Suporte a WebP (formato moderno)
- Nomeação consistente
- Integração com pipeline de deploy

**O erro 404 foi resolvido com a otimização e nova build.**
