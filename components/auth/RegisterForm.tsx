"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { register } from "@/lib/api";
import type { AuthResponse } from "@/lib/types";
import { normalizePhoneNumber } from "@/lib/utils";

interface RegisterFormProps {
  phoneNumber: string;
  onPhoneChange: (phone: string) => void;
  onSuccess: (response: AuthResponse) => void;
  onError: (error: string) => void;
  onBack: () => void;
  initialWishlist?: string;
  disabled?: boolean;
}

export function RegisterForm({
  phoneNumber,
  onPhoneChange,
  onSuccess,
  onError,
  onBack,
  initialWishlist = "",
  disabled = false,
}: RegisterFormProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhoneNumber(phoneNumber);
    if (!normalized || normalized.length < 12 || !name.trim() || !password.trim()) {
      onError("Заполните все обязательные поля");
      return;
    }

    try {
      setIsSubmitting(true);
      onError("");
      const response = await register({
        phoneNumber: normalized,
        password: password.trim(),
        name: name.trim(),
        wishlist: wishlist.trim() || undefined,
      });

      onSuccess(response);
      // Очищаем форму после успешной регистрации
      setName("");
      setPassword("");
      setWishlist("");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Не удалось зарегистрироваться");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          Номер телефона
        </label>
        <Input
          id="phone"
          type="tel"
          value={phoneNumber}
          onChange={(e) => onPhoneChange(e.target.value)}
          disabled
          className="bg-muted"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Имя *
        </label>
        <Input
          id="name"
          type="text"
          placeholder="Ваше имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
          disabled={disabled || isSubmitting}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Пароль *
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Придумайте пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={4}
          disabled={disabled || isSubmitting}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="wishlist" className="text-sm font-medium">
          Вишлист (опционально)
        </label>
        <Textarea
          id="wishlist"
          placeholder="Что бы вы хотели получить в подарок?"
          value={wishlist}
          onChange={(e) => setWishlist(e.target.value)}
          rows={4}
          disabled={disabled || isSubmitting}
        />
      </div>
      <Button type="submit" className="w-full" disabled={disabled || isSubmitting}>
        {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        className="w-full"
        disabled={disabled || isSubmitting}
      >
        Назад
      </Button>
    </form>
  );
}

