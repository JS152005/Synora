import { Link } from "react-router-dom";
import { Stethoscope, ArrowLeft, LayoutDashboard } from "lucide-react";
import Button from "../components/ui/Button";

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-6 shadow-sm">
        <Stethoscope className="h-7 w-7" aria-hidden="true" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
        Error 404
      </span>

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Page Not Found
      </h1>

      <p className="mt-2.5 max-w-sm text-sm text-slate-500 leading-relaxed">
        The clinical route or page you are looking for has been moved, renamed, or does not exist.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link to="/dashboard">
          <Button
            variant="primary"
            size="md"
            leftIcon={<LayoutDashboard className="h-4 w-4" />}
          >
            Go to Dashboard
          </Button>
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </div>
    </div>
  );
}

export default NotFoundPage;
