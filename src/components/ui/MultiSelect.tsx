import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export interface MultiSelectOption<V extends string> {
  value: V;
  label: ReactNode;
}

export interface MultiSelectProps<V extends string> {
  trigger: ReactNode;
  options: MultiSelectOption<V>[];
  values: V[];
  onChange: (next: V[]) => void;
  placement?: "bottom-start" | "bottom-end";
  className?: string;
  buttonClassName?: string;
  ariaLabel: string;
}

export function MultiSelect<V extends string>({
  trigger,
  options,
  values,
  onChange,
  placement = "bottom-start",
  className = "",
  buttonClassName = "",
  ariaLabel,
}: MultiSelectProps<V>) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const root = rootRef.current;
      if (root && !root.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function toggleValue(v: V) {
    if (values.includes(v)) onChange(values.filter((x) => x !== v));
    else onChange([...values, v]);
  }

  function onKey(e: KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const opt = options[activeIndex];
      if (opt) toggleValue(opt.value);
    }
  }

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`} onKeyDown={onKey}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={[
          "inline-flex h-10 items-center gap-2 border border-ink-900 px-3 text-[13px] text-ink-900 transition-colors duration-150",
          "hover:bg-ink-900 hover:text-paper-50",
          open ? "bg-ink-900 text-paper-50" : "",
          buttonClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {trigger}
        {values.length > 0 && (
          <span className="font-mono text-[11px]">+{values.length}</span>
        )}
      </button>
      {open && (
        <ul
          role="listbox"
          aria-multiselectable="true"
          tabIndex={-1}
          className={[
            "absolute z-40 mt-1 min-w-full border border-ink-900 bg-paper-50 shadow-paper-3",
            placement === "bottom-end" ? "right-0" : "left-0",
          ].join(" ")}
        >
          {options.map((opt, i) => {
            const checked = values.includes(opt.value);
            const active = i === activeIndex;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={checked}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  toggleValue(opt.value);
                }}
                className={[
                  "flex cursor-pointer items-center gap-2 px-3 py-2 text-[13px] whitespace-nowrap",
                  active ? "bg-paper-200 text-ink-900" : "text-ink-700",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={`inline-grid h-4 w-4 place-items-center border ${
                    checked ? "border-ink-900 bg-ink-900 text-paper-50" : "border-ink-500"
                  }`}
                >
                  {checked ? "✓" : ""}
                </span>
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
