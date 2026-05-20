import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of the input value. Use to defer reactive computations
 * (e.g. search filtering) until typing pauses.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(handle);
  }, [value, delayMs]);

  return debounced;
}
