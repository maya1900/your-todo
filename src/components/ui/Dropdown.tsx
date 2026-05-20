import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export interface DropdownOption<V extends string = string> {
  value: V;
  label: ReactNode;
  description?: string;
}

export interface DropdownProps<V extends string> {
  /** Visible trigger contents */
  trigger: ReactNode;
  options: DropdownOption<V>[];
  value: V | null;
  onChange: (value: V) => void;
  placement?: "bottom-start" | "bottom-end";
  className?: string;
  buttonClassName?: string;
  ariaLabel: string;
}

export function Dropdown<V extends string>({
  trigger,
  options,
  value,
  onChange,
  placement = "bottom-start",
  className = "",
  buttonClassName = "",
  ariaLabel,
}: DropdownProps<V>) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => o.value === value);
    setActiveIndex(idx >= 0 ? idx : 0);
  }, [open, options, value]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const root = rootRef.current;
      if (root && !root.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

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
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const opt = options[activeIndex];
      if (opt) {
        onChange(opt.value);
        setOpen(false);
      }
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
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          tabIndex={-1}
          className={[
            "absolute z-40 mt-1 min-w-full border border-ink-900 bg-paper-50 shadow-paper-3",
            placement === "bottom-end" ? "right-0" : "left-0",
          ].join(" ")}
        >
          {options.map((opt, i) => {
            const selected = opt.value === value;
            const active = i === activeIndex;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={[
                  "cursor-pointer px-3 py-2 text-[13px] whitespace-nowrap",
                  active ? "bg-paper-200 text-ink-900" : "text-ink-700",
                  selected ? "font-medium" : "",
                ].join(" ")}
              >
                {opt.label}
                {opt.description && (
                  <span className="ml-2 text-[11px] text-ink-300">{opt.description}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
