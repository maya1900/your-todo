import { useEffect, type RefObject } from "react";

const MAX_PX = 240;

/**
 * Resize a textarea to fit its content, up to MAX_PX. Reverts to scroll above.
 */
export function useAutoSizeTextarea(
  ref: RefObject<HTMLTextAreaElement>,
  value: string,
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(MAX_PX, el.scrollHeight);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > MAX_PX ? "auto" : "hidden";
  }, [ref, value]);
}
