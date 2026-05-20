import type { ReactNode } from "react";

export type TagVariant =
  | "priority-low"
  | "priority-medium"
  | "priority-high"
  | "priority-urgent"
  | "category"
  | "neutral";

export interface TagProps {
  variant?: TagVariant;
  children: ReactNode;
  className?: string;
}

const variants: Record<TagVariant, string> = {
  "priority-low": "bg-prio-low-bg text-prio-low-ink uppercase tracking-[0.12em]",
  "priority-medium": "bg-prio-medium-bg text-prio-medium-ink uppercase tracking-[0.12em]",
  "priority-high": "bg-prio-high-bg text-prio-high-ink uppercase tracking-[0.12em]",
  "priority-urgent": "bg-prio-urgent-bg text-prio-urgent-ink uppercase tracking-[0.12em]",
  category: "bg-paper-200 text-ink-700",
  neutral: "bg-paper-200 text-ink-700 uppercase tracking-[0.1em]",
};

export function Tag({ variant = "neutral", children, className = "" }: TagProps) {
  return (
    <span
      className={[
        "inline-flex h-[22px] items-center px-2 text-[10px] font-medium leading-none",
        variants[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
