"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PairDto, Event, User } from "@/lib/types";
import { generatePairs } from "@/lib/api";

interface AdminPanelProps {
  event: Event;
  currentUser: User | null;
  pairs: PairDto[];
  onPairsGenerated: (pairs: PairDto[]) => void;
  onError: (error: string) => void;
}

export function AdminPanel({
  event,
  currentUser,
  pairs,
  onPairsGenerated,
  onError,
}: AdminPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePairs = async () => {
    if (!event || !currentUser?.isAdmin) return;

    try {
      setIsGenerating(true);
      const generatedPairs = await generatePairs(event.id);
      onPairsGenerated(generatedPairs);
    } catch (err) {
      onError("Не удалось сгенерировать пары");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentUser?.isAdmin) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Админ-панель</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleGeneratePairs}
          disabled={isGenerating}
          className="w-full"
          variant="outline"
        >
          {isGenerating ? "Генерация..." : "Сгенерировать пары"}
        </Button>
        {pairs.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Все пары:</p>
            <div className="space-y-2">
              {pairs.map((pair, idx) => (
                <div key={idx} className="rounded-lg border bg-muted p-3 text-sm">
                  <p>
                    <strong>{pair.santaName}</strong> → <strong>{pair.childName}</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

