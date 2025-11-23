// API функции для работы с выполнением заданий

import { getApiBaseUrl, fixApiUrl } from "./config";
import { getAuthHeaders, getAccessToken } from "./token";
import type { SantaTaskWithCompletion, UserPhoto } from "./types";

export interface CompleteTaskRequest {
  taskId: string;
  proofPhotoObjectName?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Получить все задания для текущего пользователя (как Санты) с информацией о выполнении.
 */
export async function getMyTasksAsSanta(
  eventId: string
): Promise<SantaTaskWithCompletion[]> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/events/${eventId}/tasks/my-tasks`);
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    
    // Если задания еще не выбраны, возвращаем пустой массив вместо ошибки
    try {
      const errorJson = JSON.parse(errorText);
      if (
        response.status === 400 &&
        errorJson.message &&
        errorJson.message.includes("не выбраны задания")
      ) {
        return [];
      }
    } catch {
      // Если не удалось распарсить JSON, продолжаем как обычно
    }
    
    throw new Error(
      `Не удалось загрузить задания: ${response.status} ${errorText}`
    );
  }

  const result: ApiResponse<SantaTaskWithCompletion[]> = await response.json();
  return result.data;
}

/**
 * Отметить задание как выполненное с загрузкой фото-доказательства.
 */
export async function completeTaskWithPhoto(
  eventId: string,
  taskId: string,
  photoFile: File
): Promise<SantaTaskWithCompletion> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/events/${eventId}/tasks/complete`);

  console.log("Uploading photo:", {
    url,
    fileSize: photoFile.size,
    fileName: photoFile.name,
    fileType: photoFile.type,
  });

  const formData = new FormData();
  formData.append("taskId", taskId);
  formData.append("file", photoFile);

  // Для FormData не устанавливаем Content-Type - браузер сделает это автоматически с boundary
  // Но нам нужен только Authorization заголовок
  const token = getAccessToken();
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Upload failed:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      throw new Error(
        `Не удалось отметить задание как выполненное: ${response.status} ${errorText}`
      );
    }

    const result: ApiResponse<SantaTaskWithCompletion> = await response.json();
    console.log("Upload successful:", result);
    return result.data;
  } catch (error) {
    // Обработка сетевых ошибок (например, когда устройство не может подключиться)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.error("Network error:", error);
      throw new Error(
        `Не удалось подключиться к серверу. Проверьте подключение к интернету и что бэкенд запущен на ${apiUrl}`
      );
    }
    // Пробрасываем другие ошибки как есть
    throw error;
  }
}

/**
 * Получить все фото текущего пользователя из всех событий.
 */
export async function getAllUserPhotos(): Promise<UserPhoto[]> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/tasks/my-photos`);
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Не удалось загрузить фото: ${response.status} ${errorText}`
    );
  }

  const result: ApiResponse<UserPhoto[]> = await response.json();
  return result.data;
}

/**
 * Отметить задание как выполненное с использованием уже загруженного фото.
 */
export async function completeTaskWithExistingPhoto(
  eventId: string,
  taskId: string,
  proofPhotoObjectName: string
): Promise<SantaTaskWithCompletion> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/events/${eventId}/tasks/complete`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      taskId,
      proofPhotoObjectName,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Не удалось отметить задание как выполненное: ${response.status} ${errorText}`
    );
  }

  const result: ApiResponse<SantaTaskWithCompletion> = await response.json();
  return result.data;
}

