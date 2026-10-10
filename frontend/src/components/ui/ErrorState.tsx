import type { ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  action?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this information right now. Please try again or check your network connection.",
  onRetry,
  isRetrying = false,
  action,
  className = "",
  size = "md",
}: ErrorStateProps) {
  const paddingSizes = {
    sm: "p-6",
    md: "p-10",
    lg: "p-16",
  };

  return (
    <div
      role="alert"
      className={`
        flex flex-col items-center justify-center rounded-2xl border border-rose-100
        bg-rose-50/30 text-center ${paddingSizes[size]} ${className}
      `.trim().replace(/\s+/g, " ")}
    >
      <div
        className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100/80 text-rose-600 shadow-2xs"
        aria-hidden="true"
      >
        <AlertCircle className="h-5 w-5" />
      </div>

      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-slate-500 leading-relaxed">
        {message}
      </p>

      {(onRetry || action) && (
        <div className="mt-4 flex items-center gap-2">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              isLoading={isRetrying}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Try Again
            </Button>
          )}
          {action}
        </div>
      )}
    </div>
  );
}

export default ErrorState;
