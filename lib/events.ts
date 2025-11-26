// API функции для работы с событиями

import { getApiBaseUrl, fixApiUrl } from "./config";
import { getAuthHeaders } from "./token";
import type { Event, PairDto } from "./types";

export async function getEvents(): Promise<Event[]> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/events`);
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Не удалось загрузить события");
  }
  return response.json();
}

export async function getEventById(id: string): Promise<Event> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/events/${id}`);
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Событие не найдено");
  }
  return response.json();
}


export async function createEvent(event: Partial<Event>): Promise<Event> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/events`);
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(event),
  });
  if (!response.ok) {
    let errorMessage = "Не удалось создать событие";
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

export async function generatePairs(eventId: string): Promise<import("./types").AdminPairDto[]> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/events/${eventId}/generate-pairs`);
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Не удалось сгенерировать пары");
  }
  return response.json();
}

export async function regeneratePairs(eventId: string): Promise<import("./types").AdminPairDto[]> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/events/${eventId}/regenerate-pairs`);
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Не удалось перегенерировать пары");
  }
  return response.json();
}

/**
 * Get all pairs for an event (admin only).
 * Returns all pairs with full information including Santa details.
 */
export async function getEventPairs(eventId: string): Promise<import("./types").AdminPairDto[]> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/events/${eventId}/pairs`);
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Не удалось загрузить пары мероприятия");
  }
  return response.json();
}

/**
 * Get the current user's pair where they are acting as Santa.
 * Returns only child information (without Santa information to keep identity secret).
 * Returns null if pairs are not generated yet or user is not a Santa.
 */
export async function getMyPair(eventId: string): Promise<PairDto | null> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/events/${eventId}/my-pair`);
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    if (response.status === 404) {
      return null; // Pairs not generated yet
    }
    throw new Error("Не удалось загрузить пару");
  }
  
  // Проверяем, есть ли контент в ответе
  const contentLength = response.headers.get("content-length");
  const text = await response.text();
  
  // Если ответ пустой или content-length = 0, возвращаем null
  if (!text || text.trim() === "" || contentLength === "0") {
    return null;
  }
  
  // Парсим JSON только если есть контент
  try {
    return JSON.parse(text);
  } catch (error) {
    // Если не удалось распарсить, возвращаем null
    console.warn("Failed to parse my-pair response:", error);
    return null;
  }
}

export async function revealChildWishlist(eventId: string): Promise<PairDto> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/events/${eventId}/my-pair/reveal-wishlist`);
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let errorMessage = "Не удалось получить wishlist внучка";
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

export async function getSelectedTasksForSanta(
  eventId: string,
): Promise<import("./types").Participant> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/events/${eventId}/selected-tasks-for-santa`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    let errorMessage = "Не удалось загрузить выбранные задания";
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

export async function getChatPartners(eventId: string): Promise<{ santaId: string, childId: string }> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/events/${eventId}/chat-partners`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    let errorMessage = "Не удалось получить информацию о Санте и Внучке";
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
  const data = await response.json();
  return { santaId: data.santaId, childId: data.childId };
}

export async function selectTasksForSanta(
  eventId: string,
  taskIds: string[],
): Promise<import("./types").Participant> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/events/${eventId}/select-tasks-for-santa`);
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ taskIds }),
  });
  if (!response.ok) {
    let errorMessage = "Не удалось выбрать задания";
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

