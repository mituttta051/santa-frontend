// API функции для авторизации

import { getApiBaseUrl, fixApiUrl } from "./config";
import { setAccessToken, removeAccessToken } from "./token";
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  PhoneAuthRequest,
  PhoneAuthResponse,
} from "./types";

export async function register(request: RegisterRequest): Promise<AuthResponse> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/users/register`);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    let errorMessage = "Не удалось зарегистрироваться";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text();
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  const data: AuthResponse = await response.json();
  setAccessToken(data.accessToken);
  return data;
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/users/login`);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    let errorMessage = "Не удалось войти";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text();
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  const data: AuthResponse = await response.json();
  setAccessToken(data.accessToken);
  return data;
}

export function logout(): void {
  removeAccessToken();
}

/**
 * Check if a user exists by phone number without creating a new user.
 * @param phoneNumber the phone number to check
 * @returns PhoneAuthResponse with user if exists, or null user and isNewUser=true if doesn't exist
 */
export async function checkUserExists(phoneNumber: string): Promise<PhoneAuthResponse> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/users/check-phone?phoneNumber=${encodeURIComponent(phoneNumber)}`);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    let errorMessage = "Не удалось проверить номер телефона";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text();
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function authenticateOrRegisterByPhone(
  phoneNumber: string,
  name?: string
): Promise<PhoneAuthResponse> {
  const apiUrl = getApiBaseUrl();
  const url = fixApiUrl(`${apiUrl}/users/auth/phone`);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phoneNumber, name }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Не удалось войти: ${errorText}`);
  }
  return response.json();
}

