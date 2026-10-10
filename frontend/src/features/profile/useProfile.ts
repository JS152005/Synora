import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { getErrorMessage } from "../../utils/error";
import { useAppDispatch } from "../../store/hooks";
import { updateUser } from "../auth/authSlice";

import profileService from "./profileService";
import type { UpdateProfilePayload } from "./profileTypes";

const PROFILE_QUERY_KEY = ["profile"];

export function useProfile() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

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
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      if (response.user) {
        dispatch(updateUser(response.user as any));
      }

      toast.success(response.message || "Profile updated successfully.");
    },

    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to update profile."));
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

    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to upload profile image."));
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
