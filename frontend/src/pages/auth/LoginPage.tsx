import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Stethoscope,
  Eye,
  EyeOff,
  BookOpen,
  Users,
  Brain,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../../features/auth/useAuth";
import { getErrorMessage } from "../../utils/error";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const loginSchema = z.object({
  email: z.string().email("Enter a valid personal email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const features = [
  {
    icon: Brain,
    title: "Smart Peer Matchmaking",
    desc: "Match directly with students by reciprocal curriculum syllabus topics.",
  },
  {
    icon: BookOpen,
    title: "19 MBBS Subjects",
    desc: "Complete pre-clinical, para-clinical, and clinical syllabus hierarchy.",
  },
  {
    icon: Users,
    title: "Live Peer Chat",
    desc: "Real-time direct messaging with connected academic study partners.",
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data.email, data.password);

      if (response?.requiresVerification) {
        if (response.step === "PENDING_INSTITUTION_VERIFICATION") {
          toast(
            "Your medical student registration is under institutional verification review.",
            { icon: "⏳", duration: 6000 }
          );
          return;
        }

        toast(
          response.message || "Please complete email verification to access Synora.",
          { icon: "🔐" }
        );

        navigate("/register", {
          state: {
            resumeVerification: true,
            userId: response.userId,
            step: response.step,
            personalEmailMasked: response.personalEmailMasked,
            collegeEmailMasked: response.collegeEmailMasked,
            personalEmailVerified: response.personalEmailVerified,
            collegeEmailVerified: response.collegeEmailVerified,
          },
        });
        return;
      }

      toast.success(response.message || "Welcome back to Synora!");
      navigate("/dashboard");
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, "Invalid email or password. Please try again.")
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex lg:w-[50%] relative flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-12 text-white">
        {/* Dot pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #a5b4fc 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />
        {/* Soft glow */}
        <div
          className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl"
          aria-hidden="true"
        />

        {/* Brand Header */}
        <div className="relative flex items-center gap-3 z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/20 backdrop-blur-md shadow-sm">
            <Stethoscope className="h-5 w-5 text-indigo-300" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight">Synora</span>
            <span className="ml-1.5 rounded bg-indigo-500/30 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300 border border-indigo-400/30">
              Med
            </span>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="relative z-10 space-y-8 max-w-md">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Medical Student Collaboration Platform</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Study smarter.
              <br />
              <span className="text-indigo-300">Collaborate deeper.</span>
            </h2>
            <p className="text-sm text-indigo-100/80 leading-relaxed">
              Connect with medical students across India based on the exact syllabus
              topics you want to learn or teach.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/15">
                    <Icon className="h-4.5 w-4.5 text-indigo-300" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{f.title}</p>
                    <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[11px] text-slate-400">
          Synora Academic Systems · Built specifically for medical curriculum collaboration
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12">
        {/* Mobile brand header */}
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <Stethoscope className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold text-slate-900">Synora Med</span>
        </div>

        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="text-xs text-slate-500">
              Sign in to your Synora medical student account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Personal Email"
              type="email"
              required
              placeholder="e.g. rohan@gmail.com"
              autoComplete="email"
              {...register("email")}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
              {...register("password")}
              error={errors.password?.message}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer transition p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              }
            />

            <div className="flex items-center justify-end pt-0.5">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-[#3B4F8A] hover:text-[#2b3964] dark:text-[#D8B4A0] dark:hover:text-[#F5F5DC] transition"
              >
                Forgot password?
              </Link>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isLoading}
                rightIcon={!isLoading ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : undefined}
              >
                Sign In
              </Button>
            </div>
          </form>

          <p className="text-center text-xs text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-indigo-600 hover:text-indigo-700 transition"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
