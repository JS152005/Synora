import { useState } from "react";

import SearchBar from "../components/students/SearchBar";
import StudentFilters from "../components/students/StudentFilters";
import StudentCard from "../components/students/StudentCard";

import { useStudents } from "../features/students/useStudents";

const StudentsPage = () => {
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");

  const {
    students,
    isLoading,
  } = useStudents({
    name,
    course,
    year,
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Search Students
        </h1>

        <p className="text-gray-500 mt-2">
          Find students by name, course and academic year.
        </p>
      </div>

      <SearchBar
        value={name}
        onChange={setName}
      />

      <StudentFilters
        course={course}
        year={year}
        onCourseChange={setCourse}
        onYearChange={setYear}
      />

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
