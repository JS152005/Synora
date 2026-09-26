import {
  forwardRef,
  InputHTMLAttributes,
} from "react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      required,
      className = "",
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

        <input
          ref={ref}
          className={`
            w-full
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
            disabled:bg-gray-100
            disabled:cursor-not-allowed
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

Input.displayName = "Input";

export default Input;
