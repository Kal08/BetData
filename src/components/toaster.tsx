"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, removeToast } = useAppStore();

  useEffect(() => {
    toasts.forEach((t) => {
      const timer = setTimeout(() => removeToast(t.id), 4000);
      return () => clearTimeout(timer);
    });
  }, [toasts, removeToast]);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "rounded-lg border px-4 py-3 shadow-lg backdrop-blur",
            t.type === "success" && "border-emerald-500/50 bg-emerald-950/90",
            t.type === "error" && "border-red-500/50 bg-red-950/90",
            t.type === "info" && "border-primary/50 bg-card"
          )}
        >
          <p className="font-medium text-sm">{t.title}</p>
          {t.description && (
            <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
