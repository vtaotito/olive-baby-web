import { Page, expect } from '@playwright/test';

/**
 * Helper para autenticação nos testes
 */
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Realiza login com credenciais
   */
  async login(email: string, password: string) {
    await this.page.goto('/login');
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
    // Aguarda redirecionamento após login
    await this.page.waitForURL(/\/dashboard|\/onboarding/, { timeout: 10000 });
  }

  /**
   * Realiza registro de novo usuário
   */
  async register(userData: {
    fullName: string;
    email: string;
    cpf: string;
    password: string;
    confirmPassword: string;
  }) {
    await this.page.goto('/register');
    await this.page.fill('input[name="fullName"]', userData.fullName);
    await this.page.fill('input[name="email"]', userData.email);
    await this.page.fill('input[name="cpf"]', userData.cpf);
    await this.page.fill('input[name="password"]', userData.password);
    await this.page.fill('input[name="confirmPassword"]', userData.confirmPassword);
    await this.page.click('button[type="submit"]');
    // Aguarda redirecionamento após registro
    await this.page.waitForURL(/\/dashboard|\/onboarding/, { timeout: 10000 });
  }

  /**
   * Realiza logout
   */
  async logout() {
    // Procura pelo botão de logout (pode estar em menu dropdown)
    const logoutButton = this.page.locator('button:has-text("Sair"), a:has-text("Sair")').first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // Tenta abrir menu de usuário primeiro
      const userMenu = this.page.locator('[data-testid="user-menu"], button[aria-label*="menu"]').first();
      if (await userMenu.isVisible()) {
        await userMenu.click();
        await this.page.locator('button:has-text("Sair"), a:has-text("Sair")').first().click();
      }
    }
    await this.page.waitForURL('/login', { timeout: 5000 });
  }

  /**
   * Verifica se o usuário está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.page.evaluate(() => localStorage.getItem('token'));
    return !!token;
  }

  /**
   * Limpa autenticação (logout + limpa storage)
   */
  async clearAuth() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
}
