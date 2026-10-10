import type { HTMLAttributes, ReactNode } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "outline"
    | "ghost";
  size?: "xs" | "sm" | "md";
  dot?: boolean;
}

function Badge({
  children,
  variant = "default",
  size = "sm",
  dot = false,
  className = "",
  ...props
}: BadgeProps) {
  const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-slate-100 text-slate-600 border-slate-200/60",
    primary: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
    secondary: "bg-violet-50 text-violet-700 border-violet-200/60",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    warning: "bg-amber-50 text-amber-700 border-amber-200/60",
    danger: "bg-rose-50 text-rose-700 border-rose-200/60",
    info: "bg-sky-50 text-sky-700 border-sky-200/60",
    outline: "bg-transparent text-slate-600 border-slate-300",
    ghost: "bg-transparent text-slate-500 border-transparent",
  };

  const dotColors: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-slate-400",
    primary: "bg-indigo-500",
    secondary: "bg-violet-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-sky-500",
    outline: "bg-slate-400",
    ghost: "bg-slate-400",
  };

  const sizes: Record<NonNullable<BadgeProps["size"]>, string> = {
    xs: "px-1.5 py-0.5 text-[10px] font-medium gap-1",
    sm: "px-2 py-0.5 text-[11px] font-medium gap-1",
    md: "px-2.5 py-1 text-xs font-medium gap-1.5",
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full border
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `.trim().replace(/\s+/g, " ")}
      {...props}
    >
      {dot && (
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full shrink-0 ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
