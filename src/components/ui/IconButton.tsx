import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
  size?: "sm" | "md";
  children: ReactNode;
  active?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { size = "md", className = "", active, children, type, ...rest },
    ref,
  ) {
    const sizeCls = size === "sm" ? "h-8 w-8" : "h-9 w-9";
    const cls = [
      "inline-grid place-items-center text-ink-700 transition-colors duration-150",
      "hover:bg-paper-200 hover:text-ink-900",
      active ? "bg-paper-200 text-ink-900" : "",
      sizeCls,
      className,
    ]
      .filter(Boolean)
      .join(" ");
    return (
      <button ref={ref} type={type ?? "button"} className={cls} {...rest}>
        {children}
      </button>
    );
  },
);
