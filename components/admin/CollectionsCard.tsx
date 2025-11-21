import { Layers3, Plus, RefreshCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SantaCollection } from "@/lib/types";

interface CollectionsCardProps {
  collections: SantaCollection[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onCreateCollection: () => void;
}

export function CollectionsCard({
  collections,
  loading,
  error,
  onRefresh,
  onCreateCollection,
}: CollectionsCardProps) {
  const renderTasksLabel = (count: number) => {
    if (count === 1) return "задача";
    if (count < 5) return "задачи";
    return "задач";
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Layers3 className="h-5 w-5" />
            Коллекции задач
          </CardTitle>
          <CardDescription>
            Группируйте задания, чтобы быстро подключать их к событиям
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
            <RefreshCcw className="h-4 w-4" />
            Обновить
          </Button>
          <Button size="sm" onClick={onCreateCollection}>
            <Plus className="h-4 w-4" />
            Создать коллекцию
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        ) : collections.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Пока нет коллекций. Создайте первую, чтобы быстро делиться задачами с администраторами
            событий.
          </div>
        ) : (
          <div className="space-y-3">
            {collections.map((collection) => (
              <div key={collection.id} className="space-y-3 rounded-lg border p-4">
                <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold">{collection.name}</p>
                    {collection.description && (
                      <p className="text-xs text-muted-foreground">{collection.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {collection.tasks.length} {renderTasksLabel(collection.tasks.length)}
                  </span>
                </div>
                {collection.tasks.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {collection.tasks.map((task) => (
                      <Badge
                        key={`${collection.id}-${task.id}`}
                        variant="secondary"
                        className="max-w-full truncate"
                      >
                        {task.title}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

