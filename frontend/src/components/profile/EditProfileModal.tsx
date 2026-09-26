import { useEffect } from "react";
import { Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";

import { useProfile } from "../../features/profile/useProfile";
import {
  profileSchema,
  type ProfileFormValues,
} from "../../features/profile/profileSchema";
import type { Profile } from "../../features/profile/profileTypes";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
}

const collegeOptions = [
  { value: "AIIMS New Delhi", label: "AIIMS New Delhi" },
  { value: "CMC Vellore", label: "CMC Vellore" },
  { value: "JIPMER Puducherry", label: "JIPMER Puducherry" },
  { value: "Madras Medical College", label: "Madras Medical College" },
  { value: "Stanley Medical College", label: "Stanley Medical College" },


  { value: "Saveetha Medical College", label: "Saveetha Medical College" },
  { value: "SRM Medical College", label: "SRM Medical College" },
  { value: "JS Medical College", label: "JS Medical College" },
  { value: "Pnimalar Medical College", label: "Pnimalar Medical College" }
];

const courseOptions = [
  { value: "MBBS", label: "MBBS" },
  { value: "BDS", label: "BDS" },
  { value: "BAMS", label: "BAMS" },
  { value: "BHMS", label: "BHMS" },
  { value: "BPT", label: "BPT" },
];

const yearOptions = [
  { value: "1st Year", label: "1st Year" },
  { value: "2nd Year", label: "2nd Year" },
  { value: "3rd Year", label: "3rd Year" },
  { value: "4th Year", label: "4th Year" },
  { value: "Intern", label: "Intern" },
];

function EditProfileModal({
  isOpen,
  onClose,
  profile,
}: EditProfileModalProps) {
  const { updateProfile, isUpdating } = useProfile();

  const {
    register,
    handleSubmit,
    reset,
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
      onClose={onClose}
      width="lg"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <Input
          label="Full Name"
          required
          placeholder="Enter your full name"
          {...register("fullName")}
          error={errors.fullName?.message}
        />

        <Textarea
          label="Bio"
          placeholder="Tell us something about yourself..."
          rows={4}
          {...register("bio")}
          error={errors.bio?.message}
        />

        <Select
          label="College"
          options={collegeOptions}
          {...register("college")}
          error={errors.college?.message}
        />

        <Select
          label="Course"
          options={courseOptions}
          {...register("course")}
          error={errors.course?.message}
        />

        <Select
          label="Academic Year"
          options={yearOptions}
          {...register("year")}
          error={errors.year?.message}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            <span className="flex items-center gap-2">
              <X size={18} />
              Cancel
            </span>
          </Button>

          <Button
            type="submit"
            variant="success"
            isLoading={isUpdating}
          >
            <span className="flex items-center gap-2">
              <Save size={18} />
              Save Changes
            </span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default EditProfileModal;