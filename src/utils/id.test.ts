import { describe, expect, it, vi } from "vitest";
import { newId } from "./id";

describe("newId", () => {
  it("returns a non-empty string", () => {
    expect(typeof newId()).toBe("string");
    expect(newId().length).toBeGreaterThan(8);
  });

  it("generates unique values across calls", () => {
    const set = new Set<string>();
    for (let i = 0; i < 200; i++) set.add(newId());
    expect(set.size).toBe(200);
  });

  it("falls back when crypto.randomUUID is unavailable", () => {
    const original = globalThis.crypto;
    Object.defineProperty(globalThis, "crypto", {
      value: { ...original, randomUUID: undefined },
      configurable: true,
      writable: true,
    });
    try {
      const id = newId();
      expect(id).toMatch(/-/);
    } finally {
      Object.defineProperty(globalThis, "crypto", {
        value: original,
        configurable: true,
        writable: true,
      });
    }
  });

  it("uses crypto.randomUUID when present", () => {
    const spy = vi.spyOn(crypto, "randomUUID");
    newId();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
