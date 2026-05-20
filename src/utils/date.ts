import { differenceInCalendarDays, format, isValid, parseISO, startOfToday } from "date-fns";
import type { Status } from "@/types/todo";

const DATE_FORMAT = "yyyy.MM.dd";

export function parseDueDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = parseISO(iso);
  return isValid(d) ? d : null;
}

export function formatDate(date: Date): string {
  return format(date, DATE_FORMAT);
}

export interface DueDateView {
  formatted: string;
  relative: string | null;
  tone: "overdue" | "today" | "tomorrow" | "future" | "none";
  daysFromToday: number | null;
}

/**
 * Compute a presentation-friendly view of the due date,
 * relative to a given `today` (defaults to `startOfToday()`).
 */
export function formatDueDate(
  iso: string | null | undefined,
  status: Status,
  today: Date = startOfToday(),
): DueDateView {
  const date = parseDueDate(iso);
  if (!date) {
    return { formatted: "未设置截止日期", relative: null, tone: "none", daysFromToday: null };
  }
  const days = differenceInCalendarDays(date, today);
  const formatted = formatDate(date);

  if (status === "completed") {
    return { formatted: `已完成 · ${formatted}`, relative: null, tone: "none", daysFromToday: days };
  }
  if (days < 0) {
    return {
      formatted,
      relative: `已逾期 ${-days} 天`,
      tone: "overdue",
      daysFromToday: days,
    };
  }
  if (days === 0) {
    return { formatted, relative: "今天到期", tone: "today", daysFromToday: 0 };
  }
  if (days === 1) {
    return { formatted, relative: "明天到期", tone: "tomorrow", daysFromToday: 1 };
  }
  return { formatted, relative: `${days} 天后`, tone: "future", daysFromToday: days };
}

export function isOverdue(
  iso: string | null | undefined,
  status: Status,
  today: Date = startOfToday(),
): boolean {
  if (status === "completed") return false;
  const date = parseDueDate(iso);
  if (!date) return false;
  return differenceInCalendarDays(date, today) < 0;
}

export function nowIso(): string {
  return new Date().toISOString();
}
