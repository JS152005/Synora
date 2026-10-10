import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  BookOpen,
  Sparkles,
  GraduationCap,
  Check,
  X,
  UserCheck,
  MessageSquare,
  ArrowRight,
  Plus,
  Compass,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../features/auth/useAuth";
import { getMyTopics } from "../../api/userTopic.api";
import { getHelpers, getLearners } from "../../api/match.api";
import {
  getStudyPartners,
  getIncomingRequests,
  acceptStudyPartnerRequest,
  rejectStudyPartnerRequest,
} from "../../api/studyPartner.api";
import { createConversation } from "../../api/conversation.api";
import { useSocket } from "../../context/SocketContext";
import { getErrorMessage } from "../../utils/error";

import StatCard from "../../components/ui/StatCard";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { Skeleton, SkeletonAvatar } from "../../components/ui/Skeleton";
import Tabs from "../../components/ui/Tabs";

type MatchTab = "helpers" | "learners";

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const [matchTab, setMatchTab] = useState<MatchTab>("helpers");

  /* ─ Queries ─────────────────────────────────────────────────────────────── */
  const { data: myTopics = [], isLoading: loadingTopics } = useQuery({
    queryKey: ["myTopics"],
    queryFn: getMyTopics,
  });

  const { data: studyPartners = [], isLoading: loadingPartners } = useQuery({
    queryKey: ["studyPartners"],
    queryFn: getStudyPartners,
  });

  const { data: incomingRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["incomingRequests"],
    queryFn: getIncomingRequests,
  });

  const { data: matchHelpers = [], isLoading: loadingHelpers } = useQuery({
    queryKey: ["matchHelpers"],
    queryFn: getHelpers,
  });

  const { data: matchLearners = [], isLoading: loadingLearners } = useQuery({
    queryKey: ["matchLearners"],
    queryFn: getLearners,
  });

  /* ─ Mutations ────────────────────────────────────────────────────────────── */
  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => acceptStudyPartnerRequest(requestId),
    onSuccess: () => {
      toast.success("Study partner request accepted! Direct chat enabled.");
      queryClient.invalidateQueries({ queryKey: ["incomingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["studyPartners"] });
      queryClient.invalidateQueries({ queryKey: ["incomingRequestsBadge"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Failed to accept request.")),
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => rejectStudyPartnerRequest(requestId),
    onSuccess: () => {
      toast.success("Request declined.");
      queryClient.invalidateQueries({ queryKey: ["incomingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["incomingRequestsBadge"] });
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Failed to decline request.")),
  });

  const chatMutation = useMutation({
    mutationFn: (partnerId: string) => createConversation(partnerId),
    onSuccess: (res) => navigate(`/chat?conversationId=${res.data.id}`),
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Could not open chat.")),
  });

  /* ─ Time of Day Greeting ─────────────────────────────────────────────────── */
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 17
      ? "Good afternoon"
      : "Good evening";

  const firstName = user?.fullName?.split(" ")[0] || "Doctor";
  const learningTopics = myTopics.filter((t) => t.type === "LEARNING");
  const canHelpTopics = myTopics.filter((t) => t.type === "CAN_HELP");

  const activeMatches = matchTab === "helpers" ? matchHelpers : matchLearners;
  const isLoadingMatches = matchTab === "helpers" ? loadingHelpers : loadingLearners;

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-12">
      {/* ── Welcome Banner ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-6 md:p-8 text-white shadow-md shadow-indigo-950/20">
        {/* Subtle dot pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #a5b4fc 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden="true"
        />
        {/* Soft background glow */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-xs">
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Medical Collaboration Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              {greeting}, {firstName}
            </h1>
            <p className="text-sm text-indigo-200/90 max-w-xl leading-relaxed">
              {myTopics.length === 0
                ? "Tag your curriculum topics to enable smart peer matching with medical peers."
                : `Active curriculum: ${learningTopics.length} learning · ${canHelpTopics.length} teaching · ${studyPartners.length} connected partners.`}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="white"
              size="sm"
              onClick={() => navigate("/subjects")}
              leftIcon={<BookOpen className="h-3.5 w-3.5" />}
            >
              Browse Subjects
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/students")}
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              className="!bg-white !text-indigo-950 hover:!bg-indigo-50 font-semibold shadow-xs"
            >
              Find Study Partners
            </Button>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Study Partners"
          value={loadingPartners ? "—" : studyPartners.length}
          subLabel="Connected peers"
          icon={<Users className="h-5 w-5" />}
          iconColor="indigo"
          isLoading={loadingPartners}
          className="interactive-card cursor-pointer"
          onClick={() => navigate("/requests?tab=partners")}
        />
        <StatCard
          label="Currently Learning"
          value={loadingTopics ? "—" : learningTopics.length}
          subLabel="Revising topics"
          icon={<GraduationCap className="h-5 w-5" />}
          iconColor="blue"
          isLoading={loadingTopics}
          className="interactive-card cursor-pointer"
          onClick={() => navigate("/profile")}
        />
        <StatCard
          label="Can Teach & Help"
          value={loadingTopics ? "—" : canHelpTopics.length}
          subLabel="Peer mentor topics"
          icon={<Sparkles className="h-5 w-5" />}
          iconColor="emerald"
          isLoading={loadingTopics}
          className="interactive-card cursor-pointer"
          onClick={() => navigate("/profile")}
        />
        <StatCard
          label="Incoming Requests"
          value={loadingRequests ? "—" : incomingRequests.length}
          subLabel={incomingRequests.length > 0 ? "Awaiting your reply" : "Up to date"}
          icon={<UserCheck className="h-5 w-5" />}
          iconColor="amber"
          isLoading={loadingRequests}
          className="interactive-card cursor-pointer"
          onClick={() => navigate("/requests")}
        />
      </div>

      {/* ── Main Two-Column Layout ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left Column: Smart Matchmaking & Curriculum Focus */}
        <div className="space-y-6">
          {/* Smart Peer Matching */}
          <Card
            title="Smart Peer Matchmaking"
            subtitle="Reciprocal peer matches calculated from your medical curriculum topics"
            action={
              <Button
                variant="ghost"
                size="xs"
                onClick={() => navigate("/students")}
                rightIcon={<ArrowRight className="h-3 w-3" />}
              >
                All students
              </Button>
            }
          >
            <Tabs
              tabs={[
                {
                  key: "helpers" as MatchTab,
                  label: "Can Help You",
                  count: matchHelpers.length,
                },
                {
                  key: "learners" as MatchTab,
                  label: "Need Your Help",
                  count: matchLearners.length,
                },
              ]}
              activeTab={matchTab}
              onChange={setMatchTab}
              variant="pills"
              className="mb-4"
            />

            {isLoadingMatches ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                    <SkeletonAvatar size="sm" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-2.5 w-24" />
                    </div>
                    <Skeleton className="h-7 w-16" rounded="lg" />
                  </div>
                ))}
              </div>
            ) : activeMatches.length === 0 ? (
              <EmptyState
                icon={<Sparkles className="h-5 w-5" />}
                title={
                  matchTab === "helpers"
                    ? "No helpers matched yet"
                    : "No learners matched yet"
                }
                description={
                  matchTab === "helpers"
                    ? "Add topics you are currently revising in your academic profile so peers who excel in them can connect."
                    : "Add topics you can teach or mentor to show up for peers who need study guidance."
                }
                actionLabel="Manage Curriculum Topics"
                onAction={() => navigate("/profile")}
                size="sm"
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {(activeMatches || []).slice(0, 5).map((match) => {
                  if (!match?.user) return null;
                  const matchedTopics = match.matchedTopics || [];
                  return (
                    <div
                      key={match.user.id}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:bg-slate-50/70 rounded-xl px-2.5 -mx-2.5 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          src={match.user.profileImage}
                          name={match.user.fullName || "Student"}
                          size="sm"
                          isOnline={isUserOnline(match.user.id)}
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/students/${match.user.id}`}
                            className="block truncate text-xs font-semibold text-slate-900 hover:text-indigo-600 transition"
                          >
                            {match.user.fullName || "Medical Student"}
                          </Link>
                          <p className="truncate text-[11px] text-slate-500">
                            {match.user.course || "MBBS"} ·{" "}
                            {match.user.college || "Medical College"}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {matchedTopics.slice(0, 2).map((t) => (
                              <Badge key={t.id || t.code} variant="primary" size="xs">
                                {t.name}
                              </Badge>
                            ))}
                            {matchedTopics.length > 2 && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                +{matchedTopics.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Link to={`/students/${match.user.id}`} className="shrink-0">
                        <Button variant="outline" size="xs">
                          View
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Curriculum Focus */}
          <Card
            title="My Curriculum Focus"
            subtitle="Topics powering your reciprocal study partner recommendations"
            action={
              myTopics.length > 0 ? (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => navigate("/profile")}
                  rightIcon={<ArrowRight className="h-3 w-3" />}
                >
                  Manage in Profile
                </Button>
              ) : undefined
            }
          >
            {myTopics.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="h-5 w-5" />}
                title="Curriculum topics empty"
                description="Tag topics across 19 MBBS subjects to activate automatic peer matchmaking."
                actionLabel="Explore Subjects"
                onAction={() => navigate("/subjects")}
                size="sm"
              />
            ) : (
              <div className="space-y-4">
                {learningTopics.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                        Currently Learning ({learningTopics.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {learningTopics.map((t) => (
                        <Badge key={t.id} variant="primary" size="sm">
                          {t.topic?.name || "Topic"}
                          {t.topic?.subject?.code && (
                            <span className="opacity-60 ml-0.5 text-[9px]">
                              [{t.topic.subject.code}]
                            </span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {canHelpTopics.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                        Can Teach & Mentor ({canHelpTopics.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {canHelpTopics.map((t) => (
                        <Badge key={t.id} variant="success" size="sm">
                          {t.topic?.name || "Topic"}
                          {t.topic?.subject?.code && (
                            <span className="opacity-60 ml-0.5 text-[9px]">
                              [{t.topic.subject.code}]
                            </span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Want to add more clinical topics?
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => navigate("/subjects")}
                    leftIcon={<Plus className="h-3 w-3" />}
                  >
                    Add Topics
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Requests, Partners, Quick Actions */}
        <div className="space-y-6">
          {/* Incoming Partner Requests */}
          <Card
            title="Incoming Requests"
            subtitle="Pending study partner invitations"
            action={
              incomingRequests.length > 0 ? (
                <Link to="/requests">
                  <Button variant="ghost" size="xs" rightIcon={<ArrowRight className="h-3 w-3" />}>
                    All ({incomingRequests.length})
                  </Button>
                </Link>
              ) : undefined
            }
          >
            {loadingRequests ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <SkeletonAvatar size="sm" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-2.5 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : incomingRequests.length === 0 ? (
              <EmptyState
                icon={<UserCheck className="h-5 w-5" />}
                title="No pending requests"
                description="Study partner invitations from medical peers will appear here."
                size="sm"
              />
            ) : (
              <div className="space-y-3">
                {(incomingRequests || []).slice(0, 3).map((req) => {
                  if (!req) return null;
                  const senderName = req.sender?.fullName || "Student";
                  return (
                    <div
                      key={req.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar
                          src={req.sender?.profileImage}
                          name={senderName}
                          size="sm"
                          isOnline={req.sender?.id ? isUserOnline(req.sender.id) : false}
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/students/${req.sender?.id || ""}`}
                            className="block truncate text-xs font-semibold text-slate-900 hover:text-indigo-600 leading-snug"
                          >
                            {senderName}
                          </Link>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {req.sender?.course || "MBBS"}
                            {req.sender?.year ? ` · ${req.sender.year}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => acceptMutation.mutate(req.id)}
                          disabled={acceptMutation.isPending}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer disabled:opacity-50"
                          title="Accept request"
                          aria-label={`Accept request from ${senderName}`}
                        >
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate(req.id)}
                          disabled={rejectMutation.isPending}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer disabled:opacity-50"
                          title="Decline request"
                          aria-label={`Decline request from ${senderName}`}
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {incomingRequests.length > 3 && (
                  <Link to="/requests" className="block pt-1">
                    <Button variant="outline" size="sm" fullWidth>
                      View {incomingRequests.length - 3} more requests
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </Card>

          {/* Connected Study Partners */}
          <Card
            title="My Study Partners"
            subtitle="Your active collaborative study network"
            action={
              studyPartners.length > 0 ? (
                <Link to="/requests?tab=partners">
                  <Button variant="ghost" size="xs" rightIcon={<ArrowRight className="h-3 w-3" />}>
                    All ({studyPartners.length})
                  </Button>
                </Link>
              ) : undefined
            }
          >
            {loadingPartners ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <SkeletonAvatar size="sm" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-2 w-16" />
                    </div>
                    <Skeleton className="h-7 w-14" rounded="lg" />
                  </div>
                ))}
              </div>
            ) : studyPartners.length === 0 ? (
              <EmptyState
                icon={<Users className="h-5 w-5" />}
                title="No study partners yet"
                description="Connect with students who share your learning goals."
                actionLabel="Discover Students"
                onAction={() => navigate("/students")}
                size="sm"
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {(studyPartners || []).slice(0, 5).map((partner) => {
                  if (!partner) return null;
                  const partnerName = partner.fullName || "Student";
                  const online = partner.id ? isUserOnline(partner.id) : false;
                  return (
                    <div
                      key={partner.id}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:bg-slate-50/70 rounded-xl px-2.5 -mx-2.5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar
                          src={partner.profileImage}
                          name={partnerName}
                          size="sm"
                          isOnline={online}
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/students/${partner.id || ""}`}
                            className="block truncate text-xs font-semibold text-slate-900 hover:text-indigo-600"
                          >
                            {partnerName}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                online ? "bg-emerald-500" : "bg-slate-300"
                              }`}
                              aria-hidden="true"
                            />
                            <span className="text-[11px] text-slate-400">
                              {online ? "Online now" : "Offline"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="xs"
                        isLoading={chatMutation.isPending}
                        onClick={() => chatMutation.mutate(partner.id)}
                        leftIcon={<MessageSquare className="h-3 w-3" />}
                      >
                        Chat
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Quick Navigation Shortcuts */}
          <Card variant="flat" padding={false}>
            <div className="p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Quick Actions
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Find Partners", icon: Users, path: "/students" },
                  { label: "Browse Subjects", icon: BookOpen, path: "/subjects" },
                  { label: "Review Requests", icon: UserCheck, path: "/requests" },
                  { label: "Open Study Chat", icon: MessageSquare, path: "/chat" },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.path}
                      to={action.path}
                      className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white p-3 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 transition-all duration-150 interactive-card"
                    >
                      <Icon className="h-3.5 w-3.5 text-indigo-500 shrink-0" aria-hidden="true" />
                      <span className="truncate">{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
