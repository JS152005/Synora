import type { Profile } from "../../features/profile/profileTypes";

interface ProfileCardProps {
  profile: Profile;

  onEdit: () => void;

  onChangePhoto: () => void;
}

function ProfileCard({
  profile,
  onEdit,
  onChangePhoto,
}: ProfileCardProps) {
  return (
    <div className="rounded-xl bg-white p-8 shadow-md">
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
        {/* Profile Image */}
        <div className="flex flex-col items-center">
          {profile.profileImage ? (
            <img
              src={profile.profileImage}
              alt={profile.fullName}
              className="h-36 w-36 rounded-full border-4 border-blue-500 object-cover"
            />
          ) : (
            <div className="flex h-36 w-36 items-center justify-center rounded-full bg-blue-600 text-5xl font-bold text-white">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>
          )}

          <button
            onClick={onChangePhoto}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Change Photo
          </button>
        </div>

        {/* Profile Information */}
        <div className="flex-1">
          <div className="flex flex-col justify-between gap-4 md:flex-row">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.fullName}
              </h1>

              <p className="mt-1 text-gray-500">
                {profile.email}
              </p>
            </div>

            <button
              onClick={onEdit}
              className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white transition hover:bg-green-700"
            >
              Edit Profile
            </button>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                College
              </p>

              <p className="mt-1 text-gray-800">
                {profile.college || "Not Added"}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-500">
                Course
              </p>

              <p className="mt-1 text-gray-800">
                {profile.course || "Not Added"}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-500">
                Academic Year
              </p>

              <p className="mt-1 text-gray-800">
                {profile.year || "Not Added"}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-500">
                Joined
              </p>

              <p className="mt-1 text-gray-800">
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-500">
              Bio
            </p>

            <p className="mt-2 whitespace-pre-line text-gray-700">
              {profile.bio || "No bio added yet."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
