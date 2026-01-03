import type { ToastData } from "./useToast";

export default function ShowToast({ type, message }: Omit<ToastData, "id">) {
  const baseStyle = "p-4 rounded shadow text-white mb-2";
  const typeStyles: Record<string, string> = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <div className={`${baseStyle} ${typeStyles[type]}`}>
      <span>
        <strong>{type.toUpperCase()}</strong>: {message}
      </span>
    </div>
  );
}
