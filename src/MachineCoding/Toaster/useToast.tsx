import { useToastContext } from "./ToasterContext";

export type ToastType = "success" | "error" | "info";

export interface ToastData {
  id: number;
  type: ToastType;
  message: string;
}

interface ShowToastProps {
  type: ToastType;
  message: string;
}

export function useToast() {
  const { setToasts } = useToastContext();

  const showToast = ({ type, message }: ShowToastProps) => {
    const id = Date.now();
    setToasts((prev: ToastData[]) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev: ToastData[]) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return { showToast };
}
