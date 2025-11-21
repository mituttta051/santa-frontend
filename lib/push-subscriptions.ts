// API функции для работы с push subscriptions

import { getApiBaseUrl, fixApiUrl } from "./config";
import { getAuthHeaders } from "./token";

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Сохраняет push subscription на бэкенде для текущего пользователя
 */
export async function savePushSubscription(
  subscription: PushSubscriptionData
): Promise<void> {
  try {
    const apiUrl = getApiBaseUrl();
    const url = fixApiUrl(`${apiUrl}/users/me/push-subscriptions`);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to save push subscription:", response.status, errorText);
      throw new Error(`Не удалось сохранить подписку на уведомления: ${response.status}`);
    }
  } catch (error) {
    console.error("Error saving push subscription:", error);
    throw error;
  }
}

/**
 * Удаляет push subscription на бэкенде
 */
export async function removePushSubscription(endpoint: string): Promise<void> {
  try {
    const apiUrl = getApiBaseUrl();
    const url = fixApiUrl(
      `${apiUrl}/users/me/push-subscriptions?endpoint=${encodeURIComponent(endpoint)}`
    );
    const response = await fetch(url, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to remove push subscription:", response.status, errorText);
      // Не бросаем ошибку, так как подписка может быть уже удалена
    }
  } catch (error) {
    console.error("Error removing push subscription:", error);
    // Не бросаем ошибку, так как это не критично
  }
}

/**
 * Конвертирует Web Push API subscription в формат для отправки на бэкенд
 */
export function serializePushSubscription(
  subscription: PushSubscription
): PushSubscriptionData {
  let p256dh: string;
  let auth: string;

  // Если subscription уже в JSON формате (например, после JSON.parse)
  if ((subscription as any).keys) {
    p256dh = (subscription as any).keys.p256dh || "";
    auth = (subscription as any).keys.auth || "";
  } else {
    // Если это нативный PushSubscription объект
    try {
      const p256dhKey = subscription.getKey("p256dh");
      const authKey = subscription.getKey("auth");
      p256dh = p256dhKey ? arrayBufferToBase64(p256dhKey) : "";
      auth = authKey ? arrayBufferToBase64(authKey) : "";
    } catch (error) {
      console.error("Error extracting keys from PushSubscription:", error);
      // Fallback: попробуем получить из JSON
      const jsonSub = JSON.parse(JSON.stringify(subscription));
      p256dh = jsonSub.keys?.p256dh || "";
      auth = jsonSub.keys?.auth || "";
    }
  }

  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh,
      auth,
    },
  };
}

/**
 * Конвертирует ArrayBuffer в base64 строку
 */
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

