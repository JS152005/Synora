import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  children?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  variant?: "default" | "flat" | "elevated" | "interactive";
  interactive?: boolean;
  padding?: boolean;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

function Card({
  children,
  title,
  subtitle,
  action,
  footer,
  variant = "default",
  interactive = false,
  padding = true,
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  className = "",
  ...props
}: CardProps) {
  const isInteractive = interactive || variant === "interactive";

  const variantClasses = {
    default: "border border-slate-200/80 dark:border-[#3a2e29] bg-white dark:bg-[#231b18] shadow-xs",
    flat: "border border-slate-100 dark:border-[#3a2e29] bg-slate-50/60 dark:bg-[#1d1614]",
    elevated: "border border-slate-200/60 dark:border-[#3a2e29] bg-white dark:bg-[#231b18] shadow-md",
    interactive: "border border-slate-200/80 dark:border-[#3a2e29] bg-white dark:bg-[#231b18] shadow-xs interactive-card cursor-pointer",
  };

  return (
    <div
      className={`
        rounded-2xl transition-all duration-200
        ${variantClasses[variant]}
        ${isInteractive ? "interactive-card" : ""}
        ${className}
      `.trim().replace(/\s+/g, " ")}
      {...props}
    >
      {(title || subtitle || action) && (
        <div
          className={`flex items-start justify-between gap-4 border-b border-slate-100 dark:border-[#3a2e29] px-5 py-4 ${headerClassName}`}
        >
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-semibold text-slate-900 dark:text-[#F5F5DC] leading-snug">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-[#a39587] leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      {padding ? (
        <div className={`p-5 ${bodyClassName}`}>{children}</div>
      ) : (
        <div className={bodyClassName}>{children}</div>
      )}

      {footer && (
        <div
          className={`border-t border-slate-100 px-5 py-3.5 bg-slate-50/40 rounded-b-2xl ${footerClassName}`}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;
