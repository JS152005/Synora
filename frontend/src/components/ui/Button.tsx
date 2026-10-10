import type { ButtonHTMLAttributes, ReactNode } from "react";
import Spinner from "./Spinner";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "outline"
    | "ghost"
    | "white"
    | "subtle";
  size?: "xs" | "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
      "bg-[#3B4F8A] hover:bg-[#324376] active:bg-[#293761] text-white shadow-xs shadow-[#3B4F8A]/30 border border-transparent dark:bg-[#3B4F8A] dark:hover:bg-[#4d63a8]",
    secondary:
      "bg-slate-100 hover:bg-slate-200 active:bg-slate-200/80 text-slate-700 dark:bg-[#2c221e] dark:hover:bg-[#362924] dark:text-[#d6ccbe] border border-slate-200/60 dark:border-[#3a2e29]",
    outline:
      "border border-slate-200 dark:border-[#3a2e29] bg-white dark:bg-[#231b18] hover:bg-slate-50 dark:hover:bg-[#2c221e] hover:border-slate-300 dark:hover:border-[#4A3B35] active:bg-slate-100 text-slate-700 dark:text-[#F5F5DC] shadow-2xs",
    ghost:
      "bg-transparent hover:bg-slate-100 dark:hover:bg-[#2c221e] text-slate-600 dark:text-[#d6ccbe] border border-transparent",
    success:
      "bg-[#7A8450] hover:bg-[#687143] active:bg-[#565e37] text-white shadow-xs shadow-[#7A8450]/30 border border-transparent",
    danger:
      "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs shadow-rose-200/50 border border-transparent",
    white:
      "bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/20 backdrop-blur-sm",
    subtle:
      "bg-[#3B4F8A]/10 hover:bg-[#3B4F8A]/20 text-[#3B4F8A] dark:text-[#D8B4A0] border border-[#3B4F8A]/20 font-medium",
  };

  const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    xs: "px-2.5 py-1 text-[11px] font-medium rounded-lg gap-1",
    sm: "px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5",
    md: "px-4 py-2 text-sm font-medium rounded-xl gap-2",
    lg: "px-5 py-2.5 text-sm font-semibold rounded-xl gap-2.5",
  };

  return (
    <button
      className={`
        inline-flex
        items-center
        justify-center
        cursor-pointer
        transition-all
        duration-150
        select-none
        btn-press
        focus-visible:outline-2
        focus-visible:outline-indigo-500
        focus-visible:outline-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-50
        disabled:transform-none
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `.trim().replace(/\s+/g, " ")}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" />
      ) : leftIcon ? (
        <span className="shrink-0 flex items-center">{leftIcon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {rightIcon && !isLoading && (
        <span className="shrink-0 flex items-center">{rightIcon}</span>
      )}
    </button>
  );
}

export default Button;
