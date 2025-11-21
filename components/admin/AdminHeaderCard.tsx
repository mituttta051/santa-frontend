import { Settings } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function AdminHeaderCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Панель администратора
        </CardTitle>
        <CardDescription>Управление событиями и пользователями</CardDescription>
      </CardHeader>
    </Card>
  );
}

