import { useRef } from "react";

export interface CategorySelectProps {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  allCategories: string[];
  placeholder?: string;
  maxLength?: number;
  error?: string | undefined;
}

export function CategorySelect({
  label = "CATEGORY 分类",
  required = false,
  value,
  onChange,
  allCategories,
  placeholder = "工作 / 生活 / …",
  maxLength = 30,
  error,
}: CategorySelectProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = allCategories.filter(
    (cat) => cat.toLowerCase().includes(value.toLowerCase()) && cat !== value,
  );

  // Only show all categories if input is empty
  const showAllCategories = allCategories.length > 0 && !value.trim() && !suggestions.length;

  return (
    <div className="flex flex-col">
      <label htmlFor="category-input" className="text-label text-ink-700 mb-2">
        {label}
        {required && <span className="ml-1 text-stamp-600">*</span>}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id="category-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="h-11 w-full bg-paper-50 px-3 text-[15px] text-ink-900 placeholder:text-ink-300 outline-none transition-shadow duration-150 border border-ink-900 focus:border-stamp-600 focus:ring-2 focus:ring-stamp-100"
        />
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-paper-50 border border-ink-900 shadow-paper-3">
            {suggestions.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onChange(cat)}
                className="w-full text-left px-3 py-2 text-[14px] text-ink-900 hover:bg-paper-100 transition-colors duration-150 border-b border-rule-200 last:border-b-0"
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p className="text-body-sm text-state-overdue mt-1.5">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
      {showAllCategories && (
        <div className="mt-2 flex flex-wrap gap-1">
          {allCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(cat)}
              className="inline-block px-2 py-1 text-[12px] bg-paper-100 text-ink-700 border border-rule-300 rounded transition-colors duration-150 hover:bg-paper-200"
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
