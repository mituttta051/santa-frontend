// API функции для работы с участниками

import { getApiBaseUrl, fixApiUrl } from "./config";
import { getAuthHeaders } from "./token";
import type { Participant } from "./types";

export async function getParticipants(): Promise<Participant[]> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/participants`);
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Не удалось загрузить участников");
  }
  return response.json();
}

export async function createParticipant(participant: Partial<Participant>): Promise<Participant> {
  // Формируем объект в формате, который ожидает бэкенд
  // Бэкенд ожидает объекты Event и User с установленными ID
  const requestBody = {
    event: participant.eventId ? { id: participant.eventId } : undefined,
    user: participant.userId ? { id: participant.userId } : undefined,
    wishlist: participant.wishlist,
  };

  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/participants`);
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", response.status, errorText);
    throw new Error(`Не удалось создать участника: ${response.status} ${errorText}`);
  }
  return response.json();
}

export async function updateWishlist(participantId: string, wishlist: string): Promise<Participant> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/participants/${participantId}/wishlist`);
  const response = await fetch(url, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: wishlist, // Бэкенд ожидает просто строку, не JSON
  });
  if (!response.ok) {
    let errorMessage = "Не удалось обновить вишлист";
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

export async function assignCollectionToParticipant(
  participantId: string,
  collectionId: string,
): Promise<Participant> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/participants/${participantId}/santa-collection/${collectionId}`);
  const response = await fetch(url, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Не удалось назначить коллекцию: ${response.status} ${errorText}`);
  }
  return response.json();
}

export async function unassignCollectionFromParticipant(
  participantId: string,
): Promise<Participant> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/participants/${participantId}/santa-collection`);
  const response = await fetch(url, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Не удалось снять коллекцию: ${response.status} ${errorText}`);
  }
  return response.json();
}

