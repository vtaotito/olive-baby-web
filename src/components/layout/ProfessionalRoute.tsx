// Olive Baby Web - Professional Route (Portal Profissional)
// Permite acesso de profissionais de qualquer domínio (login unificado)
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldX, Stethoscope, ArrowRight, Home } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { PageLoader } from '../ui/Spinner';

interface ProfessionalRouteProps {
  children: React.ReactNode;
}

const PROFESSIONAL_ROLES = ['PEDIATRICIAN', 'SPECIALIST'];

function AccessDenied() {
  const { user } = useAuthStore();

  // Se é admin, redirecionar para /admin
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  // Se é cuidador/parent, redirecionar para /dashboard
  return <Navigate to="/dashboard" replace />;
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

  // Se não é profissional, redirecionar para o portal correto baseado na role
  if (user && !PROFESSIONAL_ROLES.includes(user.role)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
