import { NavLink } from "react-router-dom";
import {
  Stethoscope,
  LogOut,
  X,
  LayoutDashboard,
  Users,
  BookOpen,
  UserCheck,
  MessageSquare,
  Bell,
  User,
  Settings,
} from "lucide-react";
import { useAuth } from "../../features/auth/useAuth";
import { useBadges } from "../../hooks/useBadges";
import Avatar from "../ui/Avatar";

interface SidebarProps {
  onCloseMobile?: () => void;
}

const navGroups = [
  {
    label: "LEARN",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Discover Students", path: "/students", icon: Users },
      { name: "Medical Subjects", path: "/subjects", icon: BookOpen },
    ],
  },
  {
    label: "COLLABORATE",
    items: [
      {
        name: "Partner Requests",
        path: "/requests",
        icon: UserCheck,
        badgeKey: "requests" as const,
      },
      { name: "Study Chat", path: "/chat", icon: MessageSquare },
      {
        name: "Notifications",
        path: "/notifications",
        icon: Bell,
        badgeKey: "notifications" as const,
      },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { name: "My Profile", path: "/profile", icon: User },
      { name: "Settings", path: "/settings", icon: Settings },
    ],
  },
];

function Sidebar({ onCloseMobile }: SidebarProps) {
  const { user, logout } = useAuth();
  const { incomingRequestsCount, unreadNotificationsCount } = useBadges();

  const getBadgeCount = (key?: "requests" | "notifications") => {
    if (key === "requests") return incomingRequestsCount;
    if (key === "notifications") return unreadNotificationsCount;
    return 0;
  };

  return (
    <aside className="flex h-full w-64 flex-col bg-white dark:bg-[#1d1614] border-r border-slate-200/80 dark:border-[#3a2e29] select-none shadow-xs">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-slate-100 dark:border-[#3a2e29]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3B4F8A] text-white shadow-sm">
            <Stethoscope className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-[#F5F5DC]">
              Synora
            </span>
            <span className="rounded-md bg-[#3B4F8A]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#3B4F8A] dark:text-[#D8B4A0] border border-[#3B4F8A]/20">
              Med
            </span>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition md:hidden cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="h-4.5 w-4.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <nav
        className="flex-1 overflow-y-auto py-5 px-3 space-y-6"
        aria-label="Sidebar navigation"
      >
        {navGroups.map((group, gi) => (
          <div key={gi} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {group.label}
            </p>
            <ul className="space-y-0.5 pt-1" role="list">
              {group.items.map((item) => {
                const Icon = item.icon;
                const badgeKey = "badgeKey" in item ? item.badgeKey : undefined;
                const badgeCount = getBadgeCount(badgeKey);

                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all duration-150 ${
                          isActive
                            ? "bg-[#3B4F8A]/10 text-[#3B4F8A] dark:bg-[#3B4F8A]/25 dark:text-[#D8B4A0] font-semibold shadow-2xs"
                            : "text-slate-600 dark:text-[#d6ccbe] hover:bg-slate-50 dark:hover:bg-[#2c221e] hover:text-slate-900 dark:hover:text-[#F5F5DC] font-medium"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon
                              className={`h-4 w-4 shrink-0 transition-colors ${
                                isActive
                                  ? "text-[#3B4F8A] dark:text-[#D8B4A0]"
                                  : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                              }`}
                              aria-hidden="true"
                            />
                            <span className="truncate">{item.name}</span>
                          </div>

                          {badgeCount > 0 && (
                            <span
                              className={`ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                                isActive
                                  ? "bg-[#3B4F8A]/20 text-[#3B4F8A] dark:text-[#F5F5DC]"
                                  : badgeKey === "requests"
                                  ? "bg-[#7A8450]/20 text-[#7A8450] dark:text-[#F5F5DC]"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                              }`}
                            >
                              {badgeCount > 99 ? "99+" : badgeCount}
                            </span>
                          )}

                          {/* Subtle left active accent bar */}
                          {isActive && (
                            <span
                              className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#3B4F8A] dark:bg-[#D8B4A0]"
                              aria-hidden="true"
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User profile footer */}
      <div className="shrink-0 border-t border-slate-100 dark:border-[#3a2e29] p-3">
        <div className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-[#2c221e] transition group">
          <Avatar
            src={user?.profileImage}
            name={user?.fullName || "Student"}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-900 dark:text-[#F5F5DC] group-hover:text-slate-800 leading-tight">
              {user?.fullName || "Student"}
            </p>
            <p className="truncate text-[11px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
              {user?.course || "MBBS"}
              {user?.year ? ` · ${user.year}` : ""}
            </p>
          </div>

          <button
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
            className="shrink-0 rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
