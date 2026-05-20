import type { ReactNode } from "react";

export interface DistributionItem {
  label: ReactNode;
  count: number;
  total: number;
}

export interface DistributionListProps {
  items: DistributionItem[];
  emptyHint?: string;
}

export function DistributionList({ items, emptyHint = "暂无数据" }: DistributionListProps) {
  if (items.length === 0) {
    return <p className="text-body-sm text-ink-300">{emptyHint}</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((it, idx) => {
        const percent = it.total === 0 ? 0 : (it.count / it.total) * 100;
        return (
          <div key={idx} className="grid grid-cols-[84px_1fr_32px] items-center gap-3">
            <div className="text-[13px] text-ink-700 truncate">{it.label}</div>
            <div className="relative h-1.5 bg-rule-200">
              <div
                className="absolute inset-y-0 left-0 bg-ink-700"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-right font-mono text-[12px] tabular-nums text-ink-700">
              {it.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
