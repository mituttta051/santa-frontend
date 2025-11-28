"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyTasksAsSanta } from "@/lib/task-completion";
import { revealChildWishlist } from "@/lib/events";
import type { PairDto } from "@/lib/types";
import { GrandchildSpotlight } from "./GrandchildSpotlight";
import { GrandchildWishlistModal } from "./GrandchildWishlistModal";

interface PairsCardProps {
  eventId: string;
  myPair: PairDto | null;
  tasksRefreshKey?: number;
  onWishlistRevealed?: (pair: PairDto) => void;
  className?: string;
}

export function PairsCard({
  eventId,
  myPair,
  tasksRefreshKey = 0,
  onWishlistRevealed,
  className,
}: PairsCardProps) {
  const [pair, setPair] = useState<PairDto | null>(myPair);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [taskStatus, setTaskStatus] = useState({ total: 0, completed: 0 });
  const [taskStatusMessage, setTaskStatusMessage] = useState<string | null>(null);
  const [taskStatusError, setTaskStatusError] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [revealSuccess, setRevealSuccess] = useState<string | null>(null);
  const [isWishlistModalOpen, setWishlistModalOpen] = useState(false);
  const [modalWishlist, setModalWishlist] = useState<string | null>(pair?.childWishlist ?? null);

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
    if (pair?.childWishlist) {
      setModalWishlist(pair.childWishlist);
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

  const hasWishlist = Boolean(pair.childWishlist);
  const canRevealNow =
    !!eventId && taskStatus.total > 0 && taskStatus.completed === taskStatus.total;

  const openWishlistModal = (wishlistText?: string | null) => {
    setModalWishlist(wishlistText ?? pair.childWishlist ?? null);
    setWishlistModalOpen(true);
  };

  const handleShowWishlist = async () => {
    if (!eventId || isRevealing) {
      return;
    }
    setRevealError(null);
    setRevealSuccess(null);

    if (!pair.childWishlist) {
      if (!canRevealNow) {
        return;
      }
      try {
        setIsRevealing(true);
        const revealedPair = await revealChildWishlist(eventId);
        setPair(revealedPair);
        onWishlistRevealed?.(revealedPair);
        openWishlistModal(revealedPair.childWishlist);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Не удалось получить wishlist внучка";
        setRevealError(message);
      } finally {
        setIsRevealing(false);
      }
      return;
    }
    openWishlistModal(pair.childWishlist);
  };

  return (
    <Card className={`overflow-hidden pt-0 ${className ?? ""}`}>
      <CardHeader className="flex flex-col items-center pb-0 px-0 text-center">
        <GrandchildSpotlight name={pair.childName} />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">

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
                  Проверяем прогресс... 🎄
                </div>
              ) : taskStatusError ? (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {taskStatusError}
                </div>
              ) : (
                <>
                  {taskStatusMessage && (
                    <p className="text-sm text-muted-foreground">
                      {taskStatusMessage === "Твой внучок еще не выбрал задания."
                        ? "Твой внучок еще не выбрал задания. Потерпи немного — сюрприз скоро готов! ✨"
                        : taskStatusMessage === "Выполни все задания и загрузи фото, чтобы открыть wishlist."
                          ? "Выполни все задания и загрузи фото, чтобы открыть wishlist и узнать мечты внучка 🎁"
                          : "Все задания выполнены! Можно открыть wishlist внучка и исполнять желания ✨"}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    disabled={(!hasWishlist && !canRevealNow) || isRevealing}
                    onClick={handleShowWishlist}
                    className="w-full sm:w-auto"
                  >
                    {isRevealing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Получаем...
                      </>
                    ) : (
                      "Получить wishlist 🎄"
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
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-emerald-900">
              <p className="font-semibold">Вишлист внучка открыт!</p>
              <p className="mt-1 text-emerald-800/80">
                Нажми, чтобы вновь окунуться в его мечты.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="mt-3"
                onClick={handleShowWishlist}
              >
                Открыть wishlist 🌟
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      <GrandchildWishlistModal
        open={isWishlistModalOpen}
        onOpenChange={setWishlistModalOpen}
        wishlist={modalWishlist ?? pair.childWishlist ?? ""}
        childName={pair.childName}
      />
    </Card>
  );
}

