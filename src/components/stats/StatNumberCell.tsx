export interface StatNumberCellProps {
  value: string | number;
  unit?: string;
  labelEn: string;
  labelZh: string;
  tone?: "default" | "overdue";
}

export function StatNumberCell({
  value,
  unit,
  labelEn,
  labelZh,
  tone = "default",
}: StatNumberCellProps) {
  const isOver = tone === "overdue";
  return (
    <div className={["px-5 py-6 text-center", isOver ? "bg-stamp-100/40" : ""].join(" ")}>
      <div
        className={[
          "font-display font-medium leading-none tabular-nums text-[48px] sm:text-[56px]",
          isOver ? "text-state-overdue" : "text-ink-900",
        ].join(" ")}
      >
        {value}
        {unit && <span className="text-[28px]">{unit}</span>}
      </div>
      <div
        className={[
          "text-label mt-2",
          isOver ? "text-state-overdue" : "text-ink-500",
        ].join(" ")}
      >
        {labelEn} · {labelZh}
      </div>
    </div>
  );
}
