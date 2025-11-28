"use client";

import { useMemo } from "react";
import Snowfall from "react-snowfall";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    return "✨ Активно";
  };

  const treeImages = useMemo<CanvasImageSource[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const createEmojiImage = (emoji: string) => {
      const size = 25;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" fill="transparent" />
        <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="${size * 0.75}">${emoji}</text>
      </svg>`;
      const img = new Image();
      img.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
      return img;
    };

    return [createEmojiImage("🎁")];
  }, []);

  return (
    <Card className="relative animate-slide-up-fade-in overflow-hidden">
      {/* Green gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700" />
      {/* Subtle overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-transparent to-slate-900/30" />
      {/* Snowfall effect */}
      <div className="pointer-events-none absolute inset-0">
        <Snowfall
          snowflakeCount={35}
          style={{ position: "absolute", width: "100%", height: "100%" }}
          images={treeImages.length ? treeImages : undefined}
          radius={[18, 26]}
          speed={[0.25, 0.6]}
          wind={[-0.1, 0.2]}
          rotationSpeed={[-0.15, 0.15]}
        />
      </div>
      
      {/* Content with relative positioning for z-index */}
      <div className="relative z-10">
        <CardHeader>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-2xl text-white drop-shadow-lg">{event.name}</CardTitle>
            {showStatus && (
              <Badge variant="outline" className="bg-white/90 text-slate-900 border-white/50 backdrop-blur-sm">
                {getEventStatus()}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-white/95">
            {event.signupDeadline && (
              <div className="flex items-center gap-2 drop-shadow-md">
                <span>⏰ Регистрация до: {formatDate(event.signupDeadline)}</span>
              </div>
            )}
            {event.giftDate && (
              <div className="flex items-center gap-2 drop-shadow-md">
                <span>🎁 Подарки открываем: {formatDate(event.giftDate)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
