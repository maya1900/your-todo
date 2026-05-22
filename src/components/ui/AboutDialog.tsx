import { useEffect, useRef } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const REPO_URL = "https://github.com/maya1900/your-todo";
const ISSUES_URL = `${REPO_URL}/issues`;

export interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AboutDialog({ open, onClose }: AboutDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open);

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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center px-4"
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
        aria-labelledby="about-title"
        className="relative w-full max-w-[440px] bg-paper-50 p-6 shadow-paper-3 border border-rule-400 animate-fade-up"
      >
        <h2
          id="about-title"
          className="font-display text-display-lg text-ink-900"
        >
          关于 Your Todo
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-700">
          一款本地优先、键盘友好的报纸风格 Todo 应用。支持标签、过滤、统计、JSON 导入导出，数据保存在浏览器本地。
        </p>
        <dl className="mt-5 space-y-3 text-[13px]">
          <div className="flex items-center justify-between gap-3">
            <dt className="font-mono text-ink-500 tracking-[0.16em]">REPO</dt>
            <dd>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="underline decoration-rule-400 underline-offset-4 hover:decoration-ink-900 text-ink-900"
              >
                maya1900/your-todo
              </a>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="font-mono text-ink-500 tracking-[0.16em]">FEEDBACK</dt>
            <dd>
              <a
                href={ISSUES_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="underline decoration-rule-400 underline-offset-4 hover:decoration-ink-900 text-ink-900"
              >
                提交 Issue
              </a>
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[12px] tracking-[0.16em] uppercase text-ink-700 hover:text-ink-900 underline decoration-rule-400 underline-offset-4"
          >
            close
          </button>
        </div>
      </div>
    </div>
  );
}
