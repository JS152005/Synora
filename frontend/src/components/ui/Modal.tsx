import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  width?: "sm" | "md" | "lg" | "xl";
}

const widths = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

function Modal({
  isOpen,
  title,
  description,
  children,
  footer,
  onClose,
  width = "md",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    // Focus the modal
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`
          relative z-10 w-full ${widths[width]}
          rounded-2xl bg-white border border-slate-100
          shadow-2xl shadow-slate-900/10
          animate-slide-up
          my-8
          flex flex-col
          max-h-[90vh]
          outline-none
        `.trim().replace(/\s+/g, " ")}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 shrink-0">
            <div className="min-w-0">
              {title && (
                <h2
                  id="modal-title"
                  className="text-base font-semibold text-slate-900 leading-snug"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4.5 w-4.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto p-6 flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-slate-100 px-6 py-4 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
