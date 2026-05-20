import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./Button";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export interface ConfirmDialogProps {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "确认",
  cancelLabel = "取消",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center px-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm animate-overlay-in"
      />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        className="relative w-full max-w-[400px] bg-paper-50 p-6 shadow-paper-3 border border-rule-400 animate-fade-up"
      >
        <h2 className="font-display text-display-lg text-ink-900">{title}</h2>
        {description && <p className="mt-3 text-[14px] leading-relaxed text-ink-700">{description}</p>}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button ref={cancelRef} variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "stamp" : "outline"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
