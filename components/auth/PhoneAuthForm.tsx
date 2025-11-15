"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { checkUserExists } from "@/lib/api";
import { formatPhoneNumber, normalizePhoneNumber } from "@/lib/utils";

interface PhoneAuthFormProps {
  phoneNumber: string;
  onPhoneChange: (phone: string) => void;
  onNewUser: () => void;
  onExistingUser: () => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export function PhoneAuthForm({
  phoneNumber,
  onPhoneChange,
  onNewUser,
  onExistingUser,
  onError,
  disabled = false,
}: PhoneAuthFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const normalized = normalizePhoneNumber(phoneNumber);
    if (!normalized || normalized.length < 12) {
      onError("Введите корректный номер телефона");
      return;
    }

    try {
      setIsSubmitting(true);
      onError("");
      const response = await checkUserExists(normalized);

      if (response.isNewUser || !response.user) {
        onNewUser();
      } else {
        onExistingUser();
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "Не удалось проверить номер телефона");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Input
        type="tel"
        placeholder="+7 (999) 123-45-67"
        value={formatPhoneNumber(phoneNumber)}
        onChange={(e) => {
          const formatted = formatPhoneNumber(e.target.value);
          onPhoneChange(formatted);
        }}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        className="text-lg"
        autoFocus
        disabled={disabled || isSubmitting}
      />
      <Button
        onClick={handleSubmit}
        className="w-full"
        size="lg"
        disabled={disabled || isSubmitting}
      >
        {isSubmitting ? "Проверка..." : "Продолжить"}
      </Button>
    </>
  );
}

