"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { register } from "@/lib/api";
import { useApp } from "@/lib/context";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AuthResponse } from "@/lib/types";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useApp();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  if (isAuthenticated) {
    return null; // Пока идет редирект
  }

  const handleSuccess = (response: AuthResponse) => {
    login(response.user, response.accessToken);
    router.push(redirectTo);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Регистрация</CardTitle>
          <CardDescription>
            Создайте аккаунт для участия в игре Тайный Санта
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm
            phoneNumber={phoneNumber}
            onPhoneChange={setPhoneNumber}
            onSuccess={handleSuccess}
            onError={setError}
            onBack={() => router.push("/login")}
          />
          {error && (
            <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <button
              type="button"
              onClick={() => {
                const redirectParam = redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : "";
                router.push(`/login${redirectParam}`);
              }}
              className="text-primary underline-offset-4 hover:underline"
            >
              Войти
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Регистрация</CardTitle>
            <CardDescription>Загрузка...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
