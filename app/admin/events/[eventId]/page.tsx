"use client";

import { Suspense, use, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { EventCard } from "@/components/events/EventCard";
import { AdminPanel } from "@/components/events/AdminPanel";
import { AdminPairsCard } from "@/components/events/AdminPairsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context";
import { getEventById, type Event } from "@/lib/api";

interface AdminEventPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

function AdminEventPageContent({ params }: AdminEventPageProps) {
  const { eventId: rawEventId } = use(params);
  const eventId = decodeURIComponent(rawEventId);

  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, currentUser, isLoading: isAuthLoading } = useApp();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pairsRefreshToken, setPairsRefreshToken] = useState(0);
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    // Ждем завершения проверки аутентификации перед редиректом
    if (!isAuthLoading && !isAuthenticated && !isRedirectingRef.current) {
      isRedirectingRef.current = true;
      const redirectUrl = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : "/login";
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isAuthLoading, router, pathname]);

  useEffect(() => {
    if (!isAuthenticated || !currentUser?.isAdmin || !eventId) {
      return;
    }

    let isMounted = true;

    async function loadEvent() {
      try {
        setIsLoading(true);
        setLoadError(null);
        const eventData = await getEventById(eventId);

        if (!isMounted) {
          return;
        }

        setEvent(eventData);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        const message =
          error instanceof Error ? error.message : "Не удалось загрузить мероприятие";
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

  const handlePairsGenerated = () => {
    setPairsRefreshToken((token) => token + 1);
  };

  if (!isAuthenticated || isRedirectingRef.current || !eventId) {
    return null;
  }

  if (!currentUser?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Нет доступа</CardTitle>
            <CardDescription>
              Страница доступна только администраторам. Попробуйте войти под учётной записью
              администратора.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button onClick={() => router.push("/admin")}>Перейти в админку</Button>
            <Button variant="secondary" onClick={() => router.push("/")}>
              На главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Показываем loading пока проверяется аутентификация
  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="px-2" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <Link href="/admin" className="text-sm text-muted-foreground underline">
            К списку событий
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
            <AdminPanel
              event={event}
              currentUser={currentUser}
              onPairsGenerated={handlePairsGenerated}
              onError={(error) => setLoadError(error)}
            />
            <AdminPairsCard
              key={pairsRefreshToken}
              event={event}
              currentUser={currentUser}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function AdminEventPage({ params }: AdminEventPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background p-4">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Загружаем информацию о мероприятии...
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <AdminEventPageContent params={params} />
    </Suspense>
  );
}


