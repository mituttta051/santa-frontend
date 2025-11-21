import { Button } from "@/components/ui/button";

interface CollectionModalFooterProps {
  totalTasks: number;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function CollectionModalFooter({
  totalTasks,
  isSubmitting,
  onCancel,
}: CollectionModalFooterProps) {
  const tasksLabel =
    totalTasks === 1 ? "задача" : totalTasks < 5 ? "задачи" : "задач";

  return (
    <div className="flex flex-col gap-3 border-t px-6 py-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-muted-foreground">
        В коллекцию попадёт {totalTasks} {tasksLabel}
      </p>
      <div className="flex flex-col gap-2 md:flex-row">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Отмена
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Создание..." : "Создать коллекцию"}
        </Button>
      </div>
    </div>
  );
}

