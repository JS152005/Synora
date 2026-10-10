import { ChevronRight, BookOpen } from "lucide-react";
import Badge from "./Badge";
import type { Subject } from "../../types/subject";

export interface SubjectCardProps {
  subject: Subject;
  onClick: () => void;
  learningCount?: number;
  teachingCount?: number;
  className?: string;
}

// Subject categorization according to Indian MBBS Curriculum phases
const getPhaseForSubject = (code: string) => {
  const c = code.toUpperCase();
  if (["ANAT", "PHYS", "BIOCHEM"].includes(c)) return "Phase I · Pre-Clinical";
  if (["PATH", "PHARM", "MICRO", "FMT"].includes(c)) return "Phase II · Para-Clinical";
  if (["COMMED", "ENT", "OPHTH"].includes(c)) return "Phase III Pt 1 · Clinical";
  return "Phase III Pt 2 · Clinical Specialities";
};

function SubjectCard({
  subject,
  onClick,
  learningCount = 0,
  teachingCount = 0,
  className = "",
}: SubjectCardProps) {
  const phase = getPhaseForSubject(subject.code);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`
        group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5
        text-left interactive-card cursor-pointer select-none
        focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent
        ${className}
      `.trim().replace(/\s+/g, " ")}
      aria-label={`Explore ${subject.name} curriculum topics`}
    >
      <div className="space-y-3.5">
        {/* Top Header */}
        <div className="flex w-full items-start justify-between gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs tracking-wider border border-indigo-100/80 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all duration-200">
            {subject.code}
          </div>

          <Badge variant="outline" size="xs">
            MBBS
          </Badge>
        </div>

        {/* Title & Phase */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-1">
            {subject.name}
          </h3>
          <p className="mt-1 text-[11px] text-slate-400 font-medium line-clamp-1">
            {phase}
          </p>
        </div>

        {/* User topic status indicators if any */}
        {(learningCount > 0 || teachingCount > 0) && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {learningCount > 0 && (
              <Badge variant="primary" size="xs" dot>
                {learningCount} Learning
              </Badge>
            )}
            {teachingCount > 0 && (
              <Badge variant="success" size="xs" dot>
                {teachingCount} Teaching
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-4 flex w-full items-center justify-between border-t border-slate-100 pt-3.5 text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
        <span className="flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Explore Syllabus</span>
        </span>
        <ChevronRight
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export default SubjectCard;
