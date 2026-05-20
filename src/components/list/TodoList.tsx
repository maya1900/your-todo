import { useFilteredTodos } from "@/store/selectors";
import { useTodoStore } from "@/store/useTodoStore";
import { EmptyState } from "@/components/feedback/EmptyState";
import { TodoRow } from "./TodoRow";

export function TodoList() {
  const items = useFilteredTodos();
  const totalCount = useTodoStore((s) => s.todos.length);

  if (totalCount === 0) {
    return <EmptyState variant="initial" />;
  }
  if (items.length === 0) {
    return <EmptyState variant="filtered" />;
  }

  return (
    <section
      role="list"
      aria-label="待办列表"
      className="divide-y divide-rule-200 border-b border-rule-400"
    >
      {items.map((t, i) => (
        <TodoRow key={t.id} todo={t} index={i} />
      ))}
    </section>
  );
}
