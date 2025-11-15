"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, getAccessToken, setAccessToken, removeAccessToken } from "./api";

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Проверяем наличие токена при загрузке
  useEffect(() => {
    const token = getAccessToken();
    setIsAuthenticated(!!token);
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
    <AppContext.Provider value={{ currentUser, setCurrentUser, isAuthenticated, login, logout }}>
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

