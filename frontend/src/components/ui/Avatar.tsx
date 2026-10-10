import { useState } from "react";
import { getImageUrl } from "../../utils/imageUrl";

export interface AvatarProps {
  src?: string | null;
  name?: string;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  isOnline?: boolean;
}

const sizeClasses = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

const indicatorClasses = {
  xs: "h-2 w-2 right-0 bottom-0",
  sm: "h-2.5 w-2.5 right-0 bottom-0",
  md: "h-3 w-3 right-0.5 bottom-0.5",
  lg: "h-3.5 w-3.5 right-1 bottom-1",
  xl: "h-4.5 w-4.5 right-1.5 bottom-1.5",
};

function Avatar({
  src,
  name,
  alt,
  size = "md",
  className = "",
  isOnline,
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const displayName = name || alt || "Student";
  const formattedSrc = !hasError ? getImageUrl(src) : null;

  const initials = displayName
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  return (
    <div className="relative inline-flex shrink-0">
      {formattedSrc ? (
        <img
          src={formattedSrc}
          alt={displayName}
          onError={() => setHasError(true)}
          className={`rounded-full object-cover border-2 border-white/90 shadow-2xs select-none ${sizeClasses[size]} ${className}`}
        />
      ) : (
        <div
          className={`
            flex items-center justify-center rounded-full
            bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700
            font-semibold text-white select-none
            border-2 border-white/90 shadow-2xs
            ${sizeClasses[size]}
            ${className}
          `.trim().replace(/\s+/g, " ")}
          aria-label={displayName}
        >
          {initials || "S"}
        </div>
      )}

      {isOnline !== undefined && (
        <span
          className={`
            absolute rounded-full border-2 border-white ring-1 ring-slate-900/5
            ${
              isOnline
                ? "bg-emerald-500 shadow-xs shadow-emerald-500/50"
                : "bg-slate-300"
            }
            ${indicatorClasses[size]}
          `.trim().replace(/\s+/g, " ")}
          title={isOnline ? "Online now" : "Offline"}
          aria-label={isOnline ? "Online now" : "Offline"}
        />
      )}
    </div>
  );
}

export default Avatar;
