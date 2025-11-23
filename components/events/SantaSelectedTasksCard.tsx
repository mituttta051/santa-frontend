"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2, ListTodo, Upload, X, Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getParticipants } from "@/lib/api";
import { getMyTasksAsSanta, completeTaskWithPhoto } from "@/lib/task-completion";
import { getFileDownloadUrl } from "@/lib/files";
import type { PairDto, Participant, User } from "@/lib/types";
import type { SantaTaskWithCompletion } from "@/lib/types";

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
  const [tasks, setTasks] = useState<SantaTaskWithCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Находим пару, где текущий пользователь является Сантой
  const myPairAsSanta = pairs.find((p) => p.santaName === currentUser?.name);

  // Показываем компонент только если пользователь является Сантой и пары распределены
  if (!myPairAsSanta || pairs.length === 0) {
    return null;
  }

  useEffect(() => {
    loadTasks();
  }, [eventId, myPairAsSanta.santaId]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const tasksData = await getMyTasksAsSanta(eventId);
      setTasks(tasksData);
    } catch (err) {
      console.error("Ошибка при загрузке заданий:", err);
      const message =
        err instanceof Error ? err.message : "Не удалось загрузить задания";
      
      // Проверяем, не является ли это случаем, когда задания еще не выбраны
      if (message.includes("не выбраны задания")) {
        // Не показываем это как ошибку, просто устанавливаем пустой массив
        setTasks([]);
        setError(null);
      } else {
        setError(message);
        setTasks([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (taskId: string, file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Пожалуйста, выберите изображение");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Размер файла не должен превышать 10 МБ");
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreviewUrls((prev) => ({ ...prev, [taskId]: previewUrl }));

    // Upload and complete task
    handleCompleteTask(taskId, file);
  };

  const handleCompleteTask = async (taskId: string, photoFile: File) => {
    try {
      setUploadingTaskId(taskId);
      setError(null);

      const completedTask = await completeTaskWithPhoto(eventId, taskId, photoFile);

      // Update tasks list
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? completedTask : task
        )
      );

      // Clean up preview URL
      if (previewUrls[taskId]) {
        URL.revokeObjectURL(previewUrls[taskId]);
        setPreviewUrls((prev) => {
          const newUrls = { ...prev };
          delete newUrls[taskId];
          return newUrls;
        });
      }
    } catch (err) {
      console.error("Ошибка при выполнении задания:", err);
      const message =
        err instanceof Error ? err.message : "Не удалось отметить задание как выполненное";
      setError(message);
    } finally {
      setUploadingTaskId(null);
    }
  };

  const handleRemovePreview = (taskId: string) => {
    if (previewUrls[taskId]) {
      URL.revokeObjectURL(previewUrls[taskId]);
      setPreviewUrls((prev) => {
        const newUrls = { ...prev };
        delete newUrls[taskId];
        return newUrls;
      });
    }
    // Reset file input
    if (fileInputRefs.current[taskId]) {
      fileInputRefs.current[taskId]!.value = "";
    }
  };

  // Если задачи не выбраны, не показываем компонент
  if (!isLoading && tasks.length === 0 && !error) {
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
        ) : tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Задания еще не выбраны. Твой внучок скоро выберет задания для тебя.
          </p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, index) => {
              const isUploading = uploadingTaskId === task.id;
              const hasPreview = previewUrls[task.id] !== undefined;
              const showProofPhoto = task.completed && task.proofPhotoObjectName;

              return (
                <div
                  key={task.id}
                  className={`rounded-lg border p-4 ${
                    task.completed
                      ? "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                      : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{task.title}</p>
                          {task.description && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {task.description}
                            </p>
                          )}
                        </div>
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                        ) : (
                          <div className="h-5 w-5 flex-shrink-0" />
                        )}
                      </div>

                      {/* Proof Photo Display */}
                      {showProofPhoto && task.proofPhotoObjectName && (
                        <div className="mt-3 relative">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Фото-доказательство:
                          </p>
                          <div className="relative inline-block">
                            {imageErrors[task.id] ? (
                              <div className="h-32 w-32 flex items-center justify-center rounded-lg border bg-muted text-xs text-muted-foreground text-center p-2">
                                Изображение не поддерживается браузером (возможно, формат HEIC)
                              </div>
                            ) : (
                              <img
                                src={getFileDownloadUrl(task.proofPhotoObjectName)}
                                alt="Proof photo"
                                className="h-32 w-32 object-cover rounded-lg border"
                                onError={() => {
                                  setImageErrors((prev) => ({ ...prev, [task.id]: true }));
                                }}
                              />
                            )}
                          </div>
                          {task.completedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Выполнено:{" "}
                              {new Date(task.completedAt).toLocaleDateString("ru-RU", {
                                day: "numeric",
                                month: "long",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Photo Preview (before upload) */}
                      {hasPreview && !task.completed && (
                        <div className="mt-3 relative">
                          <div className="relative inline-block">
                            <img
                              src={previewUrls[task.id]}
                              alt="Preview"
                              className="h-32 w-32 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePreview(task.id)}
                              className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1 shadow-sm hover:bg-destructive/90"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Upload Button (if not completed) */}
                      {!task.completed && (
                        <div className="mt-3">
                          <input
                            ref={(el) => {
                              fileInputRefs.current[task.id] = el;
                            }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              handleFileSelect(task.id, file);
                            }}
                            disabled={isUploading}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              fileInputRefs.current[task.id]?.click();
                            }}
                            disabled={isUploading}
                            className="w-full sm:w-auto"
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Загрузка...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4" />
                                Загрузить фото-доказательство
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

