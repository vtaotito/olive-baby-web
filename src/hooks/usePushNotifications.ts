// Olive Baby Web - Push Notifications Hook
// Gerencia push notifications usando FCM (primario) com fallback para Web Push (VAPID)
import { useState, useEffect, useCallback, useRef } from 'react';
import { deviceTokenService } from '../services/api';
import { storage } from '../lib/utils';
import { getFCMToken, isFCMSupported, onForegroundMessage } from '../config/firebase';

// ==========================================
// Types
// ==========================================

type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported';
type PushMethod = 'fcm' | 'webpush' | null;

interface PushNotificationState {
  permission: PushPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  method: PushMethod;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<void>;
  testPush: () => Promise<void>;
}

// Keys de localStorage
const PUSH_TOKEN_KEY = 'olive-baby-push-token';
const PUSH_METHOD_KEY = 'olive-baby-push-method';

// ==========================================
// Helper: URL-safe base64 to Uint8Array (para VAPID key fallback)
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
// FCM Subscribe Strategy
// ==========================================

async function subscribeFCM(): Promise<{ token: string; method: 'fcm' } | null> {
  try {
    const supported = await isFCMSupported();
    if (!supported) {
      console.log('[Push] FCM nao suportado, tentando Web Push...');
      return null;
    }

    // Buscar VAPID key do Firebase Console via API
    const vapidResponse = await deviceTokenService.getVapidPublicKey();
    if (!vapidResponse.success || !vapidResponse.data?.publicKey) {
      console.warn('[Push] Nao foi possivel obter VAPID key do servidor');
      return null;
    }

    // Usar o SW existente da PWA
    const registration = await navigator.serviceWorker.ready;

    // Obter FCM token usando nosso SW
    const token = await getFCMToken(vapidResponse.data.publicKey, registration);

    if (token) {
      console.log('[Push] FCM token obtido com sucesso');
      return { token, method: 'fcm' };
    }

    return null;
  } catch (error) {
    console.warn('[Push] Erro no FCM, tentando Web Push...', error);
    return null;
  }
}

// ==========================================
// Web Push Subscribe Strategy (Fallback)
// ==========================================

async function subscribeWebPush(): Promise<{ token: string; method: 'webpush' } | null> {
  try {
    // Buscar VAPID key do servidor
    const vapidResponse = await deviceTokenService.getVapidPublicKey();
    if (!vapidResponse.success || !vapidResponse.data?.publicKey) {
      throw new Error('Nao foi possivel obter a chave VAPID do servidor');
    }

    const vapidPublicKey = vapidResponse.data.publicKey;
    const registration = await navigator.serviceWorker.ready;

    // Subscribe via PushManager (Web Push API)
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });

    const token = JSON.stringify(subscription.toJSON());
    console.log('[Push] Web Push subscription obtida');
    return { token, method: 'webpush' };
  } catch (error) {
    console.error('[Push] Erro no Web Push:', error);
    return null;
  }
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
  const [method, setMethod] = useState<PushMethod>(() => {
    try {
      return (storage.get(PUSH_METHOD_KEY) as PushMethod) || null;
    } catch {
      return null;
    }
  });
  const initRef = useRef(false);
  const foregroundUnsubRef = useRef<(() => void) | null>(null);

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
        // Verificar se temos token salvo
        const savedToken = storage.get(PUSH_TOKEN_KEY);
        const savedMethod = storage.get(PUSH_METHOD_KEY) as PushMethod;

        if (savedToken && savedMethod) {
          setIsSubscribed(true);
          setMethod(savedMethod);
        } else {
          // Verificar via PushManager
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
          if (subscription) {
            setMethod('webpush');
          }
        }

        setPermission(Notification.permission as PushPermission);
      } catch (err) {
        console.warn('[Push] Erro ao verificar subscription existente:', err);
      }
    };

    checkExistingSubscription();
  }, [isPushSupported]);

  // Setup foreground message listener
  useEffect(() => {
    if (!isSubscribed) return;

    const setupForegroundListener = async () => {
      const unsub = await onForegroundMessage((payload) => {
        // Mostrar notificacao em foreground usando Notification API
        if (payload.notification) {
          const { title, body, image } = payload.notification;
          if (Notification.permission === 'granted' && title) {
            new Notification(title, {
              body: body || '',
              icon: image || '/favicon-192.png',
              tag: 'olive-baby-foreground',
              data: payload.data,
            });
          }
        }
      });

      if (unsub) {
        foregroundUnsubRef.current = unsub;
      }
    };

    setupForegroundListener();

    return () => {
      if (foregroundUnsubRef.current) {
        foregroundUnsubRef.current();
        foregroundUnsubRef.current = null;
      }
    };
  }, [isSubscribed]);

  // Subscribe to push notifications (FCM primeiro, fallback Web Push)
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported) {
      setError('Push notifications nao sao suportadas neste navegador');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Request notification permission
      const permResult = await Notification.requestPermission();
      setPermission(permResult as PushPermission);

      if (permResult !== 'granted') {
        setError('Permissao de notificacao negada');
        setIsLoading(false);
        return false;
      }

      // 2. Tentar FCM primeiro, depois fallback para Web Push
      let result: { token: string; method: PushMethod } | null = await subscribeFCM();
      if (!result) {
        result = await subscribeWebPush();
      }

      if (!result) {
        throw new Error('Nao foi possivel ativar push notifications');
      }

      // 3. Get device info
      const { deviceName, osVersion } = getDeviceInfo();

      // 4. Registrar token na API
      await deviceTokenService.register({
        token: result.token,
        platform: 'WEB',
        deviceName,
        osVersion,
        appVersion: '1.1.0',
      });

      // 5. Salvar localmente
      try {
        storage.set(PUSH_TOKEN_KEY, result.token);
        storage.set(PUSH_METHOD_KEY, result.method);
      } catch {
        // Ignore storage errors
      }

      setIsSubscribed(true);
      setMethod(result.method);
      console.log(`[Push] Subscription registrada via ${result.method}`);
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
      // Obter token salvo para desregistrar na API
      const savedToken = storage.get(PUSH_TOKEN_KEY);
      if (savedToken) {
        try {
          await deviceTokenService.unregister(savedToken as string);
        } catch {
          // Continue even if API call fails
        }
      }

      // Remover subscription do PushManager (Web Push)
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      } catch {
        // Ignore
      }

      // Limpar localStorage
      try {
        storage.remove(PUSH_TOKEN_KEY);
        storage.remove(PUSH_METHOD_KEY);
      } catch {
        // Ignore
      }

      setIsSubscribed(false);
      setMethod(null);
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
    method,
    subscribe,
    unsubscribe,
    testPush,
  };
}
