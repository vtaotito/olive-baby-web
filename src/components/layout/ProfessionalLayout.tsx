// Olive Baby Web - Professional Layout (Portal Profissional / White-Label)
import { type ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Stethoscope,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { getClinicSlugFromHostname } from '../../lib/domain';
import { clinicService } from '../../services/api';
import { Avatar, Button } from '../ui';

interface ProfessionalLayoutProps {
  children: ReactNode;
  title?: string;
}

const profNavItems = [
  { path: '/prof/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/prof/agenda', icon: Calendar, label: 'Agenda' },
  { path: '/prof/patients', icon: Users, label: 'Pacientes' },
  { path: '/prof/settings', icon: Settings, label: 'Configurações' },
];

export function ProfessionalLayout({ children, title }: ProfessionalLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clinicTheme, setClinicTheme] = useState<{ name?: string; logoUrl?: string; primaryColor?: string } | null>(null);

  const clinicSlug = getClinicSlugFromHostname();

  useEffect(() => {
    if (clinicSlug) {
      clinicService.getBySlug(clinicSlug).then((r) => {
        if (r.success && r.data) setClinicTheme(r.data);
      }).catch(() => {});
    }
  }, [clinicSlug]);

  const brandName = clinicTheme?.name || 'OlieCare';
  const primaryColor = clinicTheme?.primaryColor || '#738251';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-300"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold" style={{ color: primaryColor }}>{brandName}</span>
          <div className="w-10" />
        </div>
      </header>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <Link to="/prof/dashboard" className="flex items-center gap-2">
            {clinicTheme?.logoUrl ? (
              <img src={clinicTheme.logoUrl} alt={brandName} className="w-10 h-10 object-contain rounded" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                <Stethoscope className="w-6 h-6" style={{ color: primaryColor }} />
              </div>
            )}
            <span className="font-bold" style={{ color: primaryColor }}>{brandName}</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {profNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                location.pathname === item.path
                  ? 'bg-olive-50 dark:bg-olive-900/30 text-olive-700 dark:text-olive-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <Avatar name={user?.caregiver?.fullName || user?.email || 'Usuário'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.caregiver?.fullName || user?.email}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start" leftIcon={<LogOut className="w-4 h-4" />}>
            Sair
          </Button>
        </div>
      </aside>

      <main className="lg:pl-72 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6">
          {title && <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{title}</h1>}
          {children}
        </div>
      </main>
    </div>
  );
}
