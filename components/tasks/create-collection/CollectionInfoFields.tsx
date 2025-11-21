import { Input } from "@/components/ui/input";

interface CollectionInfoFieldsProps {
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  disabled: boolean;
}

export function CollectionInfoFields({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  disabled,
}: CollectionInfoFieldsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-medium">Название коллекции *</label>
        <Input
          placeholder="Например: Тёплый онбординг"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Описание</label>
        <Input
          placeholder="Коротко о назначении коллекции"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

