"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Event,
  PairDto,
  getEventBySlug,
  getParticipants,
  createParticipant,
  Participant,
  getAccessToken,
} from "@/lib/api";
import { useApp } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut } from "lucide-react";
import { AuthFlow } from "@/components/auth/AuthFlow";
import { EventCard } from "@/components/events/EventCard";
import { WishlistCard } from "@/components/events/WishlistCard";
import { PairsCard } from "@/components/events/PairsCard";
import { AdminPanel } from "@/components/events/AdminPanel";
import type { AuthResponse } from "@/lib/types";

export default function EventPage() {
  const params = useParams();
  const { currentUser, login: loginUser, isAuthenticated, logout } = useApp();
  const slug = params.slug as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [pairs, setPairs] = useState<PairDto[]>([]);

  useEffect(() => {
    loadEvent();
    const token = getAccessToken();
    if (!token) {
      // Пользователь не авторизован, покажем форму авторизации
    }
  }, [slug]);

  useEffect(() => {
    if (currentUser && event) {
      loadParticipant();
    }
  }, [currentUser, event]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const eventData = await getEventBySlug(slug);
      setEvent(eventData);
      setError(null);
    } catch (err) {
      setError("Событие не найдено");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipant = async () => {
    if (!currentUser || !event) return;

    try {
      const participants = await getParticipants();
      const userParticipant = participants.find(
        (p) => p.userId === currentUser.id && p.eventId === event.id
      );

      if (userParticipant) {
        setParticipant(userParticipant);
      } else {
        // Создаем участника, если его нет
        const newParticipant = await createParticipant({
          userId: currentUser.id,
          eventId: event.id,
        });
        setParticipant(newParticipant);
      }
    } catch (err) {
      console.error("Ошибка при загрузке участника:", err);
    }
  };

  const handleAuthSuccess = async (response: AuthResponse) => {
    loginUser(response.user, response.accessToken);

    // Создаем Participant с вишлистом для текущего события, если он был указан при регистрации
    if (event && response.user) {
      try {
        const newParticipant = await createParticipant({
          userId: response.user.id,
          eventId: event.id,
        });
        setParticipant(newParticipant);
      } catch (participantError) {
        // Если не удалось создать участника, это не критично - он создастся позже
        console.error("Ошибка при создании участника:", participantError);
      }
    }
  };

  const handleLogout = () => {
    logout();
    setParticipant(null);
    setPairs([]);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  // Если пользователь не авторизован, показываем формы авторизации
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <AuthFlow eventName={event.name} onSuccess={handleAuthSuccess} />
      </div>
    );
  }

  // Основной экран события
  return (
    <div className="min-h-screen bg-background p-4">
      {/* Заголовок с кнопкой выхода */}
      <div className="flex items-center justify-between">
        <div className="flex-1"></div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="h-9 w-9"
          title="Выйти"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
      <div className="mx-auto max-w-2xl space-y-6">
        <EventCard event={event} />

        <WishlistCard
          participant={participant}
          event={event}
          onUpdate={setParticipant}
          onError={setError}
        />

        <PairsCard pairs={pairs} currentUser={currentUser} />

        <AdminPanel
          event={event}
          currentUser={currentUser}
          pairs={pairs}
          onPairsGenerated={setPairs}
          onError={setError}
        />

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
