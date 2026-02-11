// Olive Baby Web - Auth Layout
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Baby, Shield } from 'lucide-react';
import { isAdminDomain } from '../../lib/domain';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const isAdmin = isAdminDomain();

  return (
    <div className={`min-h-screen flex flex-col ${isAdmin ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-olive-50 via-white to-baby-green'}`}>
      {/* Header */}
      <header className="p-6">
        <Link to={isAdmin ? '/login' : '/'} className="flex items-center gap-2 w-fit">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAdmin ? 'bg-amber-500' : 'bg-olive-600'}`}>
            {isAdmin ? <Shield className="w-6 h-6 text-white" /> : <Baby className="w-6 h-6 text-white" />}
          </div>
          <span className={`text-xl font-bold ${isAdmin ? 'text-white' : 'text-olive-800'}`}>
            {isAdmin ? 'OlieCare Admin' : 'OlieCare'}
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className={`text-2xl font-bold ${isAdmin ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
            {subtitle && <p className={`mt-2 ${isAdmin ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</p>}
          </div>

          {/* Form Card */}
          <div className={`rounded-2xl shadow-xl p-8 ${isAdmin ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`p-6 text-center text-sm ${isAdmin ? 'text-gray-500' : 'text-gray-500'}`}>
        &copy; {new Date().getFullYear()} Olive Baby. Todos os direitos reservados.
      </footer>
    </div>
  );
}
