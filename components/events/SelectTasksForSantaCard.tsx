"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Gift } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getSantaCollectionById,
  getSelectedTasksForSanta,
  selectTasksForSanta,
} from "@/lib/api";
import type { PairDto, Participant, SantaTask, User } from "@/lib/types";

interface SelectTasksForSantaCardProps {
  eventId: string;
  currentUser: User | null;
  onTasksSelected?: () => void;
  className?: string;
}

export function SelectTasksForSantaCard({
  eventId,
  currentUser,
  onTasksSelected,
  className,
}: SelectTasksForSantaCardProps) {
  const [tasks, setTasks] = useState<SantaTask[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasksAlreadySelected, setTasksAlreadySelected] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);

  // For regular users who are children, pairs array will be empty (they don't get pair info)
  // So we check if pairs.length === 0 and user is not admin to determine if they are a child
  // But we need to check if pairs are generated - we'll do this through the API call

  useEffect(() => {
    checkSelectedTasks();
  }, [eventId]);

  const checkSelectedTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Проверяем, выбраны ли уже задания
      try {
        const santaParticipant = await getSelectedTasksForSanta(eventId);
        if (
          santaParticipant.selectedTasks &&
          santaParticipant.selectedTasks.length > 0
        ) {
          // Задания уже выбраны, не показываем компонент
          setTasksAlreadySelected(true);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        // Если ошибка (например, пары не распределены), проверяем причину
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes("Пары еще не распределены") || 
            errorMessage.includes("pairs not generated") ||
            errorMessage.includes("pairs not distributed")) {
          // Пары не распределены, скрываем компонент
          setShouldHide(true);
          setIsLoading(false);
          return;
        }
        // Другие ошибки - продолжаем загрузку заданий
        console.log("Задания еще не выбраны или ошибка при проверке:", err);
      }

      // Если задания не выбраны, загружаем список заданий для выбора
      await loadTasks();
    } catch (err) {
      console.error("Ошибка при проверке заданий:", err);
      // Если пары не распределены или другая критическая ошибка, скрываем компонент
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes("Пары еще не распределены") || 
          errorMessage.includes("pairs not generated")) {
        setShouldHide(true);
      }
      setIsLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Получаем информацию о Санте через API (это безопасно, так как не раскрывает имя Санты)
      // getSelectedTasksForSanta возвращает Participant с информацией о Санте, но без имени пользователя
      let santaParticipant: Participant | null = null;
      try {
        santaParticipant = await getSelectedTasksForSanta(eventId);
        // Если задания уже выбраны, santaParticipant будет содержать информацию о Санте
      } catch (err) {
        // Если ошибка (например, пары не распределены), скрываем компонент
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes("Пары еще не распределены") || 
            errorMessage.includes("pairs not generated") ||
            errorMessage.includes("pairs not distributed")) {
          setShouldHide(true);
          setTasks([]);
          setIsLoading(false);
          return;
        }
        // Другие ошибки - попробуем получить информацию другим способом
        console.log("Не удалось получить информацию о Санте через getSelectedTasksForSanta:", err);
      }

      // Если не удалось получить через getSelectedTasksForSanta,
      // значит пары не распределены или пользователь не является ребенком
      if (!santaParticipant) {
        // Если пары не распределены, скрываем компонент
        setShouldHide(true);
        setTasks([]);
        setIsLoading(false);
        return;
      }

      // Проверяем, есть ли у Санты закрепленная коллекция
      if (!santaParticipant.santaCollectionId) {
        // Если коллекция не назначена, скрываем компонент
        setShouldHide(true);
        setTasks([]);
        setIsLoading(false);
        return;
      }

      // Загружаем коллекцию Санты
      const collection = await getSantaCollectionById(santaParticipant.santaCollectionId);
      
      // Устанавливаем задания из коллекции
      setTasks(collection.tasks || []);
    } catch (err) {
      console.error("Ошибка при загрузке заданий:", err);
      const message =
        err instanceof Error ? err.message : "Не удалось загрузить задания";
      setError(message);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskToggle = (taskId: string) => {
    setSelectedTaskIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        // Снимаем выбор
        newSet.delete(taskId);
        setError(null);
      } else {
        // Проверяем, что не превышен лимит в 3 задания
        if (newSet.size >= 3) {
          setError("Можно выбрать не более 3 заданий");
          return prev;
        }
        newSet.add(taskId);
        setError(null);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (selectedTaskIds.size !== 3) {
      setError("Необходимо выбрать ровно 3 задания");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await selectTasksForSanta(eventId, Array.from(selectedTaskIds));
      toast.success("Задания успешно выбраны для твоего Санты!");
      
      // После успешного выбора скрываем компонент
      setTasksAlreadySelected(true);
      
      if (onTasksSelected) {
        onTasksSelected();
      }
    } catch (err) {
      console.error("Ошибка при выборе заданий:", err);
      const message =
        err instanceof Error ? err.message : "Не удалось выбрать задания. Попробуйте позже.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Если задания уже выбраны, пары не распределены или коллекция не назначена, не показываем компонент
  if (tasksAlreadySelected || shouldHide) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Выбери праздничные задания для своего Санты 🎅
        </CardTitle>
        <CardDescription>
          Выбери 3 задания, которые твой Санта выполнит, чтобы порадовать тебя 🎄
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Загрузка праздничных заданий... ✨</p>
        ) : error && !isSaving ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Пока нет доступных заданий. Обратитесь к администратору — он подготовит что-то волшебное. ✉️
          </p>
        ) : (
          <>
            <div className="space-y-2">
              {tasks.map((task) => {
                const isSelected = selectedTaskIds.has(task.id);
                return (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5 cursor-pointer"
                        : selectedTaskIds.size >= 3
                        ? "border-border bg-muted/30 cursor-not-allowed opacity-60"
                        : "border-border hover:bg-muted/50 cursor-pointer"
                    }`}
                    onClick={() => {
                      if (!isSelected && selectedTaskIds.size >= 3) {
                        return; // Не позволяем выбрать, если уже выбрано 3
                      }
                      handleTaskToggle(task.id);
                    }}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isSelected ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      {task.description && (
                        <p className="mt-1 text-xs text-muted-foreground">{task.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
              <p className="text-sm text-muted-foreground">
                🎯 Выбрано: {selectedTaskIds.size} из 3
                {selectedTaskIds.size < 3 && (
                  <span className="ml-2 text-destructive">
                    (нужно выбрать еще {3 - selectedTaskIds.size})
                  </span>
                )}
              </p>
              <Button
                onClick={handleSubmit}
                disabled={isSaving || selectedTaskIds.size !== 3}
                size="sm"
              >
                {isSaving ? "Сохраняем..." : "Сохранить выбор 🎁"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

