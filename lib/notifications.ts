// Утилиты для работы с PWA уведомлениями

import {
  savePushSubscription,
  removePushSubscription,
  serializePushSubscription,
} from "./push-subscriptions";

/**
 * Проверяет, поддерживаются ли уведомления в браузере
 */
export function isNotificationSupported(): boolean {
  return "Notification" in window && "serviceWorker" in navigator;
}

/**
 * Проверяет, поддерживаются ли push уведомления (требует Service Worker и PushManager)
 */
export function isPushNotificationSupported(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Запрашивает разрешение на показ уведомлений
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return "denied";
  }

  if (Notification.permission === "default") {
    return await Notification.requestPermission();
  }

  return Notification.permission;
}

/**
 * Проверяет, есть ли разрешение на показ уведомлений
 */
export function hasNotificationPermission(): boolean {
  return isNotificationSupported() && Notification.permission === "granted";
}

/**
 * Показывает уведомление о новом сообщении
 */
export async function showMessageNotification(
  senderName: string,
  messageContent: string,
  eventId: string
): Promise<void> {
  if (!hasNotificationPermission()) {
    return;
  }

  // Проверяем, активна ли страница и в фокусе
  if (document.hasFocus()) {
    // Если страница в фокусе, не показываем уведомление
    return;
  }

  const title = `Новое сообщение от ${senderName}`;
  const body = messageContent.length > 100 
    ? messageContent.substring(0, 100) + "..." 
    : messageContent;

  // Используем Service Worker для показа уведомления, если он доступен
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: "/web-app-manifest-192x192.png",
        badge: "/web-app-manifest-192x192.png",
        tag: `message-${eventId}`, // Тег для группировки уведомлений
        data: {
          eventId,
          type: "message",
          dateOfArrival: Date.now(),
        },
        vibrate: [100, 50, 100],
        requireInteraction: false,
      });
    } catch (error) {
      console.error("Failed to show notification via service worker:", error);
      // Fallback на обычное уведомление
      new Notification(title, {
        body,
        icon: "/web-app-manifest-192x192.png",
        tag: `message-${eventId}`,
      });
    }
  } else {
    // Fallback на обычное уведомление
    new Notification(title, {
      body,
      icon: "/web-app-manifest-192x192.png",
      tag: `message-${eventId}`,
    });
  }
}

/**
 * Конвертирует VAPID public key из base64 в Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Подписывается на push уведомления и сохраняет подписку на бэкенде
 */
export async function subscribeToPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    console.log("Push notifications are not supported in this browser");
    return false;
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    console.warn(
      "VAPID public key is not configured. Push notifications will not work."
    );
    return false;
  }

  try {
    // Регистрируем service worker
    const registration = await navigator.serviceWorker.ready;

    // Проверяем, есть ли уже подписка
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Создаем новую подписку
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    // Сохраняем подписку на бэкенде
    const subscriptionData = serializePushSubscription(subscription);
    await savePushSubscription(subscriptionData);
    console.log("Push subscription saved successfully");
    return true;
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
    return false;
  }
}

/**
 * Отписывается от push уведомлений
 */
export async function unsubscribeFromPushNotifications(): Promise<void> {
  if (!isPushNotificationSupported()) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Удаляем подписку на бэкенде
      await removePushSubscription(subscription.endpoint);
      // Отписываемся от push
      await subscription.unsubscribe();
      console.log("Unsubscribed from push notifications");
    }
  } catch (error) {
    console.error("Failed to unsubscribe from push notifications:", error);
  }
}

/**
 * Инициализирует уведомления при загрузке приложения
 * Запрашивает разрешение, если его еще нет
 * Автоматически подписывается на push уведомления, если разрешение получено
 */
export async function initializeNotifications(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.log("Notifications are not supported in this browser");
    return false;
  }

  // Запрашиваем разрешение, если его еще нет
  let hasPermission = hasNotificationPermission();
  if (!hasPermission && Notification.permission === "default") {
    const permission = await requestNotificationPermission();
    hasPermission = permission === "granted";
  }

  // Если разрешение получено, подписываемся на push уведомления
  if (hasPermission && isPushNotificationSupported()) {
    // Подписываемся асинхронно, не блокируя инициализацию
    subscribeToPushNotifications().catch((error) => {
      console.error("Failed to subscribe to push notifications:", error);
    });
  }

  return hasPermission;
}

