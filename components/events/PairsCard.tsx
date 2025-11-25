"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyTasksAsSanta } from "@/lib/task-completion";
import { revealChildWishlist } from "@/lib/events";
import type { PairDto } from "@/lib/types";

interface PairsCardProps {
  eventId: string;
  myPair: PairDto | null;
  tasksRefreshKey?: number;
  onWishlistRevealed?: (pair: PairDto) => void;
}

export function PairsCard({
  eventId,
  myPair,
  tasksRefreshKey = 0,
  onWishlistRevealed,
}: PairsCardProps) {
  const [pair, setPair] = useState<PairDto | null>(myPair);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [taskStatus, setTaskStatus] = useState({ total: 0, completed: 0 });
  const [taskStatusMessage, setTaskStatusMessage] = useState<string | null>(null);
  const [taskStatusError, setTaskStatusError] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [revealSuccess, setRevealSuccess] = useState<string | null>(null);

  useEffect(() => {
    setPair(myPair);
  }, [myPair]);

  useEffect(() => {
    if (pair?.childWishlist) {
      setTaskStatus({ total: 0, completed: 0 });
      setTaskStatusMessage(null);
      setTaskStatusError(null);
    }
  }, [pair?.childWishlist]);

  useEffect(() => {
    if (!eventId || !pair || pair.childWishlist) {
      return;
    }

    let isMounted = true;

    async function loadTaskStatus() {
      try {
        setTasksLoading(true);
        setTaskStatusError(null);
        setTaskStatusMessage(null);

        const tasks = await getMyTasksAsSanta(eventId);
        if (!isMounted) {
          return;
        }

        const completed = tasks.filter((task) => task.completed).length;
        setTaskStatus({ total: tasks.length, completed });

        if (tasks.length === 0) {
          setTaskStatusMessage("Твой внучок еще не выбрал задания.");
        } else if (completed < tasks.length) {
          setTaskStatusMessage("Выполни все задания и загрузи фото, чтобы открыть wishlist.");
        } else {
          setTaskStatusMessage("Все задания выполнены! Можно получить wishlist внучка.");
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }
        const message =
          error instanceof Error ? error.message : "Не удалось загрузить статус заданий";
        setTaskStatusError(message);
        setTaskStatus({ total: 0, completed: 0 });
      } finally {
        if (isMounted) {
          setTasksLoading(false);
        }
      }
    }

    loadTaskStatus();

    return () => {
      isMounted = false;
    };
  }, [eventId, tasksRefreshKey, pair]);

  if (!pair) {
    return null;
  }

  const canRevealWishlist =
    !!eventId &&
    taskStatus.total > 0 &&
    taskStatus.completed === taskStatus.total &&
    !pair.childWishlist;

  const handleRevealWishlist = async () => {
    if (!eventId || !canRevealWishlist || isRevealing) {
      return;
    }
    setRevealError(null);
    setRevealSuccess(null);

    try {
      setIsRevealing(true);
      const revealedPair = await revealChildWishlist(eventId);
      setPair(revealedPair);
      onWishlistRevealed?.(revealedPair);
      setRevealSuccess("Вишлист внучка открыт!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось получить wishlist внучка";
      setRevealError(message);
    } finally {
      setIsRevealing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Мой внучок
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted p-4">
            <p className="text-lg font-semibold">Твой внучок: {pair.childName}</p>
          </div>

          {!pair.childWishlist && (
            <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Прогресс по заданиям</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  {taskStatus.completed} / {taskStatus.total}
                </div>
              </div>

              {tasksLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Проверяем прогресс...
                </div>
              ) : taskStatusError ? (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {taskStatusError}
                </div>
              ) : (
                <>
                  {taskStatusMessage && (
                    <p className="text-sm text-muted-foreground">{taskStatusMessage}</p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!canRevealWishlist || isRevealing}
                    onClick={handleRevealWishlist}
                    className="w-full sm:w-auto"
                  >
                    {isRevealing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Получаем...
                      </>
                    ) : (
                      "Получить wishlist"
                    )}
                  </Button>
                </>
              )}

              {revealError && (
                <p className="text-sm text-destructive">{revealError}</p>
              )}
              {revealSuccess && (
                <p className="text-sm text-emerald-600">{revealSuccess}</p>
              )}
            </div>
          )}

          {pair.childWishlist && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Вишлист внучка:</p>
              <div className="rounded-lg border bg-muted p-4">
                <p className="whitespace-pre-wrap">{pair.childWishlist}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

