import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';
import { testUsers, testBaby, testRoutine } from './fixtures/test-data';

test.describe('Rotinas', () => {
  let authHelper: AuthHelper;
  let babyId: number;

  test.beforeEach(async ({ page, request }) => {
    authHelper = new AuthHelper(page);
    await authHelper.clearAuth();
    
    // Cria usuário e faz login
    const user = {
      ...testUsers.parent,
      email: `rotinas.${Date.now()}@teste.com`,
    };
    const registerResponse = await request.post('/api/v1/auth/register', { data: user });
    const registerData = await registerResponse.json();
    
    await authHelper.login(user.email, user.password);
    
    // Cria bebê via API
    const loginResponse = await request.post('/api/v1/auth/login', {
      data: { email: user.email, password: user.password },
    });
    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;
    
    const babyResponse = await request.post('/api/v1/babies', {
      headers: { Authorization: `Bearer ${token}` },
      data: testBaby,
    });
    const babyData = await babyResponse.json();
    babyId = babyData.data.id;
  });

  test('deve exibir lista de rotinas no dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verifica se há seção de rotinas
    const routinesSection = page.locator('text=/rotinas|routines|alimentação|sono/i');
    await expect(routinesSection.first()).toBeVisible({ timeout: 10000 });
  });

  test('deve criar rotina de alimentação', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Procura por botão de adicionar rotina
    const addButton = page.locator('button:has-text("Adicionar"), button:has-text("Nova"), button[aria-label*="adicionar"]').first();
    if (await addButton.isVisible()) {
      await addButton.click();
    } else {
      // Tenta navegar para página de rotinas
      await page.goto('/dashboard');
      const routineLink = page.locator('a:has-text("Alimentação"), button:has-text("Alimentação")').first();
      if (await routineLink.isVisible()) {
        await routineLink.click();
      }
    }

    // Preenche dados da rotina
    const typeSelect = page.locator('select[name*="type"], button:has-text("Alimentação")').first();
    if (await typeSelect.isVisible()) {
      await typeSelect.click();
    }

    const methodSelect = page.locator('select[name*="method"], button:has-text("Mama")').first();
    if (await methodSelect.isVisible()) {
      await methodSelect.selectOption('BREAST');
    }

    const durationInput = page.locator('input[name*="duration"], input[type="number"]').first();
    if (await durationInput.isVisible()) {
      await durationInput.fill(testRoutine.durationMinutes!.toString());
    }

    // Salva
    const saveButton = page.locator('button:has-text("Salvar"), button:has-text("Adicionar"), button[type="submit"]').first();
    await saveButton.click();

    // Verifica sucesso (mensagem ou atualização da lista)
    const successMessage = page.locator('text=/sucesso|salvo|adicionado/i');
    await expect(successMessage.first()).toBeVisible({ timeout: 5000 });
  });

  test('deve visualizar histórico de rotinas', async ({ page, request }) => {
    // Cria rotina via API primeiro
    const loginResponse = await request.post('/api/v1/auth/login', {
      data: { email: testUsers.parent.email, password: testUsers.parent.password },
    });
    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;

    await request.post(`/api/v1/babies/${babyId}/routines`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        ...testRoutine,
        babyId,
      },
    });

    // Navega para dashboard
    await page.goto('/dashboard');
    
    // Verifica se rotina aparece na lista
    const routineItem = page.locator(`text=${testRoutine.type}, text=${testRoutine.notes}`).first();
    await expect(routineItem).toBeVisible({ timeout: 10000 });
  });

  test('deve editar rotina existente', async ({ page, request }) => {
    // Cria rotina via API
    const loginResponse = await request.post('/api/v1/auth/login', {
      data: { email: testUsers.parent.email, password: testUsers.parent.password },
    });
    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;

    const routineResponse = await request.post(`/api/v1/babies/${babyId}/routines`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { ...testRoutine, babyId },
    });
    const routineData = await routineResponse.json();
    const routineId = routineData.data.id;

    await page.goto('/dashboard');
    
    // Procura por botão de editar
    const editButton = page.locator(`button[aria-label*="editar"], button:has-text("Editar")`).first();
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Modifica dados
      const notesInput = page.locator('textarea[name*="notes"], input[name*="notes"]').first();
      if (await notesInput.isVisible()) {
        await notesInput.fill('Notas atualizadas');
      }

      // Salva
      const saveButton = page.locator('button:has-text("Salvar")').first();
      await saveButton.click();

      // Verifica sucesso
      const successMessage = page.locator('text=/atualizado|salvo/i');
      await expect(successMessage.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('deve deletar rotina', async ({ page, request }) => {
    // Cria rotina via API
    const loginResponse = await request.post('/api/v1/auth/login', {
      data: { email: testUsers.parent.email, password: testUsers.parent.password },
    });
    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;

    await request.post(`/api/v1/babies/${babyId}/routines`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { ...testRoutine, babyId },
    });

    await page.goto('/dashboard');
    
    // Procura por botão de deletar
    const deleteButton = page.locator('button[aria-label*="deletar"], button:has-text("Deletar"), button:has-text("Excluir")').first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Confirma deleção se houver modal
      const confirmButton = page.locator('button:has-text("Confirmar"), button:has-text("Sim")').first();
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // Verifica que rotina foi removida
      const successMessage = page.locator('text=/deletado|removido|excluído/i');
      await expect(successMessage.first()).toBeVisible({ timeout: 5000 });
    }
  });
});
