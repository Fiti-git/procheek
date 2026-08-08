"use client";

import * as React from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type ToastVariant = "success" | "error" | "info";

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastItem = ToastInput & { id: number };

type ToastContextValue = {
  toast: (t: ToastInput) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    // Safe fallback so consumers never crash if provider is missing.
    return {
      toast: (t: ToastInput) => {
        if (typeof window !== "undefined") {
          console.log("[toast]", t.title, t.description || "");
        }
      },
    };
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(1);

  const remove = React.useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toast = React.useCallback(
    (input: ToastInput) => {
      const id = idRef.current++;
      const item: ToastItem = { id, variant: "info", ...input };
      setItems((prev) => [...prev, item]);
      window.setTimeout(() => remove(id), 4000);
    },
    [remove],
  );

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[min(360px,calc(100vw-2rem))]">
        {items.map((t) => (
          <ToastCard key={t.id} item={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const variant = item.variant || "info";
  const Icon =
    variant === "success" ? CheckCircle2 : variant === "error" ? XCircle : Info;
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 bg-white border rounded-xl shadow-lg p-3.5 text-sm",
        variant === "success" && "border-emerald-200",
        variant === "error" && "border-red-200",
        variant === "info" && "border-line",
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 mt-0.5 shrink-0",
          variant === "success" && "text-emerald-600",
          variant === "error" && "text-red-600",
          variant === "info" && "text-ink-500",
        )}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-ink-900 leading-snug">{item.title}</p>
        {item.description && (
          <p className="mt-0.5 text-xs text-ink-500 leading-snug">
            {item.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="p-1 rounded hover:bg-canvas-2 text-ink-500"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
