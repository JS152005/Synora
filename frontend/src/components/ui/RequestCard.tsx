import { Link } from "react-router-dom";
import { Check, X, MessageSquare, Calendar, School, GraduationCap } from "lucide-react";
import Avatar from "./Avatar";
import Button from "./Button";
import Badge from "./Badge";
import type { StudyPartnerRequest } from "../../types/request";
import type { User } from "../../types/user";

export interface RequestCardProps {
  type: "incoming" | "outgoing" | "partner";
  request?: StudyPartnerRequest;
  partner?: User;
  isOnline?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  onChat?: () => void;
  isLoadingAction?: boolean;
}

function RequestCard({
  type,
  request,
  partner,
  isOnline = false,
  onAccept,
  onReject,
  onCancel,
  onChat,
  isLoadingAction = false,
}: RequestCardProps) {
  const user = type === "incoming" ? request?.sender : type === "outgoing" ? request?.receiver : partner;

  if (!user) return null;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 interactive-card transition-all">
      <div className="space-y-3.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            <Link to={`/students/${user.id}`} tabIndex={-1}>
              <Avatar
                src={user.profileImage}
                name={user.fullName}
                size="md"
                isOnline={isOnline}
              />
            </Link>

            <div className="min-w-0 flex-1">
              <Link
                to={`/students/${user.id}`}
                className="text-sm font-semibold text-slate-900 hover:text-indigo-600 truncate block transition leading-snug"
              >
                {user.fullName}
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 truncate">
                <GraduationCap className="h-3 w-3 shrink-0 text-slate-400" />
                <span className="truncate">
                  {user.course || "MBBS"}
                  {user.year ? ` · ${user.year}` : ""}
                </span>
              </div>
              {user.college && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 truncate">
                  <School className="h-3 w-3 shrink-0 text-slate-400" />
                  <span className="truncate">{user.college}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            {type === "incoming" && (
              <Badge variant="primary" size="xs">
                Invitation
              </Badge>
            )}
            {type === "outgoing" && (
              <Badge variant="warning" size="xs" dot>
                Pending
              </Badge>
            )}
            {type === "partner" && (
              <Badge variant="success" size="xs" dot>
                Connected
              </Badge>
            )}
          </div>
        </div>

        {/* Bio or Message Note */}
        {type === "incoming" && (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-indigo-600 mb-0.5">
              Study Partner Request
            </span>
            <p className="text-xs text-indigo-950">
              Invited you to collaborate and share medical curriculum topics.
            </p>
          </div>
        )}

        {type === "partner" && partner?.bio && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {partner.bio}
          </p>
        )}

        {/* Date for requests */}
        {request?.createdAt && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            <span>
              {type === "incoming" ? "Received" : "Sent"}{" "}
              {new Date(request.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-4.5 flex items-center gap-2 border-t border-slate-100 pt-3.5">
        {type === "incoming" && (
          <>
            <Button
              variant="success"
              size="sm"
              className="flex-1"
              isLoading={isLoadingAction}
              onClick={onAccept}
              leftIcon={<Check className="h-3.5 w-3.5" />}
            >
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              isLoading={isLoadingAction}
              onClick={onReject}
              leftIcon={<X className="h-3.5 w-3.5" />}
            >
              Decline
            </Button>
          </>
        )}

        {type === "outgoing" && (
          <>
            <Link to={`/students/${user.id}`} className="flex-1">
              <Button variant="outline" size="sm" fullWidth>
                Profile
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
              isLoading={isLoadingAction}
              onClick={onCancel}
            >
              Cancel
            </Button>
          </>
        )}

        {type === "partner" && (
          <>
            <Link to={`/students/${user.id}`} className="flex-1">
              <Button variant="outline" size="sm" fullWidth>
                Profile
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              isLoading={isLoadingAction}
              onClick={onChat}
              leftIcon={<MessageSquare className="h-3.5 w-3.5" />}
            >
              Chat
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default RequestCard;
