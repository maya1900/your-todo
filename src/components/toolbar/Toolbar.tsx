import type { RefObject } from "react";
import { useTodoStore } from "@/store/useTodoStore";
import { Button } from "@/components/ui/Button";
import { SearchBox } from "./SearchBox";
import { StatusTabs } from "./StatusTabs";
import { CategoryFilter } from "./CategoryFilter";
import { PriorityFilter } from "./PriorityFilter";
import { SortDropdown } from "./SortDropdown";
import { FilterBadges } from "./FilterBadges";

export interface ToolbarProps {
  searchInputRef?: RefObject<HTMLInputElement>;
}

export function Toolbar({ searchInputRef }: ToolbarProps) {
  const openCreate = useTodoStore((s) => s.openCreate);

  return (
    <section aria-label="筛选与操作" className="border-b border-rule-400 pb-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchBox ref={searchInputRef} />
        <StatusTabs />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <CategoryFilter />
          <PriorityFilter />
          <SortDropdown />
          <Button
            variant="stamp"
            onClick={(e) => openCreate(e.currentTarget as HTMLElement)}
          >
            <span aria-hidden="true">+</span> 新建待办
          </Button>
        </div>
      </div>
      <FilterBadges />
    </section>
  );
}
