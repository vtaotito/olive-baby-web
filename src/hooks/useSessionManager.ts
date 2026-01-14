// Olive Baby Web - Session Manager Hook
// Gerencia a sessão do usuário de forma proativa, verificando e renovando tokens
// antes que expirem, evitando perda de referência do bebê selecionado

import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useBabyStore } from '../stores/babyStore';
import { storage } from '../lib/utils';
import type { AuthTokens } from '../types';

// Configurações de sessão
const SESSION_CONFIG = {
  // Intervalo de verificação do token (a cada 1 minuto)
  CHECK_INTERVAL_MS: 60 * 1000,
  // Renovar token quando faltar menos de 5 minutos para expirar
  REFRESH_THRESHOLD_MS: 5 * 60 * 1000,
  // Tempo máximo de inatividade antes de considerar sessão expirada (30 minutos)
  MAX_INACTIVITY_MS: 30 * 60 * 1000,
};

// Decodifica JWT para obter payload (sem verificar assinatura)
function decodeJwtPayload(token: string): { exp?: number; iat?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    // Ajustar base64url para base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// Verifica se o token está próximo de expirar
function isTokenExpiringSoon(token: string, thresholdMs: number): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true; // Se não conseguir decodificar, considerar expirado
  
  const expiresAt = payload.exp * 1000; // Converter para milissegundos
  const now = Date.now();
  const timeUntilExpiry = expiresAt - now;
  
  return timeUntilExpiry < thresholdMs;
}

// Verifica se o token já expirou
function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  
  return Date.now() >= payload.exp * 1000;
}

export function useSessionManager() {
  const navigate = useNavigate();
  const { tokens, isAuthenticated, refreshTokens, clearAuth } = useAuthStore();
  const { clearBabyData, fetchBabies, selectedBaby } = useBabyStore();
  
  // Refs para rastrear estado
  const lastActivityRef = useRef<number>(Date.now());
  const isRefreshingRef = useRef<boolean>(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Atualiza timestamp de última atividade
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Limpa sessão e redireciona para login
  const handleSessionExpired = useCallback(() => {
    console.log('[SessionManager] Sessão expirada, redirecionando para login...');
    
    // Limpar todos os dados
    clearAuth();
    clearBabyData();
    storage.remove('auth_tokens');
    storage.remove('user');
    
    // Navegar para login (sem reload completo)
    navigate('/login', { replace: true });
  }, [clearAuth, clearBabyData, navigate]);

  // Renova token proativamente
  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (isRefreshingRef.current) return false;
    
    isRefreshingRef.current = true;
    
    try {
      console.log('[SessionManager] Renovando token proativamente...');
      await refreshTokens();
      console.log('[SessionManager] Token renovado com sucesso');
      
      // Recarregar dados do bebê se não houver bebê selecionado
      if (!selectedBaby) {
        await fetchBabies();
      }
      
      return true;
    } catch (error) {
      console.error('[SessionManager] Falha ao renovar token:', error);
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [refreshTokens, fetchBabies, selectedBaby]);

  // Verifica estado da sessão
  const checkSession = useCallback(async () => {
    if (!isAuthenticated || !tokens?.accessToken) return;
    
    // Verificar inatividade
    const inactivityTime = Date.now() - lastActivityRef.current;
    if (inactivityTime > SESSION_CONFIG.MAX_INACTIVITY_MS) {
      console.log('[SessionManager] Usuário inativo por muito tempo');
      // Não encerrar sessão por inatividade se o token ainda for válido
      // Apenas logar para debug
    }
    
    // Verificar se o access token expirou
    if (isTokenExpired(tokens.accessToken)) {
      console.log('[SessionManager] Access token expirado, tentando renovar...');
      
      // Verificar se o refresh token ainda é válido
      if (tokens.refreshToken && !isTokenExpired(tokens.refreshToken)) {
        const success = await refreshSession();
        if (!success) {
          handleSessionExpired();
        }
      } else {
        console.log('[SessionManager] Refresh token também expirado');
        handleSessionExpired();
      }
      return;
    }
    
    // Verificar se o token está próximo de expirar
    if (isTokenExpiringSoon(tokens.accessToken, SESSION_CONFIG.REFRESH_THRESHOLD_MS)) {
      console.log('[SessionManager] Token próximo de expirar, renovando...');
      await refreshSession();
    }
  }, [isAuthenticated, tokens, refreshSession, handleSessionExpired]);

  // Configurar verificação periódica
  useEffect(() => {
    if (!isAuthenticated) {
      // Limpar intervalo se não autenticado
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    // Verificar imediatamente ao montar
    checkSession();

    // Configurar verificação periódica
    checkIntervalRef.current = setInterval(checkSession, SESSION_CONFIG.CHECK_INTERVAL_MS);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, checkSession]);

  // Escutar eventos de atividade do usuário
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [isAuthenticated, updateActivity]);

  // Escutar evento de visibilidade da página (usuário voltou à aba)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[SessionManager] Usuário voltou à aba, verificando sessão...');
        updateActivity();
        checkSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, updateActivity, checkSession]);

  // Escutar evento de online (usuário reconectou à internet)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleOnline = () => {
      console.log('[SessionManager] Conexão restaurada, verificando sessão...');
      checkSession();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [isAuthenticated, checkSession]);

  return {
    refreshSession,
    updateActivity,
    handleSessionExpired,
  };
}

// Hook para sincronizar tokens do interceptor com o store
export function useSyncTokens() {
  const { setTokens } = useAuthStore();
  
  useEffect(() => {
    // Escutar evento customizado de token atualizado
    const handleTokenUpdate = (event: CustomEvent<AuthTokens>) => {
      console.log('[SyncTokens] Tokens atualizados via interceptor');
      setTokens(event.detail);
    };

    window.addEventListener('auth:tokens-updated' as any, handleTokenUpdate);

    return () => {
      window.removeEventListener('auth:tokens-updated' as any, handleTokenUpdate);
    };
  }, [setTokens]);
}
