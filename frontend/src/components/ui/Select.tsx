import { forwardRef } from "react";
import type { SelectHTMLAttributes, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options?: SelectOption[];
  children?: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      placeholder,
      options,
      children,
      required,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const selectId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-slate-700"
          >
            {label}
            {required && (
              <span className="ml-1 text-rose-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            className={`
              w-full
              appearance-none
              rounded-lg
              border
              bg-white
              px-3.5
              py-2.5
              pr-9
              text-sm
              text-slate-900
              outline-none
              transition-all
              duration-150
              cursor-pointer
              ${
                error
                  ? "border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 bg-rose-50/30"
                  : "border-slate-200 hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100/80"
              }
              disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
              ${className}
            `.trim().replace(/\s+/g, " ")}
            aria-invalid={error ? "true" : undefined}
            {...props}
          >
            {children ? (
              children
            ) : (
              <>
                <option value="">{placeholder || "Select…"}</option>
                {options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </>
            )}
          </select>

          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        </div>

        {error && (
          <p className="text-xs text-rose-600 animate-fade-in" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="text-xs text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;