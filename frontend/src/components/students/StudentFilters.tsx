import Select from "../ui/Select";

interface StudentFiltersProps {
  course: string;
  year: string;
  onCourseChange: (value: string) => void;
  onYearChange: (value: string) => void;
}

const StudentFilters = ({
  course,
  year,
  onCourseChange,
  onYearChange,
}: StudentFiltersProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Select
        value={course}
        onChange={(e) => onCourseChange(e.target.value)}
      >
        <option value="">All Courses</option>
        <option>MBBS</option>
        <option>BDS</option>
        <option>BAMS</option>
        <option>BHMS</option>
        <option>BPT</option>
        <option>B.Sc Nursing</option>
      </Select>

      <Select
        value={year}
        onChange={(e) => onYearChange(e.target.value)}
      >
        <option value="">All Years</option>
        <option>1st Year</option>
        <option>2nd Year</option>
        <option>3rd Year</option>
        <option>4th Year</option>
        <option>Intern</option>
      </Select>
    </div>
  );
};

export default StudentFilters;
