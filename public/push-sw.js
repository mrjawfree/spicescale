self.addEventListener('push', (event) => {
  if (!event.data) return;

  const payload = event.data.json();
  const options = {
    body: payload.body,
    icon: payload.icon || '/pwa-192x192.png',
    badge: payload.badge || '/pwa-192x192.png',
    data: payload.data || {},
    tag: 'spicescale-recipe-reminder',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const recipeId = event.notification.data?.recipeId;
  const url = recipeId ? `/?recipe=${recipeId}` : '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      })
  );
});
