import { Plus } from "lucide-react";

import { CreateEventForm } from "@/components/events/CreateEventForm";
import { Button } from "@/components/ui/button";

interface EventCreationSectionProps {
  showCreateForm: boolean;
  onToggleForm: (value: boolean) => void;
  onCreateSuccess: () => void;
}

export function EventCreationSection({
  showCreateForm,
  onToggleForm,
  onCreateSuccess,
}: EventCreationSectionProps) {
  if (showCreateForm) {
    return <CreateEventForm onSuccess={onCreateSuccess} onCancel={() => onToggleForm(false)} />;
  }

  return (
    <Button onClick={() => onToggleForm(true)} className="w-full">
      <Plus className="mr-2 h-4 w-4" />
      Создать новое событие
    </Button>
  );
}

