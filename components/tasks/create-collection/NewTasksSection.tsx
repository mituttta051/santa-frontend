import { PlusCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CreateTaskRequest } from "@/lib/types";

interface NewTasksSectionProps {
  draftTask: CreateTaskRequest;
  onDraftTaskChange: (task: CreateTaskRequest) => void;
  onAddDraftTask: () => void;
  newTasks: CreateTaskRequest[];
  onRemoveDraftTask: (index: number) => void;
  onClearDraftTasks: () => void;
  isSubmitting: boolean;
}

export function NewTasksSection({
  draftTask,
  onDraftTaskChange,
  onAddDraftTask,
  newTasks,
  onRemoveDraftTask,
  onClearDraftTasks,
  isSubmitting,
}: NewTasksSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Добавить новые задачи</p>
          <p className="text-xs text-muted-foreground">
            Они сохранятся в библиотеку и будут доступны позже
          </p>
        </div>
        {newTasks.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearDraftTasks}
            disabled={isSubmitting}
          >
            Очистить список
          </Button>
        )}
      </div>

      <div className="space-y-2 rounded-lg border p-4">
        <div className="space-y-2">
          <Input
            placeholder="Название задачи"
            value={draftTask.title}
            onChange={(event) =>
              onDraftTaskChange({
                ...draftTask,
                title: event.target.value,
              })
            }
            disabled={isSubmitting}
          />
          <Textarea
            placeholder="Описание (необязательно)"
            value={draftTask.description}
            onChange={(event) =>
              onDraftTaskChange({
                ...draftTask,
                description: event.target.value,
              })
            }
            disabled={isSubmitting}
          />
        </div>
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddDraftTask}
            disabled={isSubmitting}
          >
            <PlusCircle className="h-4 w-4" />
            Добавить задачу
          </Button>
          <span className="text-xs text-muted-foreground">
            {newTasks.length} в списке
          </span>
        </div>
      </div>

      {newTasks.length > 0 && (
        <div className="space-y-2">
          {newTasks.map((task, index) => (
            <div
              key={`${task.title}-${index}`}
              className="flex items-start justify-between gap-4 rounded-lg border bg-muted/40 p-4"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-muted-foreground">
                    {task.description}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onRemoveDraftTask(index)}
                disabled={isSubmitting}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Удалить</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

