// Olive Baby Web - Dashboard Layout
import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Baby,
  Home,
  Clock,
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
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { useBabyStore } from '../../stores/babyStore';
import { Avatar, Button } from '../ui';
import { formatAge } from '../../lib/utils';
import { FloatingActions } from './FloatingActions';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Início' },
  { path: '/routines', icon: Clock, label: 'Rotinas' },
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
  const { babies, selectedBaby, selectBaby } = useBabyStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [babyDropdownOpen, setBabyDropdownOpen] = useState(false);

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

        {/* Baby Selector */}
        {babies.length > 0 && (
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <button
                onClick={() => setBabyDropdownOpen(!babyDropdownOpen)}
                className="w-full flex items-center gap-3 p-3 bg-olive-50 rounded-xl hover:bg-olive-100 transition-colors"
              >
                <Avatar
                  name={selectedBaby?.name || 'Bebê'}
                  src={selectedBaby?.photoUrl}
                  size="md"
                />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">{selectedBaby?.name || 'Selecione'}</p>
                  {selectedBaby && (
                    <p className="text-xs text-gray-500">{formatAge(selectedBaby.birthDate)}</p>
                  )}
                </div>
                <ChevronDown className={cn('w-5 h-5 text-gray-400 transition-transform', babyDropdownOpen && 'rotate-180')} />
              </button>

              {babyDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-10">
                  {babies.map((baby) => (
                    <button
                      key={baby.id}
                      onClick={() => {
                        selectBaby(baby);
                        setBabyDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors',
                        'first:rounded-t-xl last:rounded-b-xl',
                        selectedBaby?.id === baby.id && 'bg-olive-50'
                      )}
                    >
                      <Avatar name={baby.name} src={baby.photoUrl} size="sm" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900 text-sm">{baby.name}</p>
                        <p className="text-xs text-gray-500">{formatAge(baby.birthDate)}</p>
                      </div>
                    </button>
                  ))}
                  <Link
                    to="/settings/babies/new"
                    className="block w-full p-3 text-sm text-olive-600 font-medium hover:bg-gray-50 border-t border-gray-100"
                    onClick={() => setBabyDropdownOpen(false)}
                  >
                    + Adicionar bebê
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

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
      <main className={cn('lg:pl-72 pt-16 lg:pt-0 min-h-screen')}>
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Floating Actions (Quick Actions + AI Chat) */}
      <FloatingActions />
    </div>
  );
}
