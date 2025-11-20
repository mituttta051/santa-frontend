// API функции для работы с пользователями

import { getApiBaseUrl, fixApiUrl } from "./config";
import { getAuthHeaders } from "./token";
import type { User } from "./types";

export async function getUsers(): Promise<User[]> {
  try {
    const apiUrl = getApiBaseUrl();
    const url = fixApiUrl(`${apiUrl}/users`);
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`Не удалось загрузить пользователей: ${response.status} ${errorText}`);
    }
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      const apiUrl = getApiBaseUrl();
      console.error("Network error - проверьте, что бэкенд запущен на", apiUrl);
      throw new Error(`Не удалось подключиться к серверу. Проверьте, что бэкенд запущен на ${apiUrl}`);
    }
    throw error;
  }
}

export async function createUser(name: string): Promise<User> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/users`);
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error("Не удалось создать пользователя");
  }
  return response.json();
}

export async function getCurrentUser(): Promise<User> {
  try {
    const apiUrl = getApiBaseUrl();
    const url = fixApiUrl(`${apiUrl}/users/me`);
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`Не удалось получить информацию о пользователе: ${response.status} ${errorText}`);
    }
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      const apiUrl = getApiBaseUrl();
      console.error("Network error - проверьте, что бэкенд запущен на", apiUrl);
      throw new Error(`Не удалось подключиться к серверу. Проверьте, что бэкенд запущен на ${apiUrl}`);
    }
    throw error;
  }
}

