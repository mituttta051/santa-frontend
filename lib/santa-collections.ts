// API функции для работы с коллекциями задач Санты

import { getApiBaseUrl, fixApiUrl } from "./config";
import { getAuthHeaders } from "./token";
import type { CreateSantaCollectionRequest, SantaCollection } from "./types";

export async function getSantaCollections(): Promise<SantaCollection[]> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/santa-collections`);
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Не удалось загрузить коллекции задач");
  }
  return response.json();
}

export async function getSantaCollectionById(id: string): Promise<SantaCollection> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/santa-collections/${id}`);
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Коллекция не найдена");
  }
  return response.json();
}

export async function createSantaCollection(
  payload: CreateSantaCollectionRequest,
): Promise<SantaCollection> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/santa-collections`);
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = "Не удалось создать коллекцию";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      const errorText = await response.text();
      if (errorText) {
        errorMessage = errorText;
      }
    }
    throw new Error(errorMessage);
  }

  return response.json();
}


