import { Settings } from "lucide-react";

import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuthResponse, LoginRequest } from "@/lib/types";

interface AdminLoginCardProps {
  loginForm: LoginRequest;
  loginError: string | null;
  onPhoneChange: (phone: string) => void;
  onLoginSuccess: (response: AuthResponse) => void;
  onLoginError: (error: string) => void;
}

export function AdminLoginCard({
  loginForm,
  loginError,
  onPhoneChange,
  onLoginSuccess,
  onLoginError,
}: AdminLoginCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Settings className="h-5 w-5" />
          Вход в админ-панель
        </CardTitle>
        <CardDescription>Введите номер телефона и пароль администратора</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <LoginForm
          phoneNumber={loginForm.phoneNumber}
          onPhoneChange={onPhoneChange}
          onSuccess={onLoginSuccess}
          onError={onLoginError}
          onBack={undefined}
          showPhoneField={false}
        />
        {loginError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{loginError}</div>
        )}
      </CardContent>
    </Card>
  );
}

