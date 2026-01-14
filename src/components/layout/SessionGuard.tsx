// Olive Baby Web - Session Guard Component
// Gerencia a sessão do usuário e escuta eventos de autenticação
// Permite navegação elegante via React Router ao invés de reload completo

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionManager, useSyncTokens } from '../../hooks/useSessionManager';
import { useAuthStore } from '../../stores/authStore';
import { useBabyStore } from '../../stores/babyStore';

interface SessionGuardProps {
  children: React.ReactNode;
}

export function SessionGuard({ children }: SessionGuardProps) {
  const navigate = useNavigate();
  const { clearAuth, isAuthenticated } = useAuthStore();
  const { clearBabyData, restoreSelectedBaby, selectedBaby, fetchBabies } = useBabyStore();
  
  // Ativar gerenciamento proativo de sessão
  useSessionManager();
  
  // Sincronizar tokens do interceptor com o store
  useSyncTokens();

  // Escutar evento de sessão expirada
  useEffect(() => {
    const handleSessionExpired = () => {
      console.log('[SessionGuard] Sessão expirada, limpando dados e redirecionando...');
      
      // Limpar todos os dados
      clearAuth();
      clearBabyData();
      
      // Navegar para login via React Router (sem reload)
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [clearAuth, clearBabyData, navigate]);

  // Restaurar bebê selecionado se perdido (proteção extra)
  useEffect(() => {
    if (isAuthenticated && !selectedBaby) {
      console.log('[SessionGuard] Bebê selecionado perdido, tentando restaurar...');
      restoreSelectedBaby();
      
      // Se ainda não tiver bebê, tentar buscar da API
      setTimeout(() => {
        const { selectedBaby: currentBaby, babies } = useBabyStore.getState();
        if (!currentBaby && babies.length === 0) {
          console.log('[SessionGuard] Nenhum bebê encontrado, buscando da API...');
          fetchBabies().catch(console.error);
        }
      }, 500);
    }
  }, [isAuthenticated, selectedBaby, restoreSelectedBaby, fetchBabies]);

  return <>{children}</>;
}
