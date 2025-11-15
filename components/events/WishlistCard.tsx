"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Sparkles } from "lucide-react";
import type { Participant, Event } from "@/lib/types";
import { updateWishlist, getParticipants } from "@/lib/api";

interface WishlistCardProps {
  participant: Participant | null;
  event: Event;
  onUpdate: (participant: Participant) => void;
  onError: (error: string) => void;
}

export function WishlistCard({ participant, event, onUpdate, onError }: WishlistCardProps) {
  const [wishlist, setWishlist] = useState(participant?.wishlist || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Не указано";
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleSave = async () => {
    if (!participant) return;

    try {
      setIsSaving(true);
      await updateWishlist(participant.id, wishlist);
      // Обновляем участника
      const participants = await getParticipants();
      const updated = participants.find((p) => p.id === participant.id);
      if (updated) {
        setWishlist(updated.wishlist || "");
        onUpdate(updated);
      }
      setIsEditing(false);
    } catch (err) {
      onError("Не удалось сохранить вишлист");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setWishlist(participant?.wishlist || "");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Мой вишлист
        </CardTitle>
        <CardDescription>
          Твой Санта увидит это после {formatDate(event.wishlistReleaseAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <Textarea
              placeholder="Напиши, что ты хочешь получить в подарок..."
              value={wishlist}
              onChange={(e) => setWishlist(e.target.value)}
              className="min-h-32 text-base"
              disabled={isSaving}
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
                {isSaving ? "Сохранение..." : "Сохранить"}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                Отмена
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="min-h-32 rounded-lg border bg-muted p-4">
              {participant?.wishlist ? (
                <p className="whitespace-pre-wrap text-base">{participant.wishlist}</p>
              ) : (
                <p className="text-muted-foreground">Вишлист пока не заполнен</p>
              )}
            </div>
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full"
              variant="outline"
            >
              <Edit2 className="mr-2 h-4 w-4" />
              {participant?.wishlist ? "Изменить вишлист" : "Заполнить вишлист"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

