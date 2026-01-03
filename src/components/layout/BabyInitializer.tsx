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
  const { isAuthenticated, user } = useAuthStore();
  const { babies, selectedBaby, fetchBabies, isLoading } = useBabyStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Só inicializar se estiver autenticado e ainda não tiver inicializado
    if (!isAuthenticated) {
      setIsInitializing(false);
      setHasInitialized(false);
      return;
    }

    // Evitar chamadas duplicadas
    if (hasInitialized) {
      setIsInitializing(false);
      return;
    }

    // Carregar bebês automaticamente
    // Usar uma função async para garantir que o estado seja atualizado corretamente
    const loadBabies = async () => {
      try {
        await fetchBabies();
        setHasInitialized(true);
        setIsInitializing(false);
      } catch (error) {
        console.error('Erro ao carregar bebês:', error);
        setIsInitializing(false);
      }
    };

    loadBabies();
    // Remover fetchBabies das dependências para evitar loop infinito
  }, [isAuthenticated, hasInitialized]);

  // Verificar se o onboarding foi concluído
  const hasCompletedOnboarding = !!user?.onboardingCompletedAt;

  // Redirecionar para onboarding se não houver bebês E onboarding não concluído
  // (exceto se já estiver lá ou em rotas permitidas)
  useEffect(() => {
    if (
      isAuthenticated &&
      !isInitializing &&
      !isLoading &&
      babies.length === 0 &&
      !hasCompletedOnboarding &&
      location.pathname !== '/onboarding' &&
      !location.pathname.startsWith('/settings/babies') &&
      !location.pathname.startsWith('/admin')
    ) {
      navigate('/onboarding', { replace: true });
    }
  }, [isAuthenticated, isInitializing, isLoading, babies.length, hasCompletedOnboarding, location.pathname, navigate]);

  // Mostrar loader durante inicialização
  if (isAuthenticated && isInitializing) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
