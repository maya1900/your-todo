import { forwardRef, useEffect, useRef, useState } from "react";
import { useTodoStore } from "@/store/useTodoStore";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export const SearchBox = forwardRef<HTMLInputElement>(function SearchBox(_, ref) {
  const search = useTodoStore((s) => s.filter.search);
  const setSearch = useTodoStore((s) => s.setSearch);
  const [local, setLocal] = useState(search);
  const debounced = useDebouncedValue(local, 200);
  const initialRef = useRef(true);
  const localRef = useRef(local);
  localRef.current = local;

  // Push debounced value to store (skip on first mount)
  useEffect(() => {
    if (initialRef.current) {
      initialRef.current = false;
      return;
    }
    setSearch(debounced);
  }, [debounced, setSearch]);

  // External resets (e.g. clearFilters) should sync back into local input,
  // but ONLY when the store value diverges from local — otherwise the round
  // trip local → store → local creates an infinite update loop.
  useEffect(() => {
    if (search !== localRef.current) {
      setLocal(search);
    }
  }, [search]);

  return (
    <div className="relative min-w-[220px] flex-1 max-w-[420px]">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        ref={ref}
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="搜索标题或描述…"
        aria-label="搜索待办"
        className="h-10 w-full border border-ink-900 bg-paper-50 pl-9 pr-12 text-[14px] text-ink-900 placeholder:text-ink-300 outline-none focus:border-stamp-600 focus:ring-2 focus:ring-stamp-100"
      />
      <span
        className="font-mono pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink-300"
        aria-hidden="true"
      >
        ⌘K
      </span>
    </div>
  );
});
