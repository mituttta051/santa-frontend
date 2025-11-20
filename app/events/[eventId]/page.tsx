"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useApp } from "@/lib/context";
import { EventCard } from "@/components/events/EventCard";
import { PairsCard } from "@/components/events/PairsCard";
import { ChatCard } from "@/components/events/ChatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getEventById,
  getEventPairs,
  getParticipants,
  updateWishlist,
  type Event,
  type Participant,
  type PairDto,
} from "@/lib/api";

interface EventPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default function EventPage({ params }: EventPageProps) {
  const router = useRouter();
  const { isAuthenticated, currentUser } = useApp();
  const { eventId: rawEventId } = use(params);
  const eventId = decodeURIComponent(rawEventId);

  const [event, setEvent] = useState<Event | null>(null);
  const [pairs, setPairs] = useState<PairDto[]>([]);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [wishlistValue, setWishlistValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [wishlistMessage, setWishlistMessage] = useState<string | null>(null);
  const [wishlistError, setWishlistError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      return;
    }

    let isMounted = true;

    async function loadEvent() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const [eventData, participants, pairsData] = await Promise.all([
          getEventById(eventId),
          getParticipants(),
          getEventPairs(eventId),
        ]);

        if (!isMounted) {
          return;
        }

        const myParticipant =
          participants.find(
            (p: Participant) => p.eventId === eventId && p.userId === currentUser?.id
          ) || null;

        setEvent(eventData);
        setPairs(pairsData);
        setParticipant(myParticipant);
        setWishlistValue(myParticipant?.wishlist || "");
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

  if (!isAuthenticated) {
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

            <PairsCard pairs={pairs} currentUser={currentUser} />

            <ChatCard
              eventId={eventId}
              pairs={pairs}
              participant={participant}
              currentUser={currentUser}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

