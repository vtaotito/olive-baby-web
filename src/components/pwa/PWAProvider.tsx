// Olive Baby Web - PWA Provider Component
// Orquestra todos os componentes PWA: instalação, atualização e offline
import { usePWA } from '../../hooks/usePWA';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { PWAUpdatePrompt } from './PWAUpdatePrompt';
import { PWAOfflineBanner } from './PWAOfflineBanner';
import type { ReactNode } from 'react';

interface PWAProviderProps {
  children: ReactNode;
}

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
