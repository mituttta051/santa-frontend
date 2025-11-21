// API функции для работы с задачами Санты

import { getApiBaseUrl, fixApiUrl } from "./config";
import { getAuthHeaders } from "./token";
import type { SantaTask } from "./types";

export async function getSantaTasks(): Promise<SantaTask[]> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/santa-tasks`);
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Не удалось загрузить задачи");
  }
  return response.json();
}

export async function getSantaTaskById(id: string): Promise<SantaTask> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/santa-tasks/${id}`);
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Задача не найдена");
  }
  return response.json();
}


