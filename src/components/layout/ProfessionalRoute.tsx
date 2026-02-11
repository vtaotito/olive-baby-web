// Olive Baby Web - Professional Route (Portal Profissional)
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldX, Stethoscope, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { isProfessionalDomain } from '../../lib/domain';
import { PageLoader } from '../ui/Spinner';

interface ProfessionalRouteProps {
  children: React.ReactNode;
}

const PROFESSIONAL_ROLES = ['PEDIATRICIAN', 'SPECIALIST'];

function AccessDenied() {
  const { logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Acesso Restrito</h1>
            <p className="text-gray-600 text-sm">
              Este portal é exclusivo para <strong>profissionais de saúde</strong> (pediatras e especialistas) cadastrados na plataforma OlieCare.
            </p>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              <span className="font-medium text-teal-800 text-sm">Quem pode acessar?</span>
            </div>
            <ul className="text-sm text-teal-700 text-left space-y-1">
              <li>- Pediatras cadastrados</li>
              <li>- Especialistas convidados</li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href="https://oliecare.cloud/dashboard"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-olive-600 text-white rounded-lg font-medium hover:bg-olive-700 transition-colors text-sm"
            >
              Ir para OlieCare
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => logout()}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Sair desta conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfessionalRoute({ children }: ProfessionalRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isProfessionalDomain() && user && !PROFESSIONAL_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
