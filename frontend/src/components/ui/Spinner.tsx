interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
}

function Spinner({ size = "md", className = "", fullScreen = false }: SpinnerProps) {
  const sizes = {
    xs: "h-3 w-3 border",
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-[2.5px]",
    lg: "h-10 w-10 border-[3px]",
  };

  const spinner = (
    <div
      className={`animate-spin rounded-full border-indigo-600 border-t-transparent ${sizes[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export default Spinner;
