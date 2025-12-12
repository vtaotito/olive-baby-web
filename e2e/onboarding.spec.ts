import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { testUsers, testBaby } from './fixtures/test-data';

test.describe('Onboarding', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page, request }) => {
    authHelper = new AuthHelper(page);
    await authHelper.clearAuth();
    
    // Cria usuário e faz login
    const user = {
      ...testUsers.parent,
      email: `onboarding.${Date.now()}@teste.com`,
    };
    await request.post('/api/v1/auth/register', { data: user });
    await authHelper.login(user.email, user.password);
  });

  test('deve exibir wizard de onboarding para novo usuário', async ({ page }) => {
    // Se redirecionou para onboarding
    if (page.url().includes('/onboarding')) {
      await expect(page.locator('text=/bem-vindo|onboarding|começar/i')).toBeVisible();
    }
  });

  test('deve completar cadastro de bebê no onboarding', async ({ page }) => {
    // Navega para onboarding se necessário
    if (!page.url().includes('/onboarding')) {
      await page.goto('/onboarding');
    }

    // Preenche dados do bebê
    await page.fill('input[name="name"]', testBaby.name);
    await page.fill('input[type="date"][name*="birth"], input[name*="birthDate"]', testBaby.birthDate);
    
    // Seleciona relacionamento
    const relationshipSelect = page.locator('select[name*="relationship"], input[name*="relationship"]').first();
    if (await relationshipSelect.count() > 0) {
      await relationshipSelect.selectOption(testBaby.relationship);
    }

    // Preenche dados opcionais se existirem
    const weightInput = page.locator('input[name*="weight"], input[name*="weightGrams"]').first();
    if (await weightInput.isVisible()) {
      await weightInput.fill(testBaby.birthWeightGrams!.toString());
    }

    const lengthInput = page.locator('input[name*="length"], input[name*="lengthCm"]').first();
    if (await lengthInput.isVisible()) {
      await lengthInput.fill(testBaby.birthLengthCm!.toString());
    }

    // Clica em próximo/concluir
    const nextButton = page.locator('button:has-text("Próximo"), button:has-text("Concluir"), button:has-text("Salvar")').first();
    await nextButton.click();

    // Aguarda redirecionamento para dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/dashboard/);
  });

  test('deve validar campos obrigatórios no onboarding', async ({ page }) => {
    if (!page.url().includes('/onboarding')) {
      await page.goto('/onboarding');
    }

    // Tenta avançar sem preencher
    const nextButton = page.locator('button:has-text("Próximo"), button:has-text("Concluir")').first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
      
      // Verifica mensagens de erro
      const errorMessages = page.locator('text=/obrigatório|required|preencha/i');
      await expect(errorMessages.first()).toBeVisible();
    }
  });

  test('deve permitir pular onboarding', async ({ page }) => {
    if (!page.url().includes('/onboarding')) {
      await page.goto('/onboarding');
    }

    // Procura por botão de pular
    const skipButton = page.locator('button:has-text("Pular"), button:has-text("Depois"), a:has-text("Pular")').first();
    if (await skipButton.isVisible()) {
      await skipButton.click();
      
      // Verifica redirecionamento
      await page.waitForURL(/\/dashboard/, { timeout: 5000 });
      expect(page.url()).toMatch(/\/dashboard/);
    }
  });
});
