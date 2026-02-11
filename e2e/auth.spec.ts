import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { testUsers } from './fixtures/test-data';

test.describe('Autenticação', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.clearAuth();
  });

  test('deve exibir página de login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1, h2')).toContainText(/login|entrar|bem-vindo|admin console/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[placeholder="••••••••"]')).toBeVisible();
  });

  test('deve exibir página de registro', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h1, h2')).toContainText(/registro|cadastro|criar conta/i);
    await expect(page.locator('input[name="fullName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="cpf"]')).toBeVisible();
  });

  test('deve validar campos obrigatórios no login', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    
    // Verifica mensagens de erro (Email inválido ou Senha é obrigatória)
    const errorMessages = page.locator('text=/obrigatório|required|preencha|inválido|senha/i');
    await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });
  });

  test('deve validar formato de email no login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'email-invalido');
    await page.fill('input[type="password"]', 'senha123');
    await page.click('button[type="submit"]');
    
    // Verifica mensagem de erro de email inválido
    const errorMessage = page.locator('text=/email|inválido|válido/i');
    await expect(errorMessage.first()).toBeVisible();
  });

  test('deve fazer login com credenciais válidas', async ({ page, request }) => {
    // Cria usuário de teste via API
    const user = testUsers.parent;
    const registerResponse = await request.post('/api/v1/auth/register', {
      data: user,
    });
    expect(registerResponse.ok()).toBeTruthy();

    // Faz login via UI
    await authHelper.login(user.email, user.password);
    
    // Verifica redirecionamento
    const url = page.url();
    expect(url).toMatch(/\/dashboard|\/onboarding/);
    
    // Verifica se token foi salvo
    const isAuthenticated = await authHelper.isAuthenticated();
    expect(isAuthenticated).toBeTruthy();
  });

  test('deve exibir erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'naoexiste@teste.com');
    await page.fill('input[type="password"]', 'senhaerrada');
    await page.click('button[type="submit"]');
    
    // Aguarda mensagem de erro
    const errorMessage = page.locator('text=/credenciais|inválidas|incorretas|erro/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });

  test('deve fazer registro de novo usuário', async ({ page }) => {
    const user = {
      ...testUsers.parent,
      email: `novo.${Date.now()}@teste.com`,
    };

    await authHelper.register(user);
    
    // Verifica redirecionamento após registro
    const url = page.url();
    expect(url).toMatch(/\/dashboard|\/onboarding/);
    
    // Verifica se token foi salvo
    const isAuthenticated = await authHelper.isAuthenticated();
    expect(isAuthenticated).toBeTruthy();
  });

  test('deve validar senha no registro', async ({ page }) => {
    await page.goto('/register');
    const user = testUsers.parent;
    
    await page.fill('input[name="fullName"]', user.fullName);
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="cpf"]', user.cpf);
    await page.fill('input[name="password"]', '123'); // Senha muito curta
    await page.fill('input[name="confirmPassword"]', '123');
    await page.click('button[type="submit"]');
    
    // Verifica mensagem de erro de senha
    const errorMessage = page.locator('text=/senha|password|mínimo|8/i');
    await expect(errorMessage.first()).toBeVisible();
  });

  test('deve validar confirmação de senha', async ({ page }) => {
    await page.goto('/register');
    const user = testUsers.parent;
    
    await page.fill('input[name="fullName"]', user.fullName);
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="cpf"]', user.cpf);
    await page.fill('input[name="password"]', user.password);
    await page.fill('input[name="confirmPassword"]', 'senhadiferente');
    await page.click('button[type="submit"]');
    
    // Verifica mensagem de erro de confirmação
    const errorMessage = page.locator('text=/confirmação|não confere|diferente/i');
    await expect(errorMessage.first()).toBeVisible();
  });

  test('deve fazer logout', async ({ page, request }) => {
    // Cria e faz login
    const user = testUsers.parent;
    await request.post('/api/v1/auth/register', { data: user });
    await authHelper.login(user.email, user.password);
    
    // Verifica que está autenticado
    expect(await authHelper.isAuthenticated()).toBeTruthy();
    
    // Faz logout
    await authHelper.logout();
    
    // Verifica redirecionamento para login
    expect(page.url()).toMatch(/\/login/);
    
    // Verifica que token foi removido
    expect(await authHelper.isAuthenticated()).toBeFalsy();
  });
});
