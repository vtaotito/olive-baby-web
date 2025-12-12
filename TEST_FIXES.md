# Como Testar as Correções

## 🧪 Testes Manuais

### 🔴 1. Teste CRÍTICO: Login sem Token (PRIORIDADE MÁXIMA)

1. Faça logout da aplicação
2. Abra o DevTools (F12)
3. Vá para a aba **Network**
4. Filtre por "Fetch/XHR"
5. Faça login novamente
6. Clique na requisição `login` no Network tab
7. Vá para a aba **Headers**
8. Procure por `Authorization` nos Request Headers

**Resultado esperado:**
- ❌ **ANTES:** `authorization: Bearer eyJhbGc...` (ERRADO!)
- ✅ **DEPOIS:** Sem header `Authorization` (CORRETO!)

**Por que é crítico?**
- Login com token no header não faz sentido (você está pedindo um token!)
- Pode causar problemas de autenticação no backend
- É uma falha de segurança conceitual

---

### 2. Teste de Console Limpo

1. Abra o DevTools (F12)
2. Vá para a aba Console
3. Recarregue a página
4. Navegue para diferentes páginas:
   - Dashboard
   - Configurações > Bebês
   - Marcos do Desenvolvimento
   - Crescimento

**Resultado esperado:**
- ❌ **ANTES:** Vários erros 404 em vermelho
- ✅ **DEPOIS:** Console limpo ou apenas warnings em amarelo

### 3. Teste de Página de Milestones

1. Acesse `/milestones`
2. Observe o comportamento

**Resultado esperado:**
- Se backend estiver OK: Lista de marcos carrega normalmente
- Se backend retornar 404: Página mostra "Nenhum marco registrado" (sem erro)
- Se backend retornar 502: Mensagem amigável "Servidor temporariamente indisponível"

### 4. Teste de Rotinas

1. Acesse Dashboard
2. Clique em "Alimentação"
3. Inicie uma alimentação
4. Verifique o console

**Resultado esperado:**
- ✅ Nenhum erro 404 para routines/sleep, bath ou extraction
- ✅ Apenas logs de debug (se houver)

---

## 🔍 Inspeção de Rede (Network Tab)

1. Abra DevTools (F12) > Network
2. Filtre por "Fetch/XHR"
3. Navegue pela aplicação

**O que procurar:**

### 🔴 Requisições CRÍTICAS - Verificar Primeiro:
```
POST /api/v1/auth/login       → SEM header Authorization (OBRIGATÓRIO)
POST /api/v1/auth/register    → SEM header Authorization (OBRIGATÓRIO)
```

### ❌ Requisições que NÃO devem mais aparecer:
```
GET /api/v1/routines/sleep/active/:id      (404)
GET /api/v1/routines/bath/active/:id       (404)
GET /api/v1/routines/extraction/active/:id (404)
```

### ✅ Requisições que DEVEM funcionar:
```
GET /api/v1/babies                         (200 OK) COM Authorization
GET /api/v1/stats/:id                      (200 OK) COM Authorization
GET /api/v1/routines/feeding/active/:id    (200 ou 404) COM Authorization
```

---

## 🐛 Verificação de Logs

### Console Debug Esperado:

```javascript
// Logs de debug (azul) - OK
[Debug] No active feeding routine for baby 4

// Warnings (amarelo) - OK se backend não tiver rota
[Warning] Rota de milestones pode não estar implementada no backend para baby 4

// Erros (vermelho) - Só se backend realmente falhar
[API 502] Bad Gateway - Servidor backend não está respondendo
```

---

## ⚡ Teste Rápido (30 segundos)

```bash
# 1. Abra a aplicação
npm run dev

# 2. Abra DevTools (F12) > Network tab

# 3. Faça logout e login novamente

# 4. Verifique requisição de login:
🔴 CRÍTICO: Login NÃO deve ter header Authorization

# 5. Vá para Console tab

# 6. Faça estas ações:
- Carregue o Dashboard
- Clique em "Marcos do Desenvolvimento"
- Volte ao Dashboard

# 7. Verifique:
✅ Login sem token Authorization
✅ Console sem erros 404 de routines
✅ Aplicação funciona normalmente
✅ Sem pop-ups de erro
```

---

## 🎯 Critérios de Sucesso

### ✅ Passou se:
- [ ] **CRÍTICO**: Login NÃO envia header Authorization
- [ ] **CRÍTICO**: Registro NÃO envia header Authorization
- [ ] Console sem erros 404 desnecessários
- [ ] Página de Milestones carrega (mesmo vazia)
- [ ] Rotinas de alimentação funcionam
- [ ] Aplicação navegável sem crashes
- [ ] Logs organizados e informativos

### ❌ Falhou se:
- [ ] **CRÍTICO**: Login ainda envia Authorization: Bearer ...
- [ ] **CRÍTICO**: Registro ainda envia Authorization: Bearer ...
- [ ] Ainda há erros 404 para sleep/bath/extraction active
- [ ] Página de Milestones mostra erro vermelho ao usuário
- [ ] Console cheio de erros não tratados
- [ ] Aplicação trava ou não responde

---

## 📊 Comparação Antes/Depois

### ANTES da Correção:
```
Network:
  🔴 POST /api/v1/auth/login
     Headers: authorization: Bearer eyJhbGc... (ERRADO!!!)

Console:
  ❌ 404 - GET /api/v1/routines/sleep/active/4
  ❌ 404 - GET /api/v1/routines/bath/active/4
  ❌ 404 - GET /api/v1/routines/extraction/active/4
  ❌ 404 - GET /api/v1/babies/4/milestones
  ❌ Erro não tratado: "Falha ao carregar marcos"
  
Experiência do Usuário:
  ❌ Pop-ups de erro
  ❌ Páginas quebradas
  ❌ Console poluído
  ❌ Login pode ter problemas
```

### DEPOIS da Correção:
```
Network:
  ✅ POST /api/v1/auth/login
     Headers: SEM authorization (CORRETO!!!)

Console:
  ✅ [Debug] No active feeding routine for baby 4
  ⚠️ [Warning] Rota de milestones pode não estar implementada
  
Experiência do Usuário:
  ✅ Sem pop-ups de erro inesperados
  ✅ Páginas funcionam graciosamente
  ✅ Console limpo e organizado
  ✅ Mensagens amigáveis quando backend falha
  ✅ Login e registro funcionam corretamente
```

---

## 🔄 Testes Automatizados (Futuro)

```typescript
// Exemplo de teste E2E que pode ser implementado:

describe('Bug Fixes - API Errors', () => {
  it('should not call non-existent active routine endpoints', () => {
    cy.visit('/dashboard')
    cy.window().then((win) => {
      cy.spy(win.console, 'error').as('consoleError')
    })
    cy.get('@consoleError').should('not.be.called')
  })
  
  it('should handle 404 on milestones gracefully', () => {
    cy.intercept('GET', '**/milestones', { statusCode: 404 }).as('milestones404')
    cy.visit('/milestones')
    cy.wait('@milestones404')
    cy.contains('Nenhum marco registrado').should('be.visible')
    cy.get('[role="alert"]').should('not.exist') // Sem alert de erro
  })
})
```

---

## 📝 Relatório de Teste

Após testar, preencha:

```
Data: _____________
Testador: _____________

✅ Console limpo: [ ] Sim [ ] Não
✅ Milestones funciona: [ ] Sim [ ] Não
✅ Rotinas funcionam: [ ] Sim [ ] Não
✅ Logs organizados: [ ] Sim [ ] Não

Observações:
_________________________________
_________________________________
_________________________________

Bugs encontrados:
_________________________________
_________________________________
_________________________________
```

---

**Última Atualização:** 11/12/2025
