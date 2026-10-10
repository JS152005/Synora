import Spinner from "./Spinner";

export interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function LoadingState({
  message = "Loading...",
  size = "md",
  className = "",
}: LoadingStateProps) {
  const heights = {
    sm: "py-8",
    md: "py-16",
    lg: "py-24",
  };

  const spinnerSizes = {
    sm: "sm" as const,
    md: "md" as const,
    lg: "lg" as const,
  };

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${heights[size]} ${className}`}
      role="status"
      aria-live="polite"
    >
      <Spinner size={spinnerSizes[size]} />
      {message && (
        <p className="mt-3 text-xs font-medium text-slate-500 animate-pulse-subtle">
          {message}
        </p>
      )}
    </div>
  );
}

export default LoadingState;
