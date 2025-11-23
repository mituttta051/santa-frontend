"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEvents, getParticipants, type Event, type Participant } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, currentUser, logout } = useApp();
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      setUserEvents([]);
      return;
    }

    const userId = currentUser.id;
    let isMounted = true;
    async function loadUserEvents() {
      try {
        setIsEventsLoading(true);
        setEventsError(null);

        const [events, participants] = await Promise.all([getEvents(), getParticipants()]);

        const myEventIds = new Set(
          participants
            .filter((participant: Participant) => participant.userId === userId)
            .map((participant) => participant.eventId)
        );

        if (!isMounted) return;

        const filteredEvents = events.filter((event: Event) => myEventIds.has(event.id));
        setUserEvents(filteredEvents);
      } catch (error) {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : "Не удалось загрузить мероприятия";
        setEventsError(message);
      } finally {
        if (isMounted) {
          setIsEventsLoading(false);
        }
      }
    }

    loadUserEvents();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, currentUser]);

  if (!isAuthenticated) {
    return null; // Пока идет редирект
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">🎄 Secret Santa</CardTitle>
            <CardDescription>
              Добро пожаловать, {currentUser?.name || "пользователь"}!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {userEvents.length !== 0 && (
                <div>
                  <h3 className="text-lg font-semibold">Мои мероприятия</h3>
                  <p className="text-sm text-muted-foreground">
                    Все события, в которых вы участвуете
                  </p>
                </div>
              )}
              {isEventsLoading && (
                <p className="text-sm text-muted-foreground">Загружаем мероприятия...</p>
              )}
              {!isEventsLoading && eventsError && (
                <p className="text-sm text-destructive">{eventsError}</p>
              )}
              {!isEventsLoading && !eventsError && userEvents.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Администратор скоро вас добавит на мероприятие
                </p>
              )}
              <div className="space-y-3">
                {userEvents.map((event) => (
                  <div key={event.id} className="space-y-2">
                    <EventCard event={event} />
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => router.push(`/events/${event.id}`)}
                    >
                      Открыть мероприятие
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="w-full"
            >
              Выйти
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
