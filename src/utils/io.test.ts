import { describe, expect, it } from "vitest";
import { buildExportData, exportFileName, ImportError, parseImport } from "./io";
import type { Todo } from "@/types/todo";

const sampleTodo: Todo = {
  id: "1",
  title: "买牛奶",
  description: "",
  dueDate: null,
  priority: "medium",
  category: "生活",
  status: "pending",
  createdAt: "2026-05-19T00:00:00.000Z",
  updatedAt: "2026-05-19T00:00:00.000Z",
};

describe("buildExportData / exportFileName", () => {
  it("wraps with header fields", () => {
    const out = buildExportData({ todos: [sampleTodo] });
    expect(out.app).toBe("your-todo");
    expect(out.formatVersion).toBe(1);
    expect(out.todos).toEqual([sampleTodo]);
    expect(typeof out.exportedAt).toBe("string");
  });

  it("file name follows yyyyMMdd", () => {
    const n = exportFileName(new Date(2026, 4, 20));
    expect(n).toBe("your-todo-export-20260520.json");
  });
});

describe("parseImport", () => {
  it("parses valid export file", () => {
    const text = JSON.stringify(buildExportData({ todos: [sampleTodo] }));
    const p = parseImport(text);
    expect(p.todos).toEqual([sampleTodo]);
  });

  it("rejects non-JSON", () => {
    expect(() => parseImport("not json")).toThrow(ImportError);
  });

  it("rejects wrong app marker", () => {
    const text = JSON.stringify({ app: "other", todos: [] });
    expect(() => parseImport(text)).toThrow(ImportError);
  });

  it("rejects missing todos array", () => {
    const text = JSON.stringify({ app: "your-todo" });
    expect(() => parseImport(text)).toThrow(ImportError);
  });

  it("skips invalid todos but keeps valid ones", () => {
    const text = JSON.stringify({
      app: "your-todo",
      todos: [sampleTodo, { id: 1, title: 2 }],
    });
    const p = parseImport(text);
    expect(p.todos.length).toBe(1);
  });

  it("throws if all todos are invalid", () => {
    const text = JSON.stringify({
      app: "your-todo",
      todos: [{ no: "good" }],
    });
    expect(() => parseImport(text)).toThrow(ImportError);
  });

  it("accepts empty todos as legal export", () => {
    const text = JSON.stringify({ app: "your-todo", todos: [] });
    const p = parseImport(text);
    expect(p.todos).toEqual([]);
  });
});
