// Olive Baby Web - Admin Layout (Nova Navegação Orientada a Objetivo)
import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Baby,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Shield,
  Rocket,
  DollarSign,
  Activity,
  AlertTriangle,
  Settings,
  TrendingUp,
  Bell,
  CreditCard,
  Brain,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { isAdminDomain } from '../../lib/domain';
import { Avatar, Button } from '../ui';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

// Navegação orientada a objetivo (não a feature)
const adminNavSections = [
  {
    title: null,
    items: [
      { path: '/admin', icon: LayoutDashboard, label: 'Visão Geral', exact: true },
    ],
  },
  {
    title: 'Crescimento',
    items: [
      { path: '/admin/activation', icon: Rocket, label: 'Ativação & Retenção' },
      { path: '/admin/monetization', icon: DollarSign, label: 'Monetização' },
      { path: '/admin/billing', icon: CreditCard, label: 'Billing (Stripe)' },
    ],
  },
  {
    title: 'Operação',
    items: [
      { path: '/admin/users', icon: Users, label: 'Usuários & Bebês' },
      { path: '/admin/usage', icon: Activity, label: 'Uso & Qualidade' },
    ],
  },
  {
    title: 'Monitoramento',
    items: [
      { path: '/admin/alerts', icon: AlertTriangle, label: 'Alertas', badge: true },
      { path: '/admin/errors', icon: TrendingUp, label: 'Erros & Fricção' },
    ],
  },
  {
    title: 'Configuração',
    items: [
      { path: '/admin/ai-assistant', icon: Brain, label: 'AI Assistant' },
      { path: '/admin/settings', icon: Settings, label: 'Configurações' },
    ],
  },
];

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (item: { path: string; exact?: boolean }) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
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

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-olive-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-olive-800">Admin</span>
          </div>

          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
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
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300 flex flex-col',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-olive-600 to-olive-700 rounded-xl flex items-center justify-center shadow-lg shadow-olive-200">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">Admin</span>
              <p className="text-xs text-gray-500">OlieCare</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Back to App - Escondido no subdominio admin */}
        {!isAdminDomain() && (
          <div className="px-3 py-3 border-b border-gray-100">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-olive-700 hover:bg-olive-50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar ao App</span>
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {adminNavSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={cn(section.title && 'mt-4')}>
              {section.title && (
                <p className="px-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1 px-3">
                {section.items.map((item) => {
                  const active = isActive(item);
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                          active
                            ? 'bg-olive-100 text-olive-700 font-medium shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        )}
                      >
                        <item.icon className={cn('w-5 h-5', active && 'text-olive-600')} />
                        <span className="flex-1">{item.label}</span>
                        {'badge' in item && item.badge && (
                          <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={user?.caregiver?.fullName || user?.email || 'Admin'} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate text-sm">
                {user?.caregiver?.fullName || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            fullWidth
            size="sm"
            leftIcon={<LogOut className="w-4 h-4" />}
            onClick={handleLogout}
            className="justify-start text-gray-600 hover:text-rose-600 hover:bg-rose-50"
          >
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn('lg:pl-64 pt-16 lg:pt-0 min-h-screen')}>
        {/* Page Header */}
        {title && (
          <div className="bg-white border-b border-gray-200 px-6 py-5">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
