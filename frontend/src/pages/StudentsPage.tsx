import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Sparkles,
  BookOpen,
  GraduationCap,
  SlidersHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";

import SearchInput from "../components/ui/SearchInput";
import StudentFilters from "../components/students/StudentFilters";
import StudentCard from "../components/students/StudentCard";
import { SkeletonCard } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";
import Tabs from "../components/ui/Tabs";
import Pagination from "../components/ui/Pagination";

import { discoverUsers, getRecommendations } from "../api/user.api";
import { getHelpers, getLearners } from "../api/match.api";
import {
  getOutgoingRequests,
  getStudyPartners,
  sendStudyPartnerRequest,
} from "../api/studyPartner.api";
import { getErrorMessage } from "../utils/error";
import type { PublicProfileUser } from "../types/user";

type TabType = "all" | "recommendations" | "helpers" | "learners";

const StudentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [name, setName] = useState(searchParams.get("name") || "");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [college, setCollege] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 12;

  /* ─ Queries ─────────────────────────────────────────────────────────────── */
  const { data: discoverData, isLoading: loadingDiscover } = useQuery({
    queryKey: ["discoverStudents", { name, course, year, college, page, limit }],
    queryFn: () =>
      discoverUsers({
        name: name || undefined,
        course: course || undefined,
        year: year || undefined,
        college: college || undefined,
        page,
        limit,
      }),
    enabled: activeTab === "all",
  });

  const { data: recommendations = [], isLoading: loadingRecommendations } =
    useQuery({
      queryKey: ["recommendations"],
      queryFn: () => getRecommendations(20),
      enabled: activeTab === "recommendations",
    });

  const { data: matchHelpers = [], isLoading: loadingHelpers } = useQuery({
    queryKey: ["matchHelpers"],
    queryFn: getHelpers,
    enabled: activeTab === "helpers",
  });

  const { data: matchLearners = [], isLoading: loadingLearners } = useQuery({
    queryKey: ["matchLearners"],
    queryFn: getLearners,
    enabled: activeTab === "learners",
  });

  const { data: outgoingRequests = [] } = useQuery({
    queryKey: ["outgoingRequests"],
    queryFn: getOutgoingRequests,
  });

  const { data: studyPartners = [] } = useQuery({
    queryKey: ["studyPartners"],
    queryFn: getStudyPartners,
  });

  /* ─ Connect mutation ─────────────────────────────────────────────────────── */
  const connectMutation = useMutation({
    mutationFn: (receiverId: string) => sendStudyPartnerRequest(receiverId),
    onSuccess: () => {
      toast.success("Study partner request sent!");
      queryClient.invalidateQueries({ queryKey: ["outgoingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["outgoingRequestsBadge"] });
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Failed to send request.")),
  });

  const sentReceiverIds = useMemo(
    () => new Set(outgoingRequests.map((r) => r.receiverId)),
    [outgoingRequests]
  );

  const partnerIds = useMemo(
    () => new Set(studyPartners.map((p) => p.id)),
    [studyPartners]
  );

  const handleResetFilters = () => {
    setName("");
    setCourse("");
    setYear("");
    setCollege("");
    setPage(1);
    setSearchParams({});
  };

  const helperUsers: PublicProfileUser[] = useMemo(
    () =>
      matchHelpers.map((h) => ({
        ...h.user,
        userTopics: h.matchedTopics.map((mt) => ({
          type: "CAN_HELP" as const,
          topic: { id: mt.id, name: mt.name, level: mt.level },
        })),
      })),
    [matchHelpers]
  );

  const learnerUsers: PublicProfileUser[] = useMemo(
    () =>
      matchLearners.map((l) => ({
        ...l.user,
        userTopics: l.matchedTopics.map((mt) => ({
          type: "LEARNING" as const,
          topic: { id: mt.id, name: mt.name, level: mt.level },
        })),
      })),
    [matchLearners]
  );

  const getActiveList = (): PublicProfileUser[] => {
    switch (activeTab) {
      case "all":             return discoverData?.users || [];
      case "recommendations": return recommendations;
      case "helpers":         return helperUsers;
      case "learners":        return learnerUsers;
    }
  };

  const isCurrentLoading =
    activeTab === "all"
      ? loadingDiscover
      : activeTab === "recommendations"
      ? loadingRecommendations
      : activeTab === "helpers"
      ? loadingHelpers
      : loadingLearners;

  const currentList = getActiveList();
  const hasActiveFilters = !!(course || year || college);
  const activeFiltersCount = [course, year, college].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        icon={<Users className="h-4.5 w-4.5" />}
        title="Discover Medical Students"
        subtitle="Connect with medical peers by college, curriculum, academic year, and clinical topics."
      />

      {/* Tabs */}
      <Tabs
        tabs={[
          {
            key: "all" as TabType,
            label: "All Students",
            icon: <Users className="h-3.5 w-3.5" />,
            count: activeTab === "all" ? discoverData?.total : undefined,
          },
          {
            key: "recommendations" as TabType,
            label: "Recommended",
            icon: <Sparkles className="h-3.5 w-3.5" />,
            count: recommendations.length || undefined,
          },
          {
            key: "helpers" as TabType,
            label: "Can Help You",
            icon: <BookOpen className="h-3.5 w-3.5" />,
            count: matchHelpers.length || undefined,
          },
          {
            key: "learners" as TabType,
            label: "Need Your Help",
            icon: <GraduationCap className="h-3.5 w-3.5" />,
            count: matchLearners.length || undefined,
          },
        ]}
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          setPage(1);
        }}
        variant="underline"
      />

      {/* Search and Filters Bar (All tab) */}
      {activeTab === "all" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-md">
              <SearchInput
                value={name}
                onChange={(val) => {
                  setName(val);
                  setPage(1);
                }}
                placeholder="Search students by name..."
                size="md"
              />
            </div>

            <Button
              variant={showFilters || hasActiveFilters ? "primary" : "outline"}
              size="md"
              onClick={() => setShowFilters((p) => !p)}
              leftIcon={<SlidersHorizontal className="h-4 w-4" />}
            >
              Filters
              {hasActiveFilters && (
                <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="animate-slide-up">
              <StudentFilters
                course={course}
                year={year}
                college={college}
                onCourseChange={(val) => { setCourse(val); setPage(1); }}
                onYearChange={(val) => { setYear(val); setPage(1); }}
                onCollegeChange={(val) => { setCollege(val); setPage(1); }}
                onReset={handleResetFilters}
              />
            </div>
          )}
        </div>
      )}

      {/* Grid of Student Cards */}
      {isCurrentLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No students found"
          description={
            activeTab === "all"
              ? "No students match your current search parameters. Try adjusting your search query or reset filters."
              : activeTab === "recommendations"
              ? "Add clinical topics you are learning in your profile to receive smart reciprocal recommendations."
              : "No students matching your reciprocal topic interests yet. Add more topics to unlock matching!"
          }
          actionLabel={activeTab === "all" ? "Reset All Filters" : "Manage Profile Topics"}
          onAction={activeTab === "all" ? handleResetFilters : () => {}}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5">
            {currentList.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onConnect={(id) => connectMutation.mutate(id)}
                isConnecting={connectMutation.isPending}
                hasSentRequest={sentReceiverIds.has(student.id)}
                isPartner={partnerIds.has(student.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {activeTab === "all" && discoverData && discoverData.totalPages > 1 && (
            <Pagination
              currentPage={discoverData.page}
              totalPages={discoverData.totalPages}
              totalItems={discoverData.total}
              onPageChange={setPage}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
