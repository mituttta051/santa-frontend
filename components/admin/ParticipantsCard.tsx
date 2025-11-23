"use client";

import { Users, RefreshCcw, X, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  assignCollectionToParticipant,
  unassignCollectionFromParticipant,
  getUsers,
  createParticipant,
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [addingParticipant, setAddingParticipant] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

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

  const handleAddParticipant = async () => {
    if (!selectedEventId || !selectedUserId) {
      setAddError("Пожалуйста, выберите событие и пользователя");
      return;
    }

    // Проверяем, не является ли пользователь уже участником этого события
    const existingParticipant = participants.find(
      (p) => p.eventId === selectedEventId && p.userId === selectedUserId
    );
    if (existingParticipant) {
      setAddError("Этот пользователь уже является участником данного события");
      return;
    }

    try {
      setAddingParticipant(true);
      setAddError(null);
      const newParticipant = await createParticipant({
        eventId: selectedEventId,
        userId: selectedUserId,
      });
      onParticipantUpdated(newParticipant);
      // Сбрасываем форму
      setSelectedEventId("");
      setSelectedUserId("");
      setShowAddForm(false);
      // Обновляем список участников
      onRefresh();
    } catch (err) {
      console.error("Ошибка при добавлении участника:", err);
      setAddError(err instanceof Error ? err.message : "Не удалось добавить участника");
    } finally {
      setAddingParticipant(false);
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
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            disabled={loading || usersLoading}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Добавить участника
          </Button>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCcw className="h-4 w-4" />
            Обновить
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <h3 className="text-sm font-semibold">Добавить участника на событие</h3>
            {addError && (
              <div className="rounded-md border border-destructive/20 bg-destructive/5 p-2 text-sm text-destructive">
                {addError}
              </div>
            )}
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">Событие</label>
                <select
                  className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                  value={selectedEventId}
                  onChange={(e) => {
                    setSelectedEventId(e.target.value);
                    setAddError(null);
                  }}
                  disabled={addingParticipant || events.length === 0}
                >
                  <option value="">Выберите событие...</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">Пользователь</label>
                <select
                  className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                  value={selectedUserId}
                  onChange={(e) => {
                    setSelectedUserId(e.target.value);
                    setAddError(null);
                  }}
                  disabled={addingParticipant || usersLoading || users.length === 0}
                >
                  <option value="">Выберите пользователя...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} {user.phoneNumber ? `(${user.phoneNumber})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddParticipant}
                  disabled={addingParticipant || !selectedEventId || !selectedUserId}
                >
                  {addingParticipant ? "Добавление..." : "Добавить"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedEventId("");
                    setSelectedUserId("");
                    setAddError(null);
                  }}
                  disabled={addingParticipant}
                >
                  Отмена
                </Button>
              </div>
            </div>
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

