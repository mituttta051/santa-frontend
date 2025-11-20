// API функции для работы с сообщениями

import { getApiBaseUrl, fixApiUrl } from "./config";
import { getAuthHeaders } from "./token";
import type { MessageDto, SendMessageRequest } from "./types";

export async function getMessages(
  eventId: string,
  participantId?: string,
  otherParticipantId?: string
): Promise<MessageDto[]> {
  const apiUrl = getApiBaseUrl();
  const params = new URLSearchParams();
  if (participantId) {
    params.append("participantId", participantId);
  }
  if (otherParticipantId) {
    params.append("otherParticipantId", otherParticipantId);
  }
  const queryString = params.toString();
  const url = fixApiUrl(
    `${apiUrl}/events/${eventId}/messages${queryString ? `?${queryString}` : ""}`
  );
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Не удалось загрузить сообщения");
  }
  return response.json();
}

export async function sendMessage(
  eventId: string,
  request: SendMessageRequest
): Promise<MessageDto> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/events/${eventId}/messages`);
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    let errorMessage = "Не удалось отправить сообщение";
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

export async function markMessageAsRead(
  eventId: string,
  messageId: string
): Promise<MessageDto> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/events/${eventId}/messages/${messageId}/read`);
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Не удалось отметить сообщение как прочитанное");
  }
  return response.json();
}

