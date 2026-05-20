import { useTodoStore } from "@/store/useTodoStore";
import { useStatusCounts } from "@/store/selectors";
import { STATUS_FILTERS, STATUS_FILTER_LABEL_ZH, type StatusFilter } from "@/types/todo";

export function StatusTabs() {
  const status = useTodoStore((s) => s.filter.status);
  const setStatus = useTodoStore((s) => s.setStatusFilter);
  const counts = useStatusCounts();

  return (
    <div
      role="tablist"
      aria-label="按状态筛选"
      className="flex border border-rule-400 divide-x divide-rule-400 overflow-hidden"
    >
      {STATUS_FILTERS.map((s: StatusFilter) => {
        const selected = status === s;
        return (
          <button
            key={s}
            role="tab"
            aria-selected={selected}
            onClick={() => setStatus(s)}
            className={[
              "px-3 sm:px-4 h-10 text-[13px] tracking-wide transition-colors",
              selected
                ? "bg-ink-900 text-paper-50"
                : "text-ink-500 hover:text-ink-900 hover:bg-paper-100",
            ].join(" ")}
          >
            {STATUS_FILTER_LABEL_ZH[s]}
            <span className="font-mono ml-2 text-[11px] opacity-70">
              {counts[s]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
