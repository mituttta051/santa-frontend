"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AdminPairDto, Event, User } from "@/lib/types";
import { generatePairs, confirmPairs, getEventPairs } from "@/lib/api";

interface AdminPanelProps {
  event: Event;
  currentUser: User | null;
  onPairsGenerated: () => void;
  onError: (error: string) => void;
}

export function AdminPanel({
  event,
  currentUser,
  onPairsGenerated,
  onError,
}: AdminPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [hasPairs, setHasPairs] = useState<boolean | null>(null);
  const [isCheckingPairs, setIsCheckingPairs] = useState(true);
  const [previewPairs, setPreviewPairs] = useState<AdminPairDto[] | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const isProcessingRef = useRef(false);

  // Check if pairs already exist
  useEffect(() => {
    if (!event || !currentUser?.isAdmin) {
      return;
    }

    async function checkPairs() {
      try {
        setIsCheckingPairs(true);
        const pairs = await getEventPairs(event.id);
        setHasPairs(pairs.length > 0);
      } catch (err) {
        // If error, assume pairs don't exist
        setHasPairs(false);
        console.error("Ошибка при проверке пар:", err);
      } finally {
        setIsCheckingPairs(false);
      }
    }

    checkPairs();
  }, [event, currentUser]);

  const handleGeneratePairs = async () => {
    if (isProcessingRef.current || isGenerating || isConfirming || !event || !currentUser?.isAdmin) {
      return;
    }

    try {
      isProcessingRef.current = true;
      setIsGenerating(true);
      setPanelError(null);
      const generatedPairs = await generatePairs(event.id);
      setPreviewPairs(generatedPairs);
    } catch (err) {
      const message = "Не удалось сгенерировать пары";
      setPanelError(message);
      onError(message);
      console.error(err);
    } finally {
      setIsGenerating(false);
      isProcessingRef.current = false;
    }
  };

  const handleConfirmPairs = async () => {
    if (
      isProcessingRef.current ||
      isGenerating ||
      isConfirming ||
      !event ||
      !currentUser?.isAdmin ||
      !previewPairs ||
      previewPairs.length === 0
    ) {
      return;
    }

    try {
      isProcessingRef.current = true;
      setIsConfirming(true);
      setPanelError(null);

      await confirmPairs(
        event.id,
        previewPairs.map((pair) => ({
          santaId: pair.santaId,
          childId: pair.childId,
        })),
      );

      setPreviewPairs(null);
      setHasPairs(true);
      onPairsGenerated();
    } catch (err) {
      const message = "Не удалось подтвердить пары";
      setPanelError(message);
      onError(message);
      console.error(err);
    } finally {
      setIsConfirming(false);
      isProcessingRef.current = false;
    }
  };

  const handleCancelPreview = () => {
    if (isConfirming) {
      return;
    }
    setPanelError(null);
    setPreviewPairs(null);
  };

  if (!currentUser?.isAdmin) {
    return null;
  }

  const isLoading = isCheckingPairs;
  const isProcessing = isGenerating || isConfirming;
  const hasPreview = !!previewPairs && previewPairs.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Админ-панель</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Button disabled className="w-full" variant="outline">
            Проверка...
          </Button>
        ) : (
          <>
            {!hasPreview ? (
              <Button
                onClick={handleGeneratePairs}
                disabled={isProcessing}
                className="w-full"
                variant="outline"
              >
                {isGenerating
                  ? "Генерация..."
                  : hasPairs
                    ? "Сгенерировать новые пары"
                    : "Сгенерировать пары"}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  {hasPairs
                    ? "После подтверждения текущие пары будут перезаписаны, а участники получат новые уведомления."
                    : "Проверь пары перед подтверждением. После подтверждения участники получат уведомления."}
                </div>
                <div className="max-h-72 space-y-3 overflow-y-auto pr-2">
                  {previewPairs?.map((pair) => (
                    <div
                      key={`${pair.santaId}-${pair.childId}`}
                      className="rounded-lg border bg-muted/30 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">Санта</p>
                          <p className="font-semibold">{pair.santaName}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-muted-foreground">Внучок</p>
                          <p className="font-semibold">{pair.childName}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={handleConfirmPairs} disabled={isConfirming} className="flex-1">
                    {isConfirming ? "Подтверждаем..." : "Подтвердить генерацию"}
                  </Button>
                  <Button
                    onClick={handleCancelPreview}
                    variant="outline"
                    disabled={isConfirming}
                    className="flex-1"
                  >
                    Отменить
                  </Button>
                </div>
              </div>
            )}
            {panelError && (
              <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                {panelError}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

