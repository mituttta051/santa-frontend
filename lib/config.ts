// Конфигурация API

/**
 * Получает базовый URL API, определяя его динамически на клиенте
 * Это необходимо для работы с мобильных устройств в локальной сети
 */
export function getApiBaseUrl(): string {
  // Если задана переменная окружения, используем её
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // На клиенте определяем IP автоматически
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // Если это не localhost, используем тот же хост для API
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      const apiUrl = `http://${hostname}:8080/api`;
      console.log("API Base URL (detected from hostname):", apiUrl);
      return apiUrl;
    }
  }

  // По умолчанию localhost (для серверного рендеринга и локальной разработки)
  return "http://localhost:8080/api";
}

/**
 * Исправляет URL, заменяя localhost на правильный IP адрес на клиенте
 */
export function fixApiUrl(url: string): string {
  if (typeof window === "undefined") {
    return url; // На сервере не меняем
  }

  const hostname = window.location.hostname;
  // Если URL содержит localhost, но мы на другом хосте, заменяем
  if (url.includes("localhost:8080") && hostname !== "localhost" && hostname !== "127.0.0.1") {
    return url.replace("localhost:8080", `${hostname}:8080`);
  }
  
  return url;
}

// Для обратной совместимости экспортируем функцию как константу
// Но лучше использовать getApiBaseUrl() напрямую
export const API_BASE_URL = getApiBaseUrl();

