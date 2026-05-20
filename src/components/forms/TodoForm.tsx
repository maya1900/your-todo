import { useEffect, useRef, useState } from "react";
import type { EditableTodoFields, Priority, Todo } from "@/types/todo";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Textarea } from "@/components/ui/Textarea";
import { PrioritySegmented } from "./PrioritySegmented";
import { CategorySelect } from "./CategorySelect";
import { useAutoSizeTextarea } from "@/hooks/useAutoSizeTextarea";

export type TodoFormPayload = {
  title: string;
  description: string;
  dueDate: string | null;
  priority: Priority;
  category: string;
};

export interface TodoFormProps {
  initial?: Partial<EditableTodoFields> | Todo | undefined;
  submitLabel?: string;
  allCategories?: string[];
  onSubmit: (
    payload: TodoFormPayload,
  ) => { ok: true } | { ok: false; errors: Record<string, string> };
  onCancel: () => void;
}

const DESC_MAX = 2000;

function initialPayload(initial?: Partial<EditableTodoFields> | Todo): TodoFormPayload {
  return {
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    dueDate: initial?.dueDate ?? null,
    priority: (initial?.priority as Priority) ?? "medium",
    category: initial?.category ?? "",
  };
}

export function TodoForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save & Stamp ⊙",
  allCategories = [],
}: TodoFormProps) {
  const [payload, setPayload] = useState<TodoFormPayload>(() => initialPayload(initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const descRef = useRef<HTMLTextAreaElement>(null);
  useAutoSizeTextarea(descRef, payload.description);

  // If initial changes (e.g. switching from create to edit), reset
  useEffect(() => {
    setPayload(initialPayload(initial));
    setErrors({});
  }, [initial]);

  function set<K extends keyof TodoFormPayload>(key: K, value: TodoFormPayload[K]) {
    setPayload((p) => ({ ...p, [key]: value }));
    if (errors[key as string]) {
      setErrors((e) => {
        const { [key as string]: _omit, ...rest } = e;
        return rest;
      });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = onSubmit(payload);
    if (!result.ok) setErrors(result.errors);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <TextInput
        label="TITLE 标题"
        required
        value={payload.title}
        onChange={(e) => set("title", e.target.value)}
        placeholder="例如：完成季度复盘…"
        maxLength={200}
        autoFocus
        error={errors.title}
      />
      <Textarea
        ref={descRef}
        label="DESCRIPTION 描述"
        placeholder="可选 · 最多 2000 字符"
        value={payload.description}
        onChange={(e) => set("description", e.target.value)}
        counter={{ current: payload.description.length, max: DESC_MAX }}
        maxLength={DESC_MAX + 100 /* allow visible overflow before hard cut */}
        error={errors.description}
      />
      <div className="grid grid-cols-2 gap-4">
        <TextInput
          label="DUE DATE 截止"
          type="date"
          value={payload.dueDate ?? ""}
          onChange={(e) => set("dueDate", e.target.value || null)}
          error={errors.dueDate}
          className="font-mono"
        />
        <CategorySelect
          label="CATEGORY 分类"
          required
          value={payload.category}
          onChange={(e) => set("category", e)}
          allCategories={allCategories}
          error={errors.category}
        />
      </div>
      <div>
        <div className="text-label text-ink-700 mb-2">PRIORITY 优先级</div>
        <PrioritySegmented value={payload.priority} onChange={(p) => set("priority", p)} />
        {errors.priority && (
          <p className="text-body-sm text-state-overdue mt-1.5">
            <span aria-hidden="true">⚠ </span>
            {errors.priority}
          </p>
        )}
      </div>
      {errors._root && (
        <div role="alert" className="border-l-4 border-stamp-600 bg-stamp-100/40 p-3 text-[13px] text-state-overdue">
          {errors._root}
        </div>
      )}
      <div className="mt-2 flex items-center justify-end gap-3 border-t border-rule-200 pt-4">
        <Button variant="ghost" onClick={onCancel}>取消</Button>
        <Button variant="stamp" type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
