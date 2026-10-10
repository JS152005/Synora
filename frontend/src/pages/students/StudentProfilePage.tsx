import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  School,
  GraduationCap,
  Calendar,
  MessageSquare,
  UserCheck,
  BookOpen,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

import { getPublicProfile } from "../../api/user.api";
import {
  getOutgoingRequests,
  getStudyPartners,
  sendStudyPartnerRequest,
  cancelStudyPartnerRequest,
} from "../../api/studyPartner.api";
import { createConversation } from "../../api/conversation.api";
import { useAuth } from "../../features/auth/useAuth";
import { useSocket } from "../../context/SocketContext";
import { getErrorMessage } from "../../utils/error";

import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import Breadcrumb from "../../components/ui/Breadcrumb";
import { Skeleton, SkeletonAvatar, SkeletonText } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";

function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { isUserOnline } = useSocket();

  const isMe = currentUser?.id === id;

  const { data: student, isLoading } = useQuery({
    queryKey: ["publicProfile", id],
    queryFn: () => getPublicProfile(id!),
    enabled: !!id,
  });

  const { data: outgoingRequests = [] } = useQuery({
    queryKey: ["outgoingRequests"],
    queryFn: getOutgoingRequests,
  });

  const { data: studyPartners = [] } = useQuery({
    queryKey: ["studyPartners"],
    queryFn: getStudyPartners,
  });

  const pendingRequest = outgoingRequests.find((r) => r.receiverId === id);
  const isPartner = studyPartners.some((p) => p.id === id);

  const connectMutation = useMutation({
    mutationFn: () => sendStudyPartnerRequest(id!),
    onSuccess: () => {
      toast.success("Study partner request sent!");
      queryClient.invalidateQueries({ queryKey: ["outgoingRequests"] });
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Failed to send request.")),
  });

  const cancelMutation = useMutation({
    mutationFn: (requestId: string) => cancelStudyPartnerRequest(requestId),
    onSuccess: () => {
      toast.success("Request cancelled.");
      queryClient.invalidateQueries({ queryKey: ["outgoingRequests"] });
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Failed to cancel request.")),
  });

  const chatMutation = useMutation({
    mutationFn: () => createConversation(id!),
    onSuccess: (res) =>
      navigate(`/chat?conversationId=${res.data.id}`),
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Failed to open chat.")),
  });

  /* ── Skeleton Loading ─────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="h-6 w-32 skeleton rounded-md" aria-hidden="true" />
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="h-32 md:h-44 skeleton rounded-none" aria-hidden="true" />
          <div className="px-6 py-6 space-y-5">
            <div className="flex items-end gap-4 -mt-16">
              <SkeletonAvatar size="lg" />
              <div className="flex-1 space-y-2 pb-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
              {[1, 2, 3].map((i) => (
                <SkeletonText key={i} lines={2} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Not Found ───────────────────────────────────────────────────────────── */
  if (!student) {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <EmptyState
          icon={<UserCheck className="h-6 w-6" />}
          title="Student profile not found"
          description="The requested medical student profile does not exist or has been removed."
          actionLabel="Back to Student Directory"
          onAction={() => navigate("/students")}
        />
      </div>
    );
  }

  const isOnline = isUserOnline(student.id);
  const canHelpTopics = student.userTopics?.filter((t) => t.type === "CAN_HELP") || [];
  const learningTopics = student.userTopics?.filter((t) => t.type === "LEARNING") || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            { label: "Students", href: "/students" },
            { label: student.fullName },
          ]}
        />

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        {/* Cover */}
        <div className="relative h-32 md:h-44 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #a5b4fc 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
            aria-hidden="true"
          />
        </div>

        <div className="relative px-6 pb-6 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="relative inline-block -mt-12 sm:-mt-14 shrink-0">
                <Avatar
                  src={student.profileImage}
                  name={student.fullName}
                  size="xl"
                  isOnline={isOnline}
                  className="border-4 border-white shadow-md ring-0"
                />
              </div>

              <div className="space-y-1 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-900">
                    {student.fullName}
                  </h1>
                  {student.hasVerifiedMed && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200" title="Verified Medical Student">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      Verified Med
                    </span>
                  )}
                  {isPartner && (
                    <Badge variant="success" size="xs" dot>
                      Connected Partner
                    </Badge>
                  )}
                  {isMe && (
                    <Badge variant="primary" size="xs">
                      You
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500">{student.email}</p>
              </div>
            </div>

            {/* Profile Actions */}
            {!isMe && (
              <div className="flex items-center gap-2 self-start sm:self-end">
                {isPartner ? (
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={chatMutation.isPending}
                    onClick={() => chatMutation.mutate()}
                    leftIcon={<MessageSquare className="h-4 w-4" />}
                  >
                    Open Study Chat
                  </Button>
                ) : pendingRequest ? (
                  <Button
                    variant="secondary"
                    size="md"
                    isLoading={cancelMutation.isPending}
                    onClick={() => cancelMutation.mutate(pendingRequest.id)}
                  >
                    Cancel Request
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={connectMutation.isPending}
                    onClick={() => connectMutation.mutate()}
                    leftIcon={<UserCheck className="h-4 w-4" />}
                  >
                    Connect as Partner
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Academic Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-5">
            <div className="flex items-start gap-2.5">
              <School className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Medical College
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {student.college || "Not specified"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <GraduationCap className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Degree & Course
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {student.course || "MBBS"}
                  {student.year ? ` · ${student.year}` : ""}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Academic Year
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {student.year || "Active Student"}
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {student.bio && (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                About & Learning Objectives
              </span>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {student.bio}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card
          title={
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-emerald-600" aria-hidden="true" />
              <span>Can Teach & Mentor ({canHelpTopics.length})</span>
            </div>
          }
          subtitle="Topics this student excels in and can mentor study partners on"
        >
          {canHelpTopics.length === 0 ? (
            <EmptyState
              title="No teaching topics listed"
              description="This student hasn't specified topics they can mentor on yet."
              size="sm"
            />
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {canHelpTopics.map((ut, idx) => (
                <Badge key={idx} variant="success" size="sm">
                  {ut.topic?.name}
                  {ut.topic?.subject?.name && (
                    <span className="opacity-65 ml-1 text-[10px]">
                      · {ut.topic.subject.name}
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          )}
        </Card>

        <Card
          title={
            <div className="flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-indigo-600" aria-hidden="true" />
              <span>Currently Learning ({learningTopics.length})</span>
            </div>
          }
          subtitle="Medical curriculum topics this student is currently revising"
        >
          {learningTopics.length === 0 ? (
            <EmptyState
              title="No learning topics listed"
              description="This student hasn't specified topics they are revising yet."
              size="sm"
            />
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {learningTopics.map((ut, idx) => (
                <Badge key={idx} variant="primary" size="sm">
                  {ut.topic?.name}
                  {ut.topic?.subject?.name && (
                    <span className="opacity-65 ml-1 text-[10px]">
                      · {ut.topic.subject.name}
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default StudentProfilePage;
