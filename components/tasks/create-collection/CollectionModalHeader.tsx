import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CollectionModalHeaderProps {
  onClose: () => void;
  isSubmitting: boolean;
}

export function CollectionModalHeader({ onClose, isSubmitting }: CollectionModalHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b px-6 py-4">
      <div>
        <h2 className="text-lg font-semibold">Новая коллекция задач</h2>
        <p className="text-sm text-muted-foreground">
          Объедините задачи в подборку и привяжите их к событиям позже
        </p>
      </div>
      <Button type="button" variant="ghost" size="icon" onClick={onClose} disabled={isSubmitting}>
        <X className="h-5 w-5" />
        <span className="sr-only">Закрыть</span>
      </Button>
    </div>
  );
}

