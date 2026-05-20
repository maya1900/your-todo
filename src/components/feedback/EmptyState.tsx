import { useTodoStore } from "@/store/useTodoStore";
import { Button } from "@/components/ui/Button";

export type EmptyStateVariant = "initial" | "filtered";

export interface EmptyStateProps {
  variant: EmptyStateVariant;
}

export function EmptyState({ variant }: EmptyStateProps) {
  const openCreate = useTodoStore((s) => s.openCreate);
  const clearFilters = useTodoStore((s) => s.clearFilters);

  if (variant === "filtered") {
    return (
      <div className="border border-dashed border-rule-400 py-16 px-6 text-center">
        <div className="font-mono text-[12px] text-ink-300 mb-4">№ NULL</div>
        <h2 className="font-display text-display-lg leading-tight">
          这个组合下没有任何待办
          <span className="text-stamp-600">.</span>
        </h2>
        <p className="mt-2 text-ink-500 text-[14px]">Try adjusting your filters.</p>
        <div className="mt-6 flex items-center justify-center">
          <Button variant="outline" onClick={() => clearFilters()}>
            重置筛选条件
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-dashed border-rule-400 py-16 px-6 text-center">
      <div className="font-mono text-[12px] text-ink-300 mb-4">№.000</div>
      <h2 className="font-display text-display-xl leading-tight">
        你的索引还没开始<span className="text-stamp-600">.</span>
      </h2>
      <p className="mt-2 text-ink-500 text-[14px]">Start your first entry.</p>
      <div className="mt-6 flex items-center justify-center">
        <Button
          variant="stamp"
          size="lg"
          onClick={(e) => openCreate(e.currentTarget as HTMLElement)}
        >
          <span aria-hidden="true">+</span> 新建第一条待办
        </Button>
      </div>
    </div>
  );
}
