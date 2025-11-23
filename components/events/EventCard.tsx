"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gift } from "lucide-react";
import type { Event } from "@/lib/types";

interface EventCardProps {
  event: Event;
  showStatus?: boolean;
}

export function EventCard({ event, showStatus = true }: EventCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Не указано";
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getEventStatus = () => {
    const now = new Date();
    const wishlistRelease = event.wishlistReleaseAt ? new Date(event.wishlistReleaseAt) : null;
    const assignment = event.assignmentAt ? new Date(event.assignmentAt) : null;

    if (assignment && now < assignment) {
      return "✍️ Регистрация открыта";
    }
    if (wishlistRelease && now < wishlistRelease) {
      return "🎯 Пары распределены";
    }
    if (wishlistRelease && now >= wishlistRelease) {
      return "🎁 Вишлисты открыты";
    }
    return "⚡ Активно";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-2xl">🎄 {event.name}</CardTitle>
          {showStatus && <Badge variant="outline">{getEventStatus()}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          {event.signupDeadline && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Регистрация до: {formatDate(event.signupDeadline)}</span>
            </div>
          )}
          {event.giftDate && (
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-muted-foreground" />
              <span>Подарки открываем: {formatDate(event.giftDate)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

