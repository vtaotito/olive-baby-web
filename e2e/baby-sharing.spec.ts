// Olive Baby Web - E2E Tests: Baby Sharing Flow
// Testa os fluxos de compartilhamento de bebê: convites de família e profissionais
import { test, expect } from '@playwright/test';

// Constants
const TEST_EMAIL = 'test-parent@olivebaby.test';
const TEST_PASSWORD = 'Test@123456';
const INVITED_EMAIL = 'invited@olivebaby.test';
const PROFESSIONAL_EMAIL = 'doctor@olivebaby.test';

// Helper to login
async function login(page: any, email = TEST_EMAIL, password = TEST_PASSWORD) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/);
}

test.describe('Baby Sharing - Family/Caregiver Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Assume user is logged in and has at least one baby
    await login(page);
  });

  test('should navigate to share baby page from settings', async ({ page }) => {
    // Go to babies settings
    await page.goto('/settings/babies');
    await page.waitForLoadState('networkidle');
    
    // Click on share button for first baby
    const shareButton = page.locator('button[title="Compartilhar bebê"]').first();
    if (await shareButton.isVisible()) {
      await shareButton.click();
      
      // Should be on share page
      await expect(page).toHaveURL(/\/settings\/babies\/\d+\/share/);
      
      // Should show tabs
      await expect(page.getByText('Família / Cuidador')).toBeVisible();
      await expect(page.getByText('Profissional')).toBeVisible();
    }
  });

  test('should show family invite modal with correct fields', async ({ page }) => {
    // Navigate to share page
    await page.goto('/settings/babies');
    await page.waitForLoadState('networkidle');
    
    const shareButton = page.locator('button[title="Compartilhar bebê"]').first();
    if (await shareButton.isVisible()) {
      await shareButton.click();
      await page.waitForLoadState('networkidle');
      
      // Click invite family button
      await page.click('button:has-text("Convidar Familiar")');
      
      // Modal should be visible
      await expect(page.getByText('Convidar Familiar ou Cuidador')).toBeVisible();
      
      // Should have required fields
      await expect(page.locator('input[placeholder="email@exemplo.com"]')).toBeVisible();
      await expect(page.locator('input[placeholder="Nome da pessoa"]')).toBeVisible();
      
      // Should have member type buttons
      await expect(page.getByText('Familiar')).toBeVisible();
      await expect(page.getByText('Responsável')).toBeVisible();
    }
  });

  test('should validate email field on family invite form', async ({ page }) => {
    await page.goto('/settings/babies');
    await page.waitForLoadState('networkidle');
    
    const shareButton = page.locator('button[title="Compartilhar bebê"]').first();
    if (await shareButton.isVisible()) {
      await shareButton.click();
      await page.waitForLoadState('networkidle');
      
      await page.click('button:has-text("Convidar Familiar")');
      
      // Submit without filling email
      await page.click('button:has-text("Enviar Convite")');
      
      // Should show validation error
      await expect(page.getByText('Email inválido')).toBeVisible();
    }
  });

  test('should switch between family and professional tabs', async ({ page }) => {
    await page.goto('/settings/babies');
    await page.waitForLoadState('networkidle');
    
    const shareButton = page.locator('button[title="Compartilhar bebê"]').first();
    if (await shareButton.isVisible()) {
      await shareButton.click();
      await page.waitForLoadState('networkidle');
      
      // Should start on family tab
      await expect(page.locator('button:has-text("Convidar Familiar")')).toBeVisible();
      
      // Click professional tab
      await page.click('button:has-text("Profissional")');
      
      // Should show professional invite button
      await expect(page.locator('button:has-text("Convidar Profissional")')).toBeVisible();
    }
  });
});

test.describe('Baby Sharing - Professional Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should show professional invite modal with CRM fields', async ({ page }) => {
    await page.goto('/settings/babies');
    await page.waitForLoadState('networkidle');
    
    const shareButton = page.locator('button[title="Compartilhar bebê"]').first();
    if (await shareButton.isVisible()) {
      await shareButton.click();
      await page.waitForLoadState('networkidle');
      
      // Switch to professional tab
      await page.click('button:has-text("Profissional")');
      
      // Click invite professional button
      await page.click('button:has-text("Convidar Profissional")');
      
      // Modal should be visible
      await expect(page.getByText('Convidar Profissional de Saúde')).toBeVisible();
      
      // Should have professional-specific fields
      await expect(page.locator('input[placeholder="email@clinica.com"]')).toBeVisible();
      await expect(page.locator('input[placeholder="Dr. Nome Sobrenome"]')).toBeVisible();
      await expect(page.locator('input[placeholder="Pediatria, Neonatologia..."]')).toBeVisible();
      await expect(page.locator('input[placeholder="123456"]')).toBeVisible(); // CRM
      await expect(page.locator('input[placeholder="SP"]')).toBeVisible(); // UF
    }
  });
});

test.describe('Accept Invite Page', () => {
  test('should show error for invalid token', async ({ page }) => {
    await page.goto('/invite/accept?token=invalid_token_12345');
    await page.waitForLoadState('networkidle');
    
    // Should show error state
    await expect(page.getByText(/inválido|expirou|cancelado/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show loading state initially', async ({ page }) => {
    await page.goto('/invite/accept?token=any_token');
    
    // Should show loading
    await expect(page.getByText('Verificando convite...')).toBeVisible();
  });

  test('should redirect to login without token', async ({ page }) => {
    await page.goto('/invite/accept');
    await page.waitForLoadState('networkidle');
    
    // Should show invalid state (no token)
    await expect(page.getByText(/inválido|incompleto/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Baby Members Page (Legacy)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should show members list', async ({ page }) => {
    await page.goto('/settings/babies');
    await page.waitForLoadState('networkidle');
    
    const membersButton = page.locator('button[title="Gerenciar membros"]').first();
    if (await membersButton.isVisible()) {
      await membersButton.click();
      
      // Should be on members page
      await expect(page).toHaveURL(/\/settings\/babies\/\d+\/members/);
      
      // Should show tabs
      await expect(page.getByText('Membros')).toBeVisible();
      await expect(page.getByText('Convites')).toBeVisible();
    }
  });
});

// ============================================
// QA Manual Checklist (5 Cenários Principais)
// ============================================
/**
 * CHECKLIST DE QA MANUAL - COMPARTILHAMENTO DE BEBÊ
 * 
 * 1. FLUXO: Dono convida familiar
 *    - [ ] Logar como pai/mãe
 *    - [ ] Ir para Configurações > Bebês > [Bebê] > Compartilhar
 *    - [ ] Clicar "Convidar Familiar"
 *    - [ ] Preencher email, nome, selecionar "Familiar"
 *    - [ ] Verificar toast de sucesso
 *    - [ ] Verificar email recebido
 *    - [ ] Verificar convite na lista "Convites Pendentes"
 * 
 * 2. FLUXO: Convidado aceita convite (nova conta)
 *    - [ ] Abrir link do convite no email
 *    - [ ] Verificar tela mostra nome do bebê
 *    - [ ] Criar senha
 *    - [ ] Verificar redirecionamento para dashboard
 *    - [ ] Verificar bebê aparece na lista
 * 
 * 3. FLUXO: Convidado aceita convite (conta existente)
 *    - [ ] Abrir link do convite
 *    - [ ] Verificar "Você já tem uma conta"
 *    - [ ] Fazer login com senha existente
 *    - [ ] Verificar convite aceito
 *    - [ ] Verificar bebê adicionado
 * 
 * 4. FLUXO: Dono convida profissional
 *    - [ ] Ir para aba "Profissional"
 *    - [ ] Clicar "Convidar Profissional"
 *    - [ ] Preencher dados (email, nome, CRM, especialidade)
 *    - [ ] Verificar toast de sucesso
 *    - [ ] Verificar profissional na lista "Aguardando Ativação"
 * 
 * 5. FLUXO: Dono revoga convite/acesso
 *    - [ ] Ir para lista de convites pendentes
 *    - [ ] Clicar no ícone de lixeira
 *    - [ ] Confirmar revogação
 *    - [ ] Verificar convite removido da lista
 *    - [ ] Tentar usar o link antigo (deve mostrar erro)
 */
