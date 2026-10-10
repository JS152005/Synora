import { Link, useNavigate } from "react-router-dom";
import { UserCheck, School, GraduationCap, MessageSquare, ShieldCheck } from "lucide-react";
import type { PublicProfileUser } from "../../types/user";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { useSocket } from "../../context/SocketContext";

export interface StudentCardProps {
  student: PublicProfileUser;
  onConnect?: (userId: string) => void;
  isConnecting?: boolean;
  hasSentRequest?: boolean;
  isPartner?: boolean;
  className?: string;
}

const StudentCard = ({
  student,
  onConnect,
  isConnecting = false,
  hasSentRequest = false,
  isPartner = false,
  className = "",
}: StudentCardProps) => {
  const navigate = useNavigate();
  const { isUserOnline } = useSocket();
  const isOnline = isUserOnline(student.id);

  const canHelpTopics =
    student.userTopics?.filter((t) => t.type === "CAN_HELP") || [];
  const learningTopics =
    student.userTopics?.filter((t) => t.type === "LEARNING") || [];

  return (
    <div
      className={`
        group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5
        interactive-card text-left transition-all duration-200
        ${className}
      `.trim().replace(/\s+/g, " ")}
    >
      <div className="space-y-3.5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Link to={`/students/${student.id}`} className="shrink-0" tabIndex={-1}>
            <Avatar
              src={student.profileImage}
              name={student.fullName}
              size="md"
              isOnline={isOnline}
            />
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                to={`/students/${student.id}`}
                className="block text-sm font-semibold text-slate-900 group-hover:text-indigo-600 truncate transition leading-snug"
              >
                {student.fullName}
              </Link>
              {student.hasVerifiedMed && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200 shrink-0" title="Verified Medical Student">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  Verified Med
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 truncate">
              <GraduationCap className="h-3.5 w-3.5 shrink-0 text-indigo-500" aria-hidden="true" />
              <span className="truncate">
                {student.course || "MBBS"}
                {student.year ? ` · ${student.year}` : ""}
              </span>
            </div>

            {student.college && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 truncate">
                <School className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />
                <span className="truncate">{student.college}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {student.bio ? (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {student.bio}
          </p>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Medical student collaborating on curriculum topics.
          </p>
        )}

        {/* Topic Badges */}
        {(canHelpTopics.length > 0 || learningTopics.length > 0) && (
          <div className="space-y-1.5 pt-0.5">
            {canHelpTopics.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 mr-0.5">
                  Teaches:
                </span>
                {canHelpTopics.slice(0, 2).map((ut, i) => (
                  <Badge key={i} variant="success" size="xs">
                    {ut.topic?.name}
                  </Badge>
                ))}
                {canHelpTopics.length > 2 && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    +{canHelpTopics.length - 2}
                  </span>
                )}
              </div>
            )}

            {learningTopics.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 mr-0.5">
                  Learning:
                </span>
                {learningTopics.slice(0, 2).map((ut, i) => (
                  <Badge key={i} variant="primary" size="xs">
                    {ut.topic?.name}
                  </Badge>
                ))}
                {learningTopics.length > 2 && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    +{learningTopics.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-4.5 flex items-center gap-2 border-t border-slate-100 pt-3.5">
        <Link to={`/students/${student.id}`} className="flex-1">
          <Button variant="outline" size="sm" fullWidth>
            Profile
          </Button>
        </Link>

        {isPartner ? (
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => navigate("/chat")}
            leftIcon={<MessageSquare className="h-3.5 w-3.5" />}
          >
            Chat
          </Button>
        ) : hasSentRequest ? (
          <Button variant="secondary" size="sm" disabled className="flex-1">
            Pending
          </Button>
        ) : onConnect ? (
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            isLoading={isConnecting}
            onClick={() => onConnect(student.id)}
            leftIcon={<UserCheck className="h-3.5 w-3.5" />}
          >
            Connect
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default StudentCard;
