import { APIRequestContext, expect } from '@playwright/test';

/**
 * Helper para interações com API nos testes
 */
export class ApiHelper {
  constructor(private apiContext: APIRequestContext) {}

  /**
   * Cria um usuário de teste via API
   */
  async createTestUser(userData: {
    fullName: string;
    email: string;
    cpf: string;
    password: string;
  }) {
    const response = await this.apiContext.post('/api/v1/auth/register', {
      data: userData,
    });
    expect(response.ok()).toBeTruthy();
    return await response.json();
  }

  /**
   * Faz login via API e retorna token
   */
  async login(email: string, password: string) {
    const response = await this.apiContext.post('/api/v1/auth/login', {
      data: { email, password },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    return data.data.accessToken;
  }

  /**
   * Cria um bebê de teste
   */
  async createBaby(token: string, babyData: {
    name: string;
    birthDate: string;
    relationship: string;
  }) {
    const response = await this.apiContext.post('/api/v1/babies', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: babyData,
    });
    expect(response.ok()).toBeTruthy();
    return await response.json();
  }

  /**
   * Limpa dados de teste (deleta usuário/bebês criados)
   */
  async cleanupTestData(token: string, userId?: number) {
    // Implementar limpeza se necessário
    // Por segurança, em produção não deletamos dados reais
  }
}
