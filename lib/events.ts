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

export async function getEventBySlug(slug: string): Promise<Event> {
  const events = await getEvents();
  const event = events.find((e) => e.slug === slug);
  if (!event) {
    throw new Error("Событие не найдено");
  }
  return event;
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

export async function generatePairs(eventId: string): Promise<PairDto[]> {
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

export async function getEventPairs(eventId: string): Promise<PairDto[]> {
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

