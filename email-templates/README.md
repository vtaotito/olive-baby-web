# Templates de e-mail – OlieCare

Esta pasta contém os HTMLs de todos os e-mails enviados pela plataforma (B2C e B2B), para validação visual e sugestões de melhoria.

## Canal e tipo de cada template

| Arquivo | Canal | Descrição | Disparo |
|---------|--------|-----------|---------|
| `01-professional-invite.html` | **B2B** | Convite para profissional (cuidador → profissional) ativar conta e acompanhar bebê | Ao enviar convite a profissional |
| `02-baby-invite.html` | **B2C** | Convite para pais/familiares/profissionais acessarem um bebê | Ao convidar membro para o bebê |
| `03-password-reset.html` | **B2C/B2B** | Recuperação de senha | Esqueci minha senha |
| `04-welcome.html` | **B2C/B2B** | Boas-vindas após registro | Após criar conta |
| `05-alert.html` | **Interno** | Alerta para admins (monitoramento) | Falhas/alertas do sistema |
| `06-payment-confirmation.html` | **B2C** | Confirmação de pagamento (Stripe) | Após cobrança bem-sucedida |
| `07-subscription-cancelled.html` | **B2C** | Cancelamento de assinatura | Ao cancelar plano |
| `08-patient-invite.html` | **B2B** | Convite de paciente (profissional → paciente/cuidador) para OlieCare | Profissional convida paciente |

## Como validar

1. Abrir cada `.html` no navegador para checar layout e responsividade.
2. Testar em cliente de e-mail (Gmail, Outlook, Apple Mail) ou com [Litmus](https://litmus.com)/[Email on Acid](https://www.emailonacid.com) se disponível.
3. Verificar textos, CTAs e links (placeholders como `{{FRONTEND_URL}}` são substituídos em produção).

## Sugestões de melhoria

- **Acessibilidade:** garantir contraste (WCAG), texto alternativo em imagens (se houver), botões com área de clique adequada.
- **Mobile:** já existe viewport e estilos responsivos; validar em larguras ~320px e 414px.
- **Assunto e pré-header:** revisar subject e primeiras linhas (pré-header) em cada template.
- **Unsubscribe:** em e-mails transacionais não é obrigatório; em newsletters futuras incluir link de descadastramento.
- **Marcas e tom:** manter tom acolhedor e profissional; reforçar marca OlieCare/Olive Baby onde fizer sentido.
- **Rastreamento:** se usar MailerSend/outro provedor com open/click tracking, garantir que métricas apareçam no admin (página Comunicações).

## Onde os templates são usados no código

- API: `olive-baby-api/src/services/email.service.ts` — funções `sendProfessionalInvite`, `sendBabyInvite`, `sendPasswordResetEmail`, `sendWelcomeEmail`, `sendAlert`, `sendPaymentConfirmation`, `sendSubscriptionCancelled`, `sendPatientInviteEmail`.
- Os HTMLs desta pasta são **cópias estáticas** para preview; o HTML real é montado em runtime no `email.service.ts`.
