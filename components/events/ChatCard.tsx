"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { getMessages, sendMessage, markMessageAsRead, type MessageDto, type SendMessageRequest } from "@/lib/api";
import type { PairDto, Participant, User } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatCardProps {
  eventId: string;
  pairs: PairDto[];
  participant: Participant | null;
  currentUser: User | null;
}

type ChatType = "santa" | "child";

// Функция для корректного форматирования времени сообщения
// Гарантирует консистентное отображение времени независимо от формата строки от сервера
function formatMessageTime(createdAt: string): string {
  if (!createdAt) return "";
  
  try {
    // Парсим дату - new Date() корректно обрабатывает ISO 8601 строки с timezone
    const date = new Date(createdAt);
    
    // Проверяем что дата валидна
    if (isNaN(date.getTime())) {
      return "";
    }
    
    // Форматируем в локальное время пользователя
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.warn("Error formatting message time:", error, createdAt);
    return "";
  }
}

export function ChatCard({ eventId, pairs, participant, currentUser }: ChatCardProps) {
  const [chatType, setChatType] = useState<ChatType>("santa");
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Отслеживаем ID сообщений, которые только что отправлены и еще не обновлены с правильным временем
  const [pendingMessageIds, setPendingMessageIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Находим пару, где текущий пользователь является Сантой
  const myPairAsSanta = pairs.find((p) => p.santaName === currentUser?.name);
  // Находим пару, где текущий пользователь является Внучком
  const myPairAsChild = pairs.find((p) => p.childName === currentUser?.name);

  // Определяем ID собеседника в зависимости от выбранного чата
  const getOtherParticipantId = (): string | null => {
    if (!participant) return null;
    
    if (chatType === "santa") {
      // Чат с Сантой: текущий пользователь - Внучок, собеседник - Санта
      return myPairAsChild?.santaId || null;
    } else {
      // Чат с Внучком: текущий пользователь - Санта, собеседник - Внучок
      return myPairAsSanta?.childId || null;
    }
  };

  const otherParticipantId = getOtherParticipantId();
  const canChat = participant && otherParticipantId;

  // Загрузка сообщений
  useEffect(() => {
    if (!canChat) {
      setMessages([]);
      return;
    }

    let isMounted = true;

    async function loadMessages() {
      if (!participant || !otherParticipantId) return;
      
      try {
        setError(null);
        const loadedMessages = await getMessages(eventId, participant.id, otherParticipantId);
        if (isMounted) {
          setMessages(loadedMessages);
          // Убираем из pending те сообщения, которые теперь есть в обновленном списке
          // Это означает, что они успешно сохранены на сервере с правильным временем
          setPendingMessageIds((prev) => {
            const updated = new Set(prev);
            loadedMessages.forEach((msg) => {
              updated.delete(msg.id);
            });
            return updated;
          });
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : "Не удалось загрузить сообщения";
          setError(message);
        }
      }
    }

    loadMessages();

    // Обновляем сообщения каждые 3 секунды
    const interval = setInterval(loadMessages, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [eventId, participant?.id, otherParticipantId, canChat]);

  // Прокрутка к последнему сообщению (только если пользователь уже внизу)
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const isNearBottom = 
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    
    // Прокручиваем только если пользователь уже внизу или это первая загрузка
    if (isNearBottom || messages.length <= 1) {
      // Используем scrollTop контейнера вместо scrollIntoView, чтобы не прокручивать страницу
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Отмечаем непрочитанные сообщения как прочитанные
  useEffect(() => {
    if (!canChat || !participant) return;

    messages.forEach((msg) => {
      if (!msg.readAt && msg.recipientId === participant.id) {
        markMessageAsRead(eventId, msg.id).catch(console.error);
      }
    });
  }, [messages, canChat, participant, eventId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canChat || !newMessage.trim() || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setIsSending(true);
    setError(null);

    try {
      const request: SendMessageRequest = {
        senderId: participant!.id,
        recipientId: otherParticipantId!,
        content: messageContent,
      };

      const sentMessage = await sendMessage(eventId, request);
      setMessages((prev) => [...prev, sentMessage]);
      // Добавляем ID сообщения в pending, чтобы показывать индикатор загрузки вместо времени
      setPendingMessageIds((prev) => new Set(prev).add(sentMessage.id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось отправить сообщение";
      setError(message);
      setNewMessage(messageContent); // Возвращаем текст обратно
    } finally {
      setIsSending(false);
    }
  };

  if (!canChat) {
    return null;
  }

  const otherParticipantName = chatType === "santa" 
    ? myPairAsChild?.santaName 
    : myPairAsSanta?.childName;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Чат
        </CardTitle>
        <CardDescription>
          Общайся с {chatType === "santa" ? "Секретным Сантой" : "Внучком"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Селектор чата */}
        <div className="flex gap-2 rounded-lg border bg-muted p-1">
          <button
            type="button"
            onClick={() => setChatType("santa")}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              chatType === "santa"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            С Сантой
          </button>
          <button
            type="button"
            onClick={() => setChatType("child")}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              chatType === "child"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            С Внучком
          </button>
        </div>

        {/* Область сообщений */}
        <div
          ref={messagesContainerRef}
          className="flex h-96 flex-col gap-2 overflow-y-auto rounded-lg border bg-muted/30 p-4"
        >
          {error && messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sm text-destructive">
              {error}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Пока нет сообщений. Начни общение первым!
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const isMyMessage = message.senderId === participant.id;
                const isPending = pendingMessageIds.has(message.id);
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex w-full",
                      isMyMessage ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-2",
                        isMyMessage
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <div
                        className={cn(
                          "mt-1 flex items-center gap-1 text-xs",
                          isMyMessage
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                          </>
                        ) : (
                          formatMessageTime(message.createdAt)
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Форма отправки */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Написать ${chatType === "santa" ? "Санте" : "Внучку"}...`}
            disabled={isSending}
            className="flex-1"
          />
          <Button type="submit" disabled={isSending || !newMessage.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {error && messages.length > 0 && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}

