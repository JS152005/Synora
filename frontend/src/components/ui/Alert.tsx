import type { ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

export interface AlertProps {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

function Alert({
  variant = "info",
  title,
  children,
  onDismiss,
  className = "",
}: AlertProps) {
  const configs = {
    info: {
      bg: "bg-sky-50/70 border-sky-200/80 text-sky-900",
      iconColor: "text-sky-600",
      Icon: Info,
    },
    success: {
      bg: "bg-emerald-50/70 border-emerald-200/80 text-emerald-900",
      iconColor: "text-emerald-600",
      Icon: CheckCircle2,
    },
    warning: {
      bg: "bg-amber-50/70 border-amber-200/80 text-amber-900",
      iconColor: "text-amber-600",
      Icon: AlertTriangle,
    },
    error: {
      bg: "bg-rose-50/70 border-rose-200/80 text-rose-900",
      iconColor: "text-rose-600",
      Icon: AlertCircle,
    },
  };

  const { bg, iconColor, Icon } = configs[variant];

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 rounded-xl border p-3.5 text-xs
        ${bg} ${className}
      `.trim().replace(/\s+/g, " ")}
    >
      <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${iconColor}`} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && <h3 className="font-semibold mb-0.5">{title}</h3>}
        <div className="leading-relaxed opacity-95">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 rounded-md p-0.5 opacity-60 hover:opacity-100 transition cursor-pointer"
          aria-label="Dismiss alert"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default Alert;
