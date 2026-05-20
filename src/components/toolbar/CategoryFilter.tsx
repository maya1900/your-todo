import { useTodoStore } from "@/store/useTodoStore";
import { useAllCategories } from "@/store/selectors";
import { Dropdown, type DropdownOption } from "@/components/ui/Dropdown";

const ALL = "__all__";

export function CategoryFilter() {
  const categories = useAllCategories();
  const selected = useTodoStore((s) => s.filter.categories);
  const setCategories = useTodoStore((s) => s.setCategories);

  const current = selected[0] ?? ALL;
  const options: DropdownOption<string>[] = [
    { value: ALL, label: "全部分类" },
    ...categories.map((c) => ({ value: c, label: `#${c}` })),
  ];
  const triggerLabel =
    current === ALL ? "分类" : `分类：${current}`;

  return (
    <Dropdown
      ariaLabel="按分类筛选"
      trigger={
        <span>
          {triggerLabel} <span aria-hidden="true">▾</span>
        </span>
      }
      options={options}
      value={current}
      onChange={(v) => {
        if (v === ALL) setCategories([]);
        else setCategories([v]);
      }}
    />
  );
}
