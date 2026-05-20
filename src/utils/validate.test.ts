import { describe, expect, it } from "vitest";
import { validateEditTodo, validateNewTodo } from "./validate";

const baseInput = {
  title: "买牛奶",
  priority: "medium" as const,
  category: "生活",
};

describe("validateNewTodo", () => {
  it("accepts minimal valid input", () => {
    const r = validateNewTodo(baseInput);
    expect(r.ok).toBe(true);
  });

  it("rejects empty title", () => {
    const r = validateNewTodo({ ...baseInput, title: "   " });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.title).toBeDefined();
  });

  it("rejects oversized title", () => {
    const r = validateNewTodo({ ...baseInput, title: "x".repeat(201) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.title).toMatch(/200/);
  });

  it("rejects oversized description", () => {
    const r = validateNewTodo({ ...baseInput, description: "x".repeat(2001) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.description).toMatch(/2000/);
  });

  it("rejects empty category", () => {
    const r = validateNewTodo({ ...baseInput, category: "" });
    expect(r.ok).toBe(false);
  });

  it("rejects oversized category", () => {
    const r = validateNewTodo({ ...baseInput, category: "x".repeat(31) });
    expect(r.ok).toBe(false);
  });

  it("rejects invalid priority", () => {
    // @ts-expect-error testing invalid runtime value
    const r = validateNewTodo({ ...baseInput, priority: "super" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.priority).toBeDefined();
  });

  it("rejects invalid status", () => {
    // @ts-expect-error testing invalid runtime value
    const r = validateNewTodo({ ...baseInput, status: "done" });
    expect(r.ok).toBe(false);
  });

  it("rejects invalid due date", () => {
    const r = validateNewTodo({ ...baseInput, dueDate: "not-a-date" });
    expect(r.ok).toBe(false);
  });

  it("accepts null due date", () => {
    const r = validateNewTodo({ ...baseInput, dueDate: null });
    expect(r.ok).toBe(true);
  });
});

describe("validateEditTodo", () => {
  it("accepts empty patch", () => {
    expect(validateEditTodo({}).ok).toBe(true);
  });

  it("validates only provided fields", () => {
    const r = validateEditTodo({ title: "   " });
    expect(r.ok).toBe(false);
  });

  it("collects multiple errors", () => {
    const r = validateEditTodo({ title: "", category: "x".repeat(31) });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.errors).length).toBe(2);
    }
  });
});
