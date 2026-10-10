import Select from "../ui/Select";
import { Filter, RotateCcw } from "lucide-react";

interface StudentFiltersProps {
  course: string;
  year: string;
  college: string;
  onCourseChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onCollegeChange: (value: string) => void;
  onReset: () => void;
}

const courseOptions = [
  { value: "MBBS", label: "MBBS" },
  { value: "BDS", label: "BDS" },
  { value: "BAMS", label: "BAMS" },
  { value: "BHMS", label: "BHMS" },
  { value: "BPT", label: "BPT" },
  { value: "B.Sc Nursing", label: "B.Sc Nursing" },
  { value: "Pharmacy", label: "Pharmacy" },
];

const yearOptions = [
  { value: "1st Year", label: "1st Year" },
  { value: "2nd Year", label: "2nd Year" },
  { value: "3rd Year", label: "3rd Year" },
  { value: "4th Year", label: "4th Year" },
  { value: "Intern", label: "Intern" },
];

const collegeOptions = [
  { value: "AIIMS New Delhi", label: "AIIMS New Delhi" },
  { value: "CMC Vellore", label: "CMC Vellore" },
  { value: "JIPMER Puducherry", label: "JIPMER Puducherry" },
  { value: "Madras Medical College", label: "Madras Medical College" },
  { value: "Stanley Medical College", label: "Stanley Medical College" },
  { value: "Saveetha Medical College", label: "Saveetha Medical College" },
  { value: "SRM Medical College", label: "SRM Medical College" },
  { value: "JS Medical College", label: "JS Medical College" },
];

const StudentFilters = ({
  course,
  year,
  college,
  onCourseChange,
  onYearChange,
  onCollegeChange,
  onReset,
}: StudentFiltersProps) => {
  const hasActiveFilters = course || year || college;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-indigo-600" />
          <span>Filter Students</span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-indigo-600 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          value={course}
          onChange={(e) => onCourseChange(e.target.value)}
          options={courseOptions}
          placeholder="All Courses"
        />

        <Select
          value={year}
          onChange={(e) => onYearChange(e.target.value)}
          options={yearOptions}
          placeholder="All Academic Years"
        />

        <Select
          value={college}
          onChange={(e) => onCollegeChange(e.target.value)}
          options={collegeOptions}
          placeholder="All Colleges"
        />
      </div>
    </div>
  );
};

export default StudentFilters;
