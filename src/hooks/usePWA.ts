// Olive Baby Web - PWA Hook
// Gerencia registro do service worker, prompt de instalação e atualizações
import { useState, useEffect, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

interface PWAState {
  // Instalação
  canInstall: boolean;
  isInstalled: boolean;
  installPrompt: () => Promise<void>;
  dismissInstall: () => void;
  installDismissed: boolean;
  
  // Atualização
  needRefresh: boolean;
  updateServiceWorker: () => void;
  dismissUpdate: () => void;
  
  // Status
  isOffline: boolean;
  registrationError: boolean;
}

const INSTALL_DISMISSED_KEY = 'olive-baby-pwa-install-dismissed';
const INSTALL_DISMISSED_EXPIRY = 1000 * 60 * 60 * 24 * 7; // 7 dias

function wasInstallDismissed(): boolean {
  try {
    const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY);
    if (!dismissed) return false;
    const timestamp = parseInt(dismissed, 10);
    if (Date.now() - timestamp > INSTALL_DISMISSED_EXPIRY) {
      localStorage.removeItem(INSTALL_DISMISSED_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function usePWA(): PWAState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installDismissed, setInstallDismissed] = useState(wasInstallDismissed);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [registrationError, setRegistrationError] = useState(false);
  const [needRefreshState, setNeedRefreshState] = useState(false);

  // Registrar o Service Worker via vite-plugin-pwa
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Verificar atualizações a cada 1 hora
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
      console.log('[PWA] Service Worker registrado:', swUrl);
    },
    onRegisterError(error) {
      console.error('[PWA] Erro ao registrar Service Worker:', error);
      setRegistrationError(true);
    },
  });

  // Sincronizar estado do needRefresh
  useEffect(() => {
    setNeedRefreshState(needRefresh);
  }, [needRefresh]);

  // Detectar se já está instalado como PWA
  useEffect(() => {
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error - navigator.standalone é específico do iOS Safari
      window.navigator.standalone === true;
    
    setIsInstalled(isStandalone);

    // Ouvir mudanças no display-mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handler = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Capturar o evento beforeinstallprompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detectar quando o app é instalado
    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Trigger do prompt de instalação
  const installPrompt = useCallback(async () => {
    if (!deferredPrompt) return;
    
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] Instalação aceita');
        setIsInstalled(true);
      } else {
        console.log('[PWA] Instalação recusada');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('[PWA] Erro no prompt de instalação:', error);
    }
  }, [deferredPrompt]);

  // Dispensar prompt de instalação (com cooldown de 7 dias)
  const dismissInstall = useCallback(() => {
    setInstallDismissed(true);
    try {
      localStorage.setItem(INSTALL_DISMISSED_KEY, Date.now().toString());
    } catch {
      // Ignore
    }
  }, []);

  // Dispensar atualização
  const dismissUpdate = useCallback(() => {
    setNeedRefresh(false);
  }, [setNeedRefresh]);

  return {
    canInstall: !!deferredPrompt && !isInstalled && !installDismissed,
    isInstalled,
    installPrompt,
    dismissInstall,
    installDismissed,
    needRefresh: needRefreshState,
    updateServiceWorker: () => updateServiceWorker(true),
    dismissUpdate,
    isOffline,
    registrationError,
  };
}
