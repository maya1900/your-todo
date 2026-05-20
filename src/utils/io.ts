import { format } from "date-fns";
import {
  DEFAULT_FILTER,
  PRIORITIES,
  STATUSES,
  type Filter,
  type SortKey,
  type Todo,
} from "@/types/todo";

const EXPORT_FORMAT_VERSION = 1;

export interface ExportFile {
  app: "your-todo";
  formatVersion: number;
  exportedAt: string;
  todos: Todo[];
  filter?: Filter;
  sort?: SortKey;
}

export interface ImportPayload {
  todos: Todo[];
  filter?: Filter;
  sort?: SortKey;
}

export class ImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportError";
  }
}

export function buildExportData(input: {
  todos: Todo[];
  filter?: Filter;
  sort?: SortKey;
}): ExportFile {
  return {
    app: "your-todo",
    formatVersion: EXPORT_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    todos: input.todos,
    ...(input.filter ? { filter: input.filter } : {}),
    ...(input.sort ? { sort: input.sort } : {}),
  };
}

export function exportFileName(date: Date = new Date()): string {
  return `your-todo-export-${format(date, "yyyyMMdd")}.json`;
}

/**
 * Trigger a browser download of the given export data.
 * Has a small DOM-side effect: creates and revokes a Blob URL.
 */
export function exportToFile(input: {
  todos: Todo[];
  filter?: Filter;
  sort?: SortKey;
}): void {
  const data = buildExportData(input);
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = exportFileName();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}
function isOptionalString(v: unknown): v is string | null | undefined {
  return v == null || typeof v === "string";
}

function validateTodo(v: unknown): v is Todo {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    isString(o.id) &&
    isString(o.title) &&
    isString(o.description) &&
    isOptionalString(o.dueDate) &&
    isString(o.priority) &&
    (PRIORITIES as readonly string[]).includes(o.priority) &&
    isString(o.category) &&
    isString(o.status) &&
    (STATUSES as readonly string[]).includes(o.status) &&
    isString(o.createdAt) &&
    isString(o.updatedAt)
  );
}

export function parseImport(text: string): ImportPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ImportError("文件不是合法的 JSON");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new ImportError("文件结构不合法");
  }
  const obj = parsed as Record<string, unknown>;
  if (obj.app !== "your-todo") {
    throw new ImportError("文件来源不是 YOUR · TODO");
  }
  if (!Array.isArray(obj.todos)) {
    throw new ImportError("文件中缺少 todos 数组");
  }
  const validTodos: Todo[] = [];
  for (const t of obj.todos) {
    if (validateTodo(t)) validTodos.push(t as Todo);
  }
  if (validTodos.length === 0 && obj.todos.length > 0) {
    throw new ImportError("todos 数据全部不合法");
  }
  const payload: ImportPayload = { todos: validTodos };
  if (obj.filter && typeof obj.filter === "object") {
    payload.filter = { ...DEFAULT_FILTER, ...(obj.filter as Filter) };
  }
  if (typeof obj.sort === "string") {
    payload.sort = obj.sort as SortKey;
  }
  return payload;
}
