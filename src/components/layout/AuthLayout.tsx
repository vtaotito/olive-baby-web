// Olive Baby Web - Auth Layout
import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Baby } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-olive-50 via-white to-baby-green flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="w-10 h-10 bg-olive-600 rounded-xl flex items-center justify-center">
            <Baby className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-olive-800">OlieCare</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Olive Baby. Todos os direitos reservados.
      </footer>
    </div>
  );
}
