// Olive Baby Web - Firebase Client SDK Configuration
// Firebase App, Analytics e Cloud Messaging (FCM)
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported, type Analytics } from 'firebase/analytics';
import { getMessaging, getToken, onMessage, isSupported as isMessagingSupported, type Messaging } from 'firebase/messaging';

// ==========================================
// Firebase Config (chaves publicas - seguro no client)
// ==========================================

const firebaseConfig = {
  apiKey: 'AIzaSyCT75Xwj8Xl2SO2n8shT6FRljKhYV3p4qE',
  authDomain: 'oliecare-a517d.firebaseapp.com',
  projectId: 'oliecare-a517d',
  storageBucket: 'oliecare-a517d.firebasestorage.app',
  messagingSenderId: '112847860266',
  appId: '1:112847860266:web:de6a65eb5485613de28953',
  measurementId: 'G-WK21EB621E',
};

// ==========================================
// Singleton instances
// ==========================================

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;
let messaging: Messaging | null = null;

// ==========================================
// Initialize Firebase App
// ==========================================

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(firebaseConfig);
    console.log('[Firebase] App inicializado (projeto:', firebaseConfig.projectId, ')');
  }
  return app;
}

// ==========================================
// Analytics
// ==========================================

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (analytics) return analytics;

  try {
    const supported = await isAnalyticsSupported();
    if (!supported) {
      console.warn('[Firebase] Analytics nao suportado neste ambiente');
      return null;
    }

    const firebaseApp = getFirebaseApp();
    analytics = getAnalytics(firebaseApp);
    console.log('[Firebase] Analytics inicializado');
    return analytics;
  } catch (error) {
    console.warn('[Firebase] Erro ao inicializar Analytics:', error);
    return null;
  }
}

// ==========================================
// Cloud Messaging (FCM)
// ==========================================

/**
 * Verifica se o FCM e suportado no browser atual
 */
export async function isFCMSupported(): Promise<boolean> {
  try {
    return await isMessagingSupported();
  } catch {
    return false;
  }
}

/**
 * Retorna a instancia de Firebase Messaging
 * Retorna null se nao suportado
 */
export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (messaging) return messaging;

  try {
    const supported = await isMessagingSupported();
    if (!supported) {
      console.warn('[Firebase] Messaging nao suportado neste ambiente');
      return null;
    }

    const firebaseApp = getFirebaseApp();
    messaging = getMessaging(firebaseApp);
    console.log('[Firebase] Messaging inicializado');
    return messaging;
  } catch (error) {
    console.warn('[Firebase] Erro ao inicializar Messaging:', error);
    return null;
  }
}

/**
 * Obtem o FCM registration token para este dispositivo
 * Usa o Service Worker existente da PWA (nao precisa de firebase-messaging-sw.js separado)
 * 
 * @param vapidKey - VAPID public key do Firebase Console (Web Push certificates)
 * @param serviceWorkerRegistration - Registro do SW existente da PWA
 * @returns FCM token string ou null se falhar
 */
export async function getFCMToken(
  vapidKey: string,
  serviceWorkerRegistration?: ServiceWorkerRegistration
): Promise<string | null> {
  try {
    const msg = await getFirebaseMessaging();
    if (!msg) return null;

    const token = await getToken(msg, {
      vapidKey,
      serviceWorkerRegistration,
    });

    if (token) {
      console.log('[Firebase] FCM token obtido:', token.substring(0, 20) + '...');
      return token;
    }

    console.warn('[Firebase] Nenhum FCM token retornado');
    return null;
  } catch (error) {
    console.error('[Firebase] Erro ao obter FCM token:', error);
    return null;
  }
}

/**
 * Registra callback para mensagens recebidas em foreground
 * (quando o app esta aberto e visivel)
 * 
 * @param callback - Funcao chamada quando uma mensagem chega em foreground
 * @returns Funcao de unsubscribe
 */
export async function onForegroundMessage(
  callback: (payload: { notification?: { title?: string; body?: string; image?: string }; data?: Record<string, string> }) => void
): Promise<(() => void) | null> {
  try {
    const msg = await getFirebaseMessaging();
    if (!msg) return null;

    const unsubscribe = onMessage(msg, (payload) => {
      console.log('[Firebase] Mensagem em foreground:', payload);
      callback(payload);
    });

    return unsubscribe;
  } catch (error) {
    console.error('[Firebase] Erro ao registrar listener de foreground:', error);
    return null;
  }
}

// ==========================================
// Export config for reference
// ==========================================

export { firebaseConfig };
