// Olive Baby Web - Appearance Settings Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Palette,
  ChevronLeft,
  Sun,
  Moon,
  Monitor,
  Check,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardBody, CardHeader, Button } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../lib/utils';
import { settingsService } from '../../services/api';

type ThemeOption = 'light' | 'dark' | 'system';

interface ThemeConfig {
  id: ThemeOption;
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

export function AppearancePage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>('system');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsService.getSettings();
        if (response.success && response.data?.appearance) {
          setSelectedTheme(response.data.appearance.theme || 'system');
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleThemeChange = async (theme: ThemeOption) => {
    if (theme === selectedTheme) return;

    setIsSaving(true);
    try {
      const response = await settingsService.updateAppearance({ theme });
      
      if (response.success) {
        setSelectedTheme(theme);
        
        // Apply theme to document (for future dark mode implementation)
        applyTheme(theme);
        
        success('Tema atualizado!', `Tema ${themes.find(t => t.id === theme)?.label} aplicado`);
      } else {
        throw new Error(response.message || 'Falha ao atualizar tema');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      showError('Erro', error.response?.data?.message || error.message || 'Falha ao atualizar tema');
    } finally {
      setIsSaving(false);
    }
  };

  const applyTheme = (theme: ThemeOption) => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Store preference locally for immediate application on page load
    localStorage.setItem('theme', theme);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/settings')}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Palette className="w-6 h-6 text-olive-600" />
            Aparência
          </h1>
          <p className="text-gray-500">Personalize a aparência do aplicativo</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-olive-600 animate-spin" />
        </div>
      ) : (
        <div className="max-w-2xl space-y-6">
          {/* Theme Selection */}
          <Card>
            <CardHeader 
              title="Tema" 
              subtitle="Escolha como o Olive Baby deve aparecer"
            />
            <CardBody>
              <div className="grid gap-4">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    disabled={isSaving}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                      selectedTheme === theme.id
                        ? 'border-olive-500 bg-olive-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    )}
                  >
                    {/* Preview Box */}
                    <div className={cn(
                      'w-16 h-12 rounded-lg border-2 flex items-center justify-center',
                      theme.preview
                    )}>
                      <theme.icon className={cn(
                        'w-5 h-5',
                        theme.id === 'dark' ? 'text-white' : 'text-gray-600'
                      )} />
                    </div>
                    
                    {/* Label */}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{theme.label}</h4>
                      <p className="text-sm text-gray-500">{theme.description}</p>
                    </div>
                    
                    {/* Check */}
                    {selectedTheme === theme.id && (
                      <div className="w-6 h-6 bg-olive-600 rounded-full flex items-center justify-center">
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
                selectedTheme === 'dark' 
                  ? 'bg-gray-900 border-gray-700' 
                  : 'bg-white border-gray-200'
              )}>
                {/* Mini Dashboard Preview */}
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-full',
                      selectedTheme === 'dark' ? 'bg-gray-700' : 'bg-olive-100'
                    )} />
                    <div className="space-y-1">
                      <div className={cn(
                        'h-3 w-24 rounded',
                        selectedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                      )} />
                      <div className={cn(
                        'h-2 w-16 rounded',
                        selectedTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                      )} />
                    </div>
                  </div>
                  
                  {/* Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'p-3 rounded-lg',
                          selectedTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                        )}
                      >
                        <div className={cn(
                          'h-2 w-12 rounded mb-2',
                          selectedTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                        )} />
                        <div className={cn(
                          'h-6 w-8 rounded',
                          selectedTheme === 'dark' ? 'bg-gray-700' : 'bg-olive-200'
                        )} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Info */}
          <div className="text-center text-sm text-gray-400 py-4">
            <p>O tema escuro será aplicado em uma atualização futura.</p>
            <p>Sua preferência será salva e aplicada automaticamente.</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

