# 📚 Documentação da API - Olive Baby

## 🎯 Como Acessar a Documentação

Existem **duas formas** de acessar a documentação completa da API:

### 1️⃣ Página HTML Interativa (Recomendado)

Abra o arquivo `api-docs.html` no seu navegador para uma experiência visual e interativa:

```bash
# Windows
start api-docs.html

# macOS
open api-docs.html

# Linux
xdg-open api-docs.html
```

**Ou simplesmente:**
- Navegue até a pasta do projeto
- Dê duplo clique no arquivo `api-docs.html`

#### ✨ Recursos da Página HTML:
- 🎨 Interface moderna e responsiva
- 🔍 Busca de endpoints
- 📝 Exemplos de código com botão de copiar
- 🎯 Navegação por seções
- 📊 Tabelas de códigos de resposta
- 🔄 Abas para diferentes respostas (sucesso/erro)

---

### 2️⃣ Arquivo Markdown Completo

Consulte o arquivo `API_DOCUMENTATION.md` para documentação completa em texto:

```bash
# Abrir no VSCode
code API_DOCUMENTATION.md

# Ou visualizar no GitHub
```

#### 📄 Conteúdo do Markdown:
- ✅ **Todos os 50+ endpoints** detalhados
- 📝 **Modelos JSON completos** de request e response
- 🔢 **Códigos de resposta HTTP** e quando ocorrem
- 📊 **Exemplos práticos** com JavaScript/Fetch
- 🎯 **Meta Fields** estruturados por tipo de rotina
- ⚡ **Rate limiting** e validações
- 🔐 **Segurança** e autenticação

---

## 📋 Índice de Endpoints

### 🔐 Autenticação (7 endpoints)
- `POST /auth/login` - Login de usuário
- `POST /auth/register` - Registro de novo usuário
- `POST /auth/refresh` - Renovar access token
- `POST /auth/logout` - Logout do usuário
- `POST /auth/forgot-password` - Solicitar reset de senha
- `POST /auth/reset-password` - Resetar senha com token
- `GET /auth/me` - Obter perfil do usuário

### 👶 Bebês (5 endpoints)
- `GET /babies` - Listar todos os bebês
- `GET /babies/:id` - Obter detalhes de um bebê
- `POST /babies` - Criar novo bebê
- `PATCH /babies/:id` - Atualizar dados do bebê
- `DELETE /babies/:id` - Deletar bebê

### 📝 Rotinas (15 endpoints)
- `GET /routines` - Listar rotinas
- `GET /routines/log/:id` - Obter rotina específica
- `PATCH /routines/log/:id` - Atualizar rotina
- `DELETE /routines/log/:id` - Deletar rotina
- `POST /routines/feeding/start` - Iniciar alimentação
- `POST /routines/feeding/close` - Finalizar alimentação
- `POST /routines/sleep/start` - Iniciar sono
- `POST /routines/sleep/close` - Finalizar sono
- `POST /routines/diaper` - Registrar troca de fralda
- `POST /routines/bath/start` - Iniciar banho
- `POST /routines/bath/close` - Finalizar banho
- `POST /routines/extraction/start` - Iniciar extração de leite
- `POST /routines/extraction/close` - Finalizar extração de leite
- `GET /routines/:routineType/active/:babyId` - Obter rotina ativa

### 📊 Estatísticas (2 endpoints)
- `GET /stats/:babyId` - Obter estatísticas do bebê
- `GET /stats/:babyId/history/:type` - Obter histórico de estatísticas

### 📈 Crescimento (6 endpoints)
- `GET /babies/:babyId/growth` - Listar registros de crescimento
- `GET /babies/:babyId/growth/:growthId` - Obter registro específico
- `POST /babies/:babyId/growth` - Criar registro de crescimento
- `PATCH /babies/:babyId/growth/:growthId` - Atualizar registro
- `DELETE /babies/:babyId/growth/:growthId` - Deletar registro
- `GET /babies/:babyId/growth/latest` - Obter último registro

### 🎯 Marcos de Desenvolvimento (5 endpoints)
- `GET /babies/:babyId/milestones` - Listar marcos
- `GET /babies/:babyId/milestones/:milestoneId` - Obter marco específico
- `POST /babies/:babyId/milestones` - Criar novo marco
- `PATCH /babies/:babyId/milestones/:milestoneId` - Atualizar marco
- `DELETE /babies/:babyId/milestones/:milestoneId` - Deletar marco

### 👨‍⚕️ Profissionais (9 endpoints)
- `GET /babies/:babyId/professionals` - Listar profissionais vinculados
- `GET /professionals/:professionalId` - Obter detalhes do profissional
- `POST /babies/:babyId/professionals/invite` - Convidar profissional
- `POST /professionals/verify-token` - Verificar token de convite (público)
- `POST /professionals/activate` - Ativar conta de profissional (público)
- `POST /babies/:babyId/professionals/:linkId/resend-invite` - Reenviar convite
- `DELETE /babies/:babyId/professionals/:linkId` - Remover profissional
- `PATCH /babies/:babyId/professionals/:linkId` - Atualizar vínculo
- `GET /professionals/my-patients` - Obter lista de pacientes

### 📥 Exportação (4 endpoints)
- `GET /export/:babyId/routines` - Exportar rotinas em CSV
- `GET /export/:babyId/growth` - Exportar crescimento em CSV
- `GET /export/:babyId/milestones` - Exportar marcos em CSV
- `GET /export/:babyId/full` - Exportar relatório completo em PDF

---

## 🔗 Base URL

**Desenvolvimento:**
```
http://localhost:4000/api/v1
```

**Produção:**
```
https://api.olivebaby.com/api/v1
```

---

## 🔐 Autenticação

A API utiliza **JWT (JSON Web Tokens)** para autenticação.

### Tokens Disponíveis:
| Token | Duração | Uso |
|-------|---------|-----|
| Access Token | 15 minutos | Autorização de requisições |
| Refresh Token | 7 dias | Renovar access token |

### Como Usar:
```javascript
// Incluir no header de todas as requisições protegidas
Authorization: Bearer {accessToken}
```

### Rotas Públicas (sem token):
- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/professionals/verify-token`
- `/professionals/activate`

---

## 📊 Códigos de Resposta

| Código | Status | Quando Ocorre |
|--------|--------|---------------|
| **200** | OK | Requisição bem-sucedida |
| **201** | Created | Recurso criado com sucesso |
| **400** | Bad Request | Dados de entrada inválidos |
| **401** | Unauthorized | Token ausente, inválido ou expirado |
| **403** | Forbidden | Sem permissão para acessar recurso |
| **404** | Not Found | Recurso não encontrado |
| **422** | Unprocessable Entity | Erro de validação |
| **429** | Too Many Requests | Limite de requisições excedido |
| **500** | Internal Server Error | Erro interno do servidor |
| **502** | Bad Gateway | Servidor backend não responde |

---

## 💡 Exemplo de Uso

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:4000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@email.com',
    password: 'senha123'
  })
});

const { data } = await loginResponse.json();
const token = data.accessToken;

// 2. Listar bebês
const babiesResponse = await fetch('http://localhost:4000/api/v1/babies', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const babies = await babiesResponse.json();

// 3. Criar rotina
const routineResponse = await fetch('http://localhost:4000/api/v1/routines/feeding/start', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    babyId: 1,
    meta: {
      feedingType: 'breast',
      breastSide: 'left'
    }
  })
});

const routine = await routineResponse.json();
```

---

## 🎯 Meta Fields (Campos Personalizados)

Cada tipo de rotina aceita campos específicos no objeto `meta`:

### 🍼 Alimentação (Feeding)
```json
{
  "feedingType": "breast" | "bottle" | "solid",
  "breastSide": "left" | "right" | "both",
  "complement": "yes" | "no",
  "complementType": "formula" | "donated_milk",
  "complementMl": 50,
  "bottleMl": 120,
  "bottleMilkType": "breast" | "formula",
  "solidFoods": ["banana", "papinha"]
}
```

### 😴 Sono (Sleep)
```json
{
  "location": "crib" | "bed" | "stroller",
  "environment": "dark" | "light",
  "quality": "good" | "fair" | "poor"
}
```

### 🚼 Fralda (Diaper)
```json
{
  "diaperType": "wet" | "dirty" | "both",
  "consistency": "normal" | "soft" | "hard",
  "color": "yellow" | "green" | "brown"
}
```

### 🛁 Banho (Bath)
```json
{
  "waterTemperature": "warm" | "cool",
  "hairWashed": true | false,
  "productsUsed": ["shampoo", "sabonete"]
}
```

### 🤱 Extração (Extraction)
```json
{
  "extractionType": "manual" | "electric_pump" | "hand_pump",
  "breastSide": "left" | "right" | "both",
  "quantityMl": 150
}
```

---

## ⚡ Rate Limiting

| Rota | Limite |
|------|--------|
| Login/Registro | 5 requisições/minuto por IP |
| Outras rotas | 100 requisições/minuto por token |

---

## 📞 Suporte

- 📧 **Email:** dev@olivebaby.com
- 📄 **Documentação Markdown:** `API_DOCUMENTATION.md`
- 🌐 **Página HTML:** `api-docs.html`
- 🔧 **Última atualização:** 11/12/2024
- 📦 **Versão:** v1.0

---

## 🚀 Como Testar a API

### Usando cURL:
```bash
# Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@email.com","password":"senha123"}'

# Listar bebês (com token)
curl -X GET http://localhost:4000/api/v1/babies \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Usando Postman:
1. Importe a coleção de requisições (se disponível)
2. Configure a variável `baseUrl` para `http://localhost:4000/api/v1`
3. Configure a variável `token` após fazer login
4. Use `{{baseUrl}}` e `{{token}}` nas requisições

### Usando Insomnia:
1. Crie um novo workspace
2. Adicione a base URL como variável de ambiente
3. Crie requisições para cada endpoint
4. Configure autenticação Bearer Token

---

## 📝 Notas Importantes

1. **Timezone**: Todas as datas/horas são em UTC
2. **Formato de Data**: ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`)
3. **Paginação**: Suportada em endpoints de listagem (`page`, `limit`)
4. **CORS**: Configurado para aceitar qualquer origem em desenvolvimento
5. **Validação**: Todos os dados são validados antes de serem salvos

---

**✨ Documentação criada em:** 11/12/2024  
**📦 Versão da API:** v1.0  
**🍼 Olive Baby - Cuidando do seu bebê com tecnologia**
