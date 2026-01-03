// Olive Baby Web - Baby Initializer Component
// Garante que bebês sejam carregados automaticamente ao acessar o app
import { useEffect, useState } from 'react';
import { useBabyStore } from '../../stores/babyStore';
import { useAuthStore } from '../../stores/authStore';
import { PageLoader } from '../ui/Spinner';

interface BabyInitializerProps {
  children: React.ReactNode;
}

export function BabyInitializer({ children }: BabyInitializerProps) {
  const { isAuthenticated } = useAuthStore();
  const { fetchBabies } = useBabyStore();
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
  }, [isAuthenticated, hasInitialized]);

  // Mostrar loader durante inicialização
  if (isAuthenticated && isInitializing) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
