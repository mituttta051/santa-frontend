"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ListTodo } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getParticipants, getSelectedTasksForSanta } from "@/lib/api";
import type { PairDto, Participant, SantaTask, User } from "@/lib/types";

interface SantaSelectedTasksCardProps {
  eventId: string;
  pairs: PairDto[];
  currentUser: User | null;
}

export function SantaSelectedTasksCard({
  eventId,
  pairs,
  currentUser,
}: SantaSelectedTasksCardProps) {
  const [selectedTasks, setSelectedTasks] = useState<SantaTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Находим пару, где текущий пользователь является Сантой
  const myPairAsSanta = pairs.find((p) => p.santaName === currentUser?.name);

  // Показываем компонент только если пользователь является Сантой и пары распределены
  if (!myPairAsSanta || pairs.length === 0) {
    return null;
  }

  useEffect(() => {
    loadSelectedTasks();
  }, [eventId, myPairAsSanta.santaId]);

  const loadSelectedTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Получаем всех участников
      const participants = await getParticipants();

      // Находим участника-Санту (это текущий пользователь)
      const santaParticipant = participants.find(
        (p: Participant) => p.id === myPairAsSanta.santaId
      );

      if (!santaParticipant) {
        setError("Не удалось найти участника-Санту");
        setIsLoading(false);
        return;
      }

      // Проверяем, есть ли выбранные задачи
      if (santaParticipant.selectedTasks && santaParticipant.selectedTasks.length > 0) {
        setSelectedTasks(santaParticipant.selectedTasks);
      } else {
        // Если в участнике нет задач, пробуем получить через API
        // (на случай, если данные не обновились)
        try {
          // Но getSelectedTasksForSanta работает для ребенка, не для Санты
          // Поэтому просто проверяем участника
          setSelectedTasks([]);
        } catch (err) {
          console.error("Ошибка при загрузке задач:", err);
          setSelectedTasks([]);
        }
      }
    } catch (err) {
      console.error("Ошибка при загрузке выбранных задач:", err);
      const message =
        err instanceof Error ? err.message : "Не удалось загрузить выбранные задачи";
      setError(message);
      setSelectedTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Если задачи не выбраны, не показываем компонент
  if (!isLoading && selectedTasks.length === 0 && !error) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListTodo className="h-5 w-5" />
          Задания для выполнения
        </CardTitle>
        <CardDescription>
          Твой внучок выбрал эти задания для тебя. Выполни их, чтобы сделать праздник особенным!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Загрузка заданий...</p>
        ) : error ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : selectedTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Задания еще не выбраны. Твой внучок скоро выберет задания для тебя.
          </p>
        ) : (
          <div className="space-y-3">
            {selectedTasks.map((task, index) => (
              <div
                key={task.id}
                className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4"
              >
                <div className="mt-0.5 flex-shrink-0">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{task.title}</p>
                  {task.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{task.description}</p>
                  )}
                </div>
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

