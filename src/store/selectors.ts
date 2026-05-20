import { useMemo } from "react";
import type { Stats } from "@/utils/stats";
import { deriveStats } from "@/utils/stats";
import { deriveFilteredSorted } from "@/utils/filter";
import type { StatusFilter, Todo } from "@/types/todo";
import { useTodoStore } from "./useTodoStore";

export function useFilteredTodos(): Todo[] {
  const todos = useTodoStore((s) => s.todos);
  const filter = useTodoStore((s) => s.filter);
  const sort = useTodoStore((s) => s.sort);
  return useMemo(() => deriveFilteredSorted(todos, filter, sort), [todos, filter, sort]);
}

export function useStats(): Stats {
  const todos = useTodoStore((s) => s.todos);
  return useMemo(() => deriveStats(todos), [todos]);
}

export function useAllCategories(): string[] {
  const todos = useTodoStore((s) => s.todos);
  return useMemo(() => {
    const set = new Set<string>();
    for (const t of todos) set.add(t.category);
    return [...set].sort();
  }, [todos]);
}

export function useStatusCounts(): Record<StatusFilter, number> {
  const todos = useTodoStore((s) => s.todos);
  return useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: todos.length,
      pending: 0,
      "in-progress": 0,
      completed: 0,
    };
    for (const t of todos) counts[t.status]++;
    return counts;
  }, [todos]);
}

export function useHasActiveFilters(): boolean {
  return useTodoStore((s) => {
    const f = s.filter;
    return Boolean(
      f.search.trim() ||
        f.status !== "all" ||
        f.categories.length > 0 ||
        f.priorities.length > 0,
    );
  });
}
