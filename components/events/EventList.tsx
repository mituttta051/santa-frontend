"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Event } from "@/lib/types";

interface EventListProps {
  events: Event[];
  loading?: boolean;
}

export function EventList({ events, loading = false }: EventListProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Не указано";
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return <p className="text-muted-foreground">Загрузка...</p>;
  }

  if (events.length === 0) {
    return <p className="text-muted-foreground">Событий пока нет</p>;
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{event.name}</CardTitle>
              <Link href={`/admin/events/${event.id}`}>
                <Button variant="outline" size="sm">
                  Открыть
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div>
                <strong>Вишлисты открываются:</strong> {formatDate(event.wishlistReleaseAt)}
              </div>
              {event.giftDate && (
                <div>
                  <strong>Подарки:</strong> {formatDate(event.giftDate)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

