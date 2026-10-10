import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  Edit3,
  School,
  GraduationCap,
  Calendar,
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

import { useProfile } from "../../features/profile/useProfile";
import { getMyTopics, addUserTopic, removeUserTopic } from "../../api/userTopic.api";
import { getSubjects, getSubjectTopics } from "../../api/subject.api";
import { getErrorMessage } from "../../utils/error";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import Modal from "../../components/ui/Modal";
import Select from "../../components/ui/Select";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import EditProfileModal from "../../components/profile/EditProfileModal";
import { Skeleton, SkeletonAvatar, SkeletonText } from "../../components/ui/Skeleton";
import type { UserTopicType } from "../../types/subject";

function ProfilePage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    profile,
    isLoading: loadingProfile,
    uploadProfileImage,
    isUploadingImage,
  } = useProfile();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [topicType, setTopicType] = useState<UserTopicType>("LEARNING");

  const { data: myTopics = [], isLoading: loadingTopics } = useQuery({
    queryKey: ["myTopics"],
    queryFn: getMyTopics,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
    enabled: isAddTopicOpen,
  });

  const { data: subjectTopicsData, isLoading: loadingSubjectTopics } = useQuery({
    queryKey: ["subjectTopics", selectedSubjectId],
    queryFn: () => getSubjectTopics(selectedSubjectId),
    enabled: !!selectedSubjectId && isAddTopicOpen,
  });

  const availableTopics = subjectTopicsData?.topics || [];

  const removeTopicMutation = useMutation({
    mutationFn: ({ topicId, type }: { topicId: string; type: UserTopicType }) =>
      removeUserTopic(topicId, type),
    onSuccess: () => {
      toast.success("Topic removed.");
      queryClient.invalidateQueries({ queryKey: ["myTopics"] });
      queryClient.invalidateQueries({ queryKey: ["matchHelpers"] });
      queryClient.invalidateQueries({ queryKey: ["matchLearners"] });
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Failed to remove topic.")),
  });

  const addTopicMutation = useMutation({
    mutationFn: () => addUserTopic(selectedTopicId, topicType),
    onSuccess: () => {
      toast.success("Topic added to your profile!");
      queryClient.invalidateQueries({ queryKey: ["myTopics"] });
      queryClient.invalidateQueries({ queryKey: ["matchHelpers"] });
      queryClient.invalidateQueries({ queryKey: ["matchLearners"] });
      setIsAddTopicOpen(false);
      setSelectedSubjectId("");
      setSelectedTopicId("");
    },
    onError: (err: unknown) =>
      toast.error(getErrorMessage(err, "Failed to add topic.")),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPG, PNG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }
    uploadProfileImage(file);
  };

  const learningTopics = myTopics.filter((t) => t.type === "LEARNING");
  const canHelpTopics = myTopics.filter((t) => t.type === "CAN_HELP");

  /* ─ Skeleton ───────────────────────────────────────────────────────────── */
  if (loadingProfile) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="h-32 md:h-44 skeleton rounded-none" aria-hidden="true" />
          <div className="px-6 py-6 space-y-5">
            <div className="flex items-end gap-4 -mt-16">
              <SkeletonAvatar size="lg" />
              <div className="flex-1 pb-1 space-y-2">
                <Skeleton className="h-5 w-40" />
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

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto py-20">
        <EmptyState
          title="Profile unavailable"
          description="Could not load your profile credentials. Please sign in again."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Profile Header Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        {/* Banner Cover */}
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
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="relative inline-block -mt-12 sm:-mt-14 shrink-0">
                <Avatar
                  src={profile.profileImage}
                  name={profile.fullName}
                  size="xl"
                  className="border-4 border-white shadow-md"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition cursor-pointer disabled:opacity-60"
                  title="Upload profile picture"
                  aria-label="Upload profile picture"
                >
                  {isUploadingImage ? (
                    <Spinner size="xs" />
                  ) : (
                    <Camera className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  aria-hidden="true"
                />
              </div>

              <div className="space-y-1 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {profile.fullName}
                  </h1>
                  {profile.hasVerifiedMed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200" title="Verified Medical Student">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      Verified Med
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 border border-indigo-100">
                      <CheckCircle2 className="h-3 w-3 text-indigo-600" />
                      Active Student
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium">{profile.email}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={() => setIsEditOpen(true)}
              leftIcon={<Edit3 className="h-4 w-4" />}
              className="self-start sm:self-end"
            >
              Edit Profile
            </Button>
          </div>

          {/* Academic Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-5">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <School className="h-4.5 w-4.5" aria-hidden="true" />
              </div>
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Medical College
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {profile.college || "Not added yet"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <GraduationCap className="h-4.5 w-4.5" aria-hidden="true" />
              </div>
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Degree & Year
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {profile.course || "MBBS"}
                  {profile.year ? ` · ${profile.year}` : ""}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Calendar className="h-4.5 w-4.5" aria-hidden="true" />
              </div>
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Member Since
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {new Date(profile.createdAt).toLocaleDateString([], {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-5 border-t border-slate-100 pt-4">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Biography & Study Interests
            </span>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {profile.bio ||
                "No biography added yet. Click 'Edit Profile' to introduce yourself to potential study partners."}
            </p>
          </div>
        </div>
      </div>

      {/* Academic Topics */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <PageHeader
            title="My Academic Curriculum Focus"
            subtitle="Topics tagged here power the smart reciprocal peer matchmaking engine."
          />
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddTopicOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Topic
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Learning topics */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-indigo-600" aria-hidden="true" />
                <span>Currently Learning ({learningTopics.length})</span>
              </div>
            }
            subtitle="Topics where you want study partners or tutors"
          >
            {loadingTopics ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <SkeletonText key={i} lines={2} />
                ))}
              </div>
            ) : learningTopics.length === 0 ? (
              <EmptyState
                title="No learning topics tagged"
                description='Click "Add Topic" to select topics you are revising.'
                size="sm"
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {learningTopics.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-slate-900 block truncate">
                        {item.topic?.name || "Topic"}
                      </span>
                      {item.topic?.subject?.name && (
                        <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                          {item.topic.subject.name} [{item.topic.subject.code}]
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        removeTopicMutation.mutate({
                          topicId: item.topicId,
                          type: "LEARNING",
                        })
                      }
                      disabled={removeTopicMutation.isPending}
                      className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer disabled:opacity-50"
                      aria-label={`Remove ${item.topic?.name || "topic"}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Teaching topics */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-emerald-600" aria-hidden="true" />
                <span>Can Teach & Help ({canHelpTopics.length})</span>
              </div>
            }
            subtitle="Topics where you excel and can help other students"
          >
            {loadingTopics ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <SkeletonText key={i} lines={2} />
                ))}
              </div>
            ) : canHelpTopics.length === 0 ? (
              <EmptyState
                title="No teaching topics tagged"
                description="Share topics where you can mentor peers!"
                size="sm"
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {canHelpTopics.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-slate-900 block truncate">
                        {item.topic?.name || "Topic"}
                      </span>
                      {item.topic?.subject?.name && (
                        <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                          {item.topic.subject.name} [{item.topic.subject.code}]
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        removeTopicMutation.mutate({
                          topicId: item.topicId,
                          type: "CAN_HELP",
                        })
                      }
                      disabled={removeTopicMutation.isPending}
                      className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer disabled:opacity-50"
                      aria-label={`Remove ${item.topic?.name || "topic"}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        profile={profile}
      />

      {/* Add Topic Modal */}
      {isAddTopicOpen && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddTopicOpen(false);
            setSelectedSubjectId("");
            setSelectedTopicId("");
          }}
          title="Add Curriculum Topic"
          description="Select a medical subject, pick a syllabus topic, and define your learning role."
          width="md"
        >
          <div className="space-y-5">
            <Select
              label="1. Medical Subject"
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedTopicId("");
              }}
              options={subjects.map((s) => ({
                value: s.id,
                label: `${s.code} — ${s.name}`,
              }))}
            />

            {selectedSubjectId && (
              <div>
                {loadingSubjectTopics ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                    <Spinner size="xs" />
                    <span>Loading topics…</span>
                  </div>
                ) : (
                  <Select
                    label="2. Topic"
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    options={availableTopics.map((t) => ({
                      value: t.id,
                      label: `${t.name} (Level ${t.level})`,
                    }))}
                  />
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                3. My Role For This Topic
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTopicType("LEARNING")}
                  className={`rounded-2xl border p-3.5 text-left transition cursor-pointer ${
                    topicType === "LEARNING"
                      ? "border-indigo-500 bg-indigo-50/80 text-indigo-950 ring-2 ring-indigo-200"
                      : "border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                  aria-pressed={topicType === "LEARNING"}
                >
                  <span className="text-xs font-bold block text-indigo-700">I'm Learning This</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Find tutors & study partners
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTopicType("CAN_HELP")}
                  className={`rounded-2xl border p-3.5 text-left transition cursor-pointer ${
                    topicType === "CAN_HELP"
                      ? "border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-200"
                      : "border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                  aria-pressed={topicType === "CAN_HELP"}
                >
                  <span className="text-xs font-bold block text-emerald-700">I Can Teach / Mentor</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Help peers study this topic
                  </span>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsAddTopicOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={!selectedTopicId}
                isLoading={addTopicMutation.isPending}
                onClick={() => addTopicMutation.mutate()}
              >
                Save Topic
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ProfilePage;
