import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_FILTER } from "@/types/todo";
import { BACKUP_KEY, STORAGE_KEY } from "./storage";
import { useTodoStore } from "./useTodoStore";

function reset() {
  localStorage.clear();
  useTodoStore.setState({
    todos: [],
    filter: { ...DEFAULT_FILTER },
    sort: "createdAt-desc",
    ui: {
      drawer: { open: false },
      confirmDelete: { open: false },
      lastTrigger: null,
    },
  });
}

beforeEach(() => {
  reset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useTodoStore — addTodo", () => {
  it("creates a todo with defaults", () => {
    const r = useTodoStore.getState().addTodo({
      title: "买牛奶",
      priority: "medium",
      category: "生活",
    });
    expect(r.ok).toBe(true);
    const todos = useTodoStore.getState().todos;
    expect(todos).toHaveLength(1);
    expect(todos[0]?.title).toBe("买牛奶");
    expect(todos[0]?.status).toBe("pending");
    expect(todos[0]?.description).toBe("");
    expect(todos[0]?.dueDate).toBeNull();
    expect(todos[0]?.createdAt).toBe(todos[0]?.updatedAt);
  });

  it("rejects invalid title", () => {
    const r = useTodoStore.getState().addTodo({
      title: "  ",
      priority: "medium",
      category: "生活",
    });
    expect(r.ok).toBe(false);
    expect(useTodoStore.getState().todos).toHaveLength(0);
  });

  it("persists to localStorage", () => {
    useTodoStore.getState().addTodo({
      title: "T",
      priority: "low",
      category: "c",
    });
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.state.todos).toHaveLength(1);
    expect(parsed.version).toBe(1);
  });
});

describe("useTodoStore — updateTodo", () => {
  it("updates fields and refreshes updatedAt", async () => {
    useTodoStore.getState().addTodo({
      title: "原标题",
      priority: "low",
      category: "工作",
    });
    const id = useTodoStore.getState().todos[0]!.id;
    const before = useTodoStore.getState().todos[0]!.updatedAt;
    await new Promise((r) => setTimeout(r, 5));
    const r = useTodoStore.getState().updateTodo(id, { title: "新标题", priority: "urgent" });
    expect(r.ok).toBe(true);
    const t = useTodoStore.getState().todos[0]!;
    expect(t.title).toBe("新标题");
    expect(t.priority).toBe("urgent");
    expect(t.updatedAt > before).toBe(true);
  });

  it("rejects invalid patch", () => {
    useTodoStore.getState().addTodo({
      title: "T",
      priority: "low",
      category: "c",
    });
    const id = useTodoStore.getState().todos[0]!.id;
    const r = useTodoStore.getState().updateTodo(id, { title: "  " });
    expect(r.ok).toBe(false);
    expect(useTodoStore.getState().todos[0]!.title).toBe("T");
  });
});

describe("useTodoStore — deleteTodo", () => {
  it("removes the matching item", () => {
    useTodoStore.getState().addTodo({ title: "A", priority: "low", category: "c" });
    useTodoStore.getState().addTodo({ title: "B", priority: "low", category: "c" });
    const idA = useTodoStore.getState().todos[1]!.id; // last added is at index 0
    expect(useTodoStore.getState().todos.length).toBe(2);
    useTodoStore.getState().deleteTodo(idA);
    expect(useTodoStore.getState().todos.length).toBe(1);
    expect(useTodoStore.getState().todos[0]?.title).toBe("B");
  });
});

describe("useTodoStore — toggleStatus", () => {
  it("pending → completed and back", () => {
    useTodoStore.getState().addTodo({ title: "A", priority: "low", category: "c" });
    const id = useTodoStore.getState().todos[0]!.id;
    useTodoStore.getState().toggleStatus(id);
    expect(useTodoStore.getState().todos[0]?.status).toBe("completed");
    useTodoStore.getState().toggleStatus(id);
    expect(useTodoStore.getState().todos[0]?.status).toBe("pending");
  });

  it("explicit next overrides default", () => {
    useTodoStore.getState().addTodo({ title: "A", priority: "low", category: "c" });
    const id = useTodoStore.getState().todos[0]!.id;
    useTodoStore.getState().toggleStatus(id, "in-progress");
    expect(useTodoStore.getState().todos[0]?.status).toBe("in-progress");
  });
});

describe("useTodoStore — filter & sort", () => {
  it("setSearch updates filter", () => {
    useTodoStore.getState().setSearch("hello");
    expect(useTodoStore.getState().filter.search).toBe("hello");
  });
  it("setStatusFilter updates filter", () => {
    useTodoStore.getState().setStatusFilter("completed");
    expect(useTodoStore.getState().filter.status).toBe("completed");
  });
  it("setCategories updates filter", () => {
    useTodoStore.getState().setCategories(["工作", "学习"]);
    expect(useTodoStore.getState().filter.categories).toEqual(["工作", "学习"]);
  });
  it("setPriorities updates filter", () => {
    useTodoStore.getState().setPriorities(["urgent"]);
    expect(useTodoStore.getState().filter.priorities).toEqual(["urgent"]);
  });
  it("setSort updates sort", () => {
    useTodoStore.getState().setSort("priority-desc");
    expect(useTodoStore.getState().sort).toBe("priority-desc");
  });
  it("clearFilters resets all", () => {
    useTodoStore.getState().setSearch("x");
    useTodoStore.getState().setStatusFilter("pending");
    useTodoStore.getState().setCategories(["a"]);
    useTodoStore.getState().setPriorities(["high"]);
    useTodoStore.getState().clearFilters();
    expect(useTodoStore.getState().filter).toEqual(DEFAULT_FILTER);
  });
});

describe("useTodoStore — importAll", () => {
  it("replaces todos", () => {
    useTodoStore.getState().addTodo({ title: "old", priority: "low", category: "c" });
    useTodoStore.getState().importAll({
      todos: [
        {
          id: "x1",
          title: "imp",
          description: "",
          dueDate: null,
          priority: "high",
          category: "工作",
          status: "pending",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });
    const todos = useTodoStore.getState().todos;
    expect(todos.length).toBe(1);
    expect(todos[0]?.id).toBe("x1");
  });
});

describe("useTodoStore — UI slice", () => {
  it("openCreate / closeDrawer", () => {
    useTodoStore.getState().openCreate(null);
    const d = useTodoStore.getState().ui.drawer;
    expect(d.open).toBe(true);
    if (d.open) expect(d.mode).toBe("create");
    useTodoStore.getState().closeDrawer();
    expect(useTodoStore.getState().ui.drawer.open).toBe(false);
  });

  it("openEdit sets editingId", () => {
    useTodoStore.getState().addTodo({ title: "A", priority: "low", category: "c" });
    const id = useTodoStore.getState().todos[0]!.id;
    useTodoStore.getState().openEdit(id);
    const d = useTodoStore.getState().ui.drawer;
    if (d.open && d.mode === "edit") {
      expect(d.editingId).toBe(id);
    } else {
      throw new Error("drawer should be open in edit mode");
    }
  });

  it("openConfirmDelete captures id and title", () => {
    useTodoStore.getState().addTodo({ title: "A", priority: "low", category: "c" });
    const id = useTodoStore.getState().todos[0]!.id;
    useTodoStore.getState().openConfirmDelete(id);
    const c = useTodoStore.getState().ui.confirmDelete;
    expect(c.open).toBe(true);
    if (c.open) {
      expect(c.id).toBe(id);
      expect(c.title).toBe("A");
    }
  });
});

describe("useTodoStore — QuotaExceededError handling", () => {
  it("rolls back add when localStorage.setItem throws QuotaExceededError", () => {
    // First add to satisfy any baseline
    useTodoStore.getState().addTodo({ title: "seed", priority: "low", category: "c" });
    // Now stub setItem to throw
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      const err = new DOMException("quota", "QuotaExceededError");
      throw err;
    });
    const before = useTodoStore.getState().todos.length;
    const r = useTodoStore.getState().addTodo({ title: "boom", priority: "low", category: "c" });
    // store catches inside addTodo and rolls back
    expect(r.ok).toBe(false);
    expect(useTodoStore.getState().todos.length).toBe(before);
    spy.mockRestore();
  });
});

describe("safeStorage — corrupted JSON", () => {
  it("backs up corrupted value and rehydrates with empty state", async () => {
    localStorage.setItem(STORAGE_KEY, "{not valid json");
    // Trigger rehydrate by importing freshly via the persist API.
    // Easiest: call persist.rehydrate() through useTodoStore.persist
    const p = useTodoStore.persist;
    await p.rehydrate();
    expect(localStorage.getItem(BACKUP_KEY)).toBe("{not valid json");
    expect(useTodoStore.getState().todos).toEqual([]);
  });
});
