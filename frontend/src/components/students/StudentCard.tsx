import { Link } from "react-router-dom";
import type { Student } from "../../features/students/students.types";

import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import Card from "../ui/Card";

interface StudentCardProps {
  student: Student;
}

const StudentCard = ({ student }: StudentCardProps) => {
  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Avatar
          src={student.profileImage ?? undefined}
          alt={student.fullName}
        />

        <div className="flex-1">
          <h3 className="text-lg font-semibold">
            {student.fullName}
          </h3>

          <p className="text-sm text-gray-500">
            {student.course ?? "Course"} • {student.year ?? "Year"}
          </p>

          <p className="text-sm text-gray-500">
            {student.college}
          </p>
        </div>
      </div>

      {student.bio && (
        <p className="text-sm text-gray-600 line-clamp-2">
          {student.bio}
        </p>
      )}

      <Link to={`/profile/${student.id}`}>
        <Button className="w-full">
          View Profile
        </Button>
      </Link>
    </Card>
  );
};

export default StudentCard;
