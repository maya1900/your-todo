import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDebouncedValue } from "./useDebouncedValue";

describe("useDebouncedValue", () => {
  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("a", 100));
    expect(result.current).toBe("a");
  });

  it("delays propagation by `delayMs`", async () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 200), {
      initialProps: { v: "a" },
    });
    rerender({ v: "b" });
    expect(result.current).toBe("a");
    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(result.current).toBe("a");
    act(() => {
      vi.advanceTimersByTime(2);
    });
    expect(result.current).toBe("b");
    vi.useRealTimers();
  });
});
