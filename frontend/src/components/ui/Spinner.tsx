interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

function Spinner({
  size = "md",
  fullScreen = false,
}: SpinnerProps) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
  };

  const spinner = (
    <div
      className={`
        animate-spin
        rounded-full
        border-blue-600
        border-t-transparent
        ${sizes[size]}
      `}
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
