import {
  PRIORITIES,
  PRIORITY_LABEL_ZH,
  type Priority,
} from "@/types/todo";

const variantBg: Record<Priority, string> = {
  low: "bg-prio-low-bg text-prio-low-ink",
  medium: "bg-prio-medium-bg text-prio-medium-ink",
  high: "bg-prio-high-bg text-prio-high-ink",
  urgent: "bg-prio-urgent-bg text-prio-urgent-ink",
};

export interface PrioritySegmentedProps {
  value: Priority;
  onChange: (next: Priority) => void;
  name?: string;
}

export function PrioritySegmented({ value, onChange, name }: PrioritySegmentedProps) {
  return (
    <div
      role="radiogroup"
      aria-label="优先级"
      className="grid grid-cols-4 border border-ink-900 divide-x divide-ink-900"
    >
      {PRIORITIES.map((p) => {
        const selected = p === value;
        return (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={selected}
            data-name={name}
            onClick={() => onChange(p)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                const idx = PRIORITIES.indexOf(value);
                const next = PRIORITIES[Math.min(PRIORITIES.length - 1, idx + 1)];
                if (next) onChange(next);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                const idx = PRIORITIES.indexOf(value);
                const next = PRIORITIES[Math.max(0, idx - 1)];
                if (next) onChange(next);
              }
            }}
            className={[
              "py-2.5 text-[12px] font-medium tracking-wider transition-colors duration-150",
              selected ? variantBg[p] : "bg-paper-50 text-ink-700 hover:bg-paper-200",
            ].join(" ")}
          >
            {PRIORITY_LABEL_ZH[p]}
          </button>
        );
      })}
    </div>
  );
}
