"use client";

import { useEffect, useMemo, useState } from "react";

import { CollectionInfoFields } from "@/components/tasks/create-collection/CollectionInfoFields";
import { CollectionModalFooter } from "@/components/tasks/create-collection/CollectionModalFooter";
import { CollectionModalHeader } from "@/components/tasks/create-collection/CollectionModalHeader";
import { ExistingTasksSection } from "@/components/tasks/create-collection/ExistingTasksSection";
import { NewTasksSection } from "@/components/tasks/create-collection/NewTasksSection";
import { createSantaCollection } from "@/lib/santa-collections";
import type {
  CreateTaskRequest,
  SantaCollection,
  SantaTask,
} from "@/lib/types";

interface CreateTaskCollectionModalProps {
  tasks: SantaTask[];
  onClose: () => void;
  onCreated: (collection: SantaCollection) => void;
}

export function CreateTaskCollectionModal({
  tasks,
  onClose,
  onCreated,
}: CreateTaskCollectionModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [newTasks, setNewTasks] = useState<CreateTaskRequest[]>([]);
  const [draftTask, setDraftTask] = useState<CreateTaskRequest>({
    title: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const filteredTasks = useMemo(() => {
    if (!searchTerm.trim()) {
      return tasks;
    }
    const lowered = searchTerm.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowered) ||
        task.description?.toLowerCase().includes(lowered),
    );
  }, [tasks, searchTerm]);

  const handleToggleTask = (taskId: string) => {
    setSelectedTaskIds((prev) => {
      if (prev.includes(taskId)) {
        return prev.filter((id) => id !== taskId);
      }
      return [...prev, taskId];
    });
  };

  const handleAddDraftTask = () => {
    if (!draftTask.title.trim()) {
      setError("Укажите название задачи");
      return;
    }
    setNewTasks((prev) => [
      ...prev,
      {
        title: draftTask.title.trim(),
        description: draftTask.description?.trim()
          ? draftTask.description.trim()
          : undefined,
      },
    ]);
    setDraftTask({ title: "", description: "" });
    setError(null);
  };

  const handleRemoveDraftTask = (index: number) => {
    setNewTasks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!name.trim()) {
      setError("Название коллекции обязательно");
      return;
    }
    if (selectedTaskIds.length === 0 && newTasks.length === 0) {
      setError("Добавьте хотя бы одну задачу в коллекцию");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        taskIds: selectedTaskIds.length ? selectedTaskIds : undefined,
        tasks: newTasks.length ? newTasks : undefined,
      };
      const collection = await createSantaCollection(payload);
      onCreated(collection);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Не удалось создать коллекцию";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 md:items-center md:justify-center">
      <div className="modal-content w-full max-w-4xl rounded-xl border bg-background shadow-2xl md:rounded-xl">
        <form onSubmit={handleSubmit}>
          <CollectionModalHeader onClose={onClose} isSubmitting={isSubmitting} />

          <div className="space-y-6 px-6 py-6">
            <CollectionInfoFields
              name={name}
              description={description}
              onNameChange={setName}
              onDescriptionChange={setDescription}
              disabled={isSubmitting}
            />

            <ExistingTasksSection
              tasks={tasks}
              filteredTasks={filteredTasks}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              selectedTaskIds={selectedTaskIds}
              onToggleTask={handleToggleTask}
              isSubmitting={isSubmitting}
            />

            <NewTasksSection
              draftTask={draftTask}
              onDraftTaskChange={setDraftTask}
              onAddDraftTask={handleAddDraftTask}
              newTasks={newTasks}
              onRemoveDraftTask={handleRemoveDraftTask}
              onClearDraftTasks={() => setNewTasks([])}
              isSubmitting={isSubmitting}
            />

            {error && (
              <div className="error-message rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <CollectionModalFooter
            totalTasks={selectedTaskIds.length + newTasks.length}
            isSubmitting={isSubmitting}
            onCancel={onClose}
          />
        </form>
      </div>
    </div>
  );
}


