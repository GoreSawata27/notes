"use client";

import ShowToast from "./ShowToast";
import { useToastContext } from "./ToasterContext";
import { useToast } from "./useToast";

export default function ShowToastDemo() {
  const { toasts } = useToastContext();
  const { showToast } = useToast();

  return (
    <div className="flex flex-col items-center gap-4">
      <p>Toaster</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => showToast({ type: "error", message: "Something went wrong!" })}
        >
          Show Error Toast
        </button>
        <button
          type="button"
          onClick={() => showToast({ type: "success", message: "All good!" })}
        >
          Show Success Toast
        </button>
        <button
          type="button"
          onClick={() => showToast({ type: "info", message: "Fill all details" })}
        >
          Show Info Toast
        </button>
      </div>
      <div className="fixed top-4 right-4 z-50 w-80">
        {toasts.map((toast) => (
          <ShowToast key={toast.id} type={toast.type} message={toast.message} />
        ))}
      </div>
    </div>
  );
}
