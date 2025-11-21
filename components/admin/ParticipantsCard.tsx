"use client";

import { Users, RefreshCcw, X } from "lucide-react";
import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  assignCollectionToParticipant,
  unassignCollectionFromParticipant,
  getUsers,
} from "@/lib/api";
import type { Event, Participant, SantaCollection, User } from "@/lib/types";

interface ParticipantsCardProps {
  participants: Participant[];
  events: Event[];
  collections: SantaCollection[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onParticipantUpdated: (participant: Participant) => void;
}

export function ParticipantsCard({
  participants,
  events,
  collections,
  loading,
  error,
  onRefresh,
  onParticipantUpdated,
}: ParticipantsCardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [assigningCollection, setAssigningCollection] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (err) {
      console.error("Ошибка при загрузке пользователей:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Загружаем пользователей при монтировании
  useEffect(() => {
    loadUsers();
  }, []);

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || `Пользователь ${userId.slice(0, 8)}...`;
  };

  const getEventName = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    return event?.name || `Событие ${eventId.slice(0, 8)}...`;
  };

  const getCollectionName = (collectionId: string) => {
    const collection = collections.find((c) => c.id === collectionId);
    return collection?.name || `Коллекция ${collectionId.slice(0, 8)}...`;
  };

  const handleAssignCollection = async (participantId: string, collectionId: string) => {
    try {
      setAssigningCollection(participantId);
      const updated = await assignCollectionToParticipant(participantId, collectionId);
      onParticipantUpdated(updated);
    } catch (err) {
      console.error("Ошибка при назначении коллекции:", err);
      alert(err instanceof Error ? err.message : "Не удалось назначить коллекцию");
    } finally {
      setAssigningCollection(null);
    }
  };

  const handleUnassignCollection = async (participantId: string) => {
    try {
      setAssigningCollection(participantId);
      const updated = await unassignCollectionFromParticipant(participantId);
      onParticipantUpdated(updated);
    } catch (err) {
      console.error("Ошибка при снятии коллекции:", err);
      alert(err instanceof Error ? err.message : "Не удалось снять коллекцию");
    } finally {
      setAssigningCollection(null);
    }
  };

  // Группируем участников по событиям
  const participantsByEvent = participants.reduce((acc, participant) => {
    const eventId = participant.eventId;
    if (!acc[eventId]) {
      acc[eventId] = [];
    }
    acc[eventId].push(participant);
    return acc;
  }, {} as Record<string, Participant[]>);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Участники событий
          </CardTitle>
          <CardDescription>
            Управление участниками и назначение коллекций заданий
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCcw className="h-4 w-4" />
          Обновить
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        ) : participants.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Пока нет участников. Участники появятся после регистрации на события.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(participantsByEvent).map(([eventId, eventParticipants]) => (
              <div key={eventId} className="space-y-3 rounded-lg border p-4">
                <h3 className="text-sm font-semibold">{getEventName(eventId)}</h3>
                <div className="space-y-3">
                  {eventParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{getUserName(participant.userId)}</p>
                        {participant.santaCollectionId && (
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {getCollectionName(participant.santaCollectionId)}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {participant.santaCollectionId ? (
                          <>
                            <select
                              className="h-8 rounded-md border bg-background px-2 text-xs"
                              value={participant.santaCollectionId}
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssignCollection(participant.id, e.target.value);
                                }
                              }}
                              disabled={assigningCollection === participant.id}
                            >
                              <option value={participant.santaCollectionId}>
                                {getCollectionName(participant.santaCollectionId)}
                              </option>
                              {collections
                                .filter((c) => c.id !== participant.santaCollectionId)
                                .map((collection) => (
                                  <option key={collection.id} value={collection.id}>
                                    {collection.name}
                                  </option>
                                ))}
                              <option value="">-- Сменить коллекцию --</option>
                            </select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnassignCollection(participant.id)}
                              disabled={assigningCollection === participant.id}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <select
                            className="h-8 rounded-md border bg-background px-2 text-xs"
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssignCollection(participant.id, e.target.value);
                              }
                            }}
                            disabled={assigningCollection === participant.id || collections.length === 0}
                          >
                            <option value="">Выберите коллекцию...</option>
                            {collections.map((collection) => (
                              <option key={collection.id} value={collection.id}>
                                {collection.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

