"use client";

import { use, useEffect, useState, useRef, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, LogOut, X } from "lucide-react";

import { useApp } from "@/lib/context";
import { EventCard } from "@/components/events/EventCard";
import { PairsCard } from "@/components/events/PairsCard";
import { SantaSelectedTasksCard } from "@/components/events/SantaSelectedTasksCard";
import { SelectTasksForSantaCard } from "@/components/events/SelectTasksForSantaCard";
import { ChatCard } from "@/components/events/ChatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  getEventById,
  getEvents,
  getParticipants,
  updateWishlist,
  type Event,
  type Participant,
  type PairDto,
} from "@/lib/api";
import { getMyPair } from "@/lib/events";

interface EventPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

function EventPageContent({ params }: EventPageProps) {
  // use(params) должен быть вызван первым, чтобы избежать проблем с порядком хуков
  const { eventId: rawEventId } = use(params);
  const eventId = decodeURIComponent(rawEventId);
  
  // Все остальные хуки вызываются после use(params)
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, currentUser, isLoading: isAuthLoading, logout } = useApp();

  const [event, setEvent] = useState<Event | null>(null);
  const [myPair, setMyPair] = useState<PairDto | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [wishlistValue, setWishlistValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [wishlistError, setWishlistError] = useState<string | null>(null);
  const isRedirectingRef = useRef(false);
  const [tasksRefreshKey, setTasksRefreshKey] = useState(0);
  const [userEventsCount, setUserEventsCount] = useState(0);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const isWishlistLocked = Boolean(myPair);

  useEffect(() => {
    // Ждем завершения проверки аутентификации перед редиректом
    if (!isAuthLoading && !isAuthenticated && !isRedirectingRef.current) {
      isRedirectingRef.current = true;
      const redirectUrl = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : "/login";
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isAuthLoading, router, pathname]);

  // Загружаем количество мероприятий пользователя
  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      return;
    }

    const userId = currentUser.id;
    let isMounted = true;
    async function loadUserEventsCount() {
      try {
        const [events, participants] = await Promise.all([getEvents(), getParticipants()]);
        
        if (!isMounted) return;

        const myEventIds = new Set(
          participants
            .filter((participant: Participant) => participant.userId === userId)
            .map((participant) => participant.eventId)
        );

        const filteredEvents = events.filter((event: Event) => myEventIds.has(event.id));
        setUserEventsCount(filteredEvents.length);
      } catch (error) {
        // Игнорируем ошибки при загрузке количества мероприятий
        console.error("Failed to load user events count:", error);
      }
    }

    loadUserEventsCount();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    if (!isAuthenticated || !currentUser || !eventId) {
      return;
    }

    let isMounted = true;

    async function loadEvent() {
      try {
        setIsLoading(true);
        setLoadError(null);

        // Получаем событие по ID (UUID)
        const eventData = await getEventById(eventId);
        
        if (!isMounted) {
          return;
        }

        // Используем UUID события для остальных запросов
        const eventUuid = eventData.id;
        const participants = await getParticipants();

        if (!isMounted) {
          return;
        }

        const myParticipant =
          participants.find(
            (p: Participant) => p.eventId === eventUuid && p.userId === currentUser?.id
          ) || null;

        // Load pair for all users (including admins who participate in the event)
        const pair = await getMyPair(eventUuid);
        if (isMounted) {
          setMyPair(pair);
        }

        if (isMounted) {
          setEvent(eventData);
          setParticipant(myParticipant);
          setWishlistValue(myParticipant?.wishlist || "");
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }
        const message = error instanceof Error ? error.message : "Не удалось загрузить мероприятие";
        setLoadError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadEvent();

    return () => {
      isMounted = false;
    };
  }, [eventId, isAuthenticated, currentUser]);

  useEffect(() => {
    if (isLogoutModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isLogoutModalOpen]);

  async function handleWishlistSave(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    if (!participant?.id) {
      setWishlistError("Вы пока не участвуете в этом мероприятии");
      return;
    }

    if (isWishlistLocked) {
      setWishlistError("Пары уже распределены. Редактирование вишлиста закрыто.");
      return;
    }

    try {
      setIsSaving(true);
      setWishlistError(null);

      const updated = await updateWishlist(participant.id, wishlistValue);
      setParticipant(updated);
      toast.success("Вишлист сохранён");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось сохранить вишлист. Попробуйте позже.";
      setWishlistError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (!isAuthenticated || isRedirectingRef.current || !eventId) {
    return null;
  }

  // Показываем loading пока проверяется аутентификация
  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex items-center justify-between">
          {userEventsCount > 1 && (
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="px-2"
                onClick={() => router.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setIsLogoutModalOpen(true)}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Загружаем информацию о мероприятии...
            </CardContent>
          </Card>
        ) : loadError ? (
          <Card>
            <CardHeader>
              <CardTitle>Что-то пошло не так</CardTitle>
              <CardDescription>{loadError}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.refresh()}>Попробовать снова</Button>
            </CardContent>
          </Card>
        ) : event ? (
          <>
            <EventCard event={event} />

            <Card>
              <CardHeader>
                <CardTitle>Мой вишлист</CardTitle>
                <CardDescription>
                  Подскажи Секретному Санте, что тебя порадует
                </CardDescription>
                {isWishlistLocked && (
                  <p className="text-sm text-muted-foreground">
                    Пары уже распределены, изменить вишлист теперь нельзя.
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {participant ? (
                  <form className="space-y-4" onSubmit={handleWishlistSave}>
                    <Textarea
                      value={wishlistValue}
                      onChange={(e) => setWishlistValue(e.target.value)}
                      placeholder="Например, книга, сладости или сертификат в любимый магазин..."
                      rows={6}
                      disabled={isSaving || isWishlistLocked}
                    />
                    {wishlistError && (
                      <p className="text-sm text-destructive">{wishlistError}</p>
                    )}
                    {!isWishlistLocked && (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button type="submit" className="flex-1" disabled={isSaving}>
                          {isSaving ? "Сохраняем..." : "Сохранить"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          disabled={isSaving}
                          onClick={() => setWishlistValue(participant.wishlist || "")}
                        >
                          Сбросить изменения
                        </Button>
                      </div>
                    )}
                  </form>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Ты пока не участвуешь в этом событии. Попроси администратора добавить тебя.
                  </p>
                )}
              </CardContent>
            </Card>

            <PairsCard
              eventId={event?.id || ""}
              myPair={myPair}
              tasksRefreshKey={tasksRefreshKey}
              onWishlistRevealed={(updatedPair) => setMyPair(updatedPair)}
            />

            <SantaSelectedTasksCard
              eventId={event?.id || ""}
              myPair={myPair}
              currentUser={currentUser}
              onTaskCompletion={() => setTasksRefreshKey((prev) => prev + 1)}
            />

            <SelectTasksForSantaCard
              eventId={event?.id || ""}
              currentUser={currentUser}
              onTasksSelected={async () => {
                if (!event?.id) return;
                try {
                  const participants = await getParticipants();
                  const updated = participants.find(
                    (p: Participant) => p.eventId === event.id && p.userId === currentUser?.id
                  );
                  if (updated) {
                    setParticipant(updated);
                  }
                  const pair = await getMyPair(event.id);
                  setMyPair(pair);
                  setTasksRefreshKey((prev) => prev + 1);
                } catch (err) {
                  console.error("Ошибка при обновлении участника:", err);
                }
              }}
            />

            {myPair && (
              <ChatCard
                eventId={event?.id || ""}
                participant={participant}
                currentUser={currentUser}
              />
            )}
          </>
        ) : null}
      </div>

      {isLogoutModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsLogoutModalOpen(false);
            }
          }}
        >
          <div className="w-full max-w-sm rounded-xl border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-semibold">Выход</h2>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsLogoutModalOpen(false)}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Закрыть</span>
              </Button>
            </div>
            <div className="px-6 py-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Вы уверены, что хотите выйти?
              </p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsLogoutModalOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleLogout}
                >
                  Выйти
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EventPage({ params }: EventPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Загружаем информацию о мероприятии...
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <EventPageContent params={params} />
    </Suspense>
  );
}

