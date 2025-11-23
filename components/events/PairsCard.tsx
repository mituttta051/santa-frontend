"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import type { PairDto, User } from "@/lib/types";

interface PairsCardProps {
  myPair: PairDto | null;
  currentUser: User | null;
}

export function PairsCard({ myPair, currentUser }: PairsCardProps) {
  if (!myPair) {
    return null;
  }

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
      </CardContent>
    </Card>
  );
}

