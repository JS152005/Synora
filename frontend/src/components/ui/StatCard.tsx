import type { HTMLAttributes, ReactNode } from "react";

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  subLabel?: string;
  icon: ReactNode;
  iconColor?: "indigo" | "blue" | "emerald" | "amber" | "rose" | "violet";
  isLoading?: boolean;
}

const colorMap = {
  indigo: {
    icon: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    value: "text-slate-900",
  },
  blue: {
    icon: "bg-blue-50 text-blue-600 border border-blue-100",
    value: "text-slate-900",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    value: "text-slate-900",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600 border border-amber-100",
    value: "text-slate-900",
  },
  rose: {
    icon: "bg-rose-50 text-rose-600 border border-rose-100",
    value: "text-slate-900",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600 border border-violet-100",
    value: "text-slate-900",
  },
};

function StatCard({
  label,
  value,
  subLabel,
  icon,
  iconColor = "indigo",
  isLoading = false,
  className = "",
  onClick,
  ...props
}: StatCardProps) {
  const colors = colorMap[iconColor];
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(e as any);
              }
            }
          : undefined
      }
      className={`
        rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200
        ${isClickable ? "interactive-card cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-indigo-500" : ""}
        ${className}
      `.trim().replace(/\s+/g, " ")}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 truncate">{label}</p>
          {isLoading ? (
            <div className="skeleton mt-2 h-7 w-16 rounded-md" aria-hidden="true" />
          ) : (
            <p className={`mt-1.5 text-2xl font-bold tracking-tight ${colors.value}`}>
              {value}
            </p>
          )}
          {subLabel && (
            <p className="mt-0.5 text-[11px] text-slate-400 font-medium truncate">{subLabel}</p>
          )}
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors.icon}`}
          aria-hidden="true"
        >
          <span className="h-5 w-5 flex items-center justify-center">{icon}</span>
        </div>
      </div>
    </div>
  );
}

export default StatCard;
