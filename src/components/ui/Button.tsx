import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "stamp" | "outline" | "ghost" | "text";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children?: ReactNode;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 select-none whitespace-nowrap font-medium tracking-wide transition-all duration-150 ease-out-quint disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  stamp:
    "bg-stamp-600 text-paper-50 shadow-[0_1px_0_var(--stamp-700)] hover:bg-stamp-700 hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(179,58,58,0.25),0_1px_0_var(--stamp-700)] active:translate-y-px active:shadow-none",
  outline:
    "border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-paper-50",
  ghost: "text-ink-700 hover:bg-paper-200 hover:text-ink-900",
  text: "text-ink-500 hover:text-stamp-600 underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[12px]",
  md: "h-10 px-4 text-[13px]",
  lg: "h-11 px-6 text-[14px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "outline", size = "md", className = "", fullWidth, type, children, ...rest },
  ref,
) {
  const cls = [
    base,
    variants[variant],
    sizes[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button ref={ref} type={type ?? "button"} className={cls} {...rest}>
      {children}
    </button>
  );
});
