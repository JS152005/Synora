import type { ReactNode } from "react";
import Button from "./Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = "",
  size = "md",
}: EmptyStateProps) {
  const iconSizes = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const iconInnerSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const paddingSizes = {
    sm: "p-8",
    md: "p-10 md:p-14",
    lg: "p-14 md:p-20",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 text-center ${paddingSizes[size]} ${className}`}
    >
      {icon && (
        <div
          className={`mb-4 flex ${iconSizes[size]} items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500`}
          aria-hidden="true"
        >
          <span className={iconInnerSizes[size]}>{icon}</span>
        </div>
      )}

      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>

      {description && (
        <p className="mt-1.5 max-w-xs text-xs text-slate-500 leading-relaxed">
          {description}
        </p>
      )}

      {(actionLabel && onAction) || (secondaryActionLabel && onSecondaryAction) ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {actionLabel && onAction && (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default EmptyState;
