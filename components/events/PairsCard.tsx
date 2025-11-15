"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import type { PairDto, User } from "@/lib/types";

interface PairsCardProps {
  pairs: PairDto[];
  currentUser: User | null;
}

export function PairsCard({ pairs, currentUser }: PairsCardProps) {
  if (pairs.length === 0) {
    return null;
  }

  const myPair = pairs.find((p) => p.santaName === currentUser?.name);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Мой внучок
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!myPair ? (
          <p className="text-muted-foreground">Информация о паре не найдена</p>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted p-4">
              <p className="text-lg font-semibold">Твой внучок: {myPair.childName}</p>
            </div>
            {myPair.childWishlist && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Вишлист внучка:</p>
                <div className="rounded-lg border bg-muted p-4">
                  <p className="whitespace-pre-wrap">{myPair.childWishlist}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

