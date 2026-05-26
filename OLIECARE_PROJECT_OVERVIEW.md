# OlieCare - Visao Completa do Projeto

## 1. Identidade e Proposito

**OlieCare** (tambem referenciado como Olive Baby) e uma plataforma completa de acompanhamento da rotina e saude do bebe. O produto atende tres perfis de usuario:

- **Familia** — pais, avos, babas e cuidadores que registram rotinas diarias do bebe
- **Profissionais de saude** — pediatras, obstetras, consultoras de amamentacao com portal clinico
- **Admin** — gestao operacional, metricas, comunicacoes, blog e configuracao de IA

**Modelo de negocio:** freemium com planos pagos via Stripe (Free, Premium, Professional, Clinic).
**Dominio:** `oliecare.cloud` (subdomínios `prof.*` para B2B, `*.oliecare.cloud` para clinicas white-label).
**Linguagem do produto:** Portugues (Brasil).

---

## 2. Arquitetura do Ecossistema

O projeto e composto por 4 repositorios:

| Repositorio | Papel |
|-------------|-------|
| `olive-baby-web` | SPA React — interface do usuario (familia, profissional, admin) |
| `olive-baby-api` | API REST Express — logica de negocio, banco, integrações |
| `n8n-workflows` | 20 workflows n8n — automacao, digests, jornadas, campanhas |
| `mcp-dev-brasil` | Monorepo MCP — servidor MCP para WhatsApp via Evolution API |

**Fluxo de dados:**
- O frontend (SPA) comunica-se com o backend via HTTP/Axios (`VITE_API_URL`)
- O n8n chama endpoints da API via webhooks HTTP e schedules cron
- O backend integra com servicos externos: Stripe, MailerSend, Firebase, Anthropic/OpenAI, Evolution API
- O MCP Evolution API expoe 39 tools para controlar WhatsApp via protocolo MCP (stdio)

---

## 3. Stack Tecnica

### 3.1 Frontend (`olive-baby-web`)

| Camada | Tecnologia |
|--------|------------|
| Build | Vite 7 (`@vitejs/plugin-react`) |
| UI | React 19 + TypeScript |
| Roteamento | react-router-dom 7 (BrowserRouter) |
| Estilo | Tailwind CSS 3 + `@tailwindcss/forms` + `@tailwindcss/typography` |
| Estado global | Zustand (stores `authStore`, `babyStore` com persist localStorage) |
| Dados async | TanStack React Query v5 |
| HTTP | Axios (instancia principal + `adsApi` separado) |
| Formularios | react-hook-form + Zod + `@hookform/resolvers` |
| Animacoes | framer-motion |
| Icones | lucide-react |
| Graficos | Chart.js + react-chartjs-2 |
| SEO | react-helmet-async |
| PWA | vite-plugin-pwa (Workbox) |
| Push/Analytics | Firebase (app, analytics, messaging/FCM) |
| PDF | jspdf + html2canvas |
| Utilitarios | date-fns, clsx, tailwind-merge |
| Testes E2E | Playwright |

**Design system:** paleta customizada (`olive`, `sand`, `baby`, `peach`, `lavender`), fontes Inter/DM Sans/Lora, dark mode via Tailwind `class` strategy com `ThemeProvider` (claro/escuro/sistema).

**PWA:** manifest pt-BR, `start_url: /dashboard`, shortcuts de rotinas, service worker com push notifications customizado (`sw-push.js`), cache Workbox (StaleWhileRevalidate para blog, NetworkFirst para dados).

### 3.2 Backend (`olive-baby-api`)

| Camada | Tecnologia |
|--------|------------|
| Runtime | Node.js >= 20 |
| Framework | Express 4 + TypeScript (CommonJS) |
| Banco de dados | PostgreSQL via Prisma 5 |
| Validacao | Zod (env, request bodies) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Cache | ioredis (opcional, fallback em memoria) |
| Email | MailerSend (primario), Brevo (fallback), SMTP/Nodemailer (legacy) |
| Pagamentos | Stripe |
| Push | web-push (VAPID) + Firebase Admin (FCM) |
| Log | Winston + winston-daily-rotate-file |
| Seguranca | Helmet, CORS, express-rate-limit |
| IA | Anthropic Claude + OpenAI (chat, RAG com pgvector, blog) |
| Testes | Jest |

### 3.3 Automacao (`n8n-workflows`)

- 20 workflows JSON (numeracao 01-19 + 2 especiais)
- Tipos: webhooks proxy BFF (01-08), cron Slack digests (10-12), push/B2B (13-14), jornadas/campanhas agendadas (15-19)
- Integracoes: API OlieCare, Slack, WhatsApp (Evolution via API), OpenAI (indiretamente via API admin)

### 3.4 MCP Evolution API (`mcp-dev-brasil/packages/communication/evolution-api`)

- Servidor MCP TypeScript (`@modelcontextprotocol/sdk`, transporte stdio)
- 39 tools: instancias (7), mensagens (13), chat (9), grupos (6), perfil (2), webhook (2)
- Proxy MCP → HTTP para servidor Evolution API v2 auto-hospedado
- Env: `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`

---

## 4. Modelo de Dados (Prisma Schema)

Banco PostgreSQL com extensao pgvector (embeddings 1536-dim). Schema em `prisma/schema.prisma`.

### 4.1 Enums (36)

`UserRole` (PARENT, CAREGIVER, PEDIATRICIAN, SPECIALIST, ADMIN), `Gender`, `Relationship`, `RegistrationSource`, `ProfessionalStatus`, `ProfessionalRole`, `RoutineType` (FEEDING, SLEEP, DIAPER, BATH, MILK_EXTRACTION), `BabyMemberType`, `BabyMemberRole`, `BabyMemberStatus`, `BabyInviteStatus`, `PlanType` (FREE, PREMIUM, PROFESSIONAL, CLINIC), `SubscriptionStatus`, `BillingInterval`, `UserStatus`, `NotificationStatus`, `NotificationType`, `NotificationSeverity`, `VaccineStatus`, `VaccineCalendarSource`, `AuditAction`, `AiMessageRole`, `AiInsightSeverity`, `AiInsightType`, `AlertSeverity`, `AlertStatus`, `JourneyStatus`, `EnrollmentStatus`, `AiConfigStatus`, `KnowledgeBaseStatus`, `DevicePlatform`, `AppointmentStatus`, `AppointmentType`, `VisitType`, `PatientInviteStatus`, `BlogPostStatus`

### 4.2 Modelos (53) por dominio

**Auth e Usuarios:**
- `User` — email, passwordHash, role (UserRole), status, onboardingCompleted
- `Caregiver` — nome, relationship, phone, cpfHash, foto; pertence a User
- `RefreshToken` — token JWT de refresh, expiresAt
- `PasswordReset` — token, expiresAt, used
- `UserSettings` — notificacoes, aparencia (tema, idioma), timezone

**Bebes:**
- `Baby` — nome, birthDate, gender, premature, gestationalWeeks, foto
- `CaregiverBaby` — relacao N:N Caregiver↔Baby com role (isPrimary)
- `BabyMember` — membros com tipo (PARENT, FAMILY, PROFESSIONAL) e role granular
- `BabyInvite` — convites por email/token para acessar bebe

**Rotinas:**
- `RoutineLog` — type (RoutineType), startedAt, endedAt, meta (JSON), notes, timezone

**Saude:**
- `Growth` — peso, altura, perimetro cefalico, data
- `Milestone` — key, achievedAt (marcos de desenvolvimento predefinidos)
- `VaccineDefinition` — definicoes de vacinas por calendario (PNI, SBIM)
- `BabyVaccineRecord` — registro de vacinacao do bebe

**Profissionais:**
- `Professional` — registrationNumber (CRM), specialization, status, clinicName
- `BabyProfessional` — vinculo profissional↔bebe (addedAt)
- `PatientInvite` — convite de profissional para paciente

**Clinicas:**
- `Clinic` — nome, slug (subdominio), CNPJ, endereco, configs JSON
- `ClinicProfessional` — vinculo clinica↔profissional com role
- `ClinicSubscription` — assinatura da clinica
- `ProfessionalSchedule` — horarios de atendimento por dia da semana
- `ScheduleException` — excecoes (folgas, feriados)
- `Appointment` — agendamento: bebe, profissional, clinica, status, data/hora

**Clinico:**
- `BabyClinicalInfo` — informacoes clinicas persistentes (alergias, tipo sanguineo)
- `ClinicalVisit` — consulta/visita com tipo, notas, medidas
- `Prescription` — prescricao medica com conteudo
- `MedicalCertificate` — atestado medico

**Inteligencia Artificial:**
- `AiDocument` — documento para RAG
- `AiChunk` — chunk com embedding vector(1536) para busca semantica
- `AiChatSession` — sessao de chat AI por bebe
- `AiChatMessage` — mensagens na sessao (role: user/assistant/system/tool)
- `AiInsight` — insights gerados pela IA (tipo, severidade, lido, dismissed)
- `AiAssistantConfig` — configuracao do assistente (modelo, temperatura, system prompt)
- `KnowledgeBaseDocument` — documentos da base de conhecimento (status, chunks)

**Billing:**
- `Plan` — plano (type, preco, features JSON, stripeProductId/PriceId)
- `Subscription` — assinatura ativa do usuario (status, periodo, stripeSubscriptionId)
- `BillingEvent` — log de eventos Stripe (type, amount, metadata)

**Comunicacoes:**
- `EmailCommunication` — registro de emails enviados (provider, status, opens, clicks)
- `Notification` — notificacoes in-app (tipo, severidade, lida, arquivada)
- `DeviceToken` — tokens de push (plataforma, VAPID/FCM, ativo)

**Admin e Operacoes:**
- `AuditEvent` — auditoria de acoes (userId, action, resource, details)
- `ApiEvent` — eventos de API (erros, latencia alta, rate limit)
- `SystemAlert` — alertas do sistema (severidade, status, resolvido)
- `AlertConfig` — configuracao de regras de alerta

**Jornadas (Customer Journeys):**
- `Journey` — jornada automatizada (nome, trigger, status)
- `JourneyStep` — passo da jornada (tipo: email/push/whatsapp/wait, ordem, config)
- `TriggerConfig` — configuracao de triggers (evento, condicoes)
- `JourneyEnrollment` — inscricao do usuario em jornada
- `JourneyStepExecution` — execucao de cada passo (status, resultado)

**Blog:**
- `BlogCategory` — categorias do blog (nome, slug)
- `BlogTag` — tags
- `BlogPost` — post (titulo, slug, conteudo, status, SEO meta, autor, capa)
- `BlogPostTag` — relacao N:N post↔tag

---

## 5. Endpoints da API

Prefixo base: `/api/v1` (configuravel via `API_PREFIX`).

### 5.1 Auth e Usuarios
- `POST /auth/register` — registro
- `POST /auth/login` — login (retorna access + refresh tokens)
- `POST /auth/refresh` — renovar tokens
- `POST /auth/logout` — logout
- `POST /auth/forgot-password` — solicitar reset
- `POST /auth/reset-password` — redefinir senha
- `POST /auth/change-password` — alterar senha (autenticado)
- `DELETE /auth/account` — excluir conta
- `POST /auth/setup-admin` — bootstrap do primeiro admin
- `GET /caregivers/me` — perfil do cuidador logado
- `PUT /caregivers/me` — atualizar perfil
- `GET /caregivers/search` — buscar cuidadores
- `GET /caregivers/:id` — cuidador por ID

### 5.2 Bebes
- `GET/POST /babies` — listar/criar bebes
- `GET/PUT/DELETE /babies/:id` — CRUD bebe
- Sub-rotas: `/babies/:babyId/members`, `/babies/:babyId/invites`, `/babies/:babyId/professionals`

### 5.3 Rotinas
- `GET/POST /routines` — listar/criar rotinas
- `PUT/DELETE /routines/:id` — atualizar/excluir
- Timers: start/stop para sono, alimentacao, banho, extracao
- Compat: `GET /routines/active/:babyId`

### 5.4 Dados de Saude
- `GET /stats/:babyId` — estatisticas do bebe
- `GET /stats/:babyId/history` — historico
- `GET /stats/:babyId/volume-by-type` — volume por tipo
- `/growth` e `/babies/:babyId/growth` — CRUD registros de crescimento + stats
- `/milestones` e `/babies/:babyId/milestones` — marcos predefinidos, marcar/desmarcar, progresso
- `/vaccines` e `/babies/:babyId/vaccines` — calendarios, definicoes, registros (Premium)
- `GET /export/*` — CSV de rotinas, crescimento, marcos, relatorio completo

### 5.5 IA
- `GET /ai/health` — status do servico AI
- `POST/GET /ai/chat/sessions` — sessoes de chat
- `POST /ai/chat/sessions/:sessionId/messages` — enviar mensagem
- `GET/POST /ai/insights` — listar/gerar insights
- `PUT /ai/insights/:id/read` — marcar lido
- `PUT /ai/insights/:id/dismiss` — dispensar

### 5.6 Billing (Stripe)
- `GET /billing/status` — status publico
- `POST /billing/webhook` — webhook Stripe (body raw)
- `GET /billing/plans` — planos disponiveis
- `GET /billing/me` — assinatura do usuario
- `POST /billing/checkout` — criar sessao checkout
- `POST /billing/portal` — portal de gerenciamento
- Rotas admin: listar subscricoes e eventos

### 5.7 Profissionais e Clinicas
- `/professionals` — verificar token, ativar, meus pacientes
- `/clinics` — CRUD clinicas, by-slug publico
- `/appointments` — agenda, slots, excecoes, cancelamento
- `/patient-invites` — convites profissional→paciente
- `/babies/:babyId/clinical-info` — informacoes clinicas
- `/babies/:babyId/visits` — visitas clinicas
- `/babies/:babyId/prescriptions` — prescricoes
- `/babies/:babyId/certificates` — atestados

### 5.8 Comunicacoes
- `/notifications` — listar, contar, ler, arquivar, excluir
- `/device-tokens` — VAPID public key, capabilities, registrar, testar, stats admin
- `/settings` — notificacoes, aparencia, timezone

### 5.9 Admin
- `/admin` — metricas, users, babies, funil, coortes, paywall, erros, summaries
- `/admin` n8n: execute-journey, trigger-push, send-whatsapp, blog-submit-draft, execution-summary
- `/admin` comunicacoes: enviar email, push broadcast, health
- `/admin/ai` — configs do assistente, knowledge base CRUD, preview
- `/admin/blog` — CRUD posts, categorias, tags; AI: topicos, conteudo, SEO, imagem; stats; hooks n8n

### 5.10 Outros
- `/blog` — posts publicos, categorias, tags, sitemap, imagens
- `/invites/verify-token` — verificacao publica de convite
- `/onboarding` — status, skip, complete
- `/monitoring` — status (publico), health/metrics (Bearer token)
- `/email-data` — dados para templates de email (stats, insights, milestones, weekly-summary)
- `GET /health` — health check basico

---

## 6. Autenticacao e Autorizacao

### 6.1 Fluxo JWT
1. Login/registro retorna `accessToken` (curta duracao, default 1h) + `refreshToken` (7d)
2. Frontend armazena tokens em localStorage via Zustand persist (`olive-baby-auth`)
3. Interceptor Axios adiciona `Authorization: Bearer <accessToken>` + `x-correlation-id`
4. Em 401, interceptor tenta `POST /auth/refresh` (fila anti-loop), atualiza tokens ou forca logout
5. `useSessionManager` decodifica JWT e renova proativamente antes de expirar

### 6.2 Roles e Permissoes
- 5 roles: `PARENT`, `CAREGIVER`, `PEDIATRICIAN`, `SPECIALIST`, `ADMIN`
- Matriz `ROLE_PERMISSIONS` no backend define permissoes por role
- Middlewares: `requireCaregiver`, `requireProfessional`, `requireAdmin`
- Middleware `permission.middleware.ts` verifica permissoes por acao

### 6.3 Entitlements (Paywall)
- Middleware `entitlements.middleware.ts` + service `entitlements.service.ts`
- Verifica features e limites por plano (Free vs Premium vs Professional vs Clinic)
- Exemplo: vacinas so para Premium+, clinicas so para Professional+

### 6.4 Acesso a Bebe
- Middleware `baby-access.middleware.ts` verifica se o usuario autenticado tem acesso ao bebe solicitado
- Considera: CaregiverBaby, BabyMember, BabyProfessional

### 6.5 Guards no Frontend
- `ProtectedRoute` — requer autenticacao
- `AdminRoute` — requer role ADMIN
- `ProfessionalRoute` — requer role PEDIATRICIAN ou SPECIALIST
- `SessionGuard` — gerencia sessao e eventos de expiracao
- `BabyInitializer` — carrega bebes apos autenticacao

---

## 7. Rotas do Frontend (SPA)

### 7.1 Publicas
- `/` — landing B2C ou B2B (baseado em `shouldShowB2BLanding()`: subdominio, UTM, cookie)
- `/para-profissionais` — landing B2B dedicada
- `/olive-assistente` — pagina do assistente AI
- `/login`, `/register`, `/forgot-password`, `/reset-password`
- `/activate-professional`, `/invite/accept`
- `/privacidade`, `/termos` — paginas legais (SEO)
- `/blog`, `/blog/:slug` — blog publico

### 7.2 Protegidas (Familia)
- `/onboarding` — wizard de primeiro acesso
- `/dashboard` — painel principal com resumo do dia
- `/routines`, `/routines/feeding`, `/routines/sleep`, `/routines/diaper`, `/routines/bath`, `/routines/extraction`
- `/feeding/dashboard` — dashboard detalhado de alimentacao
- `/growth`, `/milestones`, `/vaccines`
- `/export` — exportacao de dados
- `/team` — equipe de cuidadores
- `/assistant` — chat com assistente AI
- `/settings/*` — perfil, bebes, notificacoes, privacidade, aparencia, billing, ajuda, membros, compartilhamento

### 7.3 Portal Profissional (`/prof/*`)
- `/prof/dashboard` — visao geral
- `/prof/agenda` — agenda de consultas
- `/prof/patients`, `/prof/patients/:babyId` — lista e detalhe de pacientes
- `/prof/invites` — convites enviados
- `/prof/settings` — configuracoes do profissional

### 7.4 Admin (`/admin/*`)
- `/admin` — dashboard KPIs
- `/admin/users`, `/admin/babies` — gestao
- `/admin/usage`, `/admin/activation`, `/admin/monetization`, `/admin/quality` — metricas
- `/admin/errors`, `/admin/alerts` — operacoes
- `/admin/communications`, `/admin/journeys` — comunicacoes e jornadas
- `/admin/settings`, `/admin/billing` — configuracoes
- `/admin/ai-assistant` — config AI + knowledge base
- `/admin/ads`, `/admin/ads/campaigns`, `/admin/ads/agent` — anuncios
- `/admin/blog`, `/admin/blog/new`, `/admin/blog/:id/edit`, `/admin/blog/categories` — CMS

---

## 8. Funcionalidades por Modulo

### 8.1 Familia
- **Dashboard:** resumo diario com contadores de rotinas, graficos, rotinas ativas, widgets
- **Rotinas:** trackers com timer para alimentacao (peito/mamadeira/solidos), sono, fralda, banho, extracao de leite; historico e estatisticas detalhadas por tipo
- **Crescimento:** registro de peso/altura/perimetro cefalico com graficos de referencia WHO
- **Marcos:** checklist de marcos de desenvolvimento predefinidos por faixa etaria
- **Vacinas:** calendarios PNI e SBIM, timeline visual, registro de doses (Premium)
- **Exportacao:** CSV de rotinas, crescimento, marcos; relatorio completo
- **Assistente IA:** chat contextual com dados do bebe, insights gerados automaticamente
- **Compartilhamento:** convites por email para familia e profissionais com roles granulares
- **Notificacoes:** push web (VAPID), push mobile (FCM), notificacoes in-app com drawer

### 8.2 Profissional
- **Dashboard:** lista de pacientes vinculados com resumo rapido
- **Agenda:** horarios de atendimento por dia, excecoes, slots disponiveis
- **Prontuario:** informacoes clinicas persistentes, historico de visitas
- **Prescricoes e atestados:** criacao e gestao com modelo proprio
- **Convites:** enviar convites para pacientes (familia aceita no app)
- **Clinicas:** cadastro com slug white-label, vinculo de profissionais

### 8.3 Admin
- **KPIs:** usuarios ativos, novos registros, retencao, ativacao, monetizacao, qualidade de dados
- **Gestao:** listar/editar usuarios e bebes, alterar roles e planos
- **Monitoramento:** alertas de sistema, erros de API, health check, metricas
- **Comunicacoes:** envio de email (MailerSend/Brevo), push broadcast, WhatsApp (via n8n/Evolution)
- **Jornadas:** CRUD de customer journeys com steps (email, push, whatsapp, wait), triggers, inscricoes
- **Blog CMS:** criar/editar posts, categorias, tags; geracao AI de topicos, conteudo, SEO e imagens
- **AI Config:** configurar modelo, temperatura, system prompt; gerenciar knowledge base para RAG
- **Ads:** campanhas e agent de anuncios

---

## 9. Integracoes Externas

| Servico | Uso | Arquivo principal |
|---------|-----|-------------------|
| **Stripe** | Checkout, portal, webhooks, planos | `api/src/services/billing.service.ts` |
| **MailerSend** | Email transacional (primario) | `api/src/services/email.service.ts` |
| **Brevo** | Email transacional (fallback) | `api/src/services/email.service.ts` |
| **SMTP/Nodemailer** | Email legacy fallback | `api/src/services/email.service.ts` |
| **Firebase Admin** | FCM push notifications | `api/src/config/firebase.ts`, `push-notification.service.ts` |
| **Firebase Web SDK** | Analytics + FCM client | `web/src/config/firebase.ts` |
| **Anthropic Claude** | Blog AI content, chat assistant | `api/src/services/ai-content.service.ts`, `ai/` |
| **OpenAI** | Chat, embeddings (text-embedding-3-small), RAG | `api/src/services/ai/` |
| **Evolution API** | WhatsApp messaging | `api` (env EVOLUTION_*), `mcp-dev-brasil`, `n8n` |
| **Slack** | Alertas operacionais, digests | `n8n` workflows 10-12, 17-19 |
| **Redis** | Rate limit, monitoring cache (opcional) | `api/src/services/rate-limit.service.ts` |
| **web-push** | VAPID push notifications | `api/src/services/push-notification.service.ts` |

---

## 10. Workflows n8n

| # | Arquivo | Tipo | Proposito |
|---|---------|------|-----------|
| 01 | `01-authentication-workflow.json` | Webhook | Proxy BFF para auth (login, registro, refresh, me, forgot-password) |
| 02 | `02-babies-workflow.json` | Webhook | CRUD de bebes |
| 03 | `03-routines-workflow.json` | Webhook | Rotinas (start/stop timers, CRUD) |
| 04 | `04-stats-growth-workflow.json` | Webhook | Estatisticas e crescimento |
| 05 | `05-admin-workflow.json` | Webhook | Painel admin (metricas, users, operacoes) |
| 06 | `06-ai-workflow.json` | Webhook | Chat AI e insights |
| 07 | `07-billing-workflow.json` | Webhook | Billing/Stripe |
| 08 | `08-extras-workflow.json` | Webhook | Marcos, notificacoes, export, onboarding |
| 10 | `10-daily-digest-workflow.json` | Cron diario | Resumo diario → Slack |
| 11 | `11-weekly-digest-workflow.json` | Cron semanal | Resumo semanal → Slack |
| 12 | `12-ops-alerts-workflow.json` | Cron diario | Alertas operacionais → Slack |
| 13 | `13-push-workflow.json` | Webhook | Web Push (device tokens, VAPID) |
| 14 | `14-b2b-workflow.json` | Webhook | Portal profissional/clinicas/agendamento |
| 15 | `15-journey-executor-workflow.json` | Schedule | Execucao de jornadas automatizadas |
| 16 | `16-push-triggers-workflow.json` | Schedule | Disparo de push notifications por regras |
| 17 | `17-comms-monitor-workflow.json` | Schedule | Monitoramento de comunicacoes → Slack |
| 18 | `18-whatsapp-campaigns-workflow.json` | Schedule | Campanhas WhatsApp (upgrade) |
| 19 | `19-blog-content-agent-workflow.json` | Schedule (seg 09h) | Agente de conteudo: gera topicos, posts e imagens com AI |
| — | `olive-baby-api-complete.json` | Manual | Exemplo minimo de login na API |
| — | `oliecare-whatsapp-ai.json` | Webhook Evolution | Bot WhatsApp com IA (recebe msg → OpenAI → responde) |

**Observacao:** nao existe workflow 09 (lacuna na numeracao).

---

## 11. Padroes e Convencoes

### 11.1 Backend (API)
- **Arquitetura:** Controller → Service → Prisma (repositorio implicito no service)
- **Erros:** classe `AppError` com factories (`notFound`, `unauthorized`, etc.); middleware centralizado distingue AppError, ZodError e erros genericos
- **Validacao:** Zod para env vars (falha no startup) e request bodies via `validation.middleware.ts`
- **Logging:** Winston com rotacao diaria, niveis configuráveis
- **Correlacao:** header `x-correlation-id` propagado em todas as requests (middleware `correlation.middleware.ts`)
- **Monitoramento:** `startHealthMonitoring` com interval de 60s em app.ts; servico de monitoring com metricas
- **Rate limit:** por endpoint especifico (nao global), com Redis ou fallback em memoria

### 11.2 Frontend (Web)
- **Fluxo de dados:** Componente → Hook customizado (React Query) → Servico API (Axios) → Backend
- **Servicos API:** arquivo unico `src/services/api.ts` exporta todos os servicos (authService, babyService, routineService, etc.)
- **Componentes UI:** design system leve em `src/components/ui/` (Button, Input, Card, Modal, Toast, Spinner, Avatar, PaywallModal)
- **Layouts:** `DashboardLayout`, `AdminLayout`, `ProfessionalLayout`, `AuthLayout`
- **Lazy loading:** paginas admin e features pesadas sao lazy-loaded com `React.lazy`; paginas criticas (landing, auth, dashboard) sao eagerly loaded
- **Tema:** `ThemeProvider` com `initializeTheme()` antes do React mount (anti-flash); Tailwind `darkMode: 'class'`

### 11.3 Geral
- **TypeScript** em todo o projeto (strict no backend)
- **Zod** como validador unico (env, forms frontend, bodies backend)
- **Prisma** como unico ORM / query builder
- **Zustand** como unico state manager global
- **React Query** para cache e sincronizacao de dados do servidor

---

## 12. Variaveis de Ambiente

### 12.1 Frontend (`olive-baby-web/.env`)

```
VITE_API_URL=http://localhost:4000/api/v1

# Firebase Web SDK (chaves publicas)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=         # opcional

# Ads API (opcional)
VITE_ADS_API_URL=
```

### 12.2 Backend (`olive-baby-api/.env`)

Validadas por Zod em `src/config/env.ts`. Obrigatorias marcadas com *.

**Servidor:**
- `NODE_ENV` (default: development), `PORT` (default: 4000), `API_PREFIX` (default: /api/v1)

**Banco:** `DATABASE_URL` *

**Cache:** `REDIS_URL` (opcional)

**JWT:** `JWT_ACCESS_SECRET` * (min 32 chars), `JWT_REFRESH_SECRET` * (min 32), `JWT_ACCESS_EXPIRES_IN` (1h), `JWT_REFRESH_EXPIRES_IN` (7d)

**Email — MailerSend:** `MAILERSEND_API_KEY`, `MAILERSEND_FROM_EMAIL` (noreply@oliecare.cloud), `MAILERSEND_FROM_NAME` (OlieCare)

**Email — Brevo:** `BREVO_API_KEY`, `BREVO_FROM_EMAIL`, `BREVO_FROM_NAME`

**Email — SMTP:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

**Frontend:** `FRONTEND_URL` (http://localhost:3000)

**Rate limit:** `RATE_LIMIT_WINDOW_MS` (900000), `RATE_LIMIT_MAX` (1000)

**Log:** `LOG_LEVEL` (info)

**Monitoramento:** `ALERT_EMAIL`, `ALERT_WEBHOOK_URL`, `MEMORY_LIMIT_MB`

**AI — Anthropic:** `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` (claude-sonnet-4-20250514)

**AI — OpenAI:** `OPENAI_API_KEY`, `OPENAI_MODEL` (gpt-4o), `OPENAI_EMBEDDING_MODEL` (text-embedding-3-small), `AI_MAX_TOKENS` (2048), `AI_TEMPERATURE` (0.7), `AI_RAG_TOP_K` (6)

**Seguranca:** `CPF_SALT`

**Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`

**Push — VAPID:** `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (mailto:contato@oliecare.cloud)

**Push — Firebase:** `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

**WhatsApp:** `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE` (oliecare)

**Admin:** `ADMIN_SETUP_KEY`

**Interno:** `INTERNAL_WEB_URL` (http://olivebaby-web-server)

**Monitoramento:** `MONITORING_TOKEN`

---

## 13. Estrutura de Pastas

### 13.1 Frontend (`olive-baby-web/`)
```
src/
├── main.tsx                    # Entrada, initializeTheme()
├── App.tsx                     # Rotas e providers
├── components/
│   ├── layout/                 # Shells, guards, initializers
│   ├── ui/                     # Design system (Button, Input, Card, Modal, Toast...)
│   ├── routines/               # Trackers de rotinas
│   ├── charts/                 # Graficos WHO, stats, heatmaps
│   ├── notifications/          # Sino, drawer, insights
│   ├── admin/                  # KPIs, drawers admin
│   ├── prof/                   # Modais clinicos
│   ├── ai/, assistant/         # Chat AI
│   ├── blog/, seo/, brand/     # Blog e SEO
│   ├── babies/, pwa/, kpi/     # Diversos
│   └── animations/             # Animacoes
├── pages/
│   ├── auth/                   # Login, Register, etc.
│   ├── dashboard/              # Dashboard principal
│   ├── routines/, feeding/     # Paginas de rotinas
│   ├── growth/, milestones/    # Saude
│   ├── vaccines/, export/      # Vacinas e exportacao
│   ├── assistant/              # Chat IA
│   ├── settings/               # Configuracoes
│   ├── admin/                  # Painel admin (17+ paginas)
│   ├── prof/                   # Portal profissional
│   ├── landing/                # Landings B2C e B2B
│   ├── blog/                   # Blog publico
│   └── legal/                  # Privacidade, termos
├── services/
│   ├── api.ts                  # Cliente Axios principal + todos os servicos
│   ├── blogApi.ts              # Servicos de blog
│   ├── adminApi.ts             # Servicos admin
│   └── adsApi.ts               # Cliente Axios separado para Ads
├── stores/
│   └── authStore.ts            # Zustand (user, tokens, isAuthenticated)
├── hooks/                      # Hooks customizados (timer, stats, insights, etc.)
├── types/
│   ├── index.ts                # Tipos principais
│   ├── blog.ts, admin.ts       # Tipos especificos
│   └── ads.ts
├── theme/                      # ThemeProvider, tokens
├── lib/                        # Utilitarios (domain, landingRouter)
└── config/
    └── firebase.ts             # Firebase init
```

### 13.2 Backend (`olive-baby-api/`)
```
prisma/
└── schema.prisma               # 53 modelos, 36 enums

src/
├── app.ts                      # Express setup, middlewares globais, rotas
├── config/
│   ├── env.ts                  # Validacao Zod de env vars
│   ├── database.ts             # Prisma client
│   ├── logger.ts               # Winston config
│   └── firebase.ts             # Firebase Admin init
├── routes/
│   ├── index.ts                # Agregador de rotas
│   ├── auth.routes.ts          # 10+ endpoints auth
│   ├── baby.routes.ts          # CRUD bebes
│   ├── routine.routes.ts       # Rotinas + timers
│   ├── stats.routes.ts         # Estatisticas
│   ├── growth.routes.ts        # Crescimento
│   ├── milestone.routes.ts     # Marcos
│   ├── vaccine.routes.ts       # Vacinas
│   ├── export.routes.ts        # Exportacao
│   ├── ai.routes.ts            # Chat e insights AI
│   ├── billing.routes.ts       # Stripe
│   ├── admin.routes.ts         # Admin + n8n integrations
│   ├── admin-ai.routes.ts      # Config AI admin
│   ├── admin-blog.routes.ts    # Blog CMS
│   ├── blog.routes.ts          # Blog publico
│   ├── professional.routes.ts  # Profissionais
│   ├── clinic.routes.ts        # Clinicas
│   ├── appointment.routes.ts   # Agendamentos
│   └── ... (20+ arquivos de rotas)
├── controllers/                # 1 controller por dominio
├── services/
│   ├── auth.service.ts         # Auth logic
│   ├── baby.service.ts         # Baby logic
│   ├── routine.service.ts      # Routines logic
│   ├── billing.service.ts      # Stripe integration
│   ├── email.service.ts        # MailerSend/Brevo/SMTP
│   ├── push-notification.service.ts  # VAPID + FCM
│   ├── journey.service.ts      # Customer journeys
│   ├── ai/                     # AI services (chat, insight, openai, rag, tools)
│   ├── ai-content.service.ts   # Blog AI content
│   ├── ai-image.service.ts     # Blog AI images
│   └── ... (25+ servicos)
├── middlewares/
│   ├── auth.middleware.ts       # JWT + role guards
│   ├── permission.middleware.ts # ROLE_PERMISSIONS
│   ├── entitlements.middleware.ts # Paywall
│   ├── baby-access.middleware.ts  # Acesso ao bebe
│   ├── validation.middleware.ts   # Zod body/query
│   ├── error.middleware.ts        # Error handler central
│   ├── correlation.middleware.ts  # x-correlation-id
│   └── apiEvents.middleware.ts    # Tracking de eventos API
├── core/
│   └── entitlements/            # Entitlements service + audit
├── types/
│   └── index.ts                 # JwtPayload, ApiResponse, RoutineMeta, etc.
├── utils/
│   ├── errors/AppError.ts       # Classe de erro customizada
│   ├── ensureAdmin.ts           # Bootstrap admin
│   └── monitoring.ts            # Health monitoring
└── scripts/
    ├── seed-vaccines-pni.ts     # Seed de vacinas
    ├── ai-ingest.ts             # Ingestao de docs para RAG
    └── apply-password-reset-migration.ts
```

---

## 14. Tipos Principais (TypeScript)

### 14.1 Backend (`api/src/types/index.ts`)

```typescript
interface JwtPayload { userId: number; email: string; role: UserRole }
interface AuthenticatedRequest extends Request { user?: JwtPayload }
interface ApiResponse<T> { success: boolean; message?: string; data?: T; error?: string; pagination?: {...} }
interface PaginatedResponse<T> extends ApiResponse<T[]> { pagination: {...} }

// Metadados de rotina (campo JSON em RoutineLog)
interface FeedingMeta { feedingType?: 'breast'|'bottle'|'solid'; breastSide?; bottleMl?; bottleMilkType?; solidFoods?; complement?; complementMl?; ... }
interface DiaperMeta { diaperType?: 'pee'|'poop'|'both' }
interface MilkExtractionMeta { extractionMl?; extractionMethod?: 'manual'|'electric' }
interface BathMeta { bathTemperature?: number }
interface SleepMeta { sleepQuality?: 'good'|'regular'|'bad'; wokeUpCount?: number }
type RoutineMeta = FeedingMeta | DiaperMeta | MilkExtractionMeta | BathMeta | SleepMeta

interface BabyStats { period; labels; hourlyLabels; totalSleepHours24h; averageSleepPerDay; totalFeedingMinutes24h; ... }
```

### 14.2 Frontend (`web/src/types/index.ts`)
Espelha os tipos do backend para consumo no SPA: `User`, `Caregiver`, `AuthTokens`, `Baby`, tipos de rotinas discriminados, `Growth`, `Milestone`, stats, `ApiResponse`, formularios, AI, notificacoes.

---

## 15. Deploy e Infraestrutura

- **Docker:** `Dockerfile` no backend (Node 20, Prisma generate + migrate deploy)
- **Frontend:** build Vite estatico, servido como SPA
- **n8n:** instancia self-hosted em `n8n.oliecare.cloud`
- **Evolution API:** instancia self-hosted (Docker) para WhatsApp
- **Banco:** PostgreSQL com extensao pgvector
- **Dominio:** `oliecare.cloud` com subdomínios para profissionais e clinicas

---

## 16. Contexto para Desenvolvimento

Ao desenvolver novas features ou agentes para OlieCare, considere:

1. **Sempre use TypeScript** com tipos estritos
2. **Valide com Zod** tanto no frontend (forms) quanto no backend (bodies/queries)
3. **Siga o padrao controller→service→Prisma** no backend
4. **Use React Query** para dados do servidor e **Zustand** apenas para estado local persistente
5. **Respeite o sistema de roles e entitlements** — cada feature deve verificar permissoes e plano
6. **Middleware de baby-access** e obrigatorio para qualquer rota que acesse dados de um bebe
7. **Emails** devem usar o servico de email (MailerSend primario) e registrar em EmailCommunication
8. **Push** deve usar o servico de push-notification (VAPID + FCM) e registrar DeviceToken
9. **Jornadas** sao executadas via n8n (workflow 15) que chama `/admin/n8n/execute-journey`
10. **Blog AI** e orquestrado pelo n8n (workflow 19) que chama endpoints `/admin/blog/ai/*`
11. **WhatsApp** e enviado via API admin endpoints que delegam para Evolution API
12. **Correlacao:** manter header `x-correlation-id` em integrações para rastreabilidade
13. **Tailwind** com as cores do design system (olive, sand, baby, peach, lavender) e dark mode
14. **PWA:** considerar cache strategy ao adicionar novas rotas de API
15. **Lazy loading:** paginas novas devem ser lazy-loaded exceto se forem criticas para LCP
