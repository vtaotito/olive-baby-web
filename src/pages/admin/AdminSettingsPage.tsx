// Olive Baby Web - Admin Settings Page
import { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  Globe, 
  Mail,
  Key,
  Users,
  AlertTriangle,
  Check,
  Info,
  ExternalLink,
} from 'lucide-react';
import { AdminLayout } from '../../components/layout';
import { cn } from '../../lib/utils';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  settings: Setting[];
}

interface Setting {
  id: string;
  label: string;
  description?: string;
  type: 'toggle' | 'select' | 'input' | 'info';
  value?: string | boolean;
  options?: { label: string; value: string }[];
  disabled?: boolean;
}

const settingSections: SettingSection[] = [
  {
    id: 'general',
    title: 'Configurações Gerais',
    description: 'Configurações básicas da aplicação',
    icon: Settings,
    settings: [
      {
        id: 'app_name',
        label: 'Nome da Aplicação',
        type: 'input',
        value: 'Olive Baby',
        disabled: true,
      },
      {
        id: 'app_version',
        label: 'Versão',
        type: 'info',
        value: '1.1.0',
      },
      {
        id: 'environment',
        label: 'Ambiente',
        type: 'info',
        value: 'Produção',
      },
    ],
  },
  {
    id: 'security',
    title: 'Segurança',
    description: 'Configurações de segurança e acesso',
    icon: Shield,
    settings: [
      {
        id: 'two_factor',
        label: 'Autenticação de Dois Fatores',
        description: 'Exigir 2FA para acessar o admin',
        type: 'toggle',
        value: false,
        disabled: true,
      },
      {
        id: 'session_timeout',
        label: 'Timeout de Sessão',
        description: 'Tempo até expirar sessão inativa',
        type: 'select',
        value: '1h',
        options: [
          { label: '30 minutos', value: '30m' },
          { label: '1 hora', value: '1h' },
          { label: '4 horas', value: '4h' },
          { label: '8 horas', value: '8h' },
        ],
        disabled: true,
      },
      {
        id: 'rate_limiting',
        label: 'Rate Limiting',
        description: 'Limitar requisições por IP',
        type: 'toggle',
        value: true,
        disabled: true,
      },
    ],
  },
  {
    id: 'notifications',
    title: 'Notificações do Admin',
    description: 'Configure alertas e notificações',
    icon: Bell,
    settings: [
      {
        id: 'new_user_alert',
        label: 'Alerta de Novo Usuário',
        description: 'Notificar quando novo usuário se cadastrar',
        type: 'toggle',
        value: true,
        disabled: true,
      },
      {
        id: 'error_alert',
        label: 'Alerta de Erros',
        description: 'Notificar erros críticos da API',
        type: 'toggle',
        value: true,
        disabled: true,
      },
      {
        id: 'payment_alert',
        label: 'Alerta de Pagamentos',
        description: 'Notificar pagamentos e assinaturas',
        type: 'toggle',
        value: true,
        disabled: true,
      },
    ],
  },
  {
    id: 'email',
    title: 'Configurações de Email',
    description: 'SMTP e templates de email',
    icon: Mail,
    settings: [
      {
        id: 'smtp_host',
        label: 'SMTP Host',
        type: 'info',
        value: 'smtp.gmail.com',
      },
      {
        id: 'smtp_port',
        label: 'SMTP Port',
        type: 'info',
        value: '587',
      },
      {
        id: 'email_from',
        label: 'Email Remetente',
        type: 'info',
        value: 'noreply@oliecare.cloud',
      },
    ],
  },
  {
    id: 'api',
    title: 'API & Integrações',
    description: 'Chaves de API e serviços externos',
    icon: Key,
    settings: [
      {
        id: 'stripe_mode',
        label: 'Stripe Mode',
        type: 'info',
        value: 'Live',
      },
      {
        id: 'openai_status',
        label: 'OpenAI Status',
        type: 'info',
        value: 'Configurado',
      },
      {
        id: 'api_docs',
        label: 'Documentação da API',
        type: 'info',
        value: '/api/v1',
      },
    ],
  },
  {
    id: 'database',
    title: 'Banco de Dados',
    description: 'Status e informações do banco',
    icon: Database,
    settings: [
      {
        id: 'db_type',
        label: 'Tipo',
        type: 'info',
        value: 'PostgreSQL 16 + pgvector',
      },
      {
        id: 'db_status',
        label: 'Status',
        type: 'info',
        value: 'Conectado',
      },
      {
        id: 'db_migrations',
        label: 'Migrations',
        type: 'info',
        value: 'Atualizadas',
      },
    ],
  },
];

function SettingRow({ setting }: { setting: Setting }) {
  const [value, setValue] = useState(setting.value);

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{setting.label}</p>
        {setting.description && (
          <p className="text-sm text-gray-500 mt-0.5">{setting.description}</p>
        )}
      </div>
      <div className="ml-4">
        {setting.type === 'toggle' && (
          <button
            disabled={setting.disabled}
            onClick={() => setValue(!value)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              value ? 'bg-olive-600' : 'bg-gray-200',
              setting.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                value ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        )}
        {setting.type === 'select' && (
          <select
            disabled={setting.disabled}
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
            className={cn(
              'block w-40 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm',
              setting.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {setting.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
        {setting.type === 'input' && (
          <input
            disabled={setting.disabled}
            type="text"
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
            className={cn(
              'block w-48 rounded-lg border border-gray-300 px-3 py-1.5 text-sm',
              setting.disabled && 'opacity-50 cursor-not-allowed'
            )}
          />
        )}
        {setting.type === 'info' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
            <Check className="w-3.5 h-3.5 text-green-500" />
            {value}
          </span>
        )}
      </div>
    </div>
  );
}

function SettingCard({ section }: { section: SettingSection }) {
  const Icon = section.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-olive-100 rounded-lg">
            <Icon className="w-5 h-5 text-olive-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{section.title}</h3>
            <p className="text-sm text-gray-500">{section.description}</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-2">
        {section.settings.map((setting) => (
          <SettingRow key={setting.id} setting={setting} />
        ))}
      </div>
    </div>
  );
}

export function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">
            Gerencie as configurações da aplicação
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Algumas configurações são gerenciadas via variáveis de ambiente 
              no servidor e não podem ser alteradas pelo painel. Entre em contato com o administrador 
              do sistema para alterações avançadas.
            </p>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {settingSections.map((section) => (
            <SettingCard key={section.id} section={section} />
          ))}
        </div>

        {/* Links úteis */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Links Úteis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://api.oliecare.cloud/health"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-olive-500 hover:bg-olive-50 transition-colors"
            >
              <Globe className="w-5 h-5 text-olive-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">API Health Check</p>
                <p className="text-sm text-gray-500">Verificar status da API</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-olive-500 hover:bg-olive-50 transition-colors"
            >
              <Key className="w-5 h-5 text-olive-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Stripe Dashboard</p>
                <p className="text-sm text-gray-500">Gerenciar pagamentos</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
            <a
              href="https://platform.openai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-olive-500 hover:bg-olive-50 transition-colors"
            >
              <AlertTriangle className="w-5 h-5 text-olive-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">OpenAI Platform</p>
                <p className="text-sm text-gray-500">Gerenciar API keys</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminSettingsPage;
