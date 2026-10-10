import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      className = "",
      rows = 4,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label
            htmlFor={textareaId}
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

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          required={required}
          className={`
            w-full
            resize-none
            rounded-lg
            border
            bg-white
            px-3.5
            py-2.5
            text-sm
            text-slate-900
            placeholder:text-slate-400
            outline-none
            transition-all
            duration-150
            leading-relaxed
            ${
              error
                ? "border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 bg-rose-50/30"
                : "border-slate-200 hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100/80"
            }
            disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400
            ${className}
          `.trim().replace(/\s+/g, " ")}
          aria-invalid={error ? "true" : undefined}
          {...props}
        />

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

Textarea.displayName = "Textarea";

export default Textarea;
