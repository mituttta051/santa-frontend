import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Нормализует номер телефона к единому формату +7XXXXXXXXXX
 * - Убирает все форматирование (скобки, дефисы, пробелы)
 * - Приводит 8 к +7
 * - Приводит 7 к +7
 * - Сохраняет +7 как есть
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return "";
  
  // Убираем все символы кроме цифр и +
  let cleaned = phone.replace(/[^\d+]/g, "");
  
  // Если начинается с 8, заменяем на +7
  if (cleaned.startsWith("8")) {
    cleaned = "+7" + cleaned.slice(1);
  }
  // Если начинается с 7 (без +), добавляем +
  else if (cleaned.startsWith("7") && !cleaned.startsWith("+7")) {
    cleaned = "+" + cleaned;
  }
  // Если не начинается с +, добавляем +7
  else if (!cleaned.startsWith("+")) {
    cleaned = "+7" + cleaned;
  }
  
  // Убираем лишние символы после нормализации
  cleaned = cleaned.replace(/[^\d+]/g, "");
  
  // Ограничиваем длину (максимум 12 символов: +7 + 10 цифр)
  if (cleaned.length > 12) {
    cleaned = cleaned.slice(0, 12);
  }
  
  return cleaned;
}

/**
 * Форматирует номер телефона для отображения: +7 (XXX) XXX-XX-XX
 * Автоматически добавляет скобки и дефисы при вводе
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  
  // Убираем все символы кроме цифр и +
  let cleaned = phone.replace(/[^\d+]/g, "");
  
  // Если начинается с 8, заменяем на +7
  if (cleaned.startsWith("8")) {
    cleaned = "+7" + cleaned.slice(1);
  }
  // Если начинается с 7 (без +), добавляем +
  else if (cleaned.startsWith("7") && !cleaned.startsWith("+7")) {
    cleaned = "+" + cleaned;
  }
  // Если не начинается с + и есть цифры, добавляем +7
  else if (!cleaned.startsWith("+") && cleaned.length > 0) {
    cleaned = "+7" + cleaned;
  }
  
  // Если после обработки все еще нет +, добавляем +7
  if (!cleaned.startsWith("+")) {
    cleaned = "+7" + cleaned;
  }
  
  // Ограничиваем длину (максимум 12 символов: +7 + 10 цифр)
  if (cleaned.length > 12) {
    cleaned = cleaned.slice(0, 12);
  }
  
  // Если номер слишком короткий, возвращаем как есть (чтобы не ломать ввод)
  if (cleaned.length <= 2) {
    return cleaned;
  }
  
  // Извлекаем цифры после +7
  const digits = cleaned.replace(/^\+7/, "").replace(/\D/g, "");
  
  // Форматируем: +7 (XXX) XXX-XX-XX
  if (digits.length === 0) {
    return "+7";
  } else if (digits.length <= 3) {
    return `+7 (${digits}`;
  } else if (digits.length <= 6) {
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else if (digits.length <= 8) {
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else {
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
  }
}
