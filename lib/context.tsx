"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, getAccessToken, setAccessToken, removeAccessToken, getCurrentUser } from "./api";

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Синхронно проверяем наличие токена для быстрой инициализации
  const hasToken = typeof window !== "undefined" && !!getAccessToken();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Если токена нет, сразу считаем что не загружаемся
  const [isLoading, setIsLoading] = useState(hasToken);

  // Проверяем наличие токена при загрузке и получаем информацию о пользователе
  useEffect(() => {
    async function checkAuth() {
      const token = getAccessToken();
      if (token) {
        try {
          const user = await getCurrentUser();
          setCurrentUser(user);
          setIsAuthenticated(true);
        } catch (error) {
          // Токен невалиден или истек, удаляем его
          console.error("Failed to get current user:", error);
          removeAccessToken();
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  const login = (user: User, token: string) => {
    setAccessToken(token);
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    removeAccessToken();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AppContext.Provider value={{ currentUser, setCurrentUser, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

