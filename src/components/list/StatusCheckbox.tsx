import type { Status } from "@/types/todo";

export interface StatusCheckboxProps {
  status: Status;
  onChange: (next: Status) => void;
  ariaLabel?: string;
}

export function StatusCheckbox({ status, onChange, ariaLabel }: StatusCheckboxProps) {
  const isDone = status === "completed";
  const isProgress = status === "in-progress";

  const toggle = () => {
    if (isDone) onChange("pending");
    else if (isProgress) onChange("completed");
    else onChange("completed");
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isDone}
      aria-label={ariaLabel ?? (isDone ? "取消完成" : "标记完成")}
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      className={[
        "inline-grid place-items-center transition-all duration-150 ease-stamp",
        "h-[18px] w-[18px] rounded-full border-[1.5px]",
        isDone
          ? "bg-ink-900 border-ink-900 text-paper-50"
          : isProgress
            ? "border-state-progress"
            : "border-ink-500 hover:border-ink-900",
      ].join(" ")}
      style={
        isProgress
          ? {
              background:
                "conic-gradient(var(--state-progress) 50%, transparent 50%)",
            }
          : undefined
      }
    >
      {isDone && (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
