import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Settings,
  Moon,
  Sun,
  Laptop,
  LogOut,
  Stethoscope,
  User,
  Shield,
  Palette,
  BellRing,
  ExternalLink,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  RotateCcw,
  Clock,
  Mail,
  ShieldCheck,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../features/auth/useAuth";
import { useTheme, type ThemeMode } from "../../context/ThemeContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { OtpInput } from "../../components/ui/OtpInput";
import Badge from "../../components/ui/Badge";
import PageHeader from "../../components/ui/PageHeader";
import ToggleSwitch from "../../components/ui/ToggleSwitch";
import Tabs from "../../components/ui/Tabs";
import { getErrorMessage } from "../../utils/error";

type SettingsTab = "account" | "appearance" | "collaboration" | "security";

function SettingsPage() {
  const { user, logout, updateSettings, changePassword, requestChangePasswordOtp } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [emailNotifications, setEmailNotifications] = useState(
    user?.emailNotifications ?? true
  );
  const [livePresence, setLivePresence] = useState(
    user?.livePresence ?? true
  );

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Password Change Security OTP State
  const [passwordOtp, setPasswordOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [emailMasked, setEmailMasked] = useState<string | null>(null);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  const handleThemeChange = async (newTheme: ThemeMode) => {
    setTheme(newTheme);
    try {
      await updateSettings({ theme: newTheme });
    } catch {
      // localStorage is already updated by useTheme
    }
  };

  const handleSavePreferences = async () => {
    try {
      await updateSettings({
        emailNotifications,
        livePresence,
      });
      toast.success("Preferences saved successfully!");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save preferences."));
    }
  };

  const handleRequestPasswordOtp = async () => {
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError("Current password is required before requesting verification code.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setIsSendingOtp(true);
      const res = await requestChangePasswordOtp();
      setOtpSent(true);
      setOtpCooldown(60);
      setEmailMasked(res.emailMasked || user?.personalEmail || user?.email || "verified personal email");
      toast.success(res.message || "Security verification code sent to your verified personal email!");
    } catch (err: unknown) {
      setPasswordError(getErrorMessage(err, "Failed to send verification code."));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (!passwordOtp || passwordOtp.trim().length !== 6) {
      setPasswordError("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword, confirmPassword, passwordOtp.trim());
      toast.success("Password changed successfully! Old credentials invalidated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordOtp("");
      setOtpSent(false);
    } catch (err: unknown) {
      setPasswordError(getErrorMessage(err, "Failed to change password."));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <PageHeader
        icon={<Settings className="h-4.5 w-4.5" />}
        title="Settings & Workspace Preferences"
        subtitle="Manage your student credentials, appearance themes, collaboration preferences, and platform sessions."
      />

      {/* Tabs */}
      <Tabs
        tabs={[
          {
            key: "account" as SettingsTab,
            label: "Student Account",
            icon: <User className="h-3.5 w-3.5" />,
          },
          {
            key: "appearance" as SettingsTab,
            label: "Appearance & Theme",
            icon: <Palette className="h-3.5 w-3.5" />,
          },
          {
            key: "collaboration" as SettingsTab,
            label: "Collaboration & Alerts",
            icon: <BellRing className="h-3.5 w-3.5" />,
          },
          {
            key: "security" as SettingsTab,
            label: "Security & Session",
            icon: <Shield className="h-3.5 w-3.5" />,
          },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="underline"
      />

      {/* Content based on active tab */}
      {activeTab === "account" && (
        <div className="space-y-6">
          <Card
            title="Student Credentials Overview"
            subtitle="Your verified academic credentials and public identity"
            action={
              <Link to="/profile">
                <Button
                  variant="outline"
                  size="xs"
                  rightIcon={<ExternalLink className="h-3 w-3" />}
                >
                  View Profile
                </Button>
              </Link>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Full Name
                </span>
                <p className="text-sm font-semibold text-slate-900">
                  {user?.fullName || "Student"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Personal Email (Login ID)
                </span>
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user?.personalEmail || user?.email || "personal@synora.com"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  College / Institutional Email
                </span>
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user?.collegeEmail || "Not linked"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  College / Institution
                </span>
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user?.college || "Recognized Medical College"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Degree & Year
                </span>
                <p className="text-sm font-semibold text-slate-900">
                  {user?.course || "MBBS"} {user?.year ? `(${user.year})` : ""}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Student Verification Status
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {user?.hasVerifiedMed ? (
                    <Badge variant="success" size="sm" dot>
                      Verified Med · Institutional Email Confirmed
                    </Badge>
                  ) : (
                    <Badge variant="primary" size="sm" dot>
                      Active Student · Personal Email Verified
                    </Badge>
                  )}
                  <span className="text-xs text-slate-500">
                    Full access to curriculum topics and real-time chat enabled
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "appearance" && (
        <div className="space-y-6">
          <Card
            title="Appearance & Theme"
            subtitle="Customize the contrast and workspace theme for late-night medical study"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-xl">
              <button
                type="button"
                onClick={() => handleThemeChange("light")}
                className={`flex flex-col items-center gap-3 rounded-2xl border p-5 text-xs font-semibold transition cursor-pointer ${
                  theme === "light"
                    ? "border-[#3B4F8A] bg-[#3B4F8A]/10 text-slate-900 ring-2 ring-[#3B4F8A]/30 shadow-2xs"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="h-10 w-10 rounded-xl bg-[#F5F5DC] border border-[#D8B4A0] flex items-center justify-center text-[#7A8450]">
                  <Sun className="h-5 w-5" />
                </div>
                <span>Light Theme</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange("dark")}
                className={`flex flex-col items-center gap-3 rounded-2xl border p-5 text-xs font-semibold transition cursor-pointer ${
                  theme === "dark"
                    ? "border-[#3B4F8A] bg-[#3B4F8A]/10 text-white ring-2 ring-[#3B4F8A]/30 shadow-2xs"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="h-10 w-10 rounded-xl bg-[#181311] border border-[#3a2e29] text-[#D8B4A0] flex items-center justify-center">
                  <Moon className="h-5 w-5" />
                </div>
                <span>Dark Theme</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange("system")}
                className={`flex flex-col items-center gap-3 rounded-2xl border p-5 text-xs font-semibold transition cursor-pointer ${
                  theme === "system"
                    ? "border-[#3B4F8A] bg-[#3B4F8A]/10 text-slate-900 dark:text-white ring-2 ring-[#3B4F8A]/30 shadow-2xs"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Laptop className="h-5 w-5" />
                </div>
                <span>System Default</span>
              </button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "collaboration" && (
        <div className="space-y-6">
          <Card
            title="Peer Collaboration & Alert Preferences"
            subtitle="Manage your visibility to potential study partners and notification frequency"
          >
            <div className="space-y-5">
              <ToggleSwitch
                checked={livePresence}
                onChange={setLivePresence}
                label="Live Online Presence"
                description="Broadcast real-time active status to connected study partners when you are in the workspace."
              />

              <div className="border-t border-slate-100 pt-4">
                <ToggleSwitch
                  checked={emailNotifications}
                  onChange={setEmailNotifications}
                  label="Instant Partner Invitations"
                  description="Receive instant sound and banner alerts when medical students send you study requests."
                />
              </div>

              <div className="pt-3 border-t border-slate-100">
                <Button variant="primary" size="md" onClick={handleSavePreferences}>
                  Save Preferences
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Change Password Card */}
          <Card
            title="Change Account Password"
            subtitle="Update your password to keep your student credentials secure"
          >
            {passwordError && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <Input
                label="Current Password *"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                icon={<KeyRound className="h-4 w-4 text-slate-400" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              <Input
                label="New Password *"
                type={showPassword ? "text" : "password"}
                required
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon={<KeyRound className="h-4 w-4 text-slate-400" />}
              />

              <Input
                label="Confirm New Password *"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<KeyRound className="h-4 w-4 text-slate-400" />}
              />

              {/* Security OTP Verification Step */}
              {!otpSent ? (
                <div className="pt-2 space-y-2">
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 text-xs text-[#3B4F8A]">
                    <div className="font-semibold flex items-center gap-1.5 mb-1">
                      <ShieldCheck className="h-4 w-4" />
                      Two-Factor Email Verification Required
                    </div>
                    For your security, changing your password requires verifying a 6-digit code sent to your registered personal email.
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    className="w-full bg-[#3B4F8A] hover:bg-[#324376]"
                    isLoading={isSendingOtp}
                    onClick={handleRequestPasswordOtp}
                    rightIcon={<Mail className="h-4 w-4" />}
                  >
                    Send Verification Code
                  </Button>
                </div>
              ) : (
                <div className="pt-2 space-y-3.5 p-4 rounded-xl border border-[#3B4F8A]/30 bg-[#3B4F8A]/5 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      Enter Security Code
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Sent to {emailMasked || "personal email"}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-center">
                    <OtpInput
                      length={6}
                      value={passwordOtp}
                      onChange={setPasswordOtp}
                      disabled={isChangingPassword}
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      Valid for 10 minutes
                    </span>

                    {otpCooldown > 0 ? (
                      <span>
                        Resend in <span className="font-bold text-[#3B4F8A]">{otpCooldown}s</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isSendingOtp}
                        onClick={handleRequestPasswordOtp}
                        className="inline-flex items-center gap-1 font-semibold text-[#3B4F8A] hover:underline cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Resend Code</span>
                      </button>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full bg-[#3B4F8A] hover:bg-[#324376]"
                    isLoading={isChangingPassword}
                    disabled={passwordOtp.trim().length !== 6}
                    rightIcon={<Check className="h-4 w-4" />}
                  >
                    Verify & Change Password
                  </Button>
                </div>
              )}
            </form>
          </Card>

          {/* Platform Session & Logout Card */}
          <Card
            title="Platform Session & Security"
            subtitle="Active session status and account security"
          >
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Stethoscope className="h-4 w-4 text-[#3B4F8A]" />
                    <span>Synora Medical Platform v1.0</span>
                    <Badge variant="outline" size="xs">
                      Active
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Connected securely via JWT Token & Real-time WebSockets.
                  </p>
                </div>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={logout}
                  className="group"
                  leftIcon={<LogOut className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
