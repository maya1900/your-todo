import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import {
  DEFAULT_FILTER,
  type EditableTodoFields,
  type Filter,
  type NewTodoInput,
  type Priority,
  type SortKey,
  type Status,
  type StatusFilter,
  type Todo,
} from "@/types/todo";
import { newId } from "@/utils/id";
import { nowIso } from "@/utils/date";
import { validateEditTodo, validateNewTodo, type ValidationResult } from "@/utils/validate";
import { makeSafeStorage, STORAGE_KEY } from "./storage";

/* ---------- UI slice ---------- */

export interface UiState {
  drawer: { open: true; mode: "create" | "edit"; editingId: string | null } | { open: false };
  confirmDelete: { open: true; id: string; title: string } | { open: false };
  // remember which element opened a drawer/dialog so we can restore focus
  lastTrigger: HTMLElement | null;
}

/* ---------- Store ---------- */

export interface TodoStoreState {
  /** persisted */
  todos: Todo[];
  filter: Filter;
  sort: SortKey;

  /** ephemeral UI state */
  ui: UiState;

  /** actions: data */
  addTodo: (input: NewTodoInput) => ValidationResult & { id?: string };
  updateTodo: (id: string, patch: Partial<EditableTodoFields>) => ValidationResult;
  deleteTodo: (id: string) => void;
  toggleStatus: (id: string, next?: Status) => void;

  /** actions: filter/sort */
  setSearch: (q: string) => void;
  setStatusFilter: (s: StatusFilter) => void;
  setCategories: (cats: string[]) => void;
  setPriorities: (prios: Priority[]) => void;
  setSort: (s: SortKey) => void;
  clearFilters: () => void;

  /** import */
  importAll: (next: { todos: Todo[]; filter?: Filter; sort?: SortKey }) => void;

  /** ui actions */
  openCreate: (trigger?: HTMLElement | null) => void;
  openEdit: (id: string, trigger?: HTMLElement | null) => void;
  closeDrawer: () => void;
  openConfirmDelete: (id: string, trigger?: HTMLElement | null) => void;
  closeConfirm: () => void;
}

type PersistedSlice = Pick<TodoStoreState, "todos" | "filter" | "sort">;

const initialUi: UiState = {
  drawer: { open: false },
  confirmDelete: { open: false },
  lastTrigger: null,
};

export const useTodoStore = create<TodoStoreState>()(
  persist(
    (set, get) => ({
      todos: [],
      filter: DEFAULT_FILTER,
      sort: "createdAt-desc",
      ui: initialUi,

      addTodo: (input) => {
        const result = validateNewTodo(input);
        if (!result.ok) return result;
        const now = nowIso();
        const todo: Todo = {
          id: newId(),
          title: input.title.trim(),
          description: (input.description ?? "").trim(),
          dueDate: input.dueDate?.length ? input.dueDate : null,
          priority: input.priority,
          category: input.category.trim(),
          status: input.status ?? "pending",
          createdAt: now,
          updatedAt: now,
        };
        const snapshot = get().todos;
        try {
          set({ todos: [todo, ...snapshot] });
        } catch {
          // persistence threw (e.g. quota) — roll back state in memory
          try {
            set({ todos: snapshot });
          } catch {
            // rollback also threw at the persistence layer; in-memory state is correct
          }
          return { ok: false, errors: { _root: "本地存储空间已满，请清理后重试" } };
        }
        return { ok: true, id: todo.id };
      },

      updateTodo: (id, patch) => {
        const result = validateEditTodo(patch);
        if (!result.ok) return result;
        const snapshot = get().todos;
        const next = snapshot.map((t) => {
          if (t.id !== id) return t;
          const merged: Todo = {
            ...t,
            ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
            ...(patch.description !== undefined
              ? { description: patch.description.trim() }
              : {}),
            ...(patch.dueDate !== undefined
              ? { dueDate: patch.dueDate?.length ? patch.dueDate : null }
              : {}),
            ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
            ...(patch.category !== undefined
              ? { category: patch.category.trim() }
              : {}),
            ...(patch.status !== undefined ? { status: patch.status } : {}),
            updatedAt: nowIso(),
          };
          return merged;
        });
        try {
          set({ todos: next });
        } catch {
          try {
            set({ todos: snapshot });
          } catch {
            // ignored
          }
          return { ok: false, errors: { _root: "本地存储空间已满，请清理后重试" } };
        }
        return { ok: true };
      },

      deleteTodo: (id) => {
        const snapshot = get().todos;
        try {
          set({ todos: snapshot.filter((t) => t.id !== id) });
        } catch {
          try {
            set({ todos: snapshot });
          } catch {
            // ignored
          }
        }
      },

      toggleStatus: (id, next) => {
        set((s) => ({
          todos: s.todos.map((t) => {
            if (t.id !== id) return t;
            let nextStatus: Status;
            if (next) {
              nextStatus = next;
            } else if (t.status === "completed") {
              nextStatus = "pending";
            } else {
              nextStatus = "completed";
            }
            return { ...t, status: nextStatus, updatedAt: nowIso() };
          }),
        }));
      },

      setSearch: (q) => set((s) => ({ filter: { ...s.filter, search: q } })),
      setStatusFilter: (status) => set((s) => ({ filter: { ...s.filter, status } })),
      setCategories: (categories) =>
        set((s) => ({ filter: { ...s.filter, categories } })),
      setPriorities: (priorities) =>
        set((s) => ({ filter: { ...s.filter, priorities } })),
      setSort: (sort) => set({ sort }),
      clearFilters: () => set({ filter: { ...DEFAULT_FILTER } }),

      importAll: (next) =>
        set({
          todos: next.todos,
          filter: next.filter ?? DEFAULT_FILTER,
          sort: next.sort ?? "createdAt-desc",
        }),

      openCreate: (trigger = null) =>
        set((s) => ({
          ui: {
            ...s.ui,
            drawer: { open: true, mode: "create", editingId: null },
            lastTrigger: trigger,
          },
        })),
      openEdit: (id, trigger = null) =>
        set((s) => ({
          ui: {
            ...s.ui,
            drawer: { open: true, mode: "edit", editingId: id },
            lastTrigger: trigger,
          },
        })),
      closeDrawer: () =>
        set((s) => ({ ui: { ...s.ui, drawer: { open: false } } })),
      openConfirmDelete: (id, trigger = null) => {
        const t = get().todos.find((x) => x.id === id);
        if (!t) return;
        set((s) => ({
          ui: {
            ...s.ui,
            confirmDelete: { open: true, id, title: t.title },
            lastTrigger: trigger,
          },
        }));
      },
      closeConfirm: () =>
        set((s) => ({ ui: { ...s.ui, confirmDelete: { open: false } } })),
    }),
    {
      name: STORAGE_KEY,
      storage: makeSafeStorage<PersistedSlice>(),
      version: 1,
      partialize: (state): PersistedSlice => ({
        todos: state.todos,
        filter: state.filter,
        sort: state.sort,
      }),
      migrate: (persistedState, _fromVersion) => {
        // No migrations needed for v1; reserve hook for future versions.
        return persistedState as TodoStoreState;
      },
    },
  ),
);

/* ---------- Selector hooks ---------- */

export const useDrawerState = (): UiState["drawer"] =>
  useTodoStore((s) => s.ui.drawer);

export const useConfirmDeleteState = (): UiState["confirmDelete"] =>
  useTodoStore((s) => s.ui.confirmDelete);

export const useEditingTodo = (): Todo | null =>
  useTodoStore(
    useShallow((s) => {
      if (!s.ui.drawer.open || s.ui.drawer.mode !== "edit") return null;
      const id = s.ui.drawer.editingId;
      if (!id) return null;
      return s.todos.find((t) => t.id === id) ?? null;
    }),
  );
