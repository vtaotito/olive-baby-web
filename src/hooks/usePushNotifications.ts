// Olive Baby Web - Push Notifications Hook
// Gerencia a subscription de Web Push e registro do device token na API
import { useState, useEffect, useCallback, useRef } from 'react';
import { deviceTokenService } from '../services/api';
import { storage } from '../lib/utils';

// ==========================================
// Types
// ==========================================

type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported';

interface PushNotificationState {
  permission: PushPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<void>;
  testPush: () => Promise<void>;
}

// Keys de localStorage
const PUSH_SUBSCRIPTION_KEY = 'olive-baby-push-subscription';

// ==========================================
// Helper: URL-safe base64 to Uint8Array (para VAPID key)
// ==========================================

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

// ==========================================
// Helper: Get browser/device info
// ==========================================

function getDeviceInfo(): { deviceName: string; osVersion: string } {
  const ua = navigator.userAgent;
  let deviceName = 'Browser desconhecido';
  let osVersion = 'OS desconhecido';

  // Browser detection
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    const match = ua.match(/Chrome\/(\d+)/);
    deviceName = `Chrome ${match?.[1] || ''}`;
  } else if (ua.includes('Firefox')) {
    const match = ua.match(/Firefox\/(\d+)/);
    deviceName = `Firefox ${match?.[1] || ''}`;
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    const match = ua.match(/Version\/(\d+)/);
    deviceName = `Safari ${match?.[1] || ''}`;
  } else if (ua.includes('Edg')) {
    const match = ua.match(/Edg\/(\d+)/);
    deviceName = `Edge ${match?.[1] || ''}`;
  }

  // OS detection
  if (ua.includes('Windows NT')) {
    const match = ua.match(/Windows NT (\d+\.\d+)/);
    osVersion = `Windows ${match?.[1] || ''}`;
  } else if (ua.includes('Mac OS X')) {
    const match = ua.match(/Mac OS X (\d+[._]\d+)/);
    osVersion = `macOS ${match?.[1]?.replace(/_/g, '.') || ''}`;
  } else if (ua.includes('Android')) {
    const match = ua.match(/Android (\d+(\.\d+)?)/);
    osVersion = `Android ${match?.[1] || ''}`;
  } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
    const match = ua.match(/OS (\d+_\d+)/);
    osVersion = `iOS ${match?.[1]?.replace(/_/g, '.') || ''}`;
  } else if (ua.includes('Linux')) {
    osVersion = 'Linux';
  }

  return { deviceName, osVersion };
}

// ==========================================
// Hook
// ==========================================

export function usePushNotifications(): PushNotificationState {
  const [permission, setPermission] = useState<PushPermission>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission as PushPermission;
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initRef = useRef(false);

  // Check if push is supported
  const isPushSupported = 
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

  // Check existing subscription on mount
  useEffect(() => {
    if (!isPushSupported || initRef.current) return;
    initRef.current = true;

    const checkExistingSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);

        // Update permission state
        setPermission(Notification.permission as PushPermission);
      } catch (err) {
        console.warn('[Push] Erro ao verificar subscription existente:', err);
      }
    };

    checkExistingSubscription();
  }, [isPushSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported) {
      setError('Push notifications não são suportadas neste navegador');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Request notification permission
      const permResult = await Notification.requestPermission();
      setPermission(permResult as PushPermission);

      if (permResult !== 'granted') {
        setError('Permissão de notificação negada');
        setIsLoading(false);
        return false;
      }

      // 2. Get VAPID public key from API
      const vapidResponse = await deviceTokenService.getVapidPublicKey();
      if (!vapidResponse.success || !vapidResponse.data?.publicKey) {
        throw new Error('Não foi possível obter a chave VAPID do servidor');
      }

      const vapidPublicKey = vapidResponse.data.publicKey;

      // 3. Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // 4. Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      // 5. Get device info
      const { deviceName, osVersion } = getDeviceInfo();

      // 6. Register the subscription token with the API
      const subscriptionJson = JSON.stringify(subscription.toJSON());
      
      await deviceTokenService.register({
        token: subscriptionJson,
        platform: 'WEB',
        deviceName,
        osVersion,
        appVersion: '1.0.0', // TODO: get from package.json or build
      });

      // 7. Save locally for reference
      try {
        storage.set(PUSH_SUBSCRIPTION_KEY, subscriptionJson);
      } catch {
        // Ignore storage errors
      }

      setIsSubscribed(true);
      console.log('[Push] Subscription registrada com sucesso');
      return true;
    } catch (err: any) {
      const errorMsg = err?.message || 'Erro ao ativar push notifications';
      console.error('[Push] Erro:', errorMsg);
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isPushSupported]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unregister from API
        const subscriptionJson = JSON.stringify(subscription.toJSON());
        try {
          await deviceTokenService.unregister(subscriptionJson);
        } catch {
          // Continue even if API call fails
        }

        // Unsubscribe from browser
        await subscription.unsubscribe();
      }

      // Clean local storage
      try {
        storage.remove(PUSH_SUBSCRIPTION_KEY);
      } catch {
        // Ignore
      }

      setIsSubscribed(false);
      console.log('[Push] Subscription removida');
    } catch (err: any) {
      console.error('[Push] Erro ao remover subscription:', err);
      setError(err?.message || 'Erro ao desativar push notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send test push notification
  const testPush = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      const result = await deviceTokenService.testPush();
      if (!result.success) {
        throw new Error(result.message || 'Erro ao enviar teste');
      }
      console.log('[Push] Teste enviado:', result.data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erro ao enviar teste';
      setError(msg);
    }
  }, []);

  return {
    permission: isPushSupported ? permission : 'unsupported',
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    testPush,
  };
}
