"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, currentUser, logout } = useApp();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // Пока идет редирект
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">🎄 Secret Santa</CardTitle>
            <CardDescription>
              Добро пожаловать, {currentUser?.name || "пользователь"}!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Перейди по ссылке события, чтобы начать
            </p>
            <Button
              variant="outline"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="w-full"
            >
              Выйти
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
