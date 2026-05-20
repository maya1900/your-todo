import { useHasActiveFilters } from "@/store/selectors";
import { useTodoStore } from "@/store/useTodoStore";
import { PRIORITY_LABEL_ZH, STATUS_LABEL_ZH, type Priority, type Status } from "@/types/todo";

interface BadgeProps {
  label: string;
  onRemove: () => void;
}
function Badge({ label, onRemove }: BadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-paper-200 px-2 py-1 text-[11px] text-ink-700 before:block before:h-1 before:w-1 before:bg-stamp-600">
      {label}
      <button
        type="button"
        aria-label={`移除筛选：${label}`}
        onClick={onRemove}
        className="text-ink-500 hover:text-stamp-600"
      >
        ×
      </button>
    </span>
  );
}

export function FilterBadges() {
  const filter = useTodoStore((s) => s.filter);
  const setSearch = useTodoStore((s) => s.setSearch);
  const setStatusFilter = useTodoStore((s) => s.setStatusFilter);
  const setCategories = useTodoStore((s) => s.setCategories);
  const setPriorities = useTodoStore((s) => s.setPriorities);
  const clearFilters = useTodoStore((s) => s.clearFilters);
  const hasFilters = useHasActiveFilters();

  if (!hasFilters) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <span className="font-mono text-[11px] tracking-[0.14em] text-ink-500">
        ACTIVE FILTERS
      </span>
      {filter.search && (
        <Badge label={`搜索：${filter.search}`} onRemove={() => setSearch("")} />
      )}
      {filter.status !== "all" && (
        <Badge
          label={`状态：${STATUS_LABEL_ZH[filter.status as Status]}`}
          onRemove={() => setStatusFilter("all")}
        />
      )}
      {filter.categories.map((c) => (
        <Badge
          key={`c-${c}`}
          label={`分类：${c}`}
          onRemove={() => setCategories(filter.categories.filter((x) => x !== c))}
        />
      ))}
      {filter.priorities.map((p: Priority) => (
        <Badge
          key={`p-${p}`}
          label={`优先级：${PRIORITY_LABEL_ZH[p]}`}
          onRemove={() => setPriorities(filter.priorities.filter((x) => x !== p))}
        />
      ))}
      <button
        type="button"
        onClick={() => clearFilters()}
        className="text-[12px] text-ink-500 hover:text-stamp-600 underline underline-offset-4"
      >
        清除全部筛选
      </button>
    </div>
  );
}
