// Olive Baby Web - Dashboard Layout
import { type ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Baby,
  Home,
  TrendingUp,
  Award,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Bell,
  FileDown,
  Users,
  Plus,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { useBabyStore } from '../../stores/babyStore';
import { Avatar, Button } from '../ui';
import { formatAge } from '../../lib/utils';
import { QuickActionsFooter } from '../routines/dashboard/QuickActionsFooter';
import { AIChatButton } from '../ai/AIChatButton';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Início' },
  { path: '/growth', icon: TrendingUp, label: 'Crescimento' },
  { path: '/milestones', icon: Award, label: 'Marcos' },
  { path: '/team', icon: Users, label: 'Equipe' },
  { path: '/export', icon: FileDown, label: 'Exportar' },
  { path: '/settings', icon: Settings, label: 'Configurações' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { babies, selectedBaby, selectBaby, isLoading } = useBabyStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [babyDropdownOpen, setBabyDropdownOpen] = useState(false);
  
  // Nota: O BabyInitializer já cuida de carregar bebês automaticamente
  // e redirecionar para onboarding se necessário

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-olive-600 rounded-lg flex items-center justify-center">
              <Baby className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-olive-800">Olive Baby</span>
          </Link>

          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 transition-transform duration-300',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-olive-600 rounded-xl flex items-center justify-center">
              <Baby className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-olive-800">Olive Baby</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Baby Selector - Sempre visível */}
        <div className="p-4 border-b border-gray-100">
          {isLoading ? (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Bebê Ativo
              </label>
              <div className="w-full p-3 bg-gray-50 rounded-xl animate-pulse">
                <div className="h-10 bg-gray-200 rounded-lg" />
              </div>
            </div>
          ) : babies.length > 0 && selectedBaby ? (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Bebê Ativo
              </label>
              <div className="relative">
                <button
                  onClick={() => setBabyDropdownOpen(!babyDropdownOpen)}
                  className="w-full flex items-center gap-3 p-3 bg-olive-50 rounded-xl hover:bg-olive-100 transition-colors border border-olive-200"
                >
                  <Avatar
                    name={selectedBaby.name || 'Bebê'}
                    src={selectedBaby.photoUrl}
                    size="md"
                  />
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-gray-900 truncate">{selectedBaby.name || 'Bebê'}</p>
                    <p className="text-xs text-gray-500">{formatAge(selectedBaby.birthDate)}</p>
                  </div>
                  <ChevronDown className={cn('w-5 h-5 text-gray-400 transition-transform flex-shrink-0', babyDropdownOpen && 'rotate-180')} />
                </button>

                {babyDropdownOpen && (
                  <>
                    {/* Backdrop para fechar ao clicar fora */}
                    <div
                      className="fixed inset-0 z-[45]"
                      onClick={() => setBabyDropdownOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-[50] max-h-[400px] overflow-y-auto">
                      {babies.map((baby) => (
                        <button
                          key={baby.id}
                          onClick={() => {
                            selectBaby(baby);
                            setBabyDropdownOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors',
                            'first:rounded-t-xl',
                            selectedBaby?.id === baby.id && 'bg-olive-50'
                          )}
                        >
                          <Avatar name={baby.name} src={baby.photoUrl} size="sm" />
                          <div className="text-left flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{baby.name}</p>
                            <p className="text-xs text-gray-500">{formatAge(baby.birthDate)}</p>
                          </div>
                          {selectedBaby?.id === baby.id && (
                            <div className="w-2 h-2 bg-olive-600 rounded-full flex-shrink-0" />
                          )}
                        </button>
                      ))}
                      <Link
                        to="/onboarding"
                        className="block w-full p-3 text-sm text-olive-600 font-medium hover:bg-olive-50 border-t border-gray-100 rounded-b-xl transition-colors"
                        onClick={() => setBabyDropdownOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          <span>Adicionar bebê</span>
                        </div>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Bebê Ativo
              </label>
              <Link
                to="/onboarding"
                className="w-full flex items-center justify-center gap-2 p-3 bg-olive-50 rounded-xl hover:bg-olive-100 transition-colors border-2 border-dashed border-olive-300"
              >
                <Plus className="w-5 h-5 text-olive-600" />
                <span className="font-medium text-olive-700">Adicionar bebê</span>
              </Link>
              <p className="text-xs text-gray-500 text-center mt-2">
                Cadastre seu primeiro bebê para começar
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                      isActive
                        ? 'bg-olive-100 text-olive-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Avatar name={user?.caregiver?.fullName || user?.email || 'User'} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {user?.caregiver?.fullName || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            fullWidth
            leftIcon={<LogOut className="w-4 h-4" />}
            onClick={handleLogout}
          >
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn('lg:pl-72 pt-16 lg:pt-0 min-h-screen pb-24')}>
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Quick Actions Footer */}
      <QuickActionsFooter />

      {/* AI Chat Button (mantido flutuante) */}
      <div className="fixed bottom-24 right-6 z-50 lg:bottom-6">
        <AIChatButton />
      </div>
    </div>
  );
}
