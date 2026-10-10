import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Stethoscope,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Mail,
  GraduationCap,
  KeyRound,
  RotateCcw,
  Check,
  AlertCircle,
  Clock,
  Building2,
  UserCheck,
  Sparkles,
} from "lucide-react";

import { getErrorMessage } from "../../utils/error";
import {
  getColleges,
  getCourses,
  register as registerApi,
  resendOtp as resendOtpApi,
  getRegistrationStatus,
} from "../../api/auth.api";
import { useAuth } from "../../features/auth/useAuth";
import type { College, Course } from "../../types/user";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { CollegeSearchSelect } from "../../components/ui/CollegeSearchSelect";
import { OtpInput } from "../../components/ui/OtpInput";

type RegistrationStep = "FORM_DETAILS" | "VERIFY_EMAILS" | "VERIFIED_SUCCESS";

interface LocationState {
  resumeVerification?: boolean;
  registrationId?: string;
  userId?: string;
  step?: string;
  personalEmailMasked?: string;
  collegeEmailMasked?: string;
  personalEmailVerified?: boolean;
  collegeEmailVerified?: boolean;
  hasCollegeEmail?: boolean;
  fullName?: string;
  collegeName?: string;
}

const highlights = [
  "Strictly verified medical student identity network",
  "Smart reciprocal peer matchmaking based on 19 MBBS subjects",
  "Parent-topic and subtopic curriculum hierarchy",
  "Real-time study chat and collaboration rooms with peers",
];

const STORAGE_KEY = "synora_pending_registration";

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  const { verifyOtp } = useAuth();

  // Form Fields State
  const [fullName, setFullName] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [hasCollegeEmail, setHasCollegeEmail] = useState<boolean>(true);
  const [collegeEmail, setCollegeEmail] = useState("");
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Dynamic College & Course Database
  const [colleges, setColleges] = useState<College[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(true);

  // Verification State (Unified Single Verification Page)
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("FORM_DETAILS");
  const [registrationId, setRegistrationId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [personalEmailMasked, setPersonalEmailMasked] = useState<string>("");
  const [collegeEmailMasked, setCollegeEmailMasked] = useState<string>("");
  const [personalEmailVerified, setPersonalEmailVerified] = useState<boolean>(false);
  const [collegeEmailVerified, setCollegeEmailVerified] = useState<boolean>(false);
  const [verifiedMedGranted, setVerifiedMedGranted] = useState<boolean>(false);

  // OTP Codes for both sections
  const [personalOtp, setPersonalOtp] = useState<string>("");
  const [collegeOtp, setCollegeOtp] = useState<string>("");

  // Loading & Error States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingPersonal, setIsVerifyingPersonal] = useState(false);
  const [isVerifyingCollege, setIsVerifyingCollege] = useState(false);
  const [isResendingPersonal, setIsResendingPersonal] = useState(false);
  const [isResendingCollege, setIsResendingCollege] = useState(false);
  const [personalError, setPersonalError] = useState<string | null>(null);
  const [collegeError, setCollegeError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Independent 60s resend cooldowns
  const [personalCooldown, setPersonalCooldown] = useState<number>(0);
  const [collegeCooldown, setCollegeCooldown] = useState<number>(0);

  // Load Colleges & Courses
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoadingMetadata(true);
        const [collegesData, coursesData] = await Promise.all([
          getColleges(),
          getCourses(),
        ]);
        if (mounted) {
          setColleges(collegesData || []);
          setCourses(coursesData || []);

          const mbbs = coursesData?.find((c) => c.code === "MBBS") || coursesData?.[0];
          if (mbbs) {
            setSelectedCourseId(mbbs.id);
            if (mbbs.academicYears && mbbs.academicYears.length > 0) {
              setSelectedYear(mbbs.academicYears[0].yearCode);
            } else {
              setSelectedYear("1st Year");
            }
          }
        }
      } catch (err) {
        console.error("Failed to load registration metadata:", err);
      } finally {
        if (mounted) setLoadingMetadata(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Restore Verification State from Storage or Navigation State
  useEffect(() => {
    // 1. Check navigation state first
    if (locationState?.resumeVerification && (locationState.registrationId || locationState.userId)) {
      const regId = locationState.registrationId || locationState.userId || "";
      setRegistrationId(regId);
      setUserId(locationState.userId || regId);
      if (locationState.personalEmailMasked) setPersonalEmailMasked(locationState.personalEmailMasked);
      if (locationState.collegeEmailMasked) setCollegeEmailMasked(locationState.collegeEmailMasked);
      if (typeof locationState.hasCollegeEmail === "boolean") setHasCollegeEmail(locationState.hasCollegeEmail);
      if (locationState.personalEmailVerified) setPersonalEmailVerified(true);
      if (locationState.collegeEmailVerified) setCollegeEmailVerified(true);
      setCurrentStep("VERIFY_EMAILS");
      return;
    }

    // 2. Check sessionStorage to persist state across refreshes
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.registrationId || parsed.userId) {
          setRegistrationId(parsed.registrationId || parsed.userId || "");
          setUserId(parsed.userId || parsed.registrationId || "");
          setFullName(parsed.fullName || "");
          setPersonalEmail(parsed.personalEmail || "");
          setCollegeEmail(parsed.collegeEmail || "");
          setHasCollegeEmail(Boolean(parsed.hasCollegeEmail));
          setPersonalEmailMasked(parsed.personalEmailMasked || parsed.personalEmail || "");
          setCollegeEmailMasked(parsed.collegeEmailMasked || parsed.collegeEmail || "");
          setPersonalEmailVerified(Boolean(parsed.personalEmailVerified));
          setCollegeEmailVerified(Boolean(parsed.collegeEmailVerified));
          setCurrentStep("VERIFY_EMAILS");

          // Sync status with backend if registrationId is available
          const lookupId = parsed.registrationId || parsed.userId;
          if (lookupId) {
            getRegistrationStatus(lookupId)
              .then((statusRes) => {
                if (statusRes.success) {
                  setPersonalEmailVerified(statusRes.personalEmailVerified);
                  setCollegeEmailVerified(statusRes.collegeEmailVerified);
                  setHasCollegeEmail(statusRes.hasCollegeEmail);
                  if (statusRes.isComplete) {
                    setCurrentStep("VERIFIED_SUCCESS");
                  }
                }
              })
              .catch(() => {
                // Ignore background sync errors
              });
          }
        }
      }
    } catch {
      // Ignore sessionStorage parsing errors
    }
  }, [locationState]);

  // Persist verification session to sessionStorage
  useEffect(() => {
    if (currentStep === "VERIFY_EMAILS" && (registrationId || userId)) {
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            registrationId,
            userId,
            fullName,
            personalEmail,
            collegeEmail,
            hasCollegeEmail,
            personalEmailMasked,
            collegeEmailMasked,
            personalEmailVerified,
            collegeEmailVerified,
            collegeName: selectedCollege?.name,
            courseName: courses.find((c) => c.id === selectedCourseId)?.name,
            year: selectedYear,
          })
        );
      } catch {
        // Ignore storage errors
      }
    } else if (currentStep === "VERIFIED_SUCCESS") {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [
    currentStep,
    registrationId,
    userId,
    fullName,
    personalEmail,
    collegeEmail,
    hasCollegeEmail,
    personalEmailMasked,
    collegeEmailMasked,
    personalEmailVerified,
    collegeEmailVerified,
    selectedCollege,
    courses,
    selectedCourseId,
    selectedYear,
  ]);

  // Countdown timers for resends
  useEffect(() => {
    if (personalCooldown <= 0) return;
    const timer = setInterval(() => {
      setPersonalCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [personalCooldown]);

  useEffect(() => {
    if (collegeCooldown <= 0) return;
    const timer = setInterval(() => {
      setCollegeCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [collegeCooldown]);

  // Academic year options
  const currentCourse = useMemo(() => {
    return courses.find((c) => c.id === selectedCourseId);
  }, [courses, selectedCourseId]);

  const yearOptions = useMemo(() => {
    if (currentCourse?.academicYears && currentCourse.academicYears.length > 0) {
      return currentCourse.academicYears.map((ay) => ({
        value: ay.yearCode,
        label: ay.displayName || ay.yearCode,
      }));
    }
    return [
      { value: "1st Year", label: "1st Year" },
      { value: "2nd Year", label: "2nd Year" },
      { value: "3rd Year", label: "3rd Year" },
      { value: "Final Year", label: "Final Year" },
      { value: "Intern", label: "Intern / CRRI" },
    ];
  }, [currentCourse]);

  // College email domain validation feedback
  const domainValidation = useMemo(() => {
    if (!hasCollegeEmail || !collegeEmail || !selectedCollege) {
      return null;
    }
    const emailParts = collegeEmail.toLowerCase().trim().split("@");
    if (emailParts.length !== 2) return null;
    const domain = emailParts[1];

    if (collegeEmail.toLowerCase().trim() === "jsctsmail@gmail.com") {
      return {
        valid: true,
        message: "Development email authorized for real OTP verification testing.",
      };
    }

    if (selectedCollege.hasVerifiedDomain && selectedCollege.emailDomains?.length > 0) {
      const match = selectedCollege.emailDomains.some((d) => domain === d || domain.endsWith("." + d));
      if (match) {
        return {
          valid: true,
          message: `Official verified domain: @${domain} matches ${selectedCollege.name}`,
        };
      } else {
        const allowed = selectedCollege.emailDomains.map((d) => `@${d}`).join(", ");
        return {
          valid: true,
          message: `Note: Official domain for ${selectedCollege.name} is ${allowed}. Verification code will be sent to this email.`,
        };
      }
    } else {
      return {
        valid: true,
        message: `Verification code will be sent to this college email address.`,
      };
    }
  }, [hasCollegeEmail, collegeEmail, selectedCollege]);

  // Step 1: Initial Registration Submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMsg("Full name must be at least 3 characters.");
      return;
    }
    if (!personalEmail.trim() || !personalEmail.includes("@")) {
      setErrorMsg("Please enter a valid personal email address.");
      return;
    }

    if (hasCollegeEmail) {
      if (!collegeEmail.trim() || !collegeEmail.includes("@")) {
        setErrorMsg("Please enter your college email address or select 'No, I don't have a college email'.");
        return;
      }
      if (personalEmail.trim().toLowerCase() === collegeEmail.trim().toLowerCase()) {
        setErrorMsg("Personal email and College email must be two separate, distinct email addresses.");
        return;
      }
      if (domainValidation && !domainValidation.valid) {
        setErrorMsg(domainValidation.message);
        return;
      }
    }

    if (!selectedCollege) {
      setErrorMsg("Please select your medical college from the official list.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await registerApi({
        fullName: fullName.trim(),
        personalEmail: personalEmail.trim(),
        hasCollegeEmail,
        collegeEmail: hasCollegeEmail ? collegeEmail.trim() : undefined,
        collegeId: selectedCollege.id,
        course: currentCourse?.name || "MBBS",
        courseId: currentCourse?.id,
        year: selectedYear,
        password,
        confirmPassword,
      });

      const effectiveRegId = res.registrationId || res.userId;
      setRegistrationId(effectiveRegId);
      setUserId(res.userId || effectiveRegId);
      setPersonalEmailMasked(res.personalEmailMasked || personalEmail);
      if (res.collegeEmailMasked) {
        setCollegeEmailMasked(res.collegeEmailMasked);
      } else if (collegeEmail) {
        setCollegeEmailMasked(collegeEmail);
      }

      setPersonalEmailVerified(false);
      setCollegeEmailVerified(false);
      setPersonalOtp("");
      setCollegeOtp("");
      setPersonalError(null);
      setCollegeError(null);
      setPersonalCooldown(60);
      if (hasCollegeEmail) {
        setCollegeCooldown(60);
      }

      // Transition to unified verification page
      setCurrentStep("VERIFY_EMAILS");
      toast.success(
        hasCollegeEmail
          ? "Verification codes sent to both your personal and college emails!"
          : "Verification code sent to your personal email!"
      );
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Registration failed. Please check your information.");
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify Personal Email OTP (Never redirects on failure)
  const handleVerifyPersonalOtp = async () => {
    if (!personalOtp || personalOtp.length !== 6) {
      setPersonalError("Please enter the complete 6-digit verification code.");
      return;
    }
    setPersonalError(null);

    try {
      setIsVerifyingPersonal(true);
      const res = await verifyOtp({
        registrationId: registrationId || undefined,
        userId: userId || undefined,
        emailType: "PERSONAL",
        otp: personalOtp.trim(),
      });

      setPersonalEmailVerified(true);
      toast.success("✓ Personal email verified!");

      // If user selected NO college email, account is fully registered and active!
      if (!hasCollegeEmail || res.step === "VERIFIED") {
        if (res.token) {
          localStorage.setItem("token", res.token);
        }
        setVerifiedMedGranted(false);
        setCurrentStep("VERIFIED_SUCCESS");
        return;
      }

      // If user has college email and it's already verified as well:
      if (collegeEmailVerified || res.collegeEmailVerified) {
        if (res.token) {
          localStorage.setItem("token", res.token);
        }
        setCollegeEmailVerified(true);
        setVerifiedMedGranted(true);
        setCurrentStep("VERIFIED_SUCCESS");
      } else {
        // User remains on the SAME page to verify college email!
        toast("Please verify your college email to complete registration.", {
          icon: "🎓",
        });
      }
    } catch (err: unknown) {
      const rawMsg = getErrorMessage(err, "Invalid verification code. Please try again.");
      let friendlyMsg = rawMsg;
      if (rawMsg.toLowerCase().includes("expired")) {
        friendlyMsg = "This verification code has expired. Please request a new code.";
      } else if (rawMsg.toLowerCase().includes("invalid") || rawMsg.toLowerCase().includes("incorrect")) {
        friendlyMsg = "Invalid verification code. Please try again.";
      }
      setPersonalError(friendlyMsg);
      toast.error(friendlyMsg);
    } finally {
      setIsVerifyingPersonal(false);
    }
  };

  // Step 3: Verify College Email OTP (Never redirects on failure)
  const handleVerifyCollegeOtp = async () => {
    if (!collegeOtp || collegeOtp.length !== 6) {
      setCollegeError("Please enter the complete 6-digit verification code.");
      return;
    }
    setCollegeError(null);

    try {
      setIsVerifyingCollege(true);
      const res = await verifyOtp({
        registrationId: registrationId || undefined,
        userId: userId || undefined,
        emailType: "COLLEGE",
        otp: collegeOtp.trim(),
      });

      setCollegeEmailVerified(true);
      toast.success("✓ College email verified! Verified Med status unlocked.");

      // If personal email is also verified, registration is complete!
      if (personalEmailVerified || res.personalEmailVerified || res.step === "VERIFIED") {
        if (res.token) {
          localStorage.setItem("token", res.token);
        }
        setPersonalEmailVerified(true);
        setVerifiedMedGranted(true);
        setCurrentStep("VERIFIED_SUCCESS");
      } else {
        // User remains on the SAME page to complete personal email verification
        toast("College email verified! Now please verify your personal email.", {
          icon: "📧",
        });
      }
    } catch (err: unknown) {
      const rawMsg = getErrorMessage(err, "Invalid verification code. Please try again.");
      let friendlyMsg = rawMsg;
      if (rawMsg.toLowerCase().includes("expired")) {
        friendlyMsg = "This verification code has expired. Please request a new code.";
      } else if (rawMsg.toLowerCase().includes("invalid") || rawMsg.toLowerCase().includes("incorrect")) {
        friendlyMsg = "Invalid verification code. Please try again.";
      }
      setCollegeError(friendlyMsg);
      toast.error(friendlyMsg);
    } finally {
      setIsVerifyingCollege(false);
    }
  };

  // Resend OTP for Personal Email
  const handleResendPersonalOtp = async () => {
    if (personalCooldown > 0) return;
    setPersonalError(null);

    try {
      setIsResendingPersonal(true);
      const res = await resendOtpApi({
        registrationId: registrationId || undefined,
        userId: userId || undefined,
        emailType: "PERSONAL",
      });
      setPersonalCooldown(60);
      setPersonalOtp("");
      toast.success(res.message || "New 6-digit verification code sent to your personal email.");
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Failed to resend verification code.");
      setPersonalError(msg);
      toast.error(msg);
    } finally {
      setIsResendingPersonal(false);
    }
  };

  // Resend OTP for College Email
  const handleResendCollegeOtp = async () => {
    if (collegeCooldown > 0) return;
    setCollegeError(null);

    try {
      setIsResendingCollege(true);
      const res = await resendOtpApi({
        registrationId: registrationId || undefined,
        userId: userId || undefined,
        emailType: "COLLEGE",
      });
      setCollegeCooldown(60);
      setCollegeOtp("");
      toast.success(res.message || "New 6-digit verification code sent to your college email.");
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Failed to resend verification code.");
      setCollegeError(msg);
      toast.error(msg);
    } finally {
      setIsResendingCollege(false);
    }
  };

  // Reset verification to edit form details
  const handleRestartForm = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setCurrentStep("FORM_DETAILS");
    setPersonalOtp("");
    setCollegeOtp("");
    setPersonalError(null);
    setCollegeError(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-12 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #a5b4fc 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
          aria-hidden="true"
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/20 backdrop-blur-md shadow-sm">
            <Stethoscope className="h-5 w-5 text-indigo-300" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight">Synora</span>
            <span className="ml-1.5 rounded bg-indigo-500/30 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300 border border-indigo-400/30">
              Verified Med
            </span>
          </div>
        </div>

        {/* Brand Content */}
        <div className="relative z-10 space-y-6 max-w-md">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Medical Student Collaboration Network</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
              The collaborative platform for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300">
                future doctors.
              </span>
            </h2>
            <p className="text-sm text-indigo-100/80 leading-relaxed">
              Connect with verified MBBS peers across India to master complex clinical cases, share notes, and prepare for NEET-PG/NEXT together.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {highlights.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2
                  className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span className="text-xs text-slate-200 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>

          {/* Stepper overview */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-3">
              Verification Workflow
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    currentStep !== "FORM_DETAILS"
                      ? "bg-emerald-500 text-white"
                      : "bg-indigo-600 text-white ring-2 ring-indigo-400"
                  }`}
                >
                  {currentStep !== "FORM_DETAILS" ? <Check className="h-3.5 w-3.5" /> : "1"}
                </div>
                <span className="text-xs text-slate-200">Registration Details</span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    personalEmailVerified || currentStep === "VERIFIED_SUCCESS"
                      ? "bg-[#3B4F8A] text-white"
                      : currentStep === "VERIFY_EMAILS"
                      ? "bg-indigo-600 text-white ring-2 ring-indigo-400"
                      : "bg-white/10 text-slate-400"
                  }`}
                >
                  {personalEmailVerified || currentStep === "VERIFIED_SUCCESS" ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    "2"
                  )}
                </div>
                <span className="text-xs text-slate-200">Personal Email (Required OTP)</span>
              </div>

              {hasCollegeEmail && (
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      collegeEmailVerified || currentStep === "VERIFIED_SUCCESS"
                        ? "bg-emerald-500 text-white"
                        : currentStep === "VERIFY_EMAILS"
                        ? "bg-emerald-600 text-white ring-2 ring-emerald-400"
                        : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {collegeEmailVerified || currentStep === "VERIFIED_SUCCESS" ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      "3"
                    )}
                  </div>
                  <span className="text-xs text-slate-200">College Email (Verified Med Badge)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-slate-400">
          NMC Recognized Institutions · Protected Real Email Delivery
        </div>
      </div>

      {/* ── Right Content Panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg space-y-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between lg:hidden mb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Stethoscope className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-lg font-bold text-slate-900">Synora Med</span>
            </div>
            <Link
              to="/login"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Sign In →
            </Link>
          </div>

          {/* Form-level error banner */}
          {errorMsg && currentStep === "FORM_DETAILS" && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium">{errorMsg}</div>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="text-rose-500 hover:text-rose-700 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* ========================================================
              STEP 1: REGISTRATION FORM
             ======================================================== */}
          {currentStep === "FORM_DETAILS" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Student Registration</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Create student account
                </h1>
                <p className="text-xs text-slate-500">
                  Join Synora to find study partners and explore medical subjects. Real verification codes will be sent to your email.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Full Name */}
                <Input
                  label="Full Name"
                  required
                  placeholder="e.g. Dr. Rohan Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  icon={<GraduationCap className="h-4 w-4 text-slate-400" />}
                />

                {/* Personal Email */}
                <div>
                  <Input
                    label="Personal Email Address"
                    type="email"
                    required
                    placeholder="e.g. rohan@gmail.com"
                    value={personalEmail}
                    onChange={(e) => setPersonalEmail(e.target.value)}
                    icon={<Mail className="h-4 w-4 text-slate-400" />}
                    helperText="Your personal email is your primary login identity and used for OTP verification."
                  />
                </div>

                {/* College Search Select */}
                <CollegeSearchSelect
                  colleges={colleges}
                  selectedCollegeId={selectedCollege?.id || ""}
                  onSelectCollege={(c) => setSelectedCollege(c)}
                  isLoading={loadingMetadata}
                  helperText="Search from 200 recognized Indian medical colleges"
                />

                {/* Course and Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Select
                    label="Degree Course"
                    required
                    options={courses.map((c) => ({
                      value: c.id,
                      label: `${c.code} - ${c.name}`,
                    }))}
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    placeholder="Select Course"
                  />

                  <Select
                    label="Academic Year"
                    required
                    options={yearOptions}
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    placeholder="Select Year"
                  />
                </div>

                {/* College Email Option */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                    Do you have a college email address? <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setHasCollegeEmail(true)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        hasCollegeEmail
                          ? "border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-100"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          hasCollegeEmail ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                        }`}
                      >
                        {hasCollegeEmail && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Yes, I have a college email</div>
                        <div className="text-[11px] text-slate-500">Unlocks Verified Med badge & institutional trust</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHasCollegeEmail(false)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        !hasCollegeEmail
                          ? "border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-100"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          !hasCollegeEmail ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                        }`}
                      >
                        {!hasCollegeEmail && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">No, I don't have a college email</div>
                        <div className="text-[11px] text-slate-500">Verify using personal email only</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* College Email Input */}
                {hasCollegeEmail ? (
                  <div className="space-y-2 p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/30">
                    <Input
                      label="College Medical Email"
                      type="email"
                      required
                      placeholder="e.g. rohan@aiims.edu"
                      value={collegeEmail}
                      onChange={(e) => setCollegeEmail(e.target.value)}
                      icon={<Building2 className="h-4 w-4 text-indigo-500" />}
                    />
                    <div className="flex items-center gap-1.5 text-[11px] text-indigo-700 font-medium">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      <span>Verifying your college email gives your account a Verified Med badge.</span>
                    </div>

                    {domainValidation && (
                      <div
                        className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                          domainValidation.valid
                            ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                            : "bg-amber-50/70 border-amber-200 text-amber-800"
                        }`}
                      >
                        {domainValidation.valid ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                        )}
                        <span>{domainValidation.message}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      No college email? That's completely fine. You can create your Synora account by verifying your personal email.
                    </span>
                  </div>
                )}

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<KeyRound className="h-4 w-4 text-slate-400" />}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600 focus:outline-hidden"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />

                  <Input
                    label="Confirm Password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    icon={<KeyRound className="h-4 w-4 text-slate-400" />}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  size="lg"
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Create Account & Send Verification Code
                </Button>
              </form>

              <div className="text-center text-xs text-slate-500">
                Already registered?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Sign in here
                </Link>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 2: SAME UNIFIED OTP VERIFICATION PAGE
              (Displays BOTH Personal & College sections if college email selected)
             ======================================================== */}
          {currentStep === "VERIFY_EMAILS" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div className="space-y-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Account Verification</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {hasCollegeEmail ? "Verify Your Emails" : "Verify Your Personal Email"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  {hasCollegeEmail
                    ? "Both emails must be verified to activate your verified student account."
                    : "Enter the verification code sent to your personal email to activate your account."}
                </p>
              </div>

              {/* ── SECTION 1: PERSONAL EMAIL VERIFICATION ── */}
              <div
                className={`p-6 rounded-2xl border transition-all ${
                  personalEmailVerified
                    ? "border-[#3B4F8A]/40 bg-[#3B4F8A]/5 shadow-xs"
                    : "border-slate-200 bg-white shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Personal Email (Required)
                    </span>
                    <div className="text-sm font-semibold text-slate-900">
                      {personalEmailMasked || personalEmail || "Your Personal Email"}
                    </div>
                  </div>

                  {personalEmailVerified ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B4F8A] text-white text-xs font-bold shadow-xs">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                      <span>Personal Email Verified</span>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-600 font-medium bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Pending Verification
                    </div>
                  )}
                </div>

                {personalEmailVerified ? (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50/60 border border-blue-200/60 text-xs text-[#3B4F8A] font-medium">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#3B4F8A]" />
                    <span>✓ Personal email has been successfully verified.</span>
                  </div>
                ) : (
                  <div className="space-y-4 pt-1">
                    {/* Error message for personal OTP */}
                    {personalError && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs animate-in fade-in">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                        <span className="flex-1 font-medium">{personalError}</span>
                      </div>
                    )}

                    <div className="space-y-2 text-center">
                      <label className="text-[11px] font-semibold text-slate-600 tracking-wider uppercase">
                        6-Digit Personal Verification Code
                      </label>
                      <OtpInput
                        length={6}
                        value={personalOtp}
                        onChange={(val) => {
                          setPersonalOtp(val);
                          if (personalError) setPersonalError(null);
                        }}
                        disabled={isVerifyingPersonal}
                        autoFocus
                      />
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      className="w-full bg-[#3B4F8A] hover:bg-[#324376]"
                      size="lg"
                      isLoading={isVerifyingPersonal}
                      disabled={personalOtp.length !== 6}
                      onClick={handleVerifyPersonalOtp}
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Verify Personal Email
                    </Button>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Valid for 10 minutes</span>
                      </div>

                      {personalCooldown > 0 ? (
                        <span className="text-slate-400 font-medium">
                          Resend in <span className="font-bold text-[#3B4F8A]">{personalCooldown}s</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isResendingPersonal}
                          onClick={handleResendPersonalOtp}
                          className="inline-flex items-center gap-1 font-semibold text-[#3B4F8A] hover:text-[#324376] disabled:opacity-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>{isResendingPersonal ? "Sending..." : "Resend Code"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── SECTION 2: COLLEGE EMAIL VERIFICATION (Shown if college email was selected) ── */}
              {hasCollegeEmail && (
                <div
                  className={`p-6 rounded-2xl border transition-all ${
                    collegeEmailVerified
                      ? "border-emerald-300 bg-emerald-50/40 shadow-xs"
                      : "border-slate-200 bg-white shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          College Email
                        </span>
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-300">
                          Verified Med
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {collegeEmailMasked || collegeEmail || "Your College Email"}
                      </div>
                    </div>

                    {collegeEmailVerified ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                        <span>College Email Verified</span>
                      </div>
                    ) : (
                      <div className="text-xs text-amber-600 font-medium bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        Pending Verification
                      </div>
                    )}
                  </div>

                  {collegeEmailVerified ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>✓ College email verified! "Verified Med" badge activated.</span>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-1">
                      {/* Error message for college OTP */}
                      {collegeError && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs animate-in fade-in">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                          <span className="flex-1 font-medium">{collegeError}</span>
                        </div>
                      )}

                      <div className="space-y-2 text-center">
                        <label className="text-[11px] font-semibold text-slate-600 tracking-wider uppercase">
                          6-Digit College Verification Code
                        </label>
                        <OtpInput
                          length={6}
                          value={collegeOtp}
                          onChange={(val) => {
                            setCollegeOtp(val);
                            if (collegeError) setCollegeError(null);
                          }}
                          disabled={isVerifyingCollege}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="primary"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        size="lg"
                        isLoading={isVerifyingCollege}
                        disabled={collegeOtp.length !== 6}
                        onClick={handleVerifyCollegeOtp}
                        rightIcon={<ShieldCheck className="h-4 w-4" />}
                      >
                        Verify College Email
                      </Button>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>Valid for 10 minutes</span>
                        </div>

                        {collegeCooldown > 0 ? (
                          <span className="text-slate-400 font-medium">
                            Resend in <span className="font-bold text-emerald-600">{collegeCooldown}s</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={isResendingCollege}
                            onClick={handleResendCollegeOtp}
                            className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>{isResendingCollege ? "Sending..." : "Resend Code"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Complete Registration Action (When both are verified) */}
              {personalEmailVerified && (!hasCollegeEmail || collegeEmailVerified) && (
                <div className="pt-2 animate-in zoom-in-95">
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    className="w-full bg-[#3B4F8A] hover:bg-[#324376]"
                    onClick={() => setCurrentStep("VERIFIED_SUCCESS")}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Complete Registration
                  </Button>
                </div>
              )}

              {/* Footer Options */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                <button
                  type="button"
                  onClick={handleRestartForm}
                  className="inline-flex items-center gap-1 hover:text-slate-700 text-slate-500"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Edit registration details</span>
                </button>

                <Link to="/login" className="hover:text-indigo-600">
                  Return to sign in
                </Link>
              </div>
            </div>
          )}

          {/* ========================================================
              STEP 3: VERIFIED SUCCESS SCREEN
             ======================================================== */}
          {currentStep === "VERIFIED_SUCCESS" && (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
              <div
                className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl shadow-md ${
                  verifiedMedGranted
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-[#3B4F8A]/10 text-[#3B4F8A]"
                }`}
              >
                <ShieldCheck className="h-10 w-10" />
              </div>

              <div className="space-y-2">
                {verifiedMedGranted ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 border border-emerald-300">
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                    Verified Med Badge Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#3B4F8A] border border-blue-200">
                    <CheckCircle2 className="h-4 w-4 text-[#3B4F8A]" />
                    Active Medical Student
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Welcome to Synora!
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                  {verifiedMedGranted
                    ? "Both your personal and college emails have been verified. Your verified medical student badge is now active."
                    : "Your personal email has been verified and your Synora medical student account is active."}
                </p>
              </div>

              {/* Student Credential Summary */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white text-left space-y-2.5 max-w-sm mx-auto shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Student Name</span>
                  <span className="text-xs font-bold text-slate-900">{fullName || "Medical Student"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Institution</span>
                  <span className="text-xs font-semibold text-slate-900 truncate max-w-[200px]">
                    {selectedCollege?.name || "Medical College"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Course & Year</span>
                  <span className="text-xs font-semibold text-slate-900">
                    {currentCourse?.code || "MBBS"} • {selectedYear || "1st Year"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-500">Account Badge</span>
                  {verifiedMedGranted ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Verified Med
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#3B4F8A]" />
                      Active Student (No Badge)
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full max-w-sm mx-auto bg-[#3B4F8A] hover:bg-[#324376]"
                  onClick={() => navigate("/dashboard")}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Enter Synora Platform
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
