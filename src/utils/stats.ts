import { startOfToday } from "date-fns";
import { PRIORITIES, type Priority, type Todo } from "@/types/todo";
import { isOverdue } from "./date";

export interface PriorityCount {
  priority: Priority;
  count: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface Stats {
  total: number;
  active: number; // pending + in-progress
  done: number;
  rate: number; // 0..100, one decimal
  overdue: number;
  byPriority: PriorityCount[];
  byCategoryTop5: CategoryCount[]; // up to 5, plus an "其他" bucket if more
}

const TOP_N = 5;

function roundRate(done: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((done / total) * 1000) / 10;
}

export function deriveStats(todos: Todo[], today: Date = startOfToday()): Stats {
  let active = 0;
  let done = 0;
  let overdue = 0;
  const byPriorityMap: Record<Priority, number> = {
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0,
  };
  const byCategoryMap = new Map<string, number>();

  for (const t of todos) {
    if (t.status === "completed") done++;
    else active++;
    if (isOverdue(t.dueDate, t.status, today)) overdue++;
    byPriorityMap[t.priority]++;
    byCategoryMap.set(t.category, (byCategoryMap.get(t.category) ?? 0) + 1);
  }

  const total = todos.length;
  const byPriority: PriorityCount[] = PRIORITIES.map((p) => ({
    priority: p,
    count: byPriorityMap[p],
  }));

  // Sort categories desc, then take Top N + collapse rest into "其他"
  const sorted: CategoryCount[] = [...byCategoryMap.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));

  let byCategoryTop5: CategoryCount[];
  if (sorted.length <= TOP_N) {
    byCategoryTop5 = sorted;
  } else {
    const top = sorted.slice(0, TOP_N);
    const restCount = sorted.slice(TOP_N).reduce((sum, c) => sum + c.count, 0);
    byCategoryTop5 = [...top, { category: "其他", count: restCount }];
  }

  return {
    total,
    active,
    done,
    rate: roundRate(done, total),
    overdue,
    byPriority,
    byCategoryTop5,
  };
}
