import { useEffect, useRef, type ReactNode } from "react";
import { IconButton } from "./IconButton";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Element to return focus to after close. */
  returnFocusRef?: HTMLElement | null;
  children: ReactNode;
  /** Right (desktop) by default; auto-switches to bottom on <sm. */
  side?: "right" | "bottom" | "auto";
  width?: string;
  /** Optional id for aria-labelledby. */
  labelId?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  returnFocusRef,
  children,
  side = "auto",
  width = "480px",
  labelId,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Move initial focus into panel
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const first = panel.querySelector<HTMLElement>(
      "input, textarea, select, button:not([data-focus-skip])",
    );
    first?.focus();
  }, [open]);

  // Return focus to trigger on close
  useEffect(() => {
    if (open) return;
    if (returnFocusRef) {
      returnFocusRef.focus?.();
    }
  }, [open, returnFocusRef]);

  if (!open) return null;

  const isBottom =
    side === "bottom" ||
    (side === "auto" && typeof window !== "undefined" && window.innerWidth < 640);

  const sidePanelCls = isBottom
    ? "fixed bottom-0 left-0 right-0 max-h-[90vh] w-full overflow-auto border-t-2 border-ink-900 rounded-t-md animate-drawer-in-bottom"
    : `fixed bottom-0 right-0 top-0 w-full max-w-[${width}] overflow-auto border-l-2 border-ink-900 animate-drawer-in-right`;

  return (
    <div
      aria-hidden="false"
      className="fixed inset-0 z-50 flex"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm animate-overlay-in"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        className={[sidePanelCls, "relative bg-paper-50 p-6 shadow-paper-3"].join(" ")}
        style={!isBottom ? { width } : undefined}
      >
        <div className="mb-6 flex items-center justify-between">
          <div id={labelId} className="text-mono-11 text-ink-500 font-mono text-[11px] tracking-[0.14em]">
            {title}
          </div>
          <IconButton aria-label="关闭" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}
