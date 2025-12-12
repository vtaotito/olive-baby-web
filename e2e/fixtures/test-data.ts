/**
 * Dados de teste reutilizáveis
 */

export const testUsers = {
  parent: {
    fullName: 'Teste Pai',
    email: `teste.pai.${Date.now()}@teste.com`,
    cpf: '12345678900',
    password: 'Teste123!@#',
    confirmPassword: 'Teste123!@#',
  },
  caregiver: {
    fullName: 'Teste Cuidador',
    email: `teste.cuidador.${Date.now()}@teste.com`,
    cpf: '98765432100',
    password: 'Teste123!@#',
    confirmPassword: 'Teste123!@#',
  },
};

export const testBaby = {
  name: 'Bebê Teste',
  birthDate: '2024-01-15',
  relationship: 'FILHO',
  birthWeightGrams: 3200,
  birthLengthCm: 50,
  city: 'São Paulo',
  state: 'SP',
};

export const testRoutine = {
  type: 'FEEDING',
  method: 'BREAST',
  durationMinutes: 20,
  amountMl: null,
  notes: 'Teste de alimentação',
};

export const testGrowth = {
  date: new Date().toISOString().split('T')[0],
  weightGrams: 3500,
  lengthCm: 52,
  headCircumferenceCm: 36,
  notes: 'Teste de crescimento',
};

export const testMilestone = {
  type: 'MOTOR',
  title: 'Primeiro sorriso',
  date: new Date().toISOString().split('T')[0],
  notes: 'Teste de marco',
};
