// Olive Baby Web - Admin Route Protection
// Admin routes so sao acessiveis no subdominio adm.oliecare.cloud (ou localhost em dev)
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { isMainDomain } from '../../lib/domain';
import { PageLoader } from '../ui/Spinner';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route that only allows ADMIN role on the admin subdomain
 * On the main domain (oliecare.cloud), redirects to /dashboard
 * On localhost, allows access (for development)
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  // Block admin routes on main domain (production only)
  if (isMainDomain() && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has ADMIN role
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
