"use client";

import { use, useEffect, useState, useRef, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useApp } from "@/lib/context";
import { EventCard } from "@/components/events/EventCard";
import { PairsCard } from "@/components/events/PairsCard";
import { SantaSelectedTasksCard } from "@/components/events/SantaSelectedTasksCard";
import { SelectTasksForSantaCard } from "@/components/events/SelectTasksForSantaCard";
import { ChatCard } from "@/components/events/ChatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getEventById,
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
  const { isAuthenticated, currentUser } = useApp();

  const [event, setEvent] = useState<Event | null>(null);
  const [myPair, setMyPair] = useState<PairDto | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [wishlistValue, setWishlistValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [wishlistMessage, setWishlistMessage] = useState<string | null>(null);
  const [wishlistError, setWishlistError] = useState<string | null>(null);
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated && !isRedirectingRef.current) {
      isRedirectingRef.current = true;
      const redirectUrl = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : "/login";
      router.push(redirectUrl);
    }
  }, [isAuthenticated, router, pathname]);

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

  async function handleWishlistSave(event: React.FormEvent) {
    event.preventDefault();
    if (!participant?.id) {
      setWishlistError("Вы пока не участвуете в этом мероприятии");
      return;
    }

    try {
      setIsSaving(true);
      setWishlistError(null);
      setWishlistMessage(null);

      const updated = await updateWishlist(participant.id, wishlistValue);
      setParticipant(updated);
      setWishlistMessage("Вишлист сохранён");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось сохранить вишлист. Попробуйте позже.";
      setWishlistError(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (!isAuthenticated || isRedirectingRef.current || !eventId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="px-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <Link
            href="/"
            className="text-sm text-muted-foreground underline"
          >
            На главную
          </Link>
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
              </CardHeader>
              <CardContent>
                {participant ? (
                  <form className="space-y-4" onSubmit={handleWishlistSave}>
                    <Textarea
                      value={wishlistValue}
                      onChange={(e) => setWishlistValue(e.target.value)}
                      placeholder="Например, книга, сладости или сертификат в любимый магазин..."
                      rows={6}
                      disabled={isSaving}
                    />
                    {wishlistMessage && (
                      <p className="text-sm text-emerald-600">{wishlistMessage}</p>
                    )}
                    {wishlistError && (
                      <p className="text-sm text-destructive">{wishlistError}</p>
                    )}
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
                  </form>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Ты пока не участвуешь в этом событии. Попроси администратора добавить тебя.
                  </p>
                )}
              </CardContent>
            </Card>

            <PairsCard myPair={myPair} currentUser={currentUser} />

            <SantaSelectedTasksCard
              eventId={event?.id || ""}
              myPair={myPair}
              currentUser={currentUser}
            />

            <SelectTasksForSantaCard
              eventId={event?.id || ""}
              currentUser={currentUser}
              onTasksSelected={async () => {
                // Перезагружаем участников после выбора заданий
                if (!event?.id) return;
                try {
                  const participants = await getParticipants();
                  const updated = participants.find(
                    (p: Participant) => p.eventId === event.id && p.userId === currentUser?.id
                  );
                  if (updated) {
                    setParticipant(updated);
                  }
                  // Reload my pair
                  const pair = await getMyPair(event.id);
                  setMyPair(pair);
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

