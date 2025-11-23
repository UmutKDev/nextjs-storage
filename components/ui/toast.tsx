"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type Toast = {
  id: string;
  title?: string;
  description?: string;
  intent?: "info" | "success" | "error" | "warning";
  duration?: number; // ms
};

type ToastContextType = {
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

function randomId() {
  return Math.random().toString(36).slice(2, 9);
}

export function ToastProvider({ children }: React.PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = randomId();
    const item: Toast = { id, ...t };
    setToasts((s) => [item, ...s]);

    if (t.duration && t.duration > 0) {
      setTimeout(
        () => setToasts((s) => s.filter((x) => x.id !== id)),
        t.duration
      );
    } else {
      // auto dismiss after 4s default
      setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 4000);
    }

    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((s) => s.filter((t) => t.id !== id));
  }, []);

  const clear = useCallback(() => setToasts([]), []);

  const value = useMemo(
    () => ({ toasts, toast, dismiss, clear }),
    [toasts, toast, dismiss, clear]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-0 flex items-start px-4 py-6 z-50 sm:p-6"
      >
        <div className="w-full flex flex-col items-end space-y-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="pointer-events-auto w-96 max-w-full bg-white dark:bg-slate-800 border border-border/40 rounded-md p-3 shadow-lg ring-1 ring-black/5"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {t.title && (
                    <div className="text-sm font-semibold">{t.title}</div>
                  )}
                  {t.description && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      {t.description}
                    </div>
                  )}
                </div>
                <div className="ml-3 self-start shrink-0">
                  <button
                    onClick={() => dismiss(t.id)}
                    aria-label="Dismiss"
                    className="text-sm rounded-md px-2 py-1 hover:bg-muted"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
