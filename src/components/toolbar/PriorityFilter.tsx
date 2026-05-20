import { useTodoStore } from "@/store/useTodoStore";
import {
  PRIORITIES,
  PRIORITY_LABEL_EN,
  PRIORITY_LABEL_ZH,
  type Priority,
} from "@/types/todo";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/MultiSelect";

export function PriorityFilter() {
  const selected = useTodoStore((s) => s.filter.priorities);
  const setPriorities = useTodoStore((s) => s.setPriorities);

  const options: MultiSelectOption<Priority>[] = PRIORITIES.map((p) => ({
    value: p,
    label: (
      <span>
        <span className="font-mono mr-2 text-[10px] text-ink-500">{PRIORITY_LABEL_EN[p]}</span>
        {PRIORITY_LABEL_ZH[p]}
      </span>
    ),
  }));

  return (
    <MultiSelect<Priority>
      ariaLabel="按优先级筛选"
      trigger={
        <span>
          优先级 <span aria-hidden="true">▾</span>
        </span>
      }
      options={options}
      values={selected}
      onChange={setPriorities}
    />
  );
}
