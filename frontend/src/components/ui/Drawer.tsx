import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  side?: "left" | "right";
  width?: string;
}

function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  side = "left",
  width = "w-80 max-w-[85vw]",
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        className={`
          relative z-10 flex h-full ${width} flex-col bg-white shadow-2xl
          ${side === "left" ? "mr-auto animate-slide-right" : "ml-auto animate-slide-up"}
        `.trim().replace(/\s+/g, " ")}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
            <div className="min-w-0">
              {title && (
                <h2 className="text-sm font-semibold text-slate-900 truncate">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {footer && (
          <div className="border-t border-slate-100 p-4 bg-slate-50/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Drawer;
