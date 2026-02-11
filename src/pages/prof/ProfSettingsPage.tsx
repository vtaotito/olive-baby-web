// Olive Baby Web - Professional Settings Page
import { useState } from 'react';
import {
  User, Building2, Palette, Shield, Bell,
  Sun, Moon, Monitor, Check, ChevronRight,
  Stethoscope, Mail, Phone, MapPin, LogOut,
} from 'lucide-react';
import { Card, CardBody, CardHeader, Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../components/ui/Toast';
import { useTheme, type Theme } from '../../theme';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { settingsService } from '../../services/api';

type SettingsSection = 'overview' | 'profile' | 'clinic' | 'appearance' | 'notifications' | 'security';

interface ThemeConfig {
  id: Theme;
  label: string;
  description: string;
  icon: React.ElementType;
  preview: string;
}

const themes: ThemeConfig[] = [
  {
    id: 'light',
    label: 'Claro',
    description: 'Tema claro para uso durante o dia',
    icon: Sun,
    preview: 'bg-white border-gray-200',
  },
  {
    id: 'dark',
    label: 'Escuro',
    description: 'Tema escuro para ambientes com pouca luz',
    icon: Moon,
    preview: 'bg-gray-900 border-gray-700',
  },
  {
    id: 'system',
    label: 'Sistema',
    description: 'Segue as configurações do seu dispositivo',
    icon: Monitor,
    preview: 'bg-gradient-to-r from-white to-gray-900 border-gray-400',
  },
];

const MENU_ITEMS = [
  { key: 'profile' as const, icon: User, label: 'Perfil Profissional', description: 'Informações pessoais e CRM' },
  { key: 'clinic' as const, icon: Building2, label: 'Clínica', description: 'Dados da clínica e white-label' },
  { key: 'appearance' as const, icon: Palette, label: 'Aparência', description: 'Tema e personalização visual' },
  { key: 'notifications' as const, icon: Bell, label: 'Notificações', description: 'Alertas e preferências' },
  { key: 'security' as const, icon: Shield, label: 'Segurança', description: 'Senha e acesso' },
];

export function ProfSettingsPage() {
  const { user, logout } = useAuthStore();
  const { theme: currentTheme, resolvedTheme, setTheme } = useTheme();
  const { success: showSuccess, error: showError } = useToast();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SettingsSection>('overview');
  const [isSaving, setIsSaving] = useState(false);

  const professionalName = user?.email?.split('@')[0]?.replace(/[._-]/g, ' ')?.replace(/\b\w/g, (c) => c.toUpperCase()) || 'Profissional';
  const roleLabel = user?.role === 'PEDIATRICIAN' ? 'Pediatra' : user?.role === 'SPECIALIST' ? 'Especialista' : 'Profissional';

  const handleThemeChange = async (theme: Theme) => {
    if (theme === currentTheme) return;
    setIsSaving(true);
    try {
      setTheme(theme);
      settingsService.updateAppearance({ theme }).catch(() => {});
      showSuccess('Tema atualizado!', `Tema ${themes.find(t => t.id === theme)?.label} aplicado`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || error.message || 'Falha ao atualizar tema');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Overview
  if (activeSection === 'overview') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gerencie seu perfil e preferências</p>
        </div>

        {/* Profile Summary */}
        <Card>
          <CardBody className="flex items-center gap-4 py-5">
            <div className="w-16 h-16 rounded-2xl bg-olive-100 dark:bg-olive-900/30 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-8 h-8 text-olive-600 dark:text-olive-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{professionalName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{roleLabel}</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">{user?.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveSection('profile')}>
              Editar
            </Button>
          </CardBody>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardBody className="p-0">
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {MENU_ITEMS.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => setActiveSection(item.key)}
                    className="flex items-center gap-4 w-full px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{item.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                  </button>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        {/* Logout */}
        <Button
          variant="ghost"
          fullWidth
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
          leftIcon={<LogOut className="w-5 h-5" />}
          onClick={handleLogout}
        >
          Sair da conta
        </Button>
      </div>
    );
  }

  // Section with back button
  return (
    <div className="space-y-6">
      {/* Back Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setActiveSection('overview')}>
          <ChevronRight className="w-5 h-5 rotate-180" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {MENU_ITEMS.find(m => m.key === activeSection)?.label || 'Configurações'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {MENU_ITEMS.find(m => m.key === activeSection)?.description}
          </p>
        </div>
      </div>

      {/* Profile Section */}
      {activeSection === 'profile' && (
        <div className="space-y-4 max-w-2xl">
          <Card>
            <CardHeader title="Informações Pessoais" />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nome</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{professionalName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Stethoscope className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Especialidade</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{roleLabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Função</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.role}</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Para alterar informações do perfil, entre em contato com o suporte OlieCare.
          </p>
        </div>
      )}

      {/* Clinic Section */}
      {activeSection === 'clinic' && (
        <div className="max-w-2xl">
          <Card>
            <CardHeader title="Dados da Clínica" subtitle="Personalização white-label" />
            <CardBody>
              <div className="flex flex-col items-center py-8">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
                  <Building2 className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Clínica não configurada</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
                  Configure os dados da sua clínica para personalizar o portal com sua marca, logo e cores.
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
                  Funcionalidade em desenvolvimento. Em breve você poderá personalizar o portal com a marca da sua clínica.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Appearance Section */}
      {activeSection === 'appearance' && (
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader title="Tema" subtitle="Escolha como o portal deve aparecer" />
            <CardBody>
              <div className="grid gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    disabled={isSaving}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                      currentTheme === theme.id
                        ? 'border-olive-500 bg-olive-50 dark:bg-olive-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                    )}
                  >
                    <div className={cn(
                      'w-14 h-10 rounded-lg border-2 flex items-center justify-center flex-shrink-0',
                      theme.preview
                    )}>
                      <theme.icon className={cn(
                        'w-5 h-5',
                        theme.id === 'dark' ? 'text-white' : 'text-gray-600'
                      )} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">{theme.label}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{theme.description}</p>
                    </div>
                    {currentTheme === theme.id && (
                      <div className="w-6 h-6 bg-olive-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader title="Prévia" subtitle="Visualize como o tema ficará" />
            <CardBody>
              <div className={cn(
                'p-6 rounded-xl border-2 transition-all',
                resolvedTheme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
              )}>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-8 h-8 rounded-lg', resolvedTheme === 'dark' ? 'bg-olive-800' : 'bg-olive-100')} />
                    <div className="space-y-1">
                      <div className={cn('h-2.5 w-20 rounded', resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200')} />
                      <div className={cn('h-2 w-14 rounded', resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={cn('p-3 rounded-lg', resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50')}>
                        <div className={cn('h-2 w-8 rounded mb-1.5', resolvedTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-300')} />
                        <div className={cn('h-5 w-6 rounded', resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-olive-200')} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            Tema atual: <span className="font-medium text-gray-600 dark:text-gray-300">{resolvedTheme === 'dark' ? 'Escuro' : 'Claro'}</span> — Sua preferência é salva automaticamente.
          </p>
        </div>
      )}

      {/* Notifications Section */}
      {activeSection === 'notifications' && (
        <div className="max-w-2xl">
          <Card>
            <CardHeader title="Preferências de Notificações" />
            <CardBody>
              <div className="flex flex-col items-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Configurações de notificações estarão disponíveis em breve.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Security Section */}
      {activeSection === 'security' && (
        <div className="max-w-2xl">
          <Card>
            <CardHeader title="Segurança da Conta" />
            <CardBody>
              <div className="flex flex-col items-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Configurações de segurança estarão disponíveis em breve.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
