import {
  ReactNode,
  useEffect,
} from "react";

interface ModalProps {
  isOpen: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
  width?: "sm" | "md" | "lg" | "xl";
}

function Modal({
  isOpen,
  title,
  children,
  onClose,
  width = "md",
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const widths = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className={`
          w-full
          ${widths[width]}
          rounded-xl
          bg-white
          shadow-2xl
          animate-in
          fade-in
          zoom-in-95
          duration-200
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {title}
            </h2>

            <button
              onClick={onClose}
              className="rounded p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              aria-label="Close modal"
            >
              ?
            </button>
          </div>
        )}

        <div className="max-h-[80vh] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
