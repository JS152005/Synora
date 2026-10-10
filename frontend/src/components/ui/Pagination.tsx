import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/80 pt-4 ${className}`}
    >
      <div className="text-xs text-slate-500">
        Page <span className="font-semibold text-slate-800">{currentPage}</span> of{" "}
        <span className="font-semibold text-slate-800">{totalPages}</span>
        {totalItems !== undefined && (
          <span className="ml-1 text-slate-400">· {totalItems} total</span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
          aria-label="Previous page"
        >
          Previous
        </Button>

        {/* Page numbers preview */}
        <div className="hidden md:flex items-center gap-1 px-1">
          {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
            const pageNum = i + 1;
            const isCurrent = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                aria-current={isCurrent ? "page" : undefined}
                className={`
                  h-7 w-7 rounded-lg text-xs font-medium transition cursor-pointer
                  ${
                    isCurrent
                      ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }
                `.trim().replace(/\s+/g, " ")}
              >
                {pageNum}
              </button>
            );
          })}
          {totalPages > 5 && (
            <span className="text-xs text-slate-400 px-1">...</span>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </nav>
  );
}

export default Pagination;
