self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || '/web-app-manifest-192x192.png',
      badge: '/web-app-manifest-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        eventId: data.eventId,
        type: data.type || 'message',
      },
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.')
  event.notification.close()
  
  const notificationData = event.notification.data || {}
  const eventId = notificationData.eventId
  
  // Если это уведомление о сообщении и есть eventId, открываем страницу события
  if (notificationData.type === 'message' && eventId) {
    const url = `/events/${encodeURIComponent(eventId)}`
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
        // Проверяем, есть ли уже открытое окно с этим URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          if (client.url.includes(`/events/`) && 'focus' in client) {
            return client.focus()
          }
        }
        // Если окна нет, открываем новое
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
    )
  } else {
    // Для других уведомлений открываем главную страницу
    event.waitUntil(clients.openWindow('/'))
  }
})

