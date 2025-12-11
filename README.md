# 🌿 Olive Baby Web

Frontend React para o sistema Olive Baby Tracker - Acompanhamento do desenvolvimento de bebês.

## 🚀 Tecnologias

- **React** 18
- **TypeScript** 5.x
- **Vite** 7.x
- **Tailwind CSS** 3.x
- **React Router** 6
- **TanStack Query** (React Query)
- **Zustand** (State Management)
- **Chart.js** (Gráficos)
- **React Hook Form** + **Zod** (Formulários)

## 📋 Funcionalidades

- ✅ Login e Registro
- ✅ Onboarding (cadastro de bebê)
- ✅ Dashboard com estatísticas
- ✅ Trackers de rotinas com timer
- ✅ Gráficos de sono, alimentação, fraldas
- ✅ Acompanhamento de crescimento
- ✅ Marcos do desenvolvimento
- ✅ Gestão de equipe (profissionais)
- ✅ Exportação CSV e PDF
- ✅ Configurações (perfil, bebês, notificações)

## 🛠️ Instalação

```bash
# Clonar repositório
git clone https://github.com/SEU_USUARIO/olive-baby-web.git
cd olive-baby-web

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env

# Iniciar em desenvolvimento
npm run dev

# Build para produção
npm run build
npm run preview
```

## 📝 Variáveis de Ambiente

```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_APP_NAME=Olive Baby
```

## 🐳 Docker

```bash
# Build da imagem
docker build -t olive-baby-web .

# Executar container
docker run -p 80:80 olive-baby-web
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── charts/      # Gráficos (Chart.js)
│   ├── layout/      # Layouts (Auth, Dashboard)
│   ├── routines/    # Trackers de rotinas
│   └── ui/          # Componentes base
├── hooks/           # Custom hooks
├── lib/             # Utilitários
├── pages/           # Páginas
│   ├── auth/        # Login, Registro
│   ├── dashboard/   # Dashboard
│   ├── export/      # Exportação
│   ├── growth/      # Crescimento
│   ├── milestones/  # Marcos
│   ├── onboarding/  # Onboarding
│   ├── settings/    # Configurações
│   └── team/        # Equipe
├── services/        # API services
├── stores/          # Zustand stores
└── types/           # TypeScript types
```

## 🎨 Design System

- **Cores principais**: Olive (#65a30d), Baby colors
- **Fonte**: Inter (Google Fonts)
- **Ícones**: Lucide React
- **Animações**: Tailwind CSS

## 📄 Licença

MIT © Olive Baby Team
