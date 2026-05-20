import {
  PRIORITIES,
  STATUSES,
  type EditableTodoFields,
  type NewTodoInput,
  type Priority,
  type Status,
} from "@/types/todo";

export interface ValidationOk {
  ok: true;
}
export interface ValidationFail {
  ok: false;
  errors: Record<string, string>;
}
export type ValidationResult = ValidationOk | ValidationFail;

const TITLE_MIN = 1;
const TITLE_MAX = 200;
const DESC_MAX = 2000;
const CAT_MIN = 1;
const CAT_MAX = 30;

function isPriority(v: unknown): v is Priority {
  return typeof v === "string" && (PRIORITIES as readonly string[]).includes(v);
}
function isStatus(v: unknown): v is Status {
  return typeof v === "string" && (STATUSES as readonly string[]).includes(v);
}

function isValidIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}/.test(s)) return false;
  const t = Date.parse(s);
  return Number.isFinite(t);
}

function validateTitle(title: string | undefined, errors: Record<string, string>): void {
  const trimmed = (title ?? "").trim();
  if (trimmed.length < TITLE_MIN) {
    errors.title = "标题不能为空";
  } else if (trimmed.length > TITLE_MAX) {
    errors.title = `标题不能超过 ${TITLE_MAX} 字符`;
  }
}

function validateDescription(d: string | undefined, errors: Record<string, string>): void {
  if (d && d.length > DESC_MAX) {
    errors.description = `描述不能超过 ${DESC_MAX} 字符`;
  }
}

function validateCategory(c: string | undefined, errors: Record<string, string>): void {
  const trimmed = (c ?? "").trim();
  if (trimmed.length < CAT_MIN) {
    errors.category = "分类不能为空";
  } else if (trimmed.length > CAT_MAX) {
    errors.category = `分类不能超过 ${CAT_MAX} 字符`;
  }
}

function validateDueDate(d: string | null | undefined, errors: Record<string, string>): void {
  if (d == null || d === "") return;
  if (!isValidIsoDate(d)) {
    errors.dueDate = "截止日期格式不合法";
  }
}

function validatePriority(p: unknown, errors: Record<string, string>): void {
  if (!isPriority(p)) errors.priority = "优先级取值不合法";
}

function validateStatus(s: unknown, errors: Record<string, string>): void {
  if (s !== undefined && !isStatus(s)) errors.status = "状态取值不合法";
}

export function validateNewTodo(input: NewTodoInput): ValidationResult {
  const errors: Record<string, string> = {};
  validateTitle(input.title, errors);
  validateDescription(input.description, errors);
  validateCategory(input.category, errors);
  validateDueDate(input.dueDate, errors);
  validatePriority(input.priority, errors);
  validateStatus(input.status, errors);
  return Object.keys(errors).length === 0 ? { ok: true } : { ok: false, errors };
}

export function validateEditTodo(patch: Partial<EditableTodoFields>): ValidationResult {
  const errors: Record<string, string> = {};
  if (patch.title !== undefined) validateTitle(patch.title, errors);
  if (patch.description !== undefined) validateDescription(patch.description, errors);
  if (patch.category !== undefined) validateCategory(patch.category, errors);
  if (patch.dueDate !== undefined) validateDueDate(patch.dueDate, errors);
  if (patch.priority !== undefined) validatePriority(patch.priority, errors);
  if (patch.status !== undefined) validateStatus(patch.status, errors);
  return Object.keys(errors).length === 0 ? { ok: true } : { ok: false, errors };
}
