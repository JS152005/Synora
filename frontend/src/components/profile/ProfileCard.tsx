import type { Profile } from "../../features/profile/profileTypes";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { Camera, Edit3, School, GraduationCap, Calendar } from "lucide-react";

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
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs">
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
        {/* Profile Image */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative">
            <Avatar
              src={profile.profileImage}
              name={profile.fullName}
              size="xl"
              className="border-4 border-white shadow-md"
            />
            <button
              onClick={onChangePhoto}
              className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition cursor-pointer"
              title="Change photo"
              aria-label="Change photo"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          <Button
            variant="ghost"
            size="xs"
            onClick={onChangePhoto}
            className="mt-3 text-slate-500"
          >
            Change Photo
          </Button>
        </div>

        {/* Profile Information */}
        <div className="flex-1 min-w-0 w-full text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {profile.fullName}
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                {profile.email}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              leftIcon={<Edit3 className="h-3.5 w-3.5" />}
              className="self-center md:self-start"
            >
              Edit Profile
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-5">
            <div className="flex items-start gap-2.5 text-left">
              <School className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  College
                </span>
                <span className="text-xs font-medium text-slate-800">
                  {profile.college || "Not Added"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-left">
              <GraduationCap className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Course
                </span>
                <span className="text-xs font-medium text-slate-800">
                  {profile.course || "MBBS"}{" "}
                  {profile.year ? `(${profile.year})` : ""}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-left">
              <Calendar className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Joined
                </span>
                <span className="text-xs font-medium text-slate-800">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {profile.bio && (
            <div className="mt-5 border-t border-slate-100 pt-4 text-left">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Bio
              </span>
              <p className="whitespace-pre-line text-xs text-slate-700 leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
