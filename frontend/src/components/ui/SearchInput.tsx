import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { Search, X } from "lucide-react";

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  shortcut?: string;
  size?: "sm" | "md" | "lg";
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onClear,
      shortcut,
      size = "md",
      placeholder = "Search...",
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const handleClear = () => {
      onChange("");
      onClear?.();
    };

    const sizeClasses = {
      sm: "py-1.5 pl-8 pr-8 text-xs rounded-lg",
      md: "py-2 pl-9 pr-9 text-sm rounded-xl",
      lg: "py-2.5 pl-10 pr-10 text-sm rounded-xl",
    };

    const iconSizes = {
      sm: "h-3.5 w-3.5 left-2.5",
      md: "h-4 w-4 left-3",
      lg: "h-4.5 w-4.5 left-3.5",
    };

    return (
      <div className={`relative flex items-center w-full ${className}`}>
        <Search
          className={`pointer-events-none absolute text-slate-400 ${iconSizes[size]}`}
          aria-hidden="true"
        />

        <input
          ref={ref}
          type="search"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full border border-slate-200/90 bg-white
            text-slate-900 placeholder:text-slate-400
            shadow-2xs outline-none transition-all duration-150
            hover:border-slate-300 focus:border-indigo-400 focus:bg-white
            focus:ring-2 focus:ring-indigo-100/80
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
            ${sizeClasses[size]}
            ${shortcut && !value ? "pr-14" : ""}
          `.trim().replace(/\s+/g, " ")}
          {...props}
        />

        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : shortcut ? (
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 shadow-2xs">
            {shortcut}
          </kbd>
        ) : null}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
