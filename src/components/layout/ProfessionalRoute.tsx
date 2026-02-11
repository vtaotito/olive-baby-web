// Olive Baby Web - Professional Route (Portal Profissional)
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { isProfessionalDomain } from '../../lib/domain';
import { PageLoader } from '../ui/Spinner';

interface ProfessionalRouteProps {
  children: React.ReactNode;
}

const PROFESSIONAL_ROLES = ['PEDIATRICIAN', 'SPECIALIST'];

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
    return <Navigate to="https://oliecare.cloud/dashboard" replace />;
  }

  return <>{children}</>;
}
