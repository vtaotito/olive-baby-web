// Olive Baby Web - Professional Layout (Portal Profissional / White-Label)
import { type ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { getClinicSlugFromHostname } from '../../lib/domain';
import { clinicService } from '../../services/api';
import { Avatar, Button } from '../ui';

interface ProfessionalLayoutProps {
  children: ReactNode;
}

const profNavItems = [
  { path: '/prof/dashboard', icon: LayoutDashboard, label: 'Dashboard', description: 'Visão geral' },
  { path: '/prof/agenda', icon: Calendar, label: 'Agenda', description: 'Consultas e horários' },
  { path: '/prof/patients', icon: Users, label: 'Pacientes', description: 'Prontuários' },
  { path: '/prof/settings', icon: Settings, label: 'Configurações', description: 'Perfil e aparência' },
];

export function ProfessionalLayout({ children }: ProfessionalLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [clinicTheme, setClinicTheme] = useState<{ name?: string; logoUrl?: string; primaryColor?: string } | null>(null);

  const clinicSlug = getClinicSlugFromHostname();

  useEffect(() => {
    if (clinicSlug) {
      clinicService.getBySlug(clinicSlug).then((r) => {
        if (r.success && r.data) setClinicTheme(r.data);
      }).catch(() => {});
    }
  }, [clinicSlug]);

  const brandName = clinicTheme?.name || 'OlieCare Pro';
  const primaryColor = clinicTheme?.primaryColor || '#738251';

  // Derivar nome do profissional do email ou user
  const professionalName = user?.email?.split('@')[0]?.replace(/[._-]/g, ' ')?.replace(/\b\w/g, (c) => c.toUpperCase()) || 'Profissional';
  const roleLabel = user?.role === 'PEDIATRICIAN' ? 'Pediatra' : user?.role === 'SPECIALIST' ? 'Especialista' : 'Profissional';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarWidth = sidebarCollapsed ? 'w-20' : 'w-72';
  const mainPadding = sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/prof/dashboard" className="flex items-center gap-2">
            {clinicTheme?.logoUrl ? (
              <img src={clinicTheme.logoUrl} alt={brandName} className="w-8 h-8 object-contain rounded" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="font-bold text-gray-900 dark:text-white">{brandName}</span>
          </Link>
          <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full',
          `lg:${sidebarWidth}`
        )}
        style={{ width: sidebarOpen ? '18rem' : undefined }}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 min-h-[65px]">
          <Link to="/prof/dashboard" className="flex items-center gap-3 min-w-0">
            {clinicTheme?.logoUrl ? (
              <img src={clinicTheme.logoUrl} alt={brandName} className="w-10 h-10 object-contain rounded-xl flex-shrink-0" />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
            )}
            {(!sidebarCollapsed || sidebarOpen) && (
              <div className="min-w-0">
                <span className="font-bold text-gray-900 dark:text-white text-sm block truncate">{brandName}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">Portal Profissional</span>
              </div>
            )}
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
          {/* Collapse toggle - desktop only */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {profNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                  isActive
                    ? 'text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                )}
                style={isActive ? { backgroundColor: primaryColor } : undefined}
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200')} />
                {(!sidebarCollapsed || sidebarOpen) && (
                  <div className="min-w-0">
                    <span className="text-sm font-medium block">{item.label}</span>
                    {!isActive && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 block truncate">{item.description}</span>
                    )}
                  </div>
                )}
                {/* Active indicator pill */}
                {isActive && (
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          {(!sidebarCollapsed || sidebarOpen) ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 mb-2">
                <Avatar name={professionalName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{professionalName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{roleLabel}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Sair
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Avatar name={professionalName} size="sm" />
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(mainPadding, 'pt-16 lg:pt-0 min-h-screen transition-all duration-300')}>
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
