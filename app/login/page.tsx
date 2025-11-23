"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/context";
import { AuthFlow } from "@/components/auth/AuthFlow";
import type { AuthResponse } from "@/lib/types";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: loginUser, isAuthenticated } = useApp();

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
    loginUser(response.user, response.accessToken);
    router.push(redirectTo);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <AuthFlow onSuccess={handleSuccess} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="text-center text-muted-foreground">Загрузка...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
