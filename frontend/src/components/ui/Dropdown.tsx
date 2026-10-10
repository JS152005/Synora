import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  dividerBefore?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
  width?: string;
}

function Dropdown({
  trigger,
  items,
  align = "right",
  className = "",
  width = "w-52",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsOpen((prev) => !prev);
          }
        }}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute top-full mt-1.5 z-50 py-1.5 rounded-xl border border-slate-200/90 bg-white
            shadow-xl shadow-slate-900/10 animate-slide-up ${width}
            ${align === "right" ? "right-0" : "left-0"}
          `.trim().replace(/\s+/g, " ")}
          role="menu"
        >
          {items.map((item) => (
            <div key={item.id}>
              {item.dividerBefore && (
                <div className="my-1 border-t border-slate-100" />
              )}
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setIsOpen(false);
                  item.onClick();
                }}
                className={`
                  flex w-full items-center gap-2.5 px-3.5 py-2 text-xs transition cursor-pointer text-left
                  ${
                    item.danger
                      ? "text-rose-600 hover:bg-rose-50"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }
                  ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}
                `.trim().replace(/\s+/g, " ")}
              >
                {item.icon && (
                  <span className="shrink-0 h-3.5 w-3.5">{item.icon}</span>
                )}
                <span className="flex-1 truncate">{item.label}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
