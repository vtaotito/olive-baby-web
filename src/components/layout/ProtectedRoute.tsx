// Olive Baby Web - Protected Route Component
// Protege rotas de cuidadores/famílias. Redireciona profissionais e admins para seus portais.
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { PageLoader } from '../ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const PROFESSIONAL_ROLES = ['PEDIATRICIAN', 'SPECIALIST'];

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirecionar admin para o console admin
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  // Redirecionar profissionais para o portal profissional
  if (user && PROFESSIONAL_ROLES.includes(user.role)) {
    return <Navigate to="/prof/dashboard" replace />;
  }

  return <>{children}</>;
}
