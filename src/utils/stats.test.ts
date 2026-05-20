import { describe, expect, it } from "vitest";
import type { Todo } from "@/types/todo";
import { deriveStats } from "./stats";

const TODAY = new Date(2026, 4, 20);

function todo(partial: Partial<Todo>): Todo {
  return {
    id: partial.id ?? Math.random().toString(36).slice(2),
    title: partial.title ?? "t",
    description: partial.description ?? "",
    dueDate: partial.dueDate ?? null,
    priority: partial.priority ?? "medium",
    category: partial.category ?? "工作",
    status: partial.status ?? "pending",
    createdAt: partial.createdAt ?? "2026-05-19T00:00:00.000Z",
    updatedAt: partial.updatedAt ?? "2026-05-19T00:00:00.000Z",
  };
}

describe("deriveStats", () => {
  it("handles empty list", () => {
    const s = deriveStats([], TODAY);
    expect(s.total).toBe(0);
    expect(s.active).toBe(0);
    expect(s.done).toBe(0);
    expect(s.rate).toBe(0);
    expect(s.overdue).toBe(0);
    expect(s.byPriority.every((p) => p.count === 0)).toBe(true);
    expect(s.byCategoryTop5).toEqual([]);
  });

  it("computes basic counts and rate", () => {
    const items = [
      todo({ status: "completed" }),
      todo({ status: "completed" }),
      todo({ status: "completed" }),
      todo({ status: "pending" }),
      todo({ status: "pending" }),
      todo({ status: "pending" }),
      todo({ status: "pending" }),
      todo({ status: "in-progress" }),
      todo({ status: "in-progress" }),
      todo({ status: "in-progress" }),
    ];
    const s = deriveStats(items, TODAY);
    expect(s.total).toBe(10);
    expect(s.done).toBe(3);
    expect(s.active).toBe(7);
    expect(s.rate).toBe(30);
  });

  it("100% complete", () => {
    const items = [todo({ status: "completed" }), todo({ status: "completed" })];
    expect(deriveStats(items, TODAY).rate).toBe(100);
  });

  it("counts overdue but not completed past", () => {
    const items = [
      todo({ status: "pending", dueDate: "2026-05-19" }), // overdue
      todo({ status: "completed", dueDate: "2026-05-19" }), // not overdue (done)
      todo({ status: "pending", dueDate: "2026-05-20" }), // today, not overdue
      todo({ status: "in-progress", dueDate: "2026-05-15" }), // overdue
    ];
    expect(deriveStats(items, TODAY).overdue).toBe(2);
  });

  it("groups by priority", () => {
    const items = [
      todo({ priority: "urgent" }),
      todo({ priority: "urgent" }),
      todo({ priority: "high" }),
      todo({ priority: "medium" }),
      todo({ priority: "medium" }),
      todo({ priority: "medium" }),
      todo({ priority: "low" }),
    ];
    const s = deriveStats(items, TODAY);
    const map = Object.fromEntries(s.byPriority.map((p) => [p.priority, p.count]));
    expect(map).toEqual({ urgent: 2, high: 1, medium: 3, low: 1 });
  });

  it("returns all categories when ≤ 5", () => {
    const items = [
      todo({ category: "工作" }),
      todo({ category: "工作" }),
      todo({ category: "生活" }),
      todo({ category: "学习" }),
    ];
    const s = deriveStats(items, TODAY);
    expect(s.byCategoryTop5.length).toBe(3);
    expect(s.byCategoryTop5[0]?.category).toBe("工作");
    expect(s.byCategoryTop5.some((c) => c.category === "其他")).toBe(false);
  });

  it("collapses tail to 其他 when > 5", () => {
    const cats = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const items: Todo[] = [];
    cats.forEach((c, idx) => {
      for (let i = 0; i < cats.length - idx; i++) {
        items.push(todo({ category: c }));
      }
    });
    const s = deriveStats(items, TODAY);
    expect(s.byCategoryTop5.length).toBe(6);
    const other = s.byCategoryTop5.find((c) => c.category === "其他");
    expect(other).toBeDefined();
    // 'f' had 3, 'g' had 2, 'h' had 1 → other = 6
    expect(other?.count).toBe(6);
  });
});
