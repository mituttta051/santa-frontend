"use client";

import { useEffect, useState } from "react";
import { getApiBaseUrl, fixApiUrl } from "@/lib/config";

export function DebugConsole() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Добавляем начальную информацию асинхронно, чтобы не вызывать setState во время рендера
    const apiUrl = getApiBaseUrl();
    const fixedUrl = fixApiUrl(`${apiUrl}/test`);
    // Используем setTimeout для отложенного обновления состояния
    setTimeout(() => {
      setLogs([
        `[INFO] API Base URL (raw): ${apiUrl}`,
        `[INFO] API Base URL (fixed): ${fixedUrl.replace("/test", "")}`,
        `[INFO] Current hostname: ${typeof window !== "undefined" ? window.location.hostname : "N/A"}`,
      ]);
    }, 0);
  }, []);

  useEffect(() => {
    // Перехватываем console.log
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args: any[]) => {
      originalLog(...args);
      // Используем setTimeout для асинхронного обновления состояния
      setTimeout(() => {
        setLogs((prev) => [...prev, `[LOG] ${args.map((a) => String(a)).join(" ")}`]);
      }, 0);
    };

    console.error = (...args: any[]) => {
      originalError(...args);
      setTimeout(() => {
        setLogs((prev) => [...prev, `[ERROR] ${args.map((a) => String(a)).join(" ")}`]);
      }, 0);
    };

    console.warn = (...args: any[]) => {
      originalWarn(...args);
      setTimeout(() => {
        setLogs((prev) => [...prev, `[WARN] ${args.map((a) => String(a)).join(" ")}`]);
      }, 0);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Перехватываем ошибки fetch
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const url = typeof args[0] === "string" ? args[0] : args[0].toString();
      setTimeout(() => {
        setLogs((prev) => [...prev, `[FETCH] ${args[1]?.method || "GET"} ${url}`]);
      }, 0);
      
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          setTimeout(() => {
            setLogs((prev) => [...prev, `[FETCH ERROR] ${response.status} ${response.statusText} - ${url}`]);
          }, 0);
        }
        return response;
      } catch (error) {
        setTimeout(() => {
          setLogs((prev) => [...prev, `[FETCH ERROR] ${error} - ${url}`]);
        }, 0);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Показываем консоль для отладки (можно отключить, установив NEXT_PUBLIC_HIDE_DEBUG=true)
  if (process.env.NEXT_PUBLIC_HIDE_DEBUG === "true") {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-blue-600 px-4 py-2 text-white shadow-lg"
        style={{ fontSize: "12px" }}
      >
        {isVisible ? "Скрыть" : "Логи"}
      </button>
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 max-h-96 w-80 overflow-y-auto rounded-lg bg-black/90 p-4 text-xs text-white">
          <div className="mb-2 flex justify-between">
            <strong>Консоль отладки</strong>
            <button
              onClick={() => setLogs([])}
              className="text-blue-400 underline"
            >
              Очистить
            </button>
          </div>
          <div className="space-y-1 font-mono">
            {logs.slice(-50).map((log, i) => (
              <div key={i} className="break-words">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

