"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/lib/context";
import type { AuthResponse } from "@/lib/types";

export function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: loginUser, isAuthenticated } = useApp();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  if (isAuthenticated) {
    return null;
  }

  const handleSuccess = (response: AuthResponse) => {
    loginUser(response.user, response.accessToken);
    router.push(redirectTo);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Вход</CardTitle>
          <CardDescription>
            Войдите в свой аккаунт для участия в игре Тайный Санта
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm
            phoneNumber={phoneNumber}
            onPhoneChange={setPhoneNumber}
            onSuccess={handleSuccess}
            onError={setError}
            onBack={undefined}
            showPhoneField={false}
          />
          {error && (
            <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Нет аккаунта?{" "}
            <button
              type="button"
              onClick={() => {
                const redirectParam = redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : "";
                router.push(`/register${redirectParam}`);
              }}
              className="text-primary underline-offset-4 hover:underline"
            >
              Зарегистрироваться
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

