import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string | undefined;
  hint?: ReactNode;
  required?: boolean;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    { label, error, hint, required, className = "", id, leftSlot, rightSlot, ...rest },
    ref,
  ) {
    const reactId = useId();
    const inputId = id ?? reactId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const ring = error
      ? "border-state-overdue focus:border-state-overdue focus:ring-2 focus:ring-state-overdue/30"
      : "border-ink-900 focus:border-stamp-600 focus:ring-2 focus:ring-stamp-100";

    return (
      <div className={`flex flex-col ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-label text-ink-700 mb-2"
          >
            {label}
            {required && <span className="ml-1 text-stamp-600">*</span>}
          </label>
        )}
        <div className="relative">
          {leftSlot && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">
              {leftSlot}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={
              [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
              undefined
            }
            className={[
              "h-11 w-full bg-paper-50 px-3 text-[15px] text-ink-900 placeholder:text-ink-300 outline-none transition-shadow duration-150",
              "border",
              ring,
              leftSlot ? "pl-9" : "",
              rightSlot ? "pr-12" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            {...rest}
          />
          {rightSlot && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300">
              {rightSlot}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="text-body-sm text-state-overdue mt-1.5">
            <span aria-hidden="true">⚠ </span>
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={hintId} className="text-body-sm text-ink-500 mt-1.5">
            {hint}
          </p>
        )}
      </div>
    );
  },
);
