// Olive Baby Web - Admin Layout
import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Baby,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Shield,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { Avatar, Button } from '../ui';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

const adminNavItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/users', icon: Users, label: 'Usuários' },
  { path: '/admin/babies', icon: Baby, label: 'Bebês' },
  { path: '/admin/usage', icon: BarChart3, label: 'Métricas' },
];

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (item: typeof adminNavItems[0]) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-slate-900" />
            </div>
            <span className="font-bold text-white">Admin</span>
          </div>

          <Link
            to="/dashboard"
            className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/70"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Shield className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">Admin</span>
              <p className="text-xs text-slate-500">Olive Baby</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Back to App */}
        <div className="p-4 border-b border-slate-800">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar ao App</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1">
          <ul className="space-y-1">
            {adminNavItems.map((item) => {
              const active = isActive(item);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                      active
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <Avatar name={user?.caregiver?.fullName || user?.email || 'Admin'} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">
                {user?.caregiver?.fullName || 'Admin'}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            fullWidth
            leftIcon={<LogOut className="w-4 h-4" />}
            onClick={handleLogout}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn('lg:pl-64 pt-16 lg:pt-0 min-h-screen')}>
        {/* Page Header */}
        {title && (
          <div className="bg-slate-900/50 border-b border-slate-800 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
          </div>
        )}

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

