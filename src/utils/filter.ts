import {
  PRIORITY_WEIGHT,
  type Filter,
  type Priority,
  type SortKey,
  type Todo,
} from "@/types/todo";

function matchesSearch(todo: Todo, term: string): boolean {
  if (!term) return true;
  const q = term.toLowerCase();
  return (
    todo.title.toLowerCase().includes(q) ||
    todo.description.toLowerCase().includes(q)
  );
}

function matchesStatus(todo: Todo, filter: Filter["status"]): boolean {
  if (filter === "all") return true;
  return todo.status === filter;
}

function matchesCategory(todo: Todo, categories: string[]): boolean {
  if (categories.length === 0) return true;
  return categories.includes(todo.category);
}

function matchesPriority(todo: Todo, priorities: Priority[]): boolean {
  if (priorities.length === 0) return true;
  return priorities.includes(todo.priority);
}

function compareTodos(a: Todo, b: Todo, sort: SortKey): number {
  switch (sort) {
    case "createdAt-desc":
      return b.createdAt.localeCompare(a.createdAt);
    case "updatedAt-desc":
      return b.updatedAt.localeCompare(a.updatedAt);
    case "priority-desc":
      return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    case "dueDate-asc": {
      const ad = a.dueDate;
      const bd = b.dueDate;
      if (!ad && !bd) return 0;
      if (!ad) return 1;
      if (!bd) return -1;
      return ad.localeCompare(bd);
    }
  }
}

export function deriveFilteredSorted(
  todos: Todo[],
  filter: Filter,
  sort: SortKey,
): Todo[] {
  const search = filter.search.trim();
  const filtered = todos.filter(
    (t) =>
      matchesSearch(t, search) &&
      matchesStatus(t, filter.status) &&
      matchesCategory(t, filter.categories) &&
      matchesPriority(t, filter.priorities),
  );
  // Stable sort: filtered.toSorted is unavailable in Node 18 baseline, use [...].sort
  return [...filtered].sort((a, b) => compareTodos(a, b, sort));
}
