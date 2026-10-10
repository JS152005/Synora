import type { ButtonHTMLAttributes, ReactNode } from "react";
import Spinner from "./Spinner";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "subtle";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
}

function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: IconButtonProps) {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700",
    outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300 shadow-2xs",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-500 hover:text-slate-800",
    danger: "bg-rose-50 hover:bg-rose-100 text-rose-600",
    success: "bg-emerald-50 hover:bg-emerald-100 text-emerald-600",
    subtle: "bg-indigo-50 hover:bg-indigo-100 text-indigo-600",
  };

  const sizes = {
    xs: "h-7 w-7 rounded-md p-1",
    sm: "h-8 w-8 rounded-lg p-1.5",
    md: "h-9 w-9 rounded-xl p-2",
    lg: "h-11 w-11 rounded-xl p-2.5",
  };

  return (
    <button
      aria-label={label}
      title={label}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center shrink-0
        cursor-pointer transition-all duration-150 select-none
        btn-press
        focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-2
        disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `.trim().replace(/\s+/g, " ")}
      {...props}
    >
      {isLoading ? <Spinner size="xs" /> : icon}
    </button>
  );
}

export default IconButton;
