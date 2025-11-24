"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import type { Event } from "@/lib/types";

interface EventListProps {
  events: Event[];
  loading?: boolean;
}

export function EventList({ events, loading = false }: EventListProps) {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Не указано";
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const copyToClipboard = async (slug: string) => {
    const fullUrl = `${window.location.origin}/events/${slug}`;
    
    try {
      // Пробуем использовать современный Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
        setCopiedSlug(slug);
        setTimeout(() => setCopiedSlug(null), 2000);
        return;
      }
      
      // Fallback: используем старый метод с временным textarea
      const textArea = document.createElement("textarea");
      textArea.value = fullUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand("copy");
        if (successful) {
          setCopiedSlug(slug);
          setTimeout(() => setCopiedSlug(null), 2000);
        } else {
          // Если не получилось, показываем ссылку для ручного копирования
          alert(`Скопируйте ссылку вручную:\n${fullUrl}`);
        }
      } catch (err) {
        // Если и это не сработало, показываем ссылку
        alert(`Скопируйте ссылку вручную:\n${fullUrl}`);
      } finally {
        document.body.removeChild(textArea);
      }
    } catch (err) {
      // В крайнем случае показываем ссылку для ручного копирования
      alert(`Скопируйте ссылку вручную:\n${fullUrl}`);
    }
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
              {event.slug && (
                <Link href={`/admin/events/${event.id}`}>
                  <Button variant="outline" size="sm">
                    Открыть
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.slug && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Ссылка для регистрации:</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm">
                    {typeof window !== "undefined" ? window.location.origin : ""}
                    /events/{event.slug}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(event.slug!)}
                  >
                    {copiedSlug === event.slug ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
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

