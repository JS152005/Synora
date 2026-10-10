import React, { useRef, useEffect } from "react";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  error?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  autoFocus = true,
  error = false,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const digits = value.split("").slice(0, length);
  while (digits.length < length) {
    digits.push("");
  }

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // digits only
    if (!val) {
      // Clear current digit
      const newDigits = [...digits];
      newDigits[index] = "";
      onChange(newDigits.join(""));
      return;
    }

    if (val.length === 1) {
      const newDigits = [...digits];
      newDigits[index] = val;
      onChange(newDigits.join(""));
      // Focus next
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else {
      // User typed or pasted multiple digits into one field
      const newDigits = [...digits];
      const pastedChars = val.slice(0, length - index).split("");
      for (let i = 0; i < pastedChars.length; i++) {
        if (index + i < length) {
          newDigits[index + i] = pastedChars[i];
        }
      }
      onChange(newDigits.join(""));
      const nextIndex = Math.min(index + pastedChars.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Move to previous and clear it
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
      } else {
        const newDigits = [...digits];
        newDigits[index] = "";
        onChange(newDigits.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, length);
    if (!pastedData) return;
    onChange(pastedData);
    const targetIdx = Math.min(pastedData.length, length - 1);
    inputRefs.current[targetIdx]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold tracking-wider rounded-xl border bg-white shadow-xs transition-all duration-150 outline-hidden ${
            error
              ? "border-rose-400 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-3 focus:ring-rose-100"
              : digit
              ? "border-indigo-600 bg-indigo-50/20 text-indigo-950 ring-2 ring-indigo-50"
              : "border-slate-200 text-slate-900 focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100"
          } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-100" : "hover:border-slate-300"}`}
        />
      ))}
    </div>
  );
}

export default OtpInput;
