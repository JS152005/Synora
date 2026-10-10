import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  ChevronRight,
  Check,
  Plus,
  Users,
  ChevronDown,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getSubjects,
  getSubjectTopics,
  getTopicChildren,
} from "../../api/subject.api";
import {
  getMyTopics,
  addUserTopic,
  removeUserTopic,
} from "../../api/userTopic.api";
import { getHelpersByTopic, getLearnersByTopic } from "../../api/match.api";
import { sendStudyPartnerRequest } from "../../api/studyPartner.api";
import { getErrorMessage } from "../../utils/error";

import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Avatar from "../../components/ui/Avatar";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import SubjectCard from "../../components/ui/SubjectCard";
import { SkeletonCard } from "../../components/ui/Skeleton";
import Spinner from "../../components/ui/Spinner";
import Tabs from "../../components/ui/Tabs";
import type { Subject, Topic, UserTopicType } from "../../types/subject";

type PhaseFilter = "all" | "phase1" | "phase2" | "phase3" | "enrolled";

function getSubjectPhase(code: string): "phase1" | "phase2" | "phase3" {
  const c = code.toUpperCase();
  if (["ANAT", "PHYS", "BIOCHEM"].includes(c)) return "phase1";
  if (["PATH", "PHARM", "MICRO", "FMT"].includes(c)) return "phase2";
  return "phase3";
}

function SubjectsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("all");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [matchingTopic, setMatchingTopic] = useState<{
    topic: Topic;
    type: "helpers" | "learners";
  } | null>(null);

  /* ─ Queries ─────────────────────────────────────────────────────────────── */
  const { data: subjects = [], isLoading: loadingSubjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
  });

  const { data: myTopics = [] } = useQuery({
    queryKey: ["myTopics"],
    queryFn: getMyTopics,
  });

  /* ─ Subject enrollment topic counts ─────────────────────────────────────── */
  const subjectTopicCounts = useMemo(() => {
    const counts: Record<string, { learning: number; teaching: number }> = {};
    for (const ut of myTopics) {
      const subId = ut.topic?.subjectId;
      if (!subId) continue;
      if (!counts[subId]) counts[subId] = { learning: 0, teaching: 0 };
      if (ut.type === "LEARNING") counts[subId].learning += 1;
      if (ut.type === "CAN_HELP") counts[subId].teaching += 1;
    }
    return counts;
  }, [myTopics]);

  const isTopicTagged = (topicId: string, type: UserTopicType) =>
    myTopics.some((t) => t.topicId === topicId && t.type === type);

  /* ─ Mutation to toggle topic ────────────────────────────────────────────── */
  const toggleTopicMutation = useMutation({
    mutationFn: async ({
      topicId,
      type,
      isCurrentlyTagged,
    }: {
      topicId: string;
      type: UserTopicType;
      isCurrentlyTagged: boolean;
    }) => {
      if (isCurrentlyTagged) {
        return removeUserTopic(topicId, type);
      } else {
        return addUserTopic(topicId, type);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["myTopics"] });
      queryClient.invalidateQueries({ queryKey: ["matchHelpers"] });
      queryClient.invalidateQueries({ queryKey: ["matchLearners"] });
      toast.success(
        variables.isCurrentlyTagged
          ? "Topic removed from your profile."
          : `Topic marked as ${variables.type === "LEARNING" ? "Learning" : "Can Teach"}!`
      );
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Action failed.")),
  });

  /* ─ Filter subjects ─────────────────────────────────────────────────────── */
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (phaseFilter === "all") return true;
      if (phaseFilter === "enrolled") {
        const counts = subjectTopicCounts[s.id];
        return (counts?.learning || 0) > 0 || (counts?.teaching || 0) > 0;
      }
      return getSubjectPhase(s.code) === phaseFilter;
    });
  }, [subjects, search, phaseFilter, subjectTopicCounts]);

  const enrolledCount = useMemo(() => {
    return subjects.filter((s) => {
      const counts = subjectTopicCounts[s.id];
      return (counts?.learning || 0) > 0 || (counts?.teaching || 0) > 0;
    }).length;
  }, [subjects, subjectTopicCounts]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        icon={<BookOpen className="h-4.5 w-4.5" />}
        title="Medical Curriculum & Subjects"
        subtitle="Explore the standardized 19-subject MBBS curriculum, view syllabus hierarchies, and tag learning/teaching topics."
      />

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3.5">
        <Tabs
          tabs={[
            {
              key: "all" as PhaseFilter,
              label: "All Subjects",
              count: subjects.length,
            },
            {
              key: "phase1" as PhaseFilter,
              label: "Phase I · Pre-Clinical",
            },
            {
              key: "phase2" as PhaseFilter,
              label: "Phase II · Para-Clinical",
            },
            {
              key: "phase3" as PhaseFilter,
              label: "Phase III · Clinical",
            },
            {
              key: "enrolled" as PhaseFilter,
              label: "My Active Curriculum",
              count: enrolledCount || undefined,
            },
          ]}
          activeTab={phaseFilter}
          onChange={setPhaseFilter}
          variant="underline"
        />

        <div className="max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search subjects by name or code (e.g. Pathology, ANAT)..."
            size="md"
          />
        </div>
      </div>

      {/* Subjects Grid */}
      {loadingSubjects ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredSubjects.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="No subjects match your criteria"
          description={
            phaseFilter === "enrolled"
              ? "You haven't tagged topics in any subjects yet. Browse all subjects and select topics you are revising!"
              : "Try adjusting your search query or clear the filter."
          }
          actionLabel={
            phaseFilter !== "all" || search
              ? "Reset Filters"
              : undefined
          }
          onAction={() => {
            setSearch("");
            setPhaseFilter("all");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5">
          {filteredSubjects.map((sub) => {
            const counts = subjectTopicCounts[sub.id];
            return (
              <SubjectCard
                key={sub.id}
                subject={sub}
                learningCount={counts?.learning || 0}
                teachingCount={counts?.teaching || 0}
                onClick={() => setSelectedSubject(sub)}
              />
            );
          })}
        </div>
      )}

      {/* Subject Topics Hierarchy Modal */}
      {selectedSubject && (
        <SubjectTopicsModal
          subject={selectedSubject}
          onClose={() => setSelectedSubject(null)}
          isTopicTagged={isTopicTagged}
          onToggleTopic={(topicId, type) => {
            const isTagged = isTopicTagged(topicId, type);
            toggleTopicMutation.mutate({
              topicId,
              type,
              isCurrentlyTagged: isTagged,
            });
          }}
          isToggling={toggleTopicMutation.isPending}
          onFindMatches={(topic, type) => setMatchingTopic({ topic, type })}
        />
      )}

      {/* Topic Peers / Matches Modal */}
      {matchingTopic && (
        <TopicMatchesModal
          topic={matchingTopic.topic}
          type={matchingTopic.type}
          onClose={() => setMatchingTopic(null)}
        />
      )}
    </div>
  );
}

/* ── Subject Topics Modal ──────────────────────────────────────────────────── */
function SubjectTopicsModal({
  subject,
  onClose,
  isTopicTagged,
  onToggleTopic,
  isToggling,
  onFindMatches,
}: {
  subject: Subject;
  onClose: () => void;
  isTopicTagged: (topicId: string, type: UserTopicType) => boolean;
  onToggleTopic: (topicId: string, type: UserTopicType) => void;
  isToggling: boolean;
  onFindMatches: (topic: Topic, type: "helpers" | "learners") => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["subjectTopics", subject.id],
    queryFn: () => getSubjectTopics(subject.id),
  });

  const topics = data?.topics || [];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      width="lg"
      title={
        <div className="flex items-center gap-2.5">
          <span className="rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700">
            {subject.code}
          </span>
          <span className="font-semibold text-slate-900">{subject.name}</span>
        </div>
      }
      description="Explore curriculum hierarchy. Tag topics you are revising (Learning) or can mentor (Can Teach)."
    >
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <Spinner size="md" />
          <p className="text-xs text-slate-400">Loading syllabus topics...</p>
        </div>
      ) : topics.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-5 w-5" />}
          title="No topics catalogued yet"
          description="Syllabus topics for this subject will be indexed soon."
          size="sm"
        />
      ) : (
        <div className="space-y-2.5">
          {topics.map((topic) => (
            <TopicTreeItem
              key={topic.id}
              topic={topic}
              isTopicTagged={isTopicTagged}
              onToggleTopic={onToggleTopic}
              isToggling={isToggling}
              onFindMatches={onFindMatches}
            />
          ))}
        </div>
      )}
    </Modal>
  );
}

/* ── Topic Tree Item with Expandable Subtopics ────────────────────────────── */
function TopicTreeItem({
  topic,
  isTopicTagged,
  onToggleTopic,
  isToggling,
  onFindMatches,
  depth = 0,
}: {
  topic: Topic;
  isTopicTagged: (topicId: string, type: UserTopicType) => boolean;
  onToggleTopic: (topicId: string, type: UserTopicType) => void;
  isToggling: boolean;
  onFindMatches: (topic: Topic, type: "helpers" | "learners") => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const { data: children = [], isLoading: loadingChildren } = useQuery({
    queryKey: ["topicChildren", topic.id],
    queryFn: () => getTopicChildren(topic.id),
    enabled: expanded,
  });

  const isLearning = isTopicTagged(topic.id, "LEARNING");
  const isCanHelp = isTopicTagged(topic.id, "CAN_HELP");

  return (
    <div
      className={`rounded-xl border border-slate-200/80 bg-white transition-all shadow-2xs ${
        depth > 0 ? "ml-5 border-l-2 border-l-indigo-400 bg-slate-50/50" : ""
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer transition shrink-0"
            title="Toggle subtopics"
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse subtopics" : "Expand subtopics"}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-900 block truncate">
              {topic.name}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Code: {topic.code} · Level {topic.level}
            </span>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center ml-7 sm:ml-0">
          <button
            onClick={() => onToggleTopic(topic.id, "LEARNING")}
            disabled={isToggling}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer select-none btn-press disabled:opacity-50 ${
              isLearning
                ? "bg-indigo-600 text-white shadow-2xs"
                : "border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
            }`}
            aria-pressed={isLearning}
          >
            {isLearning ? (
              <Check className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Plus className="h-3 w-3" aria-hidden="true" />
            )}
            Learning
          </button>

          <button
            onClick={() => onToggleTopic(topic.id, "CAN_HELP")}
            disabled={isToggling}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer select-none btn-press disabled:opacity-50 ${
              isCanHelp
                ? "bg-emerald-600 text-white shadow-2xs"
                : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
            }`}
            aria-pressed={isCanHelp}
          >
            {isCanHelp ? (
              <Check className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Plus className="h-3 w-3" aria-hidden="true" />
            )}
            Can Teach
          </button>

          <button
            onClick={() => onFindMatches(topic, "helpers")}
            className="flex items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition cursor-pointer btn-press"
            title={`Find students who teach ${topic.name}`}
          >
            <Users className="h-3 w-3" aria-hidden="true" />
            Peers
          </button>
        </div>
      </div>

      {/* Subtopics */}
      {expanded && (
        <div className="px-3.5 pb-3.5 border-t border-slate-100/80 pt-2.5">
          {loadingChildren ? (
            <div className="flex items-center gap-2 py-2 pl-3 text-xs text-slate-400">
              <Spinner size="xs" />
              <span>Loading subtopics…</span>
            </div>
          ) : children.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic py-1 pl-7">
              No further nested subtopics.
            </p>
          ) : (
            <div className="space-y-2">
              {children.map((child) => (
                <TopicTreeItem
                  key={child.id}
                  topic={child}
                  isTopicTagged={isTopicTagged}
                  onToggleTopic={onToggleTopic}
                  isToggling={isToggling}
                  onFindMatches={onFindMatches}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Topic Peer Matches Modal ─────────────────────────────────────────────── */
function TopicMatchesModal({
  topic,
  type,
  onClose,
}: {
  topic: Topic;
  type: "helpers" | "learners";
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["topicMatches", topic.id, type],
    queryFn: () =>
      type === "helpers"
        ? getHelpersByTopic(topic.id)
        : getLearnersByTopic(topic.id),
  });

  const connectMutation = useMutation({
    mutationFn: (receiverId: string) => sendStudyPartnerRequest(receiverId),
    onSuccess: () => {
      toast.success("Study partner request sent!");
      queryClient.invalidateQueries({ queryKey: ["outgoingRequests"] });
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Failed to send request.")),
  });

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      width="md"
      title={
        <div className="flex items-center gap-2">
          <Users className="h-4.5 w-4.5 text-indigo-600" aria-hidden="true" />
          <span>
            {type === "helpers" ? "Tutors & Mentors for" : "Learners for"}:{" "}
            {topic.name}
          </span>
        </div>
      }
      description="Medical students with reciprocal interest in this syllabus topic."
    >
      {isLoading ? (
        <div className="py-10 flex flex-col items-center justify-center gap-2">
          <Spinner size="md" />
          <p className="text-xs text-slate-400">Finding matching peers...</p>
        </div>
      ) : matches.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="No peers found for this topic"
          description="Be the first to list this topic on your profile to help peers find you!"
          size="sm"
        />
      ) : (
        <div className="divide-y divide-slate-100">
          {matches.map((item) => (
            <div
              key={item.user.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  src={item.user.profileImage}
                  name={item.user.fullName}
                  size="sm"
                />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-900 block truncate">
                    {item.user.fullName}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate block mt-0.5">
                    {item.user.college || "Medical College"} ·{" "}
                    {item.user.course || "MBBS"} {item.user.year}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="xs"
                isLoading={connectMutation.isPending}
                onClick={() => connectMutation.mutate(item.user.id)}
              >
                Connect
              </Button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default SubjectsPage;
