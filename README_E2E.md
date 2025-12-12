# 🧪 Testes E2E - Olive Baby

Este projeto utiliza [Playwright](https://playwright.dev) para testes end-to-end automatizados.

## 📋 Pré-requisitos

- Node.js 20+
- npm ou yarn

## 🚀 Instalação

```bash
# Instalar dependências
npm install

# Instalar navegadores do Playwright
npx playwright install
```

## 🧪 Executar Testes

```bash
# Executar todos os testes
npm run test:e2e

# Executar com interface gráfica
npm run test:e2e:ui

# Executar em modo headed (ver navegador)
npm run test:e2e:headed

# Executar em modo debug
npm run test:e2e:debug

# Executar testes específicos
npx playwright test e2e/auth.spec.ts

# Executar em navegador específico
npx playwright test --project=chromium
```

## 📁 Estrutura de Testes

```
e2e/
├── auth.spec.ts          # Testes de autenticação
├── onboarding.spec.ts    # Testes de onboarding
├── routines.spec.ts     # Testes de rotinas
├── dashboard.spec.ts    # Testes do dashboard
├── settings.spec.ts     # Testes de configurações
├── helpers/
│   ├── auth.ts          # Helper de autenticação
│   └── api.ts           # Helper de API
└── fixtures/
    └── test-data.ts     # Dados de teste
```

## ⚙️ Configuração

A configuração está em `playwright.config.ts`. Principais opções:

- **baseURL**: URL base da aplicação (padrão: `https://oliecare.cloud`)
- **projects**: Navegadores e dispositivos para testar
- **retries**: Número de tentativas em caso de falha

### Variáveis de Ambiente

```bash
# URL base para testes
E2E_BASE_URL=https://oliecare.cloud

# Executar em modo CI
CI=true
```

## 📊 Relatórios

Após executar os testes, os relatórios estarão disponíveis em:

- **HTML Report**: `playwright-report/index.html`
  ```bash
  npx playwright show-report
  ```

- **Test Results**: `test-results/`

## 🔧 Helpers Disponíveis

### AuthHelper

Helper para operações de autenticação:

```typescript
const authHelper = new AuthHelper(page);
await authHelper.login('email@teste.com', 'senha123');
await authHelper.register({ ... });
await authHelper.logout();
```

### ApiHelper

Helper para interações com API:

```typescript
const apiHelper = new ApiHelper(request);
await apiHelper.createTestUser({ ... });
const token = await apiHelper.login('email', 'senha');
```

## 📝 Escrevendo Novos Testes

1. Crie um arquivo `.spec.ts` em `e2e/`
2. Use os helpers e fixtures disponíveis
3. Siga o padrão de nomenclatura existente

Exemplo:

```typescript
import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';

test.describe('Minha Funcionalidade', () => {
  test('deve fazer algo', async ({ page }) => {
    await page.goto('/minha-pagina');
    await expect(page.locator('h1')).toContainText('Título');
  });
});
```

## 🐛 Debugging

### Modo Debug

```bash
npm run test:e2e:debug
```

### Screenshots e Vídeos

Screenshots são capturados automaticamente em falhas. Vídeos são mantidos apenas em falhas quando configurado.

### Trace Viewer

```bash
npx playwright show-trace trace.zip
```

## 🔄 CI/CD

Os testes são executados automaticamente via GitHub Actions em:

- Push para `main`, `master` ou `develop`
- Pull Requests
- Execução manual

Ver `.github/workflows/e2e.yml` para detalhes.

## 📚 Recursos

- [Documentação Playwright](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

## ⚠️ Notas Importantes

- Os testes criam dados reais na API. Em produção, considere usar um ambiente de teste separado.
- Alguns testes podem falhar se a estrutura do frontend mudar. Atualize os seletores conforme necessário.
- Os testes são otimizados para a estrutura atual do frontend. Se houver mudanças significativas, os testes precisarão ser atualizados.
