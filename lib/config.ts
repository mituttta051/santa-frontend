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
    const protocol = window.location.protocol === "https:" ? "https" : "http";
    const port = window.location.port;
    const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
    
    // Если используется nginx (порт 443 или 80), API идет через тот же хост
    if (port === "443" || port === "80" || port === "") {
      const apiUrl = `${protocol}://${hostname}${port ? `:${port}` : ""}/api`;
      console.log("API Base URL (via nginx):", apiUrl);
      console.log("Current location:", window.location.href);
      return apiUrl;
    }
    
    // Если не localhost и не стандартные порты nginx, используем прямой доступ к бекенду
    if (!isLocalHost) {
      const backendPort = protocol === "https" ? "" : ":8080";
      const apiUrl = `${protocol}://${hostname}${backendPort}/api`;
      console.log("API Base URL (detected from hostname):", apiUrl);
      console.log("Current location:", window.location.href);
      return apiUrl;
    }
  }

  // По умолчанию localhost через nginx (для серверного рендеринга)
  // Если nginx работает, используем /api, иначе прямой доступ к бекенду
  return "https://localhost/api";
}

/**
 * Исправляет URL, заменяя localhost на правильный IP адрес на клиенте
 */
export function fixApiUrl(url: string): string {
  if (typeof window === "undefined") {
    return url; // На сервере не меняем
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol === "https:" ? "https" : "http";
  const port = window.location.port;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
  
  // Если используется nginx, заменяем localhost:8080 на текущий хост через nginx
  if (url.includes("localhost:8080") && (port === "443" || port === "80" || port === "")) {
    const nginxPort = port ? `:${port}` : "";
    return url.replace("http://localhost:8080", `${protocol}://${hostname}${nginxPort}`);
  }
  
  // Если URL содержит localhost, но мы на другом хосте, заменяем и подставляем корректный протокол/порт
  if (url.includes("localhost:8080") && !isLocalHost) {
    const backendPort = protocol === "https" ? "" : ":8080";
    return url.replace("http://localhost:8080", `${protocol}://${hostname}${backendPort}`);
  }
  
  return url;
}

// Для обратной совместимости экспортируем функцию как константу
// Но лучше использовать getApiBaseUrl() напрямую
export const API_BASE_URL = getApiBaseUrl();

