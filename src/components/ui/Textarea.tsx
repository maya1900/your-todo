import { forwardRef, useId, type TextareaHTMLAttributes, type ReactNode } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | undefined;
  hint?: ReactNode;
  required?: boolean;
  counter?: { current: number; max: number };
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, error, hint, required, counter, className = "", id, rows = 3, ...rest },
    ref,
  ) {
    const reactId = useId();
    const inputId = id ?? reactId;
    const errorId = `${inputId}-error`;

    const ring = error
      ? "border-state-overdue focus:border-state-overdue focus:ring-2 focus:ring-state-overdue/30"
      : "border-ink-900 focus:border-stamp-600 focus:ring-2 focus:ring-stamp-100";

    const over = counter && counter.current > counter.max;

    return (
      <div className={`flex flex-col ${className}`}>
        {label && (
          <label htmlFor={inputId} className="text-label text-ink-700 mb-2">
            {label}
            {required && <span className="ml-1 text-stamp-600">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : undefined}
          className={[
            "w-full bg-paper-50 px-3 py-2.5 text-[15px] leading-relaxed text-ink-900 placeholder:text-ink-300 outline-none transition-shadow duration-150 resize-none",
            "border",
            ring,
          ].join(" ")}
          {...rest}
        />
        <div className="mt-1.5 flex items-start justify-between gap-3">
          <div>
            {error && (
              <p id={errorId} className="text-body-sm text-state-overdue">
                <span aria-hidden="true">⚠ </span>
                {error}
              </p>
            )}
            {!error && hint && <p className="text-body-sm text-ink-500">{hint}</p>}
          </div>
          {counter && (
            <p
              className={`font-mono text-[11px] tabular-nums ${
                over ? "text-state-overdue" : "text-ink-300"
              }`}
              aria-live="off"
            >
              {counter.current} / {counter.max}
            </p>
          )}
        </div>
      </div>
    );
  },
);
