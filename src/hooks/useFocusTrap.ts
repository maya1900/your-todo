import { useEffect } from "react";

/**
 * Trap keyboard focus inside the given container while it is mounted.
 * Tab cycles forward, Shift+Tab cycles backward.
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    function focusables(): HTMLElement[] {
      if (!container) return [];
      const selectors = [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled])",
        "textarea:not([disabled])",
        "select:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
      ];
      return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(","))).filter(
        (el) => !el.hasAttribute("data-focus-skip"),
      );
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (!active || active === first || !container?.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (!active || active === last || !container?.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [containerRef, enabled]);
}
