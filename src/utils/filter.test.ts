import { describe, expect, it } from "vitest";
import { DEFAULT_FILTER, type Todo } from "@/types/todo";
import { deriveFilteredSorted } from "./filter";

function todo(partial: Partial<Todo>): Todo {
  return {
    id: partial.id ?? "x",
    title: partial.title ?? "title",
    description: partial.description ?? "",
    dueDate: partial.dueDate ?? null,
    priority: partial.priority ?? "medium",
    category: partial.category ?? "工作",
    status: partial.status ?? "pending",
    createdAt: partial.createdAt ?? "2026-05-19T10:00:00.000Z",
    updatedAt: partial.updatedAt ?? "2026-05-19T10:00:00.000Z",
  };
}

const items: Todo[] = [
  todo({
    id: "1",
    title: "完成 Q3 报告",
    description: "财务汇总",
    priority: "urgent",
    category: "工作",
    status: "in-progress",
    dueDate: "2026-05-22",
    createdAt: "2026-05-19T10:00:00.000Z",
  }),
  todo({
    id: "2",
    title: "买牛奶",
    description: "顺路买面包",
    priority: "low",
    category: "生活",
    status: "pending",
    dueDate: "2026-05-25",
    createdAt: "2026-05-18T10:00:00.000Z",
  }),
  todo({
    id: "3",
    title: "Review PR #1234",
    description: "代码评审",
    priority: "high",
    category: "工作",
    status: "completed",
    dueDate: null,
    createdAt: "2026-05-17T10:00:00.000Z",
  }),
  todo({
    id: "4",
    title: "周末复盘",
    description: "记录三件事",
    priority: "medium",
    category: "学习",
    status: "pending",
    dueDate: "2026-05-20",
    createdAt: "2026-05-16T10:00:00.000Z",
  }),
];

describe("deriveFilteredSorted", () => {
  it("returns all with empty filter, sorted by createdAt desc", () => {
    const r = deriveFilteredSorted(items, DEFAULT_FILTER, "createdAt-desc");
    expect(r.map((t) => t.id)).toEqual(["1", "2", "3", "4"]);
  });

  it("filters by search (case-insensitive, title)", () => {
    const r = deriveFilteredSorted(
      items,
      { ...DEFAULT_FILTER, search: "REVIEW" },
      "createdAt-desc",
    );
    expect(r.map((t) => t.id)).toEqual(["3"]);
  });

  it("filters by search (description)", () => {
    const r = deriveFilteredSorted(
      items,
      { ...DEFAULT_FILTER, search: "面包" },
      "createdAt-desc",
    );
    expect(r.map((t) => t.id)).toEqual(["2"]);
  });

  it("filters by status", () => {
    const r = deriveFilteredSorted(
      items,
      { ...DEFAULT_FILTER, status: "completed" },
      "createdAt-desc",
    );
    expect(r.map((t) => t.id)).toEqual(["3"]);
  });

  it("filters by categories", () => {
    const r = deriveFilteredSorted(
      items,
      { ...DEFAULT_FILTER, categories: ["生活"] },
      "createdAt-desc",
    );
    expect(r.map((t) => t.id)).toEqual(["2"]);
  });

  it("filters by priorities (multiple)", () => {
    const r = deriveFilteredSorted(
      items,
      { ...DEFAULT_FILTER, priorities: ["urgent", "high"] },
      "createdAt-desc",
    );
    expect(r.map((t) => t.id).sort()).toEqual(["1", "3"]);
  });

  it("combines filters with AND", () => {
    const r = deriveFilteredSorted(
      items,
      { ...DEFAULT_FILTER, categories: ["工作"], status: "in-progress" },
      "createdAt-desc",
    );
    expect(r.map((t) => t.id)).toEqual(["1"]);
  });

  it("returns empty when nothing matches", () => {
    const r = deriveFilteredSorted(
      items,
      { ...DEFAULT_FILTER, search: "不存在的关键字" },
      "createdAt-desc",
    );
    expect(r).toEqual([]);
  });

  it("sorts by priority-desc", () => {
    const r = deriveFilteredSorted(items, DEFAULT_FILTER, "priority-desc");
    expect(r.map((t) => t.priority)).toEqual(["urgent", "high", "medium", "low"]);
  });

  it("sorts by dueDate-asc, null at end", () => {
    const r = deriveFilteredSorted(items, DEFAULT_FILTER, "dueDate-asc");
    expect(r.map((t) => t.id)).toEqual(["4", "1", "2", "3"]);
  });

  it("sorts by updatedAt-desc", () => {
    const data = [
      todo({ id: "a", updatedAt: "2026-05-10T00:00:00.000Z" }),
      todo({ id: "b", updatedAt: "2026-05-19T00:00:00.000Z" }),
      todo({ id: "c", updatedAt: "2026-05-15T00:00:00.000Z" }),
    ];
    const r = deriveFilteredSorted(data, DEFAULT_FILTER, "updatedAt-desc");
    expect(r.map((t) => t.id)).toEqual(["b", "c", "a"]);
  });
});
