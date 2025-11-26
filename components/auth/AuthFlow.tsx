"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneAuthForm } from "./PhoneAuthForm";
import { RegisterForm } from "./RegisterForm";
import { LoginForm } from "./LoginForm";
import type { AuthResponse } from "@/lib/types";

type AuthStep = "phone" | "register" | "login";

interface AuthFlowProps {
  eventName?: string;
  onSuccess: (response: AuthResponse) => void;
  initialStep?: AuthStep;
}

export function AuthFlow({ eventName, onSuccess, initialStep = "phone" }: AuthFlowProps) {
  const [authStep, setAuthStep] = useState<AuthStep>(initialStep);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleRegisterSuccess = (response: AuthResponse) => {
    onSuccess(response);
    // Очищаем форму после успешной регистрации
    setPhoneNumber("");
    setError(null);
  };

  const handleLoginSuccess = (response: AuthResponse) => {
    onSuccess(response);
    // Очищаем форму после успешного входа
    setPhoneNumber("");
    setError(null);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {eventName ? `${eventName}` : "Secret Santa"}
        </CardTitle>
        <CardDescription>
          {authStep === "phone" && "Введи свой номер телефона, чтобы начать"}
          {authStep === "register" && "Заполни форму для регистрации"}
          {authStep === "login" && "Введи пароль для входа"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {authStep === "phone" && (
          <PhoneAuthForm
            phoneNumber={phoneNumber}
            onPhoneChange={setPhoneNumber}
            onNewUser={() => setAuthStep("register")}
            onExistingUser={() => setAuthStep("login")}
            onError={setError}
          />
        )}

        {authStep === "register" && (
          <RegisterForm
            phoneNumber={phoneNumber}
            onPhoneChange={setPhoneNumber}
            onSuccess={handleRegisterSuccess}
            onError={setError}
            onBack={() => {
              setAuthStep("phone");
              setError(null);
            }}
          />
        )}

        {authStep === "login" && (
          <LoginForm
            phoneNumber={phoneNumber}
            onPhoneChange={setPhoneNumber}
            onSuccess={handleLoginSuccess}
            onError={setError}
            onBack={() => {
              setAuthStep("phone");
              setError(null);
            }}
          />
        )}

        {error && (
          <div className="error-message rounded-md bg-destructive/10 p-3 text-sm text-destructive text-center">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

