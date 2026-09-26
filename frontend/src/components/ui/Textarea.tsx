import {
  forwardRef,
  TextareaHTMLAttributes,
} from "react";

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(
  (
    {
      label,
      error,
      required,
      className = "",
      rows = 4,
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-semibold text-gray-700">
            {label}

            {required && (
              <span className="ml-1 text-red-500">*</span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          rows={rows}
          className={`
            w-full
            resize-none
            rounded-lg
            border
            px-4
            py-2.5
            text-sm
            outline-none
            transition
            ${
              error
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-blue-600"
            }
            disabled:cursor-not-allowed
            disabled:bg-gray-100
            ${className}
          `}
          {...props}
        />

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
