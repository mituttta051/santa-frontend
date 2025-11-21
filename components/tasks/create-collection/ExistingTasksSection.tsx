import { Check, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { SantaTask } from "@/lib/types";

interface ExistingTasksSectionProps {
  tasks: SantaTask[];
  filteredTasks: SantaTask[];
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedTaskIds: string[];
  onToggleTask: (taskId: string) => void;
  isSubmitting: boolean;
}

export function ExistingTasksSection({
  tasks,
  filteredTasks,
  searchTerm,
  onSearchTermChange,
  selectedTaskIds,
  onToggleTask,
  isSubmitting,
}: ExistingTasksSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Задачи из библиотеки</p>
          <p className="text-xs text-muted-foreground">
            Выберите готовые задачи, чтобы не создавать дубликаты
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {selectedTaskIds.length} выбрано
        </span>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Поиск по названию или описанию"
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          disabled={isSubmitting || tasks.length === 0}
        />
      </div>

      <div className="max-h-64 overflow-y-auto rounded-lg border">
        {tasks.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            На бэкенде пока нет задач. Добавьте новые ниже, они автоматически
            попадут в библиотеку.
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            Ничего не найдено. Попробуйте изменить запрос.
          </div>
        ) : (
          <ul className="divide-y">
            {filteredTasks.map((task) => {
              const isSelected = selectedTaskIds.includes(task.id);
              return (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-muted/60"
                    disabled={isSubmitting}
                  >
                    <span
                      className={`mt-1 flex h-5 w-5 items-center justify-center rounded border ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/40 bg-background"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

