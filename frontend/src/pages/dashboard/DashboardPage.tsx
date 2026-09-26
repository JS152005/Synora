import { useNavigate } from "react-router-dom";

import { useAuth } from "../../features/auth/useAuth";

function DashboardPage() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-6">
          <h1 className="text-2xl font-bold">
            Synora
          </h1>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-8">
        <div className="rounded-xl bg-white p-8 shadow">
          <h2 className="mb-6 text-3xl font-bold">
            Welcome to Synora ??
          </h2>

          <div className="space-y-3">
            <p>
              <span className="font-semibold">
                Full Name:
              </span>{" "}
              {user?.fullName}
            </p>

            <p>
              <span className="font-semibold">
                Email:
              </span>{" "}
              {user?.email}
            </p>

            <p>
              <span className="font-semibold">
                User ID:
              </span>{" "}
              {user?.id}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
