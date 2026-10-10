import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Stethoscope,
  ArrowRight,
  ArrowLeft,
  Mail,
  KeyRound,
  CheckCircle2,
  Clock,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import * as authApi from "../../api/auth.api";
import { getErrorMessage } from "../../utils/error";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import OtpInput from "../../components/ui/OtpInput";

type Step = "EMAIL" | "OTP" | "NEW_PASSWORD" | "SUCCESS";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("EMAIL");
  const [email, setEmail] = useState("");
  const [emailMasked, setEmailMasked] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // OTP Countdown: 10 minutes = 600 seconds
  const [otpTimeLeft, setOtpTimeLeft] = useState<number>(600);
  const [isOtpExpired, setIsOtpExpired] = useState(false);

  // Resend Cooldown: 60 seconds
  const [resendCooldown, setResendCooldown] = useState<number>(60);
  const [canResend, setCanResend] = useState(false);

  // Timer for 10-minute expiry
  useEffect(() => {
    if (step !== "OTP") return;

    if (otpTimeLeft <= 0) {
      setIsOtpExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setOtpTimeLeft((prev) => {
        if (prev <= 1) {
          setIsOtpExpired(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, otpTimeLeft]);

  // Timer for 60-second resend cooldown
  useEffect(() => {
    if (step !== "OTP") return;

    if (resendCooldown <= 0) {
      setCanResend(true);
      return;
    }

    const cooldownTimer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(cooldownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(cooldownTimer);
  }, [step, resendCooldown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // STEP 1: Handle Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid personal email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.forgotPassword(cleanEmail);
      toast.success("Verification code sent to your email.");
      setEmailMasked(res.emailMasked || cleanEmail);
      setStep("OTP");
      setOtp("");
      setOtpTimeLeft(600); // 10 minutes
      setIsOtpExpired(false);
      setResendCooldown(60);
      setCanResend(false);
    } catch (err: unknown) {
      const message = getErrorMessage(
        err,
        "Failed to process password reset request."
      );
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isOtpExpired) {
      setErrorMsg(
        "This verification code has expired. Please request a new code."
      );
      return;
    }

    if (otp.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.verifyResetOtp(email.trim().toLowerCase(), otp);
      toast.success("Verification code verified successfully.");
      setResetToken(res.resetToken);
      setStep("NEW_PASSWORD");
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Invalid verification code.");
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;

    setErrorMsg(null);
    setIsLoading(true);
    try {
      await authApi.resendResetOtp(email.trim().toLowerCase());
      toast.success("A fresh 6-digit code has been sent to your email.");
      setOtp("");
      setOtpTimeLeft(600); // Reset 10 minutes
      setIsOtpExpired(false);
      setResendCooldown(60); // Reset 60s cooldown
      setCanResend(false);
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Failed to resend code.");
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 3: Handle Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(resetToken, newPassword, confirmPassword);
      toast.success("Password reset successfully.");
      setStep("SUCCESS");
    } catch (err: unknown) {
      const message = getErrorMessage(
        err,
        "Failed to reset password. Please start again."
      );
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-[#181311] transition-colors duration-200">
      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex lg:w-[48%] relative flex-col justify-between overflow-hidden bg-gradient-to-br from-[#4A3B35] via-[#3B4F8A] to-[#211916] p-12 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #F5F5DC 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-3 z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/20 backdrop-blur-md shadow-sm">
            <Stethoscope className="h-5 w-5 text-[#F5F5DC]" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">
              Synora
            </span>
            <span className="ml-1.5 rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F5F5DC] border border-white/30">
              Med
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#F5F5DC] backdrop-blur-xs">
            <ShieldCheck className="h-4 w-4 text-[#D8B4A0]" />
            <span>Secure Student Credential Recovery</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Account recovery <br />
            <span className="text-[#D8B4A0]">made simple & secure.</span>
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Verify your identity through your registered personal email address
            to regain access to your medical collaboration workspace.
          </p>
        </div>

        <div className="relative z-10 text-[11px] text-white/60">
          Synora Academic Systems · End-to-end Encrypted Password Recovery
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12">
        <div className="mb-6 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3B4F8A] text-white shadow-sm">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-[#F5F5DC]">
            Synora Med
          </span>
        </div>

        <div className="w-full max-w-md space-y-6 animate-fade-in">
          {/* Back link */}
          {step !== "SUCCESS" && (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-[#F5F5DC] transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          )}

          {/* STEP 1: Enter Email */}
          {step === "EMAIL" && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B4F8A]/10 text-[#3B4F8A] dark:bg-[#3B4F8A]/20 dark:text-[#D8B4A0] mb-2">
                  <Mail className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F5F5DC]">
                  Reset your password
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Enter your registered personal email address and we'll send you
                  a verification code.
                </p>
              </div>

              {errorMsg && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
                <Input
                  label="Personal Email *"
                  type="email"
                  required
                  placeholder="e.g. rohan@gmail.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    size="lg"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Send OTP
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: Verify OTP */}
          {step === "OTP" && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#7A8450]/10 text-[#7A8450] dark:bg-[#7A8450]/20 dark:text-[#F5F5DC] mb-2">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F5F5DC]">
                  Enter verification code
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Enter the 6-digit verification code sent to your email{" "}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    ({emailMasked})
                  </span>
                  .
                </p>
              </div>

              {/* Expiry indicator */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-[#231b18] px-4 py-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Clock className="h-4 w-4 text-[#7A8450]" />
                  <span>Code expires in:</span>
                </div>
                <span
                  className={`font-mono font-bold text-sm ${
                    isOtpExpired
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-[#3B4F8A] dark:text-[#D8B4A0]"
                  }`}
                >
                  {isOtpExpired ? "Expired" : formatTime(otpTimeLeft)}
                </span>
              </div>

              {errorMsg && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    6-Digit Verification Code *
                  </label>
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    length={6}
                    disabled={isLoading || isOtpExpired}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  isLoading={isLoading}
                  disabled={isOtpExpired || otp.length !== 6}
                >
                  Verify Code
                </Button>
              </form>

              {/* Resend button */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || isLoading}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition ${
                    canResend && !isLoading
                      ? "text-[#3B4F8A] hover:text-[#2b3964] dark:text-[#D8B4A0] dark:hover:text-[#F5F5DC]"
                      : "text-slate-400 dark:text-slate-600 cursor-not-allowed"
                  }`}
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
                  />
                  <span>
                    {canResend
                      ? "Resend OTP"
                      : `Resend OTP in ${resendCooldown}s`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Create New Password */}
          {step === "NEW_PASSWORD" && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B4F8A]/10 text-[#3B4F8A] dark:bg-[#3B4F8A]/20 dark:text-[#D8B4A0] mb-2">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F5F5DC]">
                  Create a new password
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Choose a secure password for your Synora medical account.
                </p>
              </div>

              {errorMsg && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <Input
                  label="New Password *"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      aria-label="Toggle password"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                />

                <Input
                  label="Confirm New Password *"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    size="lg"
                    isLoading={isLoading}
                  >
                    Reset Password
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 4: Success confirmation */}
          {step === "SUCCESS" && (
            <div className="text-center space-y-6 py-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F5F5DC]">
                  Password reset successfully
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Your new password is now active. You can log in using your
                  personal email and new password.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={() => navigate("/login")}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Return to Sign In
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
