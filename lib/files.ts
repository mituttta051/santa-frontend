// API функции для работы с файлами (загрузка фото)

import { getApiBaseUrl, fixApiUrl } from "./config";
import { getAccessToken } from "./token";

export interface UploadFileResponse {
  objectName: string;
  url: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Загрузить файл (фото) на сервер.
 */
export async function uploadFile(file: File): Promise<UploadFileResponse> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/files/upload`);

  const formData = new FormData();
  formData.append("file", file);

  // Для FormData не устанавливаем Content-Type - браузер сделает это автоматически с boundary
  // Но нам нужен только Authorization заголовок
  const token = getAccessToken();
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Не удалось загрузить файл: ${response.status} ${errorText}`
    );
  }

  const result: ApiResponse<UploadFileResponse> = await response.json();
  return result.data;
}

/**
 * Получить URL для загрузки файла через сервер (вместо прямого доступа к MinIO).
 * @param objectName имя объекта (путь к файлу) в MinIO
 * @returns URL для загрузки файла через сервер
 */
export function getFileDownloadUrl(objectName: string): string {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/files/download?objectName=${encodeURIComponent(objectName)}`);
  return url;
}

