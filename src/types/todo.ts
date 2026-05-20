export type Priority = "low" | "medium" | "high" | "urgent";
export const PRIORITIES: readonly Priority[] = ["low", "medium", "high", "urgent"] as const;

export type Status = "pending" | "in-progress" | "completed";
export const STATUSES: readonly Status[] = ["pending", "in-progress", "completed"] as const;

export interface Todo {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: Priority;
  category: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export type EditableTodoFields = Pick<
  Todo,
  "title" | "description" | "dueDate" | "priority" | "category" | "status"
>;

export interface NewTodoInput {
  title: string;
  description?: string;
  dueDate?: string | null;
  priority: Priority;
  category: string;
  status?: Status;
}

export type StatusFilter = "all" | Status;
export const STATUS_FILTERS: readonly StatusFilter[] = [
  "all",
  "pending",
  "in-progress",
  "completed",
] as const;

export interface Filter {
  search: string;
  status: StatusFilter;
  categories: string[];
  priorities: Priority[];
}

export const DEFAULT_FILTER: Filter = {
  search: "",
  status: "all",
  categories: [],
  priorities: [],
};

export type SortKey =
  | "createdAt-desc"
  | "updatedAt-desc"
  | "dueDate-asc"
  | "priority-desc";

export const SORT_KEYS: readonly SortKey[] = [
  "createdAt-desc",
  "updatedAt-desc",
  "dueDate-asc",
  "priority-desc",
] as const;

export const PRIORITY_LABEL_ZH: Record<Priority, string> = {
  low: "低",
  medium: "中",
  high: "高",
  urgent: "紧急",
};

export const PRIORITY_LABEL_EN: Record<Priority, string> = {
  low: "LOW",
  medium: "MED",
  high: "HIGH",
  urgent: "URGENT",
};

export const STATUS_LABEL_ZH: Record<Status, string> = {
  pending: "待办",
  "in-progress": "进行中",
  completed: "已完成",
};

export const STATUS_FILTER_LABEL_ZH: Record<StatusFilter, string> = {
  all: "全部",
  ...STATUS_LABEL_ZH,
};

export const SORT_LABEL_ZH: Record<SortKey, string> = {
  "createdAt-desc": "最近创建",
  "updatedAt-desc": "最近更新",
  "dueDate-asc": "截止日期",
  "priority-desc": "优先级降序",
};

export const PRIORITY_WEIGHT: Record<Priority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};
