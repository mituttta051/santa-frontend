"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { getMessages, sendMessage, markMessageAsRead, type MessageDto, type SendMessageRequest } from "@/lib/api";
import type { Participant, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { initializeNotifications, showMessageNotification, hasNotificationPermission } from "@/lib/notifications";

interface ChatCardProps {
  eventId: string;
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

// Функция для получения даты в формате YYYY-MM-DD (для группировки)
function getDateKey(createdAt: string): string {
  if (!createdAt) return "";
  
  try {
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) return "";
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.warn("Error getting date key:", error, createdAt);
    return "";
  }
}

// Функция для форматирования даты для отображения (Сегодня/Вчера/дата)
function formatDateLabel(dateKey: string): string {
  if (!dateKey) return "";
  
  try {
    const [year, month, day] = dateKey.split("-").map(Number);
    const messageDate = new Date(year, month - 1, day);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Сбрасываем время для сравнения только дат
    const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    
    if (messageDateOnly.getTime() === todayOnly.getTime()) {
      return "Сегодня";
    } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
      return "Вчера";
    } else {
      // Форматируем дату в формате "день месяц год"
      return messageDate.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  } catch (error) {
    console.warn("Error formatting date label:", error, dateKey);
    return dateKey;
  }
}

// Функция для группировки сообщений по датам
function groupMessagesByDate(messages: MessageDto[]): Array<{ dateKey: string; messages: MessageDto[] }> {
  const grouped = new Map<string, MessageDto[]>();
  
  for (const message of messages) {
    const dateKey = getDateKey(message.createdAt);
    if (!dateKey) continue;
    
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(message);
  }
  
  // Сортируем по дате (от старых к новым)
  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, messages]) => ({ dateKey, messages }));
}

export function ChatCard({ eventId, participant, currentUser }: ChatCardProps) {
  const [chatType, setChatType] = useState<ChatType>("santa");
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [santaId, setSantaId] = useState<string | null>(null);
  const [childId, setChildId] = useState<string | null>(null);
  const [isLoadingSanta, setIsLoadingSanta] = useState(true);
  const [isLoadingChild, setIsLoadingChild] = useState(true);
  // Отслеживаем ID сообщений, которые только что отправлены и еще не обновлены с правильным временем
  const [pendingMessageIds, setPendingMessageIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousMessagesRef = useRef<MessageDto[]>([]);
  const notificationsInitializedRef = useRef(false);
  const isFirstLoadRef = useRef(true);

  // Определяем ID собеседника
  const getOtherParticipantId = (): string | null => {
    if (!participant) return null;
    
    if (chatType === "santa") {
      // Чат с Сантой: текущий пользователь - Внучок, собеседник - Санта
      // Use chatPartnerId from API (which returns Santa's participant ID without revealing name)
      return santaId;
    } else {
      // Чат с Внучком: текущий пользователь - Санта, собеседник - Внучок
      // Use childId from pair (which is safe to show)
      return childId;
    }
  };

  const otherParticipantId = getOtherParticipantId();
  const canChat = participant && otherParticipantId && !isLoadingSanta && !isLoadingChild;


  // Загрузка ID собеседника для чата
  useEffect(() => {
    if (!participant || !eventId) {
      setIsLoadingSanta(false);
      setIsLoadingChild(false);
      return;
    }

    let isMounted = true;

    async function loadChatPartner() {
      try {
        setIsLoadingSanta(true);
        setIsLoadingChild(true);
        // Import getChatPartner dynamically to avoid circular dependencies
        const { getChatPartners } = await import("@/lib/events");
        const result = await getChatPartners(eventId);
        if (isMounted) {
          setSantaId(result.santaId);
          setChildId(result.childId);
        }
      } catch (err) {
        console.error("Ошибка при загрузке собеседника для чата:", err);
        if (isMounted) {
          // If pairs not generated, chat is not available
          setSantaId(null);
          setChildId(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingSanta(false);
          setIsLoadingChild(false);
        }
      }
    }

    loadChatPartner();

    return () => {
      isMounted = false;
    };
  }, [eventId, participant]);

  // Инициализация уведомлений
  useEffect(() => {
    if (!notificationsInitializedRef.current) {
      initializeNotifications().catch(console.error);
      notificationsInitializedRef.current = true;
    }
  }, []);

  // Получаем имя отправителя для уведомления
  const getSenderName = (senderId: string): string => {
    // If sender is the chat partner (Santa for child, or child for Santa)
    if (senderId === childId) {
      // If user is child, sender is Santa - don't reveal name
      return "Секретный Санта";
    }
    // If sender is child (when user is Santa)
    if (senderId === santaId) {
      return "Внучок";
    }
    return "Секретный Санта";
  };

  // Загрузка сообщений
  useEffect(() => {
    if (!canChat) {
      setMessages([]);
      previousMessagesRef.current = [];
      isFirstLoadRef.current = true;
      return;
    }

    // Сбрасываем флаг первой загрузки при смене чата
    isFirstLoadRef.current = true;
    previousMessagesRef.current = [];

    let isMounted = true;

    async function loadMessages() {
      if (!participant || !otherParticipantId) return;
      
      try {
        setError(null);
        const loadedMessages = await getMessages(eventId, participant.id, otherParticipantId);
        if (isMounted) {
          // Проверяем новые сообщения для уведомлений
          // Не показываем уведомления при первой загрузке или при смене чата
          if (!isFirstLoadRef.current && previousMessagesRef.current.length > 0 && hasNotificationPermission()) {
            const previousMessageIds = new Set(previousMessagesRef.current.map(m => m.id));
            const newMessages = loadedMessages.filter(msg => 
              !previousMessageIds.has(msg.id) && 
              msg.recipientId === participant.id // Только сообщения, адресованные текущему пользователю
            );
            
            // Показываем уведомления для новых сообщений
            for (const newMsg of newMessages) {
              const senderName = getSenderName(newMsg.senderId);
              showMessageNotification(senderName, newMsg.content, eventId).catch(console.error);
            }
          }
          
          setMessages(loadedMessages);
          previousMessagesRef.current = loadedMessages;
          isFirstLoadRef.current = false;
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

  if (isLoadingSanta || isLoadingChild) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Чат
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        </CardContent>
      </Card>
    );
  }

  if (!canChat) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Чат
        </CardTitle>
        <CardDescription>
          {chatType === "santa" 
            ? "Общайся с Секретным Сантой" 
            : "Общайся с Внучком"}
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
              {groupMessagesByDate(messages).map(({ dateKey, messages: dayMessages }) => (
                <div key={dateKey} className="space-y-2">
                  {/* Дата посередине */}
                  <div className="flex justify-center py-2">
                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {formatDateLabel(dateKey)}
                    </span>
                  </div>
                  
                  {/* Сообщения за этот день */}
                  {dayMessages.map((message) => {
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
                </div>
              ))}
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

