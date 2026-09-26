import { useAuth } from "../../features/auth/useAuth";

function Navbar() {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-blue-600">
          Synora
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="w-72 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none transition focus:border-blue-500"
        />

        <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
            {user?.fullName?.charAt(0).toUpperCase() ?? "U"}
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-800">
              {user?.fullName ?? "User"}
            </p>
            <p className="text-xs text-gray-500">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
