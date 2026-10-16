"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastTone = "ok" | "error";

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  notify: (toast: { message: string; tone: ToastTone }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const regionId = useId();

  const notify = useCallback((toast: { message: string; tone: ToastTone }) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, ...toast }]);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = window.setTimeout(() => {
      setToasts((current) => current.slice(1));
    }, 4200);
    return () => window.clearTimeout(timer);
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        id={regionId}
        aria-label={label}
        className="app-lift-toast pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
      >
        <div className="flex w-full max-w-sm flex-col gap-2">
          {toasts.map((toast) => (
            <p
              key={toast.id}
              role={toast.tone === "error" ? "alert" : "status"}
              aria-live={toast.tone === "error" ? "assertive" : "polite"}
              className={`pointer-events-auto rounded-2xl border px-4 py-3 text-center font-serif text-sm text-chocolate shadow-sm ${
                toast.tone === "error"
                  ? "border-pink-deep/40 bg-paper"
                  : "border-line bg-paper"
              }`}
            >
              {toast.message}
            </p>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
