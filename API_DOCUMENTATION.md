# 📚 Documentação Completa da API - Olive Baby

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Códigos de Resposta HTTP](#códigos-de-resposta-http)
- [Endpoints](#endpoints)
  - [Autenticação (Auth)](#autenticação-auth)
  - [Bebês (Babies)](#bebês-babies)
  - [Rotinas (Routines)](#rotinas-routines)
  - [Estatísticas (Stats)](#estatísticas-stats)
  - [Crescimento (Growth)](#crescimento-growth)
  - [Marcos de Desenvolvimento (Milestones)](#marcos-de-desenvolvimento-milestones)
  - [Profissionais (Professionals)](#profissionais-professionals)
  - [Exportação (Export)](#exportação-export)

---

## 🌐 Visão Geral

**Base URL:** `http://localhost:4000/api/v1` (Desenvolvimento)  
**Produção:** `https://api.olivebaby.com/api/v1`

**Formato:** Todas as requisições e respostas são em JSON  
**Autenticação:** JWT Bearer Token (exceto rotas públicas)

---

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Após o login, você receberá dois tokens:
- **Access Token**: Token de curta duração para requisições (15min)
- **Refresh Token**: Token de longa duração para renovar o access token (7 dias)

### Rotas Públicas (Sem Token)
- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/professionals/verify-token`
- `/professionals/activate`

### Rotas Protegidas
Inclua o token no header:
```
Authorization: Bearer {accessToken}
```

---

## 📊 Códigos de Resposta HTTP

| Código | Descrição | Quando Ocorre |
|--------|-----------|---------------|
| **200** | OK | Requisição bem-sucedida |
| **201** | Created | Recurso criado com sucesso |
| **400** | Bad Request | Dados de entrada inválidos |
| **401** | Unauthorized | Token ausente, inválido ou expirado |
| **403** | Forbidden | Sem permissão para acessar recurso |
| **404** | Not Found | Recurso não encontrado |
| **422** | Unprocessable Entity | Erro de validação |
| **429** | Too Many Requests | Limite de requisições excedido |
| **500** | Internal Server Error | Erro interno do servidor |
| **502** | Bad Gateway | Servidor backend não está respondendo |

---

## 📡 Endpoints

---

## Autenticação (Auth)

### 🔑 POST `/auth/login`
Login de usuário.

**Request Body:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "usuario@email.com",
      "fullName": "Maria Silva",
      "role": "CAREGIVER"
    }
  }
}
```

**Response 401 (Credenciais Inválidas):**
```json
{
  "success": false,
  "error": "Credenciais inválidas"
}
```

---

### 👤 POST `/auth/register`
Registro de novo usuário.

**Request Body:**
```json
{
  "email": "novo@email.com",
  "password": "SenhaForte123!",
  "fullName": "Maria Silva",
  "cpf": "12345678901",
  "phone": "(11) 98765-4321"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "novo@email.com",
      "fullName": "Maria Silva",
      "role": "CAREGIVER"
    }
  }
}
```

**Response 400 (Email já existe):**
```json
{
  "success": false,
  "error": "Email já cadastrado"
}
```

---

### 🔄 POST `/auth/refresh`
Renovar access token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "novo_access_token_aqui...",
    "refreshToken": "novo_refresh_token_aqui..."
  }
}
```

**Response 401 (Token Inválido):**
```json
{
  "success": false,
  "error": "Refresh token inválido ou expirado"
}
```

---

### 🚪 POST `/auth/logout`
Logout do usuário (revoga tokens).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

---

### 🔑 POST `/auth/forgot-password`
Solicitar reset de senha.

**Request Body:**
```json
{
  "email": "usuario@email.com"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Email de recuperação enviado"
}
```

---

### 🔐 POST `/auth/reset-password`
Resetar senha com token.

**Request Body:**
```json
{
  "token": "token_recebido_por_email",
  "password": "NovaSenhaForte123!"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```

---

### 👤 GET `/auth/me`
Obter perfil do usuário autenticado.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "usuario@email.com",
    "fullName": "Maria Silva",
    "cpf": "12345678901",
    "phone": "(11) 98765-4321",
    "role": "CAREGIVER",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Bebês (Babies)

### 📋 GET `/babies`
Listar todos os bebês do usuário.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "João Silva",
      "birthDate": "2024-01-15",
      "relationship": "filho",
      "birthWeightGrams": 3200,
      "birthLengthCm": 50.5,
      "city": "São Paulo",
      "state": "SP",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 👶 GET `/babies/:id`
Obter detalhes de um bebê específico.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "João Silva",
    "birthDate": "2024-01-15",
    "relationship": "filho",
    "birthWeightGrams": 3200,
    "birthLengthCm": 50.5,
    "city": "São Paulo",
    "state": "SP",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "error": "Bebê não encontrado"
}
```

---

### ➕ POST `/babies`
Criar novo bebê.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "João Silva",
  "birthDate": "2024-01-15",
  "relationship": "filho",
  "birthWeightGrams": 3200,
  "birthLengthCm": 50.5,
  "city": "São Paulo",
  "state": "SP"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "João Silva",
    "birthDate": "2024-01-15",
    "relationship": "filho",
    "birthWeightGrams": 3200,
    "birthLengthCm": 50.5,
    "city": "São Paulo",
    "state": "SP",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response 400:**
```json
{
  "success": false,
  "error": "Dados inválidos",
  "details": [
    "Nome é obrigatório",
    "Data de nascimento é obrigatória"
  ]
}
```

---

### ✏️ PATCH `/babies/:id`
Atualizar dados do bebê.

**Headers:** `Authorization: Bearer {token}`

**Request Body (campos opcionais):**
```json
{
  "name": "João Pedro Silva",
  "city": "Campinas",
  "state": "SP"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "João Pedro Silva",
    "birthDate": "2024-01-15",
    "city": "Campinas",
    "state": "SP",
    "updatedAt": "2024-01-20T15:45:00.000Z"
  }
}
```

---

### 🗑️ DELETE `/babies/:id`
Deletar bebê.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "message": "Bebê deletado com sucesso"
}
```

---

## Rotinas (Routines)

### 📋 GET `/routines`
Listar rotinas.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `babyId` (obrigatório): ID do bebê
- `routineType` (opcional): Tipo de rotina (feeding, sleep, diaper, bath, extraction)
- `startDate` (opcional): Data inicial (YYYY-MM-DD)
- `endDate` (opcional): Data final (YYYY-MM-DD)
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 20)

**Exemplo:** `/routines?babyId=1&routineType=feeding&startDate=2024-01-01&endDate=2024-01-31`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "routines": [
      {
        "id": 1,
        "babyId": 1,
        "routineType": "feeding",
        "startTime": "2024-01-15T10:00:00.000Z",
        "endTime": "2024-01-15T10:30:00.000Z",
        "durationSeconds": 1800,
        "notes": "Mamada no peito esquerdo",
        "meta": {
          "feedingType": "breast",
          "breastSide": "left"
        },
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

### 🔍 GET `/routines/log/:id`
Obter rotina específica.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "babyId": 1,
    "routineType": "feeding",
    "startTime": "2024-01-15T10:00:00.000Z",
    "endTime": "2024-01-15T10:30:00.000Z",
    "durationSeconds": 1800,
    "notes": "Mamada no peito esquerdo",
    "meta": {
      "feedingType": "breast",
      "breastSide": "left"
    }
  }
}
```

---

### ✏️ PATCH `/routines/log/:id`
Atualizar rotina.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "startTime": "2024-01-15T10:00:00.000Z",
  "endTime": "2024-01-15T10:35:00.000Z",
  "notes": "Notas atualizadas",
  "meta": {
    "feedingType": "breast",
    "breastSide": "both"
  }
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "babyId": 1,
    "routineType": "feeding",
    "startTime": "2024-01-15T10:00:00.000Z",
    "endTime": "2024-01-15T10:35:00.000Z",
    "durationSeconds": 2100,
    "notes": "Notas atualizadas",
    "meta": {
      "feedingType": "breast",
      "breastSide": "both"
    }
  }
}
```

---

### 🗑️ DELETE `/routines/log/:id`
Deletar rotina.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "message": "Rotina deletada com sucesso"
}
```

---

### 🍼 POST `/routines/feeding/start`
Iniciar alimentação.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "babyId": 1,
  "meta": {
    "feedingType": "breast",
    "breastSide": "left"
  }
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "babyId": 1,
    "routineType": "feeding",
    "startTime": "2024-01-15T10:00:00.000Z",
    "status": "active",
    "meta": {
      "feedingType": "breast",
      "breastSide": "left"
    }
  }
}
```

---

### 🍼 POST `/routines/feeding/close`
Finalizar alimentação.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "babyId": 1,
  "meta": {
    "complement": "yes",
    "complementType": "formula",
    "complementMl": 50
  },
  "notes": "Aceitou complemento"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "babyId": 1,
    "routineType": "feeding",
    "startTime": "2024-01-15T10:00:00.000Z",
    "endTime": "2024-01-15T10:30:00.000Z",
    "durationSeconds": 1800,
    "status": "completed",
    "notes": "Aceitou complemento",
    "meta": {
      "feedingType": "breast",
      "breastSide": "left",
      "complement": "yes",
      "complementType": "formula",
      "complementMl": 50
    }
  }
}
```

---

### 😴 POST `/routines/sleep/start`
Iniciar sono.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "babyId": 1,
  "meta": {
    "location": "crib",
    "environment": "dark"
  }
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "babyId": 1,
    "routineType": "sleep",
    "startTime": "2024-01-15T20:00:00.000Z",
    "status": "active",
    "meta": {
      "location": "crib",
      "environment": "dark"
    }
  }
}
```

---

### 😴 POST `/routines/sleep/close`
Finalizar sono.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "babyId": 1,
  "meta": {
    "quality": "good"
  },
  "notes": "Dormiu bem"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "babyId": 1,
    "routineType": "sleep",
    "startTime": "2024-01-15T20:00:00.000Z",
    "endTime": "2024-01-16T07:00:00.000Z",
    "durationSeconds": 39600,
    "status": "completed",
    "notes": "Dormiu bem",
    "meta": {
      "location": "crib",
      "environment": "dark",
      "quality": "good"
    }
  }
}
```

---

### 🚼 POST `/routines/diaper`
Registrar troca de fralda (instantâneo).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "babyId": 1,
  "meta": {
    "diaperType": "both",
    "consistency": "normal"
  },
  "notes": "Xixi e cocô"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "babyId": 1,
    "routineType": "diaper",
    "startTime": "2024-01-15T11:00:00.000Z",
    "endTime": "2024-01-15T11:00:00.000Z",
    "durationSeconds": 0,
    "notes": "Xixi e cocô",
    "meta": {
      "diaperType": "both",
      "consistency": "normal"
    }
  }
}
```

---

### 🛁 POST `/routines/bath/start`
Iniciar banho.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "babyId": 1,
  "meta": {
    "waterTemperature": "warm"
  }
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "babyId": 1,
    "routineType": "bath",
    "startTime": "2024-01-15T19:00:00.000Z",
    "status": "active",
    "meta": {
      "waterTemperature": "warm"
    }
  }
}
```

---

### 🛁 POST `/routines/bath/close`
Finalizar banho.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "babyId": 1,
  "meta": {
    "hairWashed": true
  },
  "notes": "Banho completo"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "babyId": 1,
    "routineType": "bath",
    "startTime": "2024-01-15T19:00:00.000Z",
    "endTime": "2024-01-15T19:15:00.000Z",
    "durationSeconds": 900,
    "status": "completed",
    "notes": "Banho completo",
    "meta": {
      "waterTemperature": "warm",
      "hairWashed": true
    }
  }
}
```

---

### 🤱 POST `/routines/extraction/start`
Iniciar extração de leite.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "babyId": 1,
  "meta": {
    "extractionType": "electric_pump",
    "breastSide": "both"
  }
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "babyId": 1,
    "routineType": "extraction",
    "startTime": "2024-01-15T14:00:00.000Z",
    "status": "active",
    "meta": {
      "extractionType": "electric_pump",
      "breastSide": "both"
    }
  }
}
```

---

### 🤱 POST `/routines/extraction/close`
Finalizar extração de leite.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "babyId": 1,
  "meta": {
    "quantityMl": 150
  },
  "notes": "Boa produção"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "babyId": 1,
    "routineType": "extraction",
    "startTime": "2024-01-15T14:00:00.000Z",
    "endTime": "2024-01-15T14:20:00.000Z",
    "durationSeconds": 1200,
    "status": "completed",
    "notes": "Boa produção",
    "meta": {
      "extractionType": "electric_pump",
      "breastSide": "both",
      "quantityMl": 150
    }
  }
}
```

---

### 🔍 GET `/routines/:routineType/active/:babyId`
Obter rotina ativa (em andamento).

**Headers:** `Authorization: Bearer {token}`

**Nota:** Apenas `feeding` está implementado no backend atualmente.

**Response 200 (Rotina ativa existe):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "babyId": 1,
    "routineType": "feeding",
    "startTime": "2024-01-15T10:00:00.000Z",
    "status": "active",
    "meta": {
      "feedingType": "breast",
      "breastSide": "left"
    }
  }
}
```

**Response 404 (Nenhuma rotina ativa):**
```json
{
  "success": false,
  "data": null
}
```

---

## Estatísticas (Stats)

### 📊 GET `/stats/:babyId`
Obter estatísticas do bebê.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `range` (opcional): '24h' | '7d' | '30d' (padrão: '24h')

**Exemplo:** `/stats/1?range=7d`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "labels": ["2024-01-10", "2024-01-11", "2024-01-12", "2024-01-13", "2024-01-14", "2024-01-15", "2024-01-16"],
    "sleep_hours": [8.5, 9.2, 7.8, 8.0, 9.5, 8.3, 8.8],
    "feeding_minutes": [120, 135, 110, 125, 140, 115, 130],
    "diaper_counts": [8, 9, 7, 8, 10, 8, 9],
    "feeding_counts": [6, 7, 5, 6, 7, 6, 6],
    "complement_ml_per_day": [50, 100, 0, 50, 100, 50, 0],
    "bottle_ml_per_day": [0, 0, 150, 0, 0, 150, 0],
    "extraction_ml_per_day": [100, 150, 120, 140, 130, 150, 110],
    "hourly_labels": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    "hourly_counts": [0, 0, 1, 0, 0, 2, 3, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 1, 0, 0, 0],
    "recent_logs": [
      {
        "id": 1,
        "label": "Alimentação",
        "slug": "feeding",
        "start_time": "2024-01-15T10:00:00.000Z",
        "end_time": "2024-01-15T10:30:00.000Z",
        "duration_seconds": 1800,
        "notes": "Mamada no peito esquerdo",
        "feeding_type": "breast",
        "breast_side": "left",
        "complement": "no",
        "complement_type": null,
        "complement_ml": null,
        "bottle_ml": null,
        "bottle_milk_type": null,
        "solid_foods": null
      }
    ],
    "sleep_start_times": [
      {
        "hour": 20,
        "minute": 30,
        "date": "2024-01-15"
      }
    ],
    "breast_side_distribution": {
      "left": 15,
      "right": 12,
      "both": 8
    },
    "total_sleep_hours_range": 59.1,
    "total_feeding_minutes_range": 875,
    "total_diaper_range": 59,
    "total_complement_ml_range": 350,
    "total_bottle_ml_range": 300,
    "total_extraction_ml_range": 900,
    "total_sleep_hours_24h": 8.3,
    "total_feeding_minutes_24h": 115,
    "total_diaper_24h": 8,
    "total_complement_ml_24h": 50,
    "total_bottle_ml_24h": 0,
    "total_extraction_ml_24h": 150,
    "feeding_count_24h": 6,
    "complement_feeds_24h": 2
  }
}
```

---

### 📈 GET `/stats/:babyId/history/:type`
Obter histórico de estatísticas por tipo.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `days` (opcional): Número de dias (padrão: 7)

**Exemplo:** `/stats/1/history/sleep?days=30`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "type": "sleep",
    "days": 30,
    "history": [
      {
        "date": "2024-01-15",
        "value": 8.5,
        "count": 4
      }
    ]
  }
}
```

---

## Crescimento (Growth)

### 📋 GET `/babies/:babyId/growth`
Listar todos os registros de crescimento.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "babyId": 1,
      "measurementDate": "2024-01-15",
      "weightGrams": 3200,
      "lengthCm": 50.5,
      "headCircumferenceCm": 35.0,
      "notes": "Primeira medição",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 🔍 GET `/babies/:babyId/growth/:growthId`
Obter registro de crescimento específico.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "babyId": 1,
    "measurementDate": "2024-01-15",
    "weightGrams": 3200,
    "lengthCm": 50.5,
    "headCircumferenceCm": 35.0,
    "notes": "Primeira medição",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### ➕ POST `/babies/:babyId/growth`
Criar novo registro de crescimento.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "measurementDate": "2024-02-15",
  "weightGrams": 4500,
  "lengthCm": 55.0,
  "headCircumferenceCm": 37.5,
  "notes": "Consulta de 1 mês"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "babyId": 1,
    "measurementDate": "2024-02-15",
    "weightGrams": 4500,
    "lengthCm": 55.0,
    "headCircumferenceCm": 37.5,
    "notes": "Consulta de 1 mês",
    "createdAt": "2024-02-15T14:00:00.000Z"
  }
}
```

---

### ✏️ PATCH `/babies/:babyId/growth/:growthId`
Atualizar registro de crescimento.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "weightGrams": 4550,
  "notes": "Peso corrigido"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "babyId": 1,
    "measurementDate": "2024-02-15",
    "weightGrams": 4550,
    "lengthCm": 55.0,
    "headCircumferenceCm": 37.5,
    "notes": "Peso corrigido",
    "updatedAt": "2024-02-15T15:30:00.000Z"
  }
}
```

---

### 🗑️ DELETE `/babies/:babyId/growth/:growthId`
Deletar registro de crescimento.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "message": "Registro de crescimento deletado com sucesso"
}
```

---

### 📊 GET `/babies/:babyId/growth/latest`
Obter último registro de crescimento.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "babyId": 1,
    "measurementDate": "2024-02-15",
    "weightGrams": 4550,
    "lengthCm": 55.0,
    "headCircumferenceCm": 37.5,
    "notes": "Peso corrigido"
  }
}
```

---

## Marcos de Desenvolvimento (Milestones)

### 📋 GET `/babies/:babyId/milestones`
Listar marcos de desenvolvimento.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `category` (opcional): Filtrar por categoria

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "babyId": 1,
      "title": "Primeiro Sorriso",
      "description": "Sorriu pela primeira vez!",
      "category": "social",
      "achievedAt": "2024-02-10",
      "notes": "Foi lindo!",
      "createdAt": "2024-02-10T09:00:00.000Z"
    }
  ]
}
```

---

### 🔍 GET `/babies/:babyId/milestones/:milestoneId`
Obter marco específico.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "babyId": 1,
    "title": "Primeiro Sorriso",
    "description": "Sorriu pela primeira vez!",
    "category": "social",
    "achievedAt": "2024-02-10",
    "notes": "Foi lindo!"
  }
}
```

---

### ➕ POST `/babies/:babyId/milestones`
Criar novo marco.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "title": "Primeiro Passo",
  "description": "Deu o primeiro passo sozinho",
  "category": "motor",
  "achievedAt": "2024-11-15",
  "notes": "Ficamos muito emocionados!"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "babyId": 1,
    "title": "Primeiro Passo",
    "description": "Deu o primeiro passo sozinho",
    "category": "motor",
    "achievedAt": "2024-11-15",
    "notes": "Ficamos muito emocionados!",
    "createdAt": "2024-11-15T16:30:00.000Z"
  }
}
```

---

### ✏️ PATCH `/babies/:babyId/milestones/:milestoneId`
Atualizar marco.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "notes": "Atualizando as notas do marco",
  "achievedAt": "2024-11-16"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "babyId": 1,
    "title": "Primeiro Passo",
    "description": "Deu o primeiro passo sozinho",
    "category": "motor",
    "achievedAt": "2024-11-16",
    "notes": "Atualizando as notas do marco",
    "updatedAt": "2024-11-17T10:00:00.000Z"
  }
}
```

---

### 🗑️ DELETE `/babies/:babyId/milestones/:milestoneId`
Deletar marco.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "message": "Marco deletado com sucesso"
}
```

---

## Profissionais (Professionals)

### 📋 GET `/babies/:babyId/professionals`
Listar profissionais vinculados ao bebê.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "professionalId": 5,
      "babyId": 1,
      "role": "PEDIATRICIAN",
      "status": "ACTIVE",
      "notes": "Pediatra de confiança",
      "professional": {
        "id": 5,
        "fullName": "Dr. João Santos",
        "email": "joao@clinica.com",
        "specialty": "Pediatria",
        "crmNumber": "123456",
        "crmState": "SP",
        "phone": "(11) 99999-8888"
      }
    }
  ]
}
```

---

### 🔍 GET `/professionals/:professionalId`
Obter detalhes do profissional.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "fullName": "Dr. João Santos",
    "email": "joao@clinica.com",
    "specialty": "Pediatria",
    "crmNumber": "123456",
    "crmState": "SP",
    "phone": "(11) 99999-8888",
    "city": "São Paulo",
    "state": "SP",
    "status": "ACTIVE"
  }
}
```

---

### ✉️ POST `/babies/:babyId/professionals/invite`
Convidar profissional.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "email": "medico@clinica.com",
  "fullName": "Dr. João Santos",
  "specialty": "Pediatria",
  "role": "PEDIATRICIAN",
  "crmNumber": "123456",
  "crmState": "SP",
  "phone": "(11) 99999-8888",
  "notes": "Pediatra recomendado"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "professionalId": 5,
    "babyId": 1,
    "role": "PEDIATRICIAN",
    "status": "PENDING",
    "inviteToken": "abc123...",
    "invitedAt": "2024-01-15T10:00:00.000Z",
    "message": "Convite enviado por email"
  }
}
```

---

### 🔍 POST `/professionals/verify-token` (Público)
Verificar token de convite.

**Request Body:**
```json
{
  "token": "abc123..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "professional": {
      "fullName": "Dr. João Santos",
      "email": "medico@clinica.com",
      "specialty": "Pediatria",
      "role": "PEDIATRICIAN"
    },
    "baby": {
      "name": "João Silva",
      "birthDate": "2024-01-15"
    }
  }
}
```

---

### ✅ POST `/professionals/activate` (Público)
Ativar conta de profissional.

**Request Body:**
```json
{
  "token": "abc123...",
  "password": "SenhaForte123!",
  "phone": "(11) 99999-8888",
  "city": "São Paulo",
  "state": "SP"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 5,
      "email": "medico@clinica.com",
      "fullName": "Dr. João Santos",
      "role": "PROFESSIONAL"
    }
  }
}
```

---

### 🔄 POST `/babies/:babyId/professionals/:linkId/resend-invite`
Reenviar convite.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "message": "Convite reenviado com sucesso"
}
```

---

### 🗑️ DELETE `/babies/:babyId/professionals/:linkId`
Remover profissional do bebê.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "message": "Profissional removido com sucesso"
}
```

---

### ✏️ PATCH `/babies/:babyId/professionals/:linkId`
Atualizar vínculo com profissional.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "notes": "Notas atualizadas",
  "role": "PEDIATRICIAN"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "professionalId": 5,
    "babyId": 1,
    "role": "PEDIATRICIAN",
    "notes": "Notas atualizadas",
    "updatedAt": "2024-01-20T15:00:00.000Z"
  }
}
```

---

### 👥 GET `/professionals/my-patients`
Obter lista de pacientes (para profissionais).

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "baby": {
        "id": 1,
        "name": "João Silva",
        "birthDate": "2024-01-15",
        "age": "1 mês"
      },
      "caregiver": {
        "id": 1,
        "fullName": "Maria Silva",
        "email": "maria@email.com",
        "phone": "(11) 98765-4321"
      },
      "role": "PEDIATRICIAN",
      "linkedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

## Exportação (Export)

### 📥 GET `/export/:babyId/routines`
Exportar rotinas em CSV.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `startDate` (opcional): Data inicial (YYYY-MM-DD)
- `endDate` (opcional): Data final (YYYY-MM-DD)
- `types` (opcional): Array de tipos de rotina

**Response 200:**
Retorna arquivo CSV para download.

**Exemplo de CSV:**
```csv
Data,Tipo,Início,Fim,Duração (min),Notas
2024-01-15,Alimentação,10:00,10:30,30,Mamada no peito esquerdo
2024-01-15,Sono,20:00,07:00,660,Dormiu bem
```

---

### 📥 GET `/export/:babyId/growth`
Exportar registros de crescimento em CSV.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
Retorna arquivo CSV para download.

---

### 📥 GET `/export/:babyId/milestones`
Exportar marcos de desenvolvimento em CSV.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
Retorna arquivo CSV para download.

---

### 📥 GET `/export/:babyId/full`
Exportar relatório completo em PDF.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
Retorna arquivo PDF para download com relatório completo incluindo:
- Dados do bebê
- Estatísticas gerais
- Gráficos de crescimento
- Histórico de rotinas
- Marcos de desenvolvimento

---

## 📝 Notas Importantes

### Formato de Data/Hora
- Todas as datas são em formato ISO 8601: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Timezone: UTC (converter no cliente para timezone local)

### Paginação
Endpoints de listagem suportam:
- `page`: Número da página (padrão: 1)
- `limit` ou `per_page`: Itens por página (padrão: 20, máximo: 100)

### Meta Fields (Campos Personalizados)
O campo `meta` em rotinas aceita qualquer estrutura JSON com dados específicos do tipo de rotina.

#### Exemplos de Meta por Tipo:

**Feeding (Alimentação):**
```json
{
  "feedingType": "breast" | "bottle" | "solid",
  "breastSide": "left" | "right" | "both",
  "complement": "yes" | "no",
  "complementType": "formula" | "donated_milk",
  "complementMl": 50,
  "bottleMl": 120,
  "bottleMilkType": "breast" | "formula",
  "solidFoods": ["banana", "papinha de legumes"]
}
```

**Sleep (Sono):**
```json
{
  "location": "crib" | "bed" | "stroller",
  "environment": "dark" | "light",
  "quality": "good" | "fair" | "poor"
}
```

**Diaper (Fralda):**
```json
{
  "diaperType": "wet" | "dirty" | "both",
  "consistency": "normal" | "soft" | "hard",
  "color": "yellow" | "green" | "brown"
}
```

**Bath (Banho):**
```json
{
  "waterTemperature": "warm" | "cool",
  "hairWashed": true | false,
  "productsUsed": ["shampoo", "sabonete"]
}
```

**Extraction (Extração de Leite):**
```json
{
  "extractionType": "manual" | "electric_pump" | "hand_pump",
  "breastSide": "left" | "right" | "both",
  "quantityMl": 150
}
```

### Rate Limiting
- Login/Registro: 5 requisições/minuto por IP
- Outras rotas: 100 requisições/minuto por token

### CORS
A API aceita requisições de qualquer origem em desenvolvimento.  
Em produção, configurar domínios permitidos.

### Validação
Erros de validação retornam código 400 com detalhes:
```json
{
  "success": false,
  "error": "Erro de validação",
  "details": [
    "Email é obrigatório",
    "Senha deve ter no mínimo 8 caracteres"
  ]
}
```

---

## 🔗 Links Úteis

- **JWT Debugger:** https://jwt.io/
- **API Testing:** https://www.postman.com/
- **HTTP Status Codes:** https://httpstatuses.com/

---

**Última atualização:** 11/12/2024
**Versão da API:** v1
