export type ToastKind = "info" | "success" | "error";

export interface ToastInput {
  kind: ToastKind;
  message: string;
  duration?: number;
}

export interface Toast extends ToastInput {
  id: number;
  createdAt: number;
}

type Listener = (toast: Toast) => void;

let nextId = 1;
const listeners = new Set<Listener>();

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitToast(input: ToastInput): Toast {
  const toast: Toast = {
    ...input,
    id: nextId++,
    createdAt: Date.now(),
  };
  for (const l of listeners) l(toast);
  return toast;
}
