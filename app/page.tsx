"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { subscribeUser, unsubscribeUser, sendNotification } from "./actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(true);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  async function subscribeToPush() {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      alert('VAPID public key is not configured. Please set NEXT_PUBLIC_VAPID_PUBLIC_KEY in your .env file');
      return;
    }

    try {
      setIsLoading(true);
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });
      setSubscription(sub);
      const serializedSub = JSON.parse(JSON.stringify(sub));
      await subscribeUser(serializedSub);
    } catch (error) {
      console.error('Subscription failed:', error);
      alert('Failed to subscribe to push notifications');
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribeFromPush() {
    try {
      setIsLoading(true);
      await subscription?.unsubscribe();
      setSubscription(null);
      await unsubscribeUser();
    } catch (error) {
      console.error('Unsubscription failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendTestNotification() {
    if (!subscription) {
      alert('Please subscribe to push notifications first');
      return;
    }

    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      setIsLoading(true);
      const result = await sendNotification(message);
      if (result.success) {
        setMessage('');
        alert('Notification sent successfully!');
      } else {
        alert('Failed to send notification: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) {
    return (
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          Push notifications are not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">Push Notifications</h3>
      {subscription ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Вы подписаны на push-уведомления.
          </p>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Введите сообщение для уведомления"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={isLoading}
            />
            <div className="flex gap-2">
              <Button
                onClick={sendTestNotification}
                disabled={isLoading || !message.trim()}
                className="flex-1"
              >
                {isLoading ? 'Отправка...' : 'Отправить уведомление'}
              </Button>
              <Button
                variant="outline"
                onClick={unsubscribeFromPush}
                disabled={isLoading}
              >
                Отписаться
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Вы не подписаны на push-уведомления.
          </p>
          <Button
            onClick={subscribeToPush}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Подписка...' : 'Подписаться'}
          </Button>
        </div>
      )}
    </div>
  );
}

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
            <PushNotificationManager />
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
