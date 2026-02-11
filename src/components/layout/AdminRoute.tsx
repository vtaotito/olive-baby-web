// Olive Baby Web - Admin Route Protection
// Login unificado: admins podem acessar /admin de qualquer domínio
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { PageLoader } from '../ui/Spinner';

interface AdminRouteProps {
  children: React.ReactNode;
}

const PROFESSIONAL_ROLES = ['PEDIATRICIAN', 'SPECIALIST'];

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has ADMIN role
  if (user?.role !== 'ADMIN') {
    // Redirecionar para o portal correto baseado na role
    if (user && PROFESSIONAL_ROLES.includes(user.role)) {
      return <Navigate to="/prof/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
