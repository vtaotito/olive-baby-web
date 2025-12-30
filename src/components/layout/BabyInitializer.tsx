// Olive Baby Web - Baby Initializer Component
// Garante que bebês sejam carregados automaticamente ao acessar o app
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBabyStore } from '../../stores/babyStore';
import { useAuthStore } from '../../stores/authStore';
import { PageLoader } from '../ui/Spinner';

interface BabyInitializerProps {
  children: React.ReactNode;
}

export function BabyInitializer({ children }: BabyInitializerProps) {
  const { isAuthenticated } = useAuthStore();
  const { babies, selectedBaby, fetchBabies, isLoading } = useBabyStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Só inicializar se estiver autenticado
    if (!isAuthenticated) {
      setIsInitializing(false);
      return;
    }

    // Carregar bebês automaticamente
    fetchBabies()
      .then(() => {
        setIsInitializing(false);
      })
      .catch(() => {
        setIsInitializing(false);
      });
  }, [isAuthenticated, fetchBabies]);

  // Redirecionar para onboarding se não houver bebês (exceto se já estiver lá)
  useEffect(() => {
    if (
      isAuthenticated &&
      !isInitializing &&
      !isLoading &&
      babies.length === 0 &&
      location.pathname !== '/onboarding' &&
      !location.pathname.startsWith('/settings/babies')
    ) {
      navigate('/onboarding', { replace: true });
    }
  }, [isAuthenticated, isInitializing, isLoading, babies.length, location.pathname, navigate]);

  // Mostrar loader durante inicialização
  if (isAuthenticated && isInitializing) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
