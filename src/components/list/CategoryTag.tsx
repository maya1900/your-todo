import { Tag } from "@/components/ui/Tag";

export function CategoryTag({ category }: { category: string }) {
  return <Tag variant="category">#{category}</Tag>;
}
