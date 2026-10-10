import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import { CollegeSearchSelect } from "../ui/CollegeSearchSelect";

import { useProfile } from "../../features/profile/useProfile";
import {
  profileSchema,
  type ProfileFormValues,
} from "../../features/profile/profileSchema";
import type { Profile } from "../../features/profile/profileTypes";
import { getColleges, getCourses } from "../../api/auth.api";
import type { College, Course } from "../../types/user";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
}

const defaultCourseOptions = [
  { value: "MBBS", label: "MBBS - Bachelor of Medicine, Bachelor of Surgery" },
  { value: "BDS", label: "BDS - Bachelor of Dental Surgery" },
  { value: "BAMS", label: "BAMS - Bachelor of Ayurvedic Medicine" },
  { value: "BHMS", label: "BHMS - Bachelor of Homoeopathic Medicine" },
  { value: "BPT", label: "BPT - Bachelor of Physiotherapy" },
];

const defaultYearOptions = [
  { value: "1st Year", label: "1st Year / Phase I" },
  { value: "2nd Year", label: "2nd Year / Phase II" },
  { value: "3rd Year", label: "3rd Year (Part 1)" },
  { value: "4th Year", label: "Final Year (Part 2)" },
  { value: "Intern", label: "Intern / CRRI" },
];

function EditProfileModal({
  isOpen,
  onClose,
  profile,
}: EditProfileModalProps) {
  const { updateProfile, isUpdating } = useProfile();

  const [colleges, setColleges] = useState<College[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      bio: "",
      college: "",
      course: "",
      year: "",
    },
  });

  const watchedCollege = watch("college");

  // Fetch full college database & courses
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoadingColleges(true);
        const [collegesData, coursesData] = await Promise.all([
          getColleges(),
          getCourses(),
        ]);
        if (mounted) {
          setColleges(collegesData || []);
          setCourses(coursesData || []);
        }
      } catch (err) {
        console.error("Failed to load colleges in edit profile modal:", err);
      } finally {
        if (mounted) setLoadingColleges(false);
      }
    }
    if (isOpen) {
      loadData();
    }
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!profile) return;

    reset({
      fullName: profile.fullName ?? "",
      bio: profile.bio ?? "",
      college: profile.college ?? "",
      course: profile.course ?? "",
      year: profile.year ?? "",
    });
  }, [profile, reset]);

  // Synchronize selectedCollege object with profile college name
  useEffect(() => {
    if (colleges.length > 0 && watchedCollege) {
      const match = colleges.find(
        (c) => c.name.toLowerCase() === watchedCollege.toLowerCase()
      );
      if (match) setSelectedCollege(match);
    }
  }, [colleges, watchedCollege]);

  const courseOptions =
    courses.length > 0
      ? courses.map((c) => ({
          value: c.name,
          label: `${c.code} - ${c.name}`,
        }))
      : defaultCourseOptions;

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile(data, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Edit Profile"
      description="Update your public academic credentials and biography."
      onClose={onClose}
      width="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          required
          placeholder="Enter your full name"
          {...register("fullName")}
          error={errors.fullName?.message}
        />

        <Textarea
          label="Bio"
          placeholder="Tell peers about your study interests, strengths, and goals..."
          rows={3}
          {...register("bio")}
          error={errors.bio?.message}
        />

        {/* 200+ Recognized Medical College Selector */}
        <div className="space-y-1">
          <CollegeSearchSelect
            colleges={colleges}
            selectedCollegeId={selectedCollege?.id || ""}
            onSelectCollege={(c) => {
              setSelectedCollege(c);
              setValue("college", c?.name || "", { shouldValidate: true });
            }}
            isLoading={loadingColleges}
            error={errors.college?.message}
            helperText="Search from 200 recognized Indian medical colleges"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Select
            label="Degree Course"
            options={courseOptions}
            placeholder="Select Degree Course"
            {...register("course")}
            error={errors.course?.message}
          />

          <Select
            label="Academic Year"
            options={defaultYearOptions}
            placeholder="Select Current Year"
            {...register("year")}
            error={errors.year?.message}
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            leftIcon={<X className="h-3.5 w-3.5" />}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isUpdating}
            leftIcon={<Save className="h-3.5 w-3.5" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default EditProfileModal;