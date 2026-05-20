import { formatDueDate } from "@/utils/date";
import type { Status } from "@/types/todo";

export interface DueDateLabelProps {
  iso: string | null;
  status: Status;
}

export function DueDateLabel({ iso, status }: DueDateLabelProps) {
  const v = formatDueDate(iso, status);
  const toneCls =
    v.tone === "overdue"
      ? "text-state-overdue font-medium"
      : v.tone === "today"
        ? "text-prio-high-ink font-medium"
        : v.tone === "tomorrow"
          ? "text-ink-700"
          : "text-ink-500";

  if (v.tone === "none" && !iso) {
    return (
      <span className="font-mono text-[12px] text-ink-300">
        <span aria-hidden="true">⏱ </span>
        {v.formatted}
      </span>
    );
  }

  return (
    <span className={`font-mono text-[12px] ${toneCls}`}>
      <span aria-hidden="true">⏱ </span>
      {v.formatted}
      {v.relative ? ` · ${v.relative}` : ""}
    </span>
  );
}
