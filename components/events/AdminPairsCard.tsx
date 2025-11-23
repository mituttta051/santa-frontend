"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ChevronDown, ChevronUp } from "lucide-react";
import type { AdminPairDto, Event, User } from "@/lib/types";
import { getEventPairs } from "@/lib/api";

interface AdminPairsCardProps {
  event: Event;
  currentUser: User | null;
}

export function AdminPairsCard({ event, currentUser }: AdminPairsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pairs, setPairs] = useState<AdminPairDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isExpanded && event && currentUser?.isAdmin) {
      loadPairs();
    }
  }, [isExpanded, event, currentUser]);

  async function loadPairs() {
    if (!event || !currentUser?.isAdmin) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const eventPairs = await getEventPairs(event.id);
      setPairs(eventPairs);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось загрузить пары";
      setError(message);
      console.error("Ошибка при загрузке пар:", err);
    } finally {
      setIsLoading(false);
    }
  }

  if (!currentUser?.isAdmin) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Пары
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Загрузка пар...
            </p>
          ) : error ? (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : pairs.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Пары еще не сгенерированы
            </div>
          ) : (
            <div className="space-y-4">
              {pairs.map((pair, index) => (
                <div
                  key={`${pair.santaId}-${pair.childId}`}
                  className="rounded-lg border bg-muted/30 p-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Санта
                        </p>
                        <p className="text-base font-semibold">{pair.santaName}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Внучок
                        </p>
                        <p className="text-base font-semibold">{pair.childName}</p>
                      </div>
                    </div>
                    {pair.childWishlist && (
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Вишлист внучка:
                        </p>
                        <div className="rounded-md border bg-background p-3">
                          <p className="text-sm whitespace-pre-wrap">
                            {pair.childWishlist}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

