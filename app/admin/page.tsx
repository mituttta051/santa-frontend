"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { getEvents, Event, login, LoginRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Settings } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { CreateEventForm } from "@/components/events/CreateEventForm";
import { EventList } from "@/components/events/EventList";
import type { AuthResponse } from "@/lib/types";

export default function AdminPage() {
  const router = useRouter();
  const { currentUser, login: loginUser } = useApp();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginRequest>({
    phoneNumber: "",
    password: "",
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.isAdmin) {
      loadEvents();
    }
  }, [currentUser]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (err) {
      console.error("Ошибка при загрузке событий:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEventSuccess = () => {
    setShowCreateForm(false);
    loadEvents();
  };

  const handleLoginSuccess = (response: AuthResponse) => {
    if (!response.user.isAdmin) {
      setLoginError("Этот пользователь не является администратором.");
      return;
    }

    loginUser(response.user, response.accessToken);
  };

  const handleLoginError = (error: string) => {
    setLoginError(error);
  };

  // Форма входа, если пользователь не авторизован как админ
  if (!currentUser?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Settings className="h-5 w-5" />
              Вход в админ-панель
            </CardTitle>
            <CardDescription>
              Введите номер телефона и пароль администратора
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginForm
              phoneNumber={loginForm.phoneNumber}
              onPhoneChange={(phone) => setLoginForm({ ...loginForm, phoneNumber: phone })}
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
              onBack={undefined}
              showPhoneField={false}
            />
            {loginError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {loginError}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Панель администратора
            </CardTitle>
            <CardDescription>Управление событиями и пользователями</CardDescription>
          </CardHeader>
        </Card>

        {showCreateForm ? (
          <CreateEventForm
            onSuccess={handleCreateEventSuccess}
            onCancel={() => {
              setShowCreateForm(false);
            }}
          />
        ) : (
          <Button
            onClick={() => {
              setShowCreateForm(true);
            }}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Создать новое событие
          </Button>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Все события</CardTitle>
          </CardHeader>
          <CardContent>
            <EventList events={events} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
