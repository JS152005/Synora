import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import profileService from "./profileService";
import type { UpdateProfilePayload } from "./profileTypes";

const PROFILE_QUERY_KEY = ["profile"];

export function useProfile() {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => profileService.getProfile(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfilePayload) =>
      profileService.update(data),

    onSuccess: (response) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, response.user);

      toast.success(response.message || "Profile updated successfully.");
    },

    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ??
          "Failed to update profile."
      );
    },
  });

  const uploadProfileImageMutation = useMutation({
    mutationFn: (file: File) =>
      profileService.uploadImage(file),

    onSuccess: (response) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, response.user);

      toast.success(
        response.message || "Profile image updated successfully."
      );
    },

    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ??
          "Failed to upload profile image."
      );
    },
  });

  return {
    profile,

    isLoading,

    isError,

    error,

    refetch,

    updateProfile:
      updateProfileMutation.mutate,

    updateProfileAsync:
      updateProfileMutation.mutateAsync,

    isUpdating:
      updateProfileMutation.isPending,

    uploadProfileImage:
      uploadProfileImageMutation.mutate,

    uploadProfileImageAsync:
      uploadProfileImageMutation.mutateAsync,

    isUploadingImage:
      uploadProfileImageMutation.isPending,
  };
}
