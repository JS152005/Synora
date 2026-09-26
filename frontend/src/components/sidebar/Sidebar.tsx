import { NavLink } from "react-router-dom";

import { navigation } from "../../config/navigation";
import { useAuth } from "../../features/auth/useAuth";

function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white shadow-sm">
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <button
          onClick={logout}
          className="w-full rounded-lg bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
