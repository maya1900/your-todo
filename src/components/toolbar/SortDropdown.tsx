import { useTodoStore } from "@/store/useTodoStore";
import { SORT_KEYS, SORT_LABEL_ZH, type SortKey } from "@/types/todo";
import { Dropdown, type DropdownOption } from "@/components/ui/Dropdown";

export function SortDropdown() {
  const sort = useTodoStore((s) => s.sort);
  const setSort = useTodoStore((s) => s.setSort);

  const options: DropdownOption<SortKey>[] = SORT_KEYS.map((k) => ({
    value: k,
    label: SORT_LABEL_ZH[k],
  }));

  return (
    <Dropdown<SortKey>
      ariaLabel="排序"
      trigger={
        <span>
          <span aria-hidden="true" className="mr-1">↕</span>
          {SORT_LABEL_ZH[sort]}
        </span>
      }
      options={options}
      value={sort}
      onChange={(v) => setSort(v)}
    />
  );
}
