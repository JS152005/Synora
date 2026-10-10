interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  size?: "sm" | "md";
}

function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
  size = "md",
}: ToggleSwitchProps) {
  const switchId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : "toggle");

  const trackSizes = {
    sm: "w-8 h-4",
    md: "w-10 h-5",
  };

  const thumbSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
  };

  const thumbTranslate = {
    sm: checked ? "translate-x-4" : "translate-x-0.5",
    md: checked ? "translate-x-[22px]" : "translate-x-0.5",
  };

  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div className="min-w-0 flex-1">
          {label && (
            <label
              htmlFor={switchId}
              className={`block text-sm font-medium cursor-pointer select-none ${
                disabled ? "text-slate-400" : "text-slate-800"
              }`}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}

      <button
        role="switch"
        id={switchId}
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex shrink-0 items-center rounded-full
          border-2 border-transparent transition-all duration-200 cursor-pointer
          focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
          ${trackSizes[size]}
          ${checked ? "bg-indigo-600" : "bg-slate-200"}
        `.trim().replace(/\s+/g, " ")}
      >
        <span
          className={`
            inline-block rounded-full bg-white shadow-sm
            transition-transform duration-200 ease-in-out
            ${thumbSizes[size]}
            ${thumbTranslate[size]}
          `.trim().replace(/\s+/g, " ")}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

export default ToggleSwitch;
