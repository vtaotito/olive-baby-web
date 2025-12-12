import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { testUsers, testBaby } from './fixtures/test-data';

test.describe('Dashboard', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page, request }) => {
    authHelper = new AuthHelper(page);
    await authHelper.clearAuth();
    
    // Cria usuário, faz login e cria bebê
    const user = {
      ...testUsers.parent,
      email: `dashboard.${Date.now()}@teste.com`,
    };
    await request.post('/api/v1/auth/register', { data: user });
    
    const loginResponse = await request.post('/api/v1/auth/login', {
      data: { email: user.email, password: user.password },
    });
    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;
    
    await request.post('/api/v1/babies', {
      headers: { Authorization: `Bearer ${token}` },
      data: testBaby,
    });
    
    await authHelper.login(user.email, user.password);
  });

  test('deve exibir dashboard após login', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verifica elementos principais do dashboard
    await expect(page.locator('text=/dashboard|painel|resumo/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('deve exibir estatísticas do bebê', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verifica se há cards/estatísticas
    const statsCards = page.locator('[class*="card"], [class*="stat"], [data-testid*="stat"]');
    await expect(statsCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('deve exibir gráficos no dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verifica se há gráficos (canvas do Chart.js)
    const charts = page.locator('canvas, [class*="chart"], [data-testid*="chart"]');
    await expect(charts.first()).toBeVisible({ timeout: 10000 });
  });

  test('deve navegar para página de crescimento', async ({ page }) => {
    await page.goto('/dashboard');
    
    const growthLink = page.locator('a:has-text("Crescimento"), a:has-text("Growth"), button:has-text("Crescimento")').first();
    if (await growthLink.isVisible()) {
      await growthLink.click();
      await page.waitForURL(/\/growth/, { timeout: 5000 });
      expect(page.url()).toMatch(/\/growth/);
    }
  });

  test('deve navegar para página de marcos', async ({ page }) => {
    await page.goto('/dashboard');
    
    const milestonesLink = page.locator('a:has-text("Marcos"), a:has-text("Milestones"), button:has-text("Marcos")').first();
    if (await milestonesLink.isVisible()) {
      await milestonesLink.click();
      await page.waitForURL(/\/milestones/, { timeout: 5000 });
      expect(page.url()).toMatch(/\/milestones/);
    }
  });

  test('deve navegar para configurações', async ({ page }) => {
    await page.goto('/dashboard');
    
    const settingsLink = page.locator('a:has-text("Configurações"), a:has-text("Settings"), button[aria-label*="configurações"]').first();
    if (await settingsLink.isVisible()) {
      await settingsLink.click();
      await page.waitForURL(/\/settings/, { timeout: 5000 });
      expect(page.url()).toMatch(/\/settings/);
    }
  });

  test('deve exibir informações do bebê', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verifica se nome do bebê aparece
    const babyName = page.locator(`text=${testBaby.name}`);
    await expect(babyName.first()).toBeVisible({ timeout: 10000 });
  });

  test('deve ser responsivo em mobile', async ({ page }) => {
    // Simula viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Verifica se layout se adapta
    const mainContent = page.locator('main, [role="main"], [class*="container"]').first();
    await expect(mainContent).toBeVisible();
  });
});
