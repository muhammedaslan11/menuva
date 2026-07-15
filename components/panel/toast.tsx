"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CheckCircleIcon } from "@/components/icons";

type ToastType = "success" | "error";
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  /** Sağ altta kısa bir bildirim gösterir (varsayılan: başarı). */
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Panelde yapılan işlemler (kaydet, sil, kopyala…) ardından kullanıcıya
// görsel geri bildirim veren toast'lar. useToast().toast(...) ile çağrılır.
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast, ToastProvider içinde kullanılmalı");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`toast-in pointer-events-auto flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium shadow-[0_16px_36px_-12px_rgba(35,24,18,0.45)] ${
              t.type === "success"
                ? "border-herb/30 bg-paper text-ink"
                : "border-paprika/40 bg-paper text-paprika-deep"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircleIcon size={18} className="shrink-0 text-herb" />
            ) : (
              <span className="shrink-0 font-mono text-base leading-none text-paprika">✕</span>
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
