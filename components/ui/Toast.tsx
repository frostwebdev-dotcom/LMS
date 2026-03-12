"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  /** Auto-dismiss after ms (0 = no auto). */
  duration?: number;
  type?: "success" | "error" | "info";
}

export function Toast({
  message,
  visible,
  onDismiss,
  duration = 5000,
  type = "success",
}: ToastProps) {
  useEffect(() => {
    if (!visible || duration <= 0) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  const bg =
    type === "success"
      ? "bg-emerald-600"
      : type === "error"
        ? "bg-red-600"
        : "bg-slate-700";

  return (
    <div
      role="alert"
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg ${bg} px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300`}
    >
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded p-1 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
