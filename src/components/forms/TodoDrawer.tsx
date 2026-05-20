import { useEffect, useMemo, useRef } from "react";
import { useDrawerState, useEditingTodo, useTodoStore } from "@/store/useTodoStore";
import { useAllCategories } from "@/store/selectors";
import { emitToast } from "@/components/feedback/toastBus";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { TodoForm } from "./TodoForm";

export function TodoDrawer() {
  const drawer = useDrawerState();
  const editing = useEditingTodo();
  const lastTrigger = useTodoStore((s) => s.ui.lastTrigger);
  const closeDrawer = useTodoStore((s) => s.closeDrawer);
  const addTodo = useTodoStore((s) => s.addTodo);
  const updateTodo = useTodoStore((s) => s.updateTodo);
  const allCategories = useAllCategories();

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  useFocusTrap(panelRef, drawer.open);

  useEffect(() => {
    if (drawer.open) {
      triggerRef.current = lastTrigger;
    }
  }, [drawer.open, lastTrigger]);

  // Close on Escape
  useEffect(() => {
    if (!drawer.open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDrawer();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawer.open, closeDrawer]);

  // Lock body scroll while open
  useEffect(() => {
    if (!drawer.open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawer.open]);

  // Return focus to trigger on close
  useEffect(() => {
    if (drawer.open) return;
    if (triggerRef.current) {
      triggerRef.current.focus?.();
    }
  }, [drawer.open]);

  const isEdit = drawer.open && drawer.mode === "edit";
  const title = useMemo(() => {
    if (isEdit && editing) {
      return `№ EDIT · ${editing.id.slice(0, 6).toUpperCase()}`;
    }
    return "№ NEW · 2026.05.20";
  }, [isEdit, editing]);

  if (!drawer.open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center px-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeDrawer();
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
        id="todo-drawer-title"
        className="relative w-full max-w-[600px] max-h-[90vh] overflow-auto bg-paper-50 p-6 shadow-paper-3 border border-rule-400 animate-fade-up"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="text-mono-11 text-ink-500 font-mono text-[11px] tracking-[0.14em]">
            {title}
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="inline-grid place-items-center text-ink-700 transition-colors duration-150 hover:bg-paper-200 hover:text-ink-900 h-9 w-9"
            aria-label="关闭"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18"></path>
            </svg>
          </button>
        </div>
        <div className="sect-rule mb-6">
          <span className="text-label text-ink-700">
            {isEdit ? "编辑待办" : "新建待办"}
          </span>
        </div>
        <TodoForm
          initial={isEdit ? (editing ?? undefined) : undefined}
          submitLabel={isEdit ? "保存修改 ⊙" : "Save & Stamp ⊙"}
          allCategories={allCategories}
          onSubmit={(payload) => {
            if (isEdit && editing) {
              const r = updateTodo(editing.id, payload);
              if (r.ok) {
                emitToast({ kind: "success", message: "已保存修改" });
                closeDrawer();
                return { ok: true };
              }
              return r;
            }
            const r = addTodo(payload);
            if (r.ok) {
              emitToast({ kind: "success", message: "已新增待办" });
              closeDrawer();
              return { ok: true };
            }
            return r;
          }}
          onCancel={closeDrawer}
        />
      </div>
    </div>
  );
}
