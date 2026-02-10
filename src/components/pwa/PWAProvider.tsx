// Olive Baby Web - PWA Provider Component
// Orquestra todos os componentes PWA: instalação, atualização, offline e push notifications
import { useEffect, useRef } from 'react';
import { usePWA } from '../../hooks/usePWA';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { useAuthStore } from '../../stores/authStore';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { PWAUpdatePrompt } from './PWAUpdatePrompt';
import { PWAOfflineBanner } from './PWAOfflineBanner';
import type { ReactNode } from 'react';

interface PWAProviderProps {
  children: ReactNode;
}

// Chave para saber se já pedimos permissão push nesta sessão
const PUSH_ASKED_KEY = 'olive-baby-push-asked';

export function PWAProvider({ children }: PWAProviderProps) {
  const {
    canInstall,
    installPrompt,
    dismissInstall,
    needRefresh,
    updateServiceWorker,
    dismissUpdate,
    isOffline,
  } = usePWA();

  const {
    permission,
    isSubscribed,
    subscribe,
  } = usePushNotifications();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const autoSubscribeRef = useRef(false);

  // Auto-subscribe to push notifications when:
  // 1. User is authenticated
  // 2. Push is supported and permission is 'default' or 'granted'
  // 3. Not already subscribed
  // 4. Haven't asked in this session yet
  useEffect(() => {
    if (
      !isAuthenticated ||
      isSubscribed ||
      autoSubscribeRef.current ||
      permission === 'unsupported' ||
      permission === 'denied'
    ) {
      return;
    }

    // Only auto-subscribe if already granted (don't prompt automatically)
    if (permission === 'granted') {
      autoSubscribeRef.current = true;
      subscribe().catch((err) => {
        console.warn('[PWA] Auto push subscribe falhou:', err);
      });
      return;
    }

    // If permission is 'default', ask after first install/first login
    // Only ask once per session to not be intrusive
    const hasAsked = sessionStorage.getItem(PUSH_ASKED_KEY);
    if (!hasAsked && permission === 'default') {
      // Wait 10 seconds after auth to ask (not intrusive)
      const timer = setTimeout(() => {
        autoSubscribeRef.current = true;
        sessionStorage.setItem(PUSH_ASKED_KEY, '1');
        subscribe().catch((err) => {
          console.warn('[PWA] Push subscribe falhou:', err);
        });
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isSubscribed, permission, subscribe]);

  return (
    <>
      {children}

      {/* Banner de offline */}
      {isOffline && <PWAOfflineBanner />}

      {/* Prompt de atualização (prioridade sobre instalação) */}
      {needRefresh && (
        <PWAUpdatePrompt
          onUpdate={updateServiceWorker}
          onDismiss={dismissUpdate}
        />
      )}

      {/* Prompt de instalação (só aparece se não houver atualização pendente) */}
      {canInstall && !needRefresh && (
        <PWAInstallPrompt
          onInstall={installPrompt}
          onDismiss={dismissInstall}
        />
      )}
    </>
  );
}
