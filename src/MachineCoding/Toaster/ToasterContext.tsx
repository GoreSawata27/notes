import React, { createContext, useContext, useState, ReactNode } from "react";
import type { ToastData } from "./useToast";

interface ToastContextType {
  toasts: ToastData[];
  setToasts: React.Dispatch<React.SetStateAction<ToastData[]>>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToasterContextProvider");
  }
  return context;
};

interface ToasterContextProviderProps {
  children: ReactNode;
}

export default function ToasterContextProvider({ children }: ToasterContextProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  return <ToastContext.Provider value={{ toasts, setToasts }}>{children}</ToastContext.Provider>;
}
