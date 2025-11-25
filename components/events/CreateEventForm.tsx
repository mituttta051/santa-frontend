"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createEvent } from "@/lib/events";
import type { Event } from "@/lib/types";

interface CreateEventFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateEventForm({ onSuccess, onCancel }: CreateEventFormProps) {
  const [newEvent, setNewEvent] = useState({
    name: "",
    signupDeadline: "",
    assignmentAt: "",
    wishlistReleaseAt: "",
    giftDate: "",
    revealAt: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Валидация обязательных полей
    if (!newEvent.name.trim()) {
      setError("Название события обязательно для заполнения");
      return;
    }

    if (!newEvent.wishlistReleaseAt) {
      setError("Дата открытия вишлистов обязательна для заполнения");
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      const eventData: Partial<Event> = {
        name: newEvent.name.trim(),
        signupDeadline: newEvent.signupDeadline || undefined,
        assignmentAt: newEvent.assignmentAt || undefined,
        wishlistReleaseAt: newEvent.wishlistReleaseAt,
        giftDate: newEvent.giftDate || undefined,
        revealAt: newEvent.revealAt || undefined,
      };

      await createEvent(eventData);
      setNewEvent({
        name: "",
        signupDeadline: "",
        assignmentAt: "",
        wishlistReleaseAt: "",
        giftDate: "",
        revealAt: "",
      });
      setError(null);
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Не удалось создать событие";
      setError(errorMessage);
      console.error("Ошибка при создании события:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Создать новое событие</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium">Название события *</label>
          <Input
            placeholder="Например: Новый год 2025"
            value={newEvent.name}
            onChange={(e) => {
              setNewEvent({ ...newEvent, name: e.target.value });
              if (error) setError(null);
            }}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Дата открытия вишлистов *</label>
          <Input
            type="datetime-local"
            value={newEvent.wishlistReleaseAt}
            onChange={(e) => {
              setNewEvent({ ...newEvent, wishlistReleaseAt: e.target.value });
              if (error) setError(null);
            }}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Дедлайн регистрации</label>
          <Input
            type="datetime-local"
            value={newEvent.signupDeadline}
            onChange={(e) => setNewEvent({ ...newEvent, signupDeadline: e.target.value })}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Дата распределения пар</label>
          <Input
            type="datetime-local"
            value={newEvent.assignmentAt}
            onChange={(e) => setNewEvent({ ...newEvent, assignmentAt: e.target.value })}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Дата вручения подарков</label>
          <Input
            type="datetime-local"
            value={newEvent.giftDate}
            onChange={(e) => setNewEvent({ ...newEvent, giftDate: e.target.value })}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Дата открытия Сант</label>
          <Input
            type="datetime-local"
            value={newEvent.revealAt}
            onChange={(e) => setNewEvent({ ...newEvent, revealAt: e.target.value })}
            disabled={isSubmitting}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Создание..." : "Создать"}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Отмена
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

