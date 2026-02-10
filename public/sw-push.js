// Olive Baby PWA - Push Notification Event Handlers
// Este arquivo é importado pelo Service Worker gerado pelo vite-plugin-pwa
// Lida com eventos push (receber) e notificationclick (abrir app)

// ==========================================
// Push Event - Receber notificação
// ==========================================
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.warn('[SW Push] Notificação recebida sem dados');
    return;
  }

  let payload;
  try {
    payload = event.data.json();
  } catch {
    // Fallback: tratar como texto simples
    payload = {
      title: 'OlieCare',
      body: event.data.text(),
    };
  }

  const title = payload.title || 'OlieCare';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/favicon-192.png',
    badge: payload.badge || '/favicon-72.png',
    image: payload.image || undefined,
    tag: payload.tag || 'olive-baby-notification',
    renotify: payload.renotify || false,
    data: payload.data || {},
    actions: payload.actions || [
      { action: 'open', title: 'Abrir' },
      { action: 'dismiss', title: 'Dispensar' },
    ],
    vibrate: [200, 100, 200],
    requireInteraction: false,
    silent: false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ==========================================
// Notification Click - Abrir app no URL correto
// ==========================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};
  const targetUrl = data.url || '/dashboard';

  // Se clicou em "Dispensar", apenas fecha
  if (action === 'dismiss') {
    return;
  }

  // Abrir ou focar janela existente
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Verificar se já tem uma janela aberta
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Navegar para a URL correta e focar
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      // Se não tem janela aberta, abrir nova
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// ==========================================
// Notification Close - Analytics (opcional)
// ==========================================
self.addEventListener('notificationclose', (event) => {
  const data = event.notification.data || {};
  console.log('[SW Push] Notificação fechada:', data.type || 'unknown');
});
