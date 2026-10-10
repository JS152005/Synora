interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

export function Skeleton({ className = "", rounded = "md" }: SkeletonProps) {
  const roundedClasses = {
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-xl",
    full: "rounded-full",
  };
  return (
    <div
      className={`skeleton ${roundedClasses[rounded]} ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 2, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === lines - 1 && lines > 1 ? "w-4/5" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({
  size = "md",
}: {
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const sizes = {
    xs: "h-7 w-7",
    sm: "h-9 w-9",
    md: "h-11 w-11",
    lg: "h-16 w-16",
  };
  return <Skeleton className={sizes[size]} rounded="full" />;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 space-y-4 ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-start gap-3">
        <SkeletonAvatar size="md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-16" rounded="full" />
        <Skeleton className="h-5 w-20" rounded="full" />
        <Skeleton className="h-5 w-14" rounded="full" />
      </div>
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <Skeleton className="h-8 flex-1" rounded="lg" />
        <Skeleton className="h-8 flex-1" rounded="lg" />
      </div>
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  cols = 4,
  className = "",
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {/* Header */}
      <div className="flex gap-4 px-4 py-2">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3.5"
        >
          <SkeletonAvatar size="sm" />
          {Array.from({ length: cols - 1 }).map((_, j) => (
            <Skeleton key={j} className="h-3 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
