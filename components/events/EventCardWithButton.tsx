"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gift } from "lucide-react";
import type { Event } from "@/lib/types";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface EventCardWithButtonProps {
  event: Event;
  showStatus?: boolean;
}

export function EventCardWithButton({ event, showStatus = true }: EventCardWithButtonProps) {
  const router = useRouter();
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

  const handleCardClick = () => {
    router.push(`/events/${event.id}`);
  };

  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:bg-accent/50 active:scale-[0.98]"
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-2xl">{event.name}</CardTitle>
          {showStatus && <Badge variant="outline">{getEventStatus()}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
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
        <Button
          variant="secondary"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          Открыть мероприятие
        </Button>
      </CardContent>
    </Card>
  );
}

