import { PRIORITY_LABEL_EN, PRIORITY_LABEL_ZH, type Priority } from "@/types/todo";
import { Tag } from "@/components/ui/Tag";

const variantMap = {
  low: "priority-low",
  medium: "priority-medium",
  high: "priority-high",
  urgent: "priority-urgent",
} as const;

export function PriorityTag({ priority }: { priority: Priority }) {
  return (
    <Tag variant={variantMap[priority]}>
      {PRIORITY_LABEL_EN[priority]} {PRIORITY_LABEL_ZH[priority]}
    </Tag>
  );
}
