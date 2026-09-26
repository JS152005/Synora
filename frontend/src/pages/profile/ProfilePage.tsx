import { useState } from "react";

import ProfileCard from "../../components/profile/ProfileCard";
import EditProfileModal from "../../components/profile/EditProfileModal";

import Spinner from "../../components/ui/Spinner";

import { useProfile } from "../../features/profile/useProfile";

function ProfilePage() {
  const {
    profile,
    isLoading,
  } = useProfile();

  const [isEditOpen, setIsEditOpen] = useState(false);

  if (isLoading) {
    return <Spinner fullScreen />;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <h2 className="text-xl font-semibold text-gray-600">
          Failed to load profile.
        </h2>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-5xl">
        <ProfileCard
          profile={profile}
          onEdit={() => setIsEditOpen(true)}
          onChangePhoto={() => {
            // Will be connected in the next step
          }}
        />
      </div>

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        profile={profile}
      />
    </>
  );
}

export default ProfilePage;
