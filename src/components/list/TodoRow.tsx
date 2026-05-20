import { useTodoStore } from "@/store/useTodoStore";
import { IconButton } from "@/components/ui/IconButton";
import { CategoryTag } from "./CategoryTag";
import { DueDateLabel } from "./DueDateLabel";
import { PriorityTag } from "./PriorityTag";
import { StatusCheckbox } from "./StatusCheckbox";
import type { Todo } from "@/types/todo";

export interface TodoRowProps {
  todo: Todo;
  index: number;
}

export function TodoRow({ todo, index }: TodoRowProps) {
  const toggleStatus = useTodoStore((s) => s.toggleStatus);
  const openEdit = useTodoStore((s) => s.openEdit);
  const openConfirmDelete = useTodoStore((s) => s.openConfirmDelete);

  const done = todo.status === "completed";
  const indexLabel = `№.${String(index + 1).padStart(3, "0")}`;

  return (
    <article
      role="listitem"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
      className="group px-2 sm:px-6 py-5 hover:bg-paper-100 transition-colors duration-150 ease-out-quint animate-fade-up"
    >
      <div className="grid grid-cols-[48px_28px_1fr_auto] sm:grid-cols-[56px_32px_1fr_auto] items-start gap-3">
        <div className="font-mono pt-1 text-[12px] text-ink-300">{indexLabel}</div>
        <div className="pt-0.5">
          <StatusCheckbox
            status={todo.status}
            onChange={(next) => toggleStatus(todo.id, next)}
          />
        </div>
        <div className="min-w-0">
          <div
            className={[
              "text-body-lg font-medium leading-snug",
              done ? "text-ink-300 line-through" : "text-ink-900",
            ].join(" ")}
          >
            {todo.title}
          </div>
          {todo.description && (
            <div className="mt-1 text-body-sm text-ink-500 truncate">
              {todo.description}
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <PriorityTag priority={todo.priority} />
            <CategoryTag category={todo.category} />
            <DueDateLabel iso={todo.dueDate} status={todo.status} />
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity duration-150">
          <IconButton
            aria-label={`编辑：${todo.title}`}
            onClick={(e) => openEdit(todo.id, e.currentTarget as HTMLElement)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M11 4H4v16h16v-7M18.5 2.5l3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </IconButton>
          <IconButton
            aria-label={`删除：${todo.title}`}
            onClick={(e) => openConfirmDelete(todo.id, e.currentTarget as HTMLElement)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M3 6h18M8 6V4h8v2m-1 0v14H9V6m4 4v8M11 10v8" />
            </svg>
          </IconButton>
        </div>
      </div>
    </article>
  );
}
