// Olive Baby Web - Protected Route Component
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { isAdminDomain } from '../../lib/domain';
import { PageLoader } from '../ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // No subdominio admin, usuarios ADMIN so acessam o console admin
  // Redireciona rotas normais (dashboard, routines, etc) para /admin
  if (isAdminDomain() && user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  // Nota: O BabyInitializer cuida de carregar bebês e redirecionar para onboarding
  return <>{children}</>;
}
