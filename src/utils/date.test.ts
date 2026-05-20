import { describe, expect, it } from "vitest";
import { formatDueDate, isOverdue, parseDueDate } from "./date";

const TODAY = new Date(2026, 4, 20); // 2026-05-20

describe("parseDueDate", () => {
  it("returns null for nullish input", () => {
    expect(parseDueDate(null)).toBeNull();
    expect(parseDueDate(undefined)).toBeNull();
    expect(parseDueDate("")).toBeNull();
  });

  it("returns Date for ISO string", () => {
    const d = parseDueDate("2026-05-22");
    expect(d).not.toBeNull();
    expect(d?.getFullYear()).toBe(2026);
  });

  it("returns null for invalid string", () => {
    expect(parseDueDate("not-a-date")).toBeNull();
  });
});

describe("isOverdue", () => {
  it("is false for completed regardless of date", () => {
    expect(isOverdue("2020-01-01", "completed", TODAY)).toBe(false);
  });

  it("is false when no due date", () => {
    expect(isOverdue(null, "pending", TODAY)).toBe(false);
  });

  it("is true for past pending", () => {
    expect(isOverdue("2026-05-19", "pending", TODAY)).toBe(true);
  });

  it("is false for today's pending", () => {
    expect(isOverdue("2026-05-20", "pending", TODAY)).toBe(false);
  });

  it("is false for future pending", () => {
    expect(isOverdue("2026-05-21", "in-progress", TODAY)).toBe(false);
  });
});

describe("formatDueDate", () => {
  it("handles missing due date", () => {
    const v = formatDueDate(null, "pending", TODAY);
    expect(v.tone).toBe("none");
    expect(v.formatted).toBe("未设置截止日期");
    expect(v.relative).toBeNull();
  });

  it("marks today", () => {
    const v = formatDueDate("2026-05-20", "pending", TODAY);
    expect(v.tone).toBe("today");
    expect(v.relative).toBe("今天到期");
    expect(v.formatted).toBe("2026.05.20");
  });

  it("marks tomorrow", () => {
    const v = formatDueDate("2026-05-21", "pending", TODAY);
    expect(v.tone).toBe("tomorrow");
    expect(v.relative).toBe("明天到期");
  });

  it("marks N days in the future", () => {
    const v = formatDueDate("2026-05-25", "pending", TODAY);
    expect(v.tone).toBe("future");
    expect(v.relative).toBe("5 天后");
  });

  it("marks overdue", () => {
    const v = formatDueDate("2026-05-18", "pending", TODAY);
    expect(v.tone).toBe("overdue");
    expect(v.relative).toBe("已逾期 2 天");
    expect(v.daysFromToday).toBe(-2);
  });

  it("completed does not become overdue", () => {
    const v = formatDueDate("2026-05-18", "completed", TODAY);
    expect(v.tone).toBe("none");
    expect(v.formatted).toContain("已完成");
  });
});
