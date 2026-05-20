import { useEffect, useState } from "react";
import { subscribeToasts, type Toast } from "@/components/feedback/toastBus";

const DEFAULT_DURATION = 4000;
const ERROR_DURATION = 6000;

export function ToastHost() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    return subscribeToasts((toast) => {
      setItems((prev) => [...prev, toast]);
      const ttl =
        toast.duration ??
        (toast.kind === "error" ? ERROR_DURATION : DEFAULT_DURATION);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== toast.id));
      }, ttl);
    });
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-full max-w-[360px] flex-col gap-2"
    >
      {items.map((t) => (
        <div
          key={t.id}
          role={t.kind === "error" ? "alert" : "status"}
          className={[
            "pointer-events-auto bg-ink-900 px-4 py-3 text-paper-50 shadow-paper-3 animate-fade-up",
            t.kind === "error" ? "border-l-4 border-stamp-600" : "",
            t.kind === "success" ? "border-l-4 border-state-completed" : "",
          ].join(" ")}
        >
          <p className="text-[13px] leading-snug">{t.message}</p>
        </div>
      ))}
    </div>
  );
}
