// Olive Baby Web - Baby Initializer Component
// Garante que bebês sejam carregados automaticamente ao acessar o app
// Corrige race condition em re-login sem refresh da página
import { useEffect, useState, useRef } from 'react';
import { useBabyStore } from '../../stores/babyStore';
import { useAuthStore } from '../../stores/authStore';
import { PageLoader } from '../ui/Spinner';

interface BabyInitializerProps {
  children: React.ReactNode;
}

export function BabyInitializer({ children }: BabyInitializerProps) {
  const { isAuthenticated } = useAuthStore();
  const { fetchBabies, clearBabyData } = useBabyStore();
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Ref para rastrear estado anterior de autenticação
  // Isso permite detectar transições logout → login
  const previousAuthRef = useRef<boolean>(isAuthenticated);
  const isLoadingRef = useRef<boolean>(false);

  useEffect(() => {
    const wasAuthenticated = previousAuthRef.current;
    previousAuthRef.current = isAuthenticated;

    // Caso 1: Usuário fez logout (transição de autenticado → não autenticado)
    // Limpar dados do bebê e resetar estado para próximo login
    if (wasAuthenticated && !isAuthenticated) {
      clearBabyData();
      setIsInitializing(true);
      isLoadingRef.current = false;
      return;
    }

    // Caso 2: Não está autenticado - apenas marcar como não inicializando
    if (!isAuthenticated) {
      setIsInitializing(false);
      return;
    }

    // Caso 3: Está autenticado - carregar bebês
    // Guard contra chamadas duplicadas usando ref (mais confiável que state)
    if (isLoadingRef.current) {
      return;
    }

    // Carregar bebês automaticamente
    const loadBabies = async () => {
      isLoadingRef.current = true;
      try {
        await fetchBabies();
      } catch (error) {
        console.error('[BabyInitializer] Erro ao carregar bebês:', error);
      } finally {
        setIsInitializing(false);
        isLoadingRef.current = false;
      }
    };

    loadBabies();
  }, [isAuthenticated, fetchBabies, clearBabyData]);

  // Mostrar loader durante inicialização (apenas quando autenticado)
  if (isAuthenticated && isInitializing) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
