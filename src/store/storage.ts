import type { PersistStorage, StorageValue } from "zustand/middleware";
import { emitToast } from "@/components/feedback/toastBus";

export const STORAGE_KEY = "your-todo/v1";
export const BACKUP_KEY = "your-todo/v1.backup";

function isQuotaExceeded(err: unknown): err is DOMException {
  if (!(err instanceof DOMException)) return false;
  // Quota-related names across browsers
  return (
    err.name === "QuotaExceededError" ||
    err.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    err.code === 22 ||
    err.code === 1014
  );
}

/**
 * Safe storage adapter for Zustand's persist middleware.
 *
 * - On read parse failure: backs up the raw value to BACKUP_KEY,
 *   returns null so the store rehydrates with defaults.
 * - On write quota error: emits a toast and rethrows so the action can roll back.
 */
export function makeSafeStorage<S>(): PersistStorage<S> {
  return {
    getItem: (name) => {
      const raw = localStorage.getItem(name);
      if (raw == null) return null;
      try {
        return JSON.parse(raw) as StorageValue<S>;
      } catch (err) {
        try {
          localStorage.setItem(BACKUP_KEY, raw);
        } catch {
          // ignore backup failure
        }
        // eslint-disable-next-line no-console
        console.warn(
          `[storage] parse failed for "${name}", backed up to "${BACKUP_KEY}"`,
          err,
        );
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        localStorage.setItem(name, JSON.stringify(value));
      } catch (err) {
        if (isQuotaExceeded(err)) {
          emitToast({
            kind: "error",
            message: "本地存储空间已满，请清理后重试",
          });
          throw err;
        }
        // eslint-disable-next-line no-console
        console.error("[storage] write failed", err);
        throw err;
      }
    },
    removeItem: (name) => {
      localStorage.removeItem(name);
    },
  };
}
