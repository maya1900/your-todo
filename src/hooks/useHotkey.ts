import { useEffect } from "react";

export type HotkeyHandler = (e: KeyboardEvent) => void;

export interface HotkeyOptions {
  /** Trigger only when no editable element has focus. */
  ignoreInEditable?: boolean;
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

/**
 * Register a global keyboard shortcut.
 *
 * - `combo` examples: `"mod+k"`, `"mod+n"`, `"escape"`, `"n"`.
 * - `mod` matches Cmd on macOS and Ctrl elsewhere.
 */
export function useHotkey(
  combo: string,
  handler: HotkeyHandler,
  options: HotkeyOptions = {},
): void {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (matches(combo, e)) {
        if (options.ignoreInEditable && isEditable(document.activeElement)) return;
        handler(e);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [combo, handler, options.ignoreInEditable]);
}

function matches(combo: string, e: KeyboardEvent): boolean {
  const parts = combo.toLowerCase().split("+");
  const key = parts[parts.length - 1] ?? "";
  const needMod = parts.includes("mod");
  const needShift = parts.includes("shift");
  const needAlt = parts.includes("alt");

  const isMac = navigator.platform.toUpperCase().includes("MAC");
  const modPressed = isMac ? e.metaKey : e.ctrlKey;

  if (needMod !== modPressed) return false;
  if (needShift !== e.shiftKey) return false;
  if (needAlt !== e.altKey) return false;

  const normalizedKey = e.key.toLowerCase() === " " ? "space" : e.key.toLowerCase();
  return normalizedKey === key;
}
