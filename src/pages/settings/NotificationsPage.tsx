// Olive Baby Web - Notifications Settings Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronLeft,
  Moon,
  Utensils,
  Droplets,
  Bath,
  Milk,
  Clock,
  Smartphone,
  Mail,
  Volume2,
  Save,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../lib/utils';
import { settingsService } from '../../services/api';

interface NotificationSetting {
  key: string;
  icon: React.ElementType;
  label: string;
  description: string;
  enabled: boolean;
  color: string;
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Notification preferences
  const [routineNotifications, setRoutineNotifications] = useState<NotificationSetting[]>([
    { key: 'feeding', icon: Utensils, label: 'Alimentação', description: 'Lembrete para alimentar', enabled: true, color: 'bg-yellow-100 text-yellow-600' },
    { key: 'sleep', icon: Moon, label: 'Sono', description: 'Lembrete de hora de dormir', enabled: true, color: 'bg-blue-100 text-blue-600' },
    { key: 'diaper', icon: Droplets, label: 'Fralda', description: 'Lembrete para trocar fralda', enabled: false, color: 'bg-green-100 text-green-600' },
    { key: 'bath', icon: Bath, label: 'Banho', description: 'Lembrete de hora do banho', enabled: true, color: 'bg-purple-100 text-purple-600' },
    { key: 'extraction', icon: Milk, label: 'Extração', description: 'Lembrete para extração', enabled: false, color: 'bg-pink-100 text-pink-600' },
  ]);

  const [generalSettings, setGeneralSettings] = useState({
    pushEnabled: true,
    emailEnabled: false,
    soundEnabled: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  });

  // Load settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsService.getSettings();
        if (response.success && response.data) {
          const { notifications } = response.data;
          
          // Update general settings
          setGeneralSettings({
            pushEnabled: notifications.pushEnabled,
            emailEnabled: notifications.emailEnabled,
            soundEnabled: notifications.soundEnabled,
            quietHoursEnabled: notifications.quietHoursEnabled,
            quietHoursStart: notifications.quietHoursStart,
            quietHoursEnd: notifications.quietHoursEnd,
          });
          
          // Update routine notifications
          if (notifications.routineNotifications) {
            setRoutineNotifications(prev => prev.map(n => ({
              ...n,
              enabled: notifications.routineNotifications[n.key as keyof typeof notifications.routineNotifications] ?? n.enabled,
            })));
          }
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

  const toggleRoutineNotification = (key: string) => {
    setRoutineNotifications(prev =>
      prev.map(n => n.key === key ? { ...n, enabled: !n.enabled } : n)
    );
    setHasChanges(true);
  };

  const toggleGeneralSetting = (key: keyof typeof generalSettings) => {
    setGeneralSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Build routine notifications object
      const routineNotificationsData = routineNotifications.reduce((acc, n) => ({
        ...acc,
        [n.key]: n.enabled,
      }), {} as Record<string, boolean>);

      const response = await settingsService.updateNotifications({
        ...generalSettings,
        routineNotifications: routineNotificationsData,
      });

      if (response.success) {
        success('Notificações atualizadas!', 'Suas preferências foram salvas');
        setHasChanges(false);
      } else {
        throw new Error(response.message || 'Falha ao salvar');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || error.message || 'Falha ao salvar notificações');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/settings')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-olive-600" />
              Notificações
            </h1>
            <p className="text-gray-500">Configure alertas e lembretes</p>
          </div>
        </div>
        {hasChanges && (
          <Button
            onClick={handleSave}
            isLoading={isLoading}
            leftIcon={<Save className="w-5 h-5" />}
          >
            Salvar
          </Button>
        )}
      </div>

      {isLoadingSettings ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-olive-600 animate-spin" />
        </div>
      ) : (
      <div className="max-w-2xl space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader title="Configurações Gerais" />
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-olive-100 rounded-full flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-olive-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Notificações Push</h4>
                  <p className="text-sm text-gray-500">Receber no celular</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={generalSettings.pushEnabled}
                onChange={() => toggleGeneralSetting('pushEnabled')}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Notificações por Email</h4>
                  <p className="text-sm text-gray-500">Resumo diário por email</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={generalSettings.emailEnabled}
                onChange={() => toggleGeneralSetting('emailEnabled')}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Sons</h4>
                  <p className="text-sm text-gray-500">Tocar som nas notificações</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={generalSettings.soundEnabled}
                onChange={() => toggleGeneralSetting('soundEnabled')}
              />
            </div>
          </CardBody>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader title="Modo Silencioso" />
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Horário de Silêncio</h4>
                  <p className="text-sm text-gray-500">Pausar notificações à noite</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={generalSettings.quietHoursEnabled}
                onChange={() => toggleGeneralSetting('quietHoursEnabled')}
              />
            </div>

            {generalSettings.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4 pl-14">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Início
                  </label>
                  <input
                    type="time"
                    value={generalSettings.quietHoursStart}
                    onChange={(e) => {
                      setGeneralSettings(prev => ({ ...prev, quietHoursStart: e.target.value }));
                      setHasChanges(true);
                    }}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fim
                  </label>
                  <input
                    type="time"
                    value={generalSettings.quietHoursEnd}
                    onChange={(e) => {
                      setGeneralSettings(prev => ({ ...prev, quietHoursEnd: e.target.value }));
                      setHasChanges(true);
                    }}
                    className="input"
                  />
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Routine Notifications */}
        <Card>
          <CardHeader title="Lembretes de Rotina" subtitle="Receba lembretes baseados nos padrões do bebê" />
          <CardBody className="space-y-3">
            {routineNotifications.map((notification) => (
              <div
                key={notification.key}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', notification.color)}>
                    <notification.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{notification.label}</h4>
                    <p className="text-sm text-gray-500">{notification.description}</p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={notification.enabled}
                  onChange={() => toggleRoutineNotification(notification.key)}
                />
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Info */}
        <div className="text-center text-sm text-gray-400 py-4">
          <p>As notificações são baseadas nos padrões de rotina do seu bebê.</p>
          <p>Quanto mais você registrar, mais inteligentes serão os lembretes.</p>
        </div>
      </div>
      )}
    </DashboardLayout>
  );
}

// Toggle Switch Component
function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        enabled ? 'bg-olive-600' : 'bg-gray-300'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          enabled ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
}
