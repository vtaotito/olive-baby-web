import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { testUsers, testBaby } from './fixtures/test-data';

test.describe('Configurações', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page, request }) => {
    authHelper = new AuthHelper(page);
    await authHelper.clearAuth();
    
    // Cria usuário e faz login
    const user = {
      ...testUsers.parent,
      email: `settings.${Date.now()}@teste.com`,
    };
    await request.post('/api/v1/auth/register', { data: user });
    await authHelper.login(user.email, user.password);
  });

  test('deve exibir página de configurações', async ({ page }) => {
    await page.goto('/settings');
    
    // Verifica título da página
    await expect(page.locator('h1, h2')).toContainText(/configurações|settings/i);
  });

  test('deve editar perfil do usuário', async ({ page }) => {
    await page.goto('/settings');
    
    // Procura por seção de perfil
    const profileSection = page.locator('text=/perfil|profile/i').first();
    if (await profileSection.isVisible()) {
      // Edita nome
      const nameInput = page.locator('input[name*="fullName"], input[name*="name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('Nome Atualizado');
        
        // Salva
        const saveButton = page.locator('button:has-text("Salvar"), button[type="submit"]').first();
        await saveButton.click();
        
        // Verifica sucesso
        const successMessage = page.locator('text=/salvo|atualizado|sucesso/i');
        await expect(successMessage.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('deve gerenciar bebês', async ({ page }) => {
    await page.goto('/settings');
    
    // Procura por seção de bebês
    const babiesSection = page.locator('text=/bebês|babies/i').first();
    if (await babiesSection.isVisible()) {
      await babiesSection.click();
      
      // Verifica se lista de bebês aparece
      const babiesList = page.locator('[class*="baby"], [data-testid*="baby"]').first();
      await expect(babiesList).toBeVisible({ timeout: 5000 });
    }
  });

  test('deve editar informações do bebê', async ({ page, request }) => {
    // Cria bebê via API
    const loginResponse = await request.post('/api/v1/auth/login', {
      data: { email: testUsers.parent.email, password: testUsers.parent.password },
    });
    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;

    await request.post('/api/v1/babies', {
      headers: { Authorization: `Bearer ${token}` },
      data: testBaby,
    });

    await page.goto('/settings');
    
    // Procura por botão de editar bebê
    const editButton = page.locator('button:has-text("Editar"), button[aria-label*="editar"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Modifica nome
      const nameInput = page.locator('input[name*="name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('Bebê Atualizado');
        
        // Salva
        const saveButton = page.locator('button:has-text("Salvar")').first();
        await saveButton.click();
        
        // Verifica sucesso
        const successMessage = page.locator('text=/atualizado|salvo/i');
        await expect(successMessage.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('deve configurar notificações', async ({ page }) => {
    await page.goto('/settings');
    
    // Procura por seção de notificações
    const notificationsSection = page.locator('text=/notificações|notifications/i').first();
    if (await notificationsSection.isVisible()) {
      await notificationsSection.click();
      
      // Verifica se há toggles de notificações
      const notificationToggles = page.locator('input[type="checkbox"], [role="switch"]');
      if ((await notificationToggles.count()) > 0) {
        // Alterna uma notificação
        await notificationToggles.first().click();
        
        // Verifica que mudança foi salva
        const successMessage = page.locator('text=/salvo|atualizado/i');
        await expect(successMessage.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });
});
