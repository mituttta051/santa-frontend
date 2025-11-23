"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PairDto, AdminPairDto, Event, User } from "@/lib/types";
import { generatePairs, regeneratePairs, getEventPairs } from "@/lib/api";

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
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [hasPairs, setHasPairs] = useState<boolean | null>(null);
  const [isCheckingPairs, setIsCheckingPairs] = useState(true);
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
    // Prevent double clicks and concurrent requests
    if (isProcessingRef.current || isGenerating || isRegenerating || !event || !currentUser?.isAdmin) {
      return;
    }

    try {
      isProcessingRef.current = true;
      setIsGenerating(true);
      await generatePairs(event.id);
      setHasPairs(true);
      onPairsGenerated();
    } catch (err) {
      onError("Не удалось сгенерировать пары");
      console.error(err);
    } finally {
      setIsGenerating(false);
      isProcessingRef.current = false;
    }
  };

  const handleRegeneratePairs = async () => {
    // Prevent double clicks and concurrent requests
    if (isProcessingRef.current || isGenerating || isRegenerating || !event || !currentUser?.isAdmin) {
      return;
    }

    try {
      isProcessingRef.current = true;
      setIsRegenerating(true);
      await regeneratePairs(event.id);
      setHasPairs(true);
      onPairsGenerated();
    } catch (err) {
      onError("Не удалось перегенерировать пары");
      console.error(err);
    } finally {
      setIsRegenerating(false);
      isProcessingRef.current = false;
    }
  };

  if (!currentUser?.isAdmin) {
    return null;
  }

  const isLoading = isCheckingPairs;
  const isProcessing = isGenerating || isRegenerating;

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
        ) : hasPairs ? (
          <Button
            onClick={handleRegeneratePairs}
            disabled={isProcessing}
            className="w-full"
            variant="outline"
          >
            {isRegenerating ? "Перегенерация..." : "Перегенерировать пары"}
          </Button>
        ) : (
          <Button
            onClick={handleGeneratePairs}
            disabled={isProcessing}
            className="w-full"
            variant="outline"
          >
            {isGenerating ? "Генерация..." : "Сгенерировать пары"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

