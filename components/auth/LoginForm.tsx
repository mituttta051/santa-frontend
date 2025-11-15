"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/api";
import type { AuthResponse } from "@/lib/types";
import { formatPhoneNumber, normalizePhoneNumber } from "@/lib/utils";

interface LoginFormProps {
  phoneNumber: string;
  onPhoneChange: (phone: string) => void;
  onSuccess: (response: AuthResponse) => void;
  onError: (error: string) => void;
  onBack?: () => void;
  disabled?: boolean;
  showPhoneField?: boolean;
}

export function LoginForm({
  phoneNumber,
  onPhoneChange,
  onSuccess,
  onError,
  onBack,
  disabled = false,
  showPhoneField = true,
}: LoginFormProps) {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhoneNumber(phoneNumber);
    if (!normalized || normalized.length < 12 || !password.trim()) {
      onError("Заполните все поля");
      return;
    }

    try {
      setIsSubmitting(true);
      onError("");
      const response = await login({
        phoneNumber: normalized,
        password: password.trim(),
      });

      onSuccess(response);
      // Очищаем форму после успешного входа
      setPassword("");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Неверный номер телефона или пароль");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showPhoneField ? (
        <div className="space-y-2">
          <label htmlFor="phone-login" className="text-sm font-medium">
            Номер телефона
          </label>
          <Input
            id="phone-login"
            type="tel"
            value={phoneNumber}
            onChange={(e) => onPhoneChange(e.target.value)}
            disabled
            className="bg-muted"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <label htmlFor="phoneNumber" className="text-sm font-medium">
            Номер телефона *
          </label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="+7 (999) 123-45-67"
            value={formatPhoneNumber(phoneNumber)}
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value);
              onPhoneChange(formatted);
            }}
            required
            disabled={disabled || isSubmitting}
            autoFocus
          />
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="password-login" className="text-sm font-medium">
          Пароль *
        </label>
        <Input
          id="password-login"
          type="password"
          placeholder="Введите пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus={showPhoneField}
          disabled={disabled || isSubmitting}
        />
      </div>
      <Button type="submit" className="w-full" disabled={disabled || isSubmitting}>
        {isSubmitting ? "Вход..." : "Войти"}
      </Button>
      {onBack && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            onBack();
            setPassword("");
          }}
          className="w-full"
          disabled={disabled || isSubmitting}
        >
          Назад
        </Button>
      )}
    </form>
  );
}

