import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Menu,
  Bell,
  UserCheck,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Search,
  BookOpen,
  MessageSquare,
  Users,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../../features/auth/useAuth";
import { useBadges } from "../../hooks/useBadges";
import { useSocket } from "../../context/SocketContext";
import { useTheme } from "../../context/ThemeContext";
import Avatar from "../ui/Avatar";
import SearchInput from "../ui/SearchInput";
import Modal from "../ui/Modal";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

function Navbar({ onToggleSidebar }: NavbarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { incomingRequestsCount, unreadNotificationsCount } = useBadges();
  const { socket } = useSocket();
  const { isDark, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isConnected = !!socket?.connected;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/students?name=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsQuickSearchOpen(false);
    }
  };

  // Keyboard shortcut (Ctrl+K or ⌘K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsQuickSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const quickNavLinks = [
    { label: "Find Study Partners", icon: Users, path: "/students" },
    { label: "Medical Subjects (MBBS)", icon: BookOpen, path: "/subjects" },
    { label: "Partner Requests", icon: UserCheck, path: "/requests" },
    { label: "Study Chat Room", icon: MessageSquare, path: "/chat" },
  ];

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 md:px-6 sticky top-0 z-30">
      {/* Left: Mobile Menu + Search */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition md:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        )}

        {/* Global Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
          <SearchInput
            ref={searchInputRef}
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search students, subjects... (Ctrl+K)"
            shortcut="Ctrl K"
            size="sm"
            className="w-56 lg:w-72"
          />
        </form>

        {/* Mobile Search Button */}
        <button
          onClick={() => setIsQuickSearchOpen(true)}
          className="sm:hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Open search"
        >
          <Search className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Right: Status + Navigation Shortcuts + Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Real-time Connection status */}
        <div
          className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 select-none shadow-2xs"
          title={isConnected ? "Real-time sync active via Socket.IO" : "Reconnecting to live sync..."}
          aria-live="polite"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected ? "bg-emerald-500 shadow-xs shadow-emerald-500/50" : "bg-amber-500"
            }`}
          />
          <span className="font-semibold">{isConnected ? "Live Network" : "Syncing"}</span>
        </div>

        <div className="hidden sm:block h-4 w-px bg-slate-200 mx-1" aria-hidden="true" />

        {/* Partner requests quick icon */}
        <Link
          to="/requests"
          className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
          title="Partner Requests"
          aria-label={`Partner requests${incomingRequestsCount > 0 ? `, ${incomingRequestsCount} pending` : ""}`}
        >
          <UserCheck className="h-4.5 w-4.5" aria-hidden="true" />
          {incomingRequestsCount > 0 && (
            <span
              className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white shadow-2xs"
              aria-hidden="true"
            >
              {incomingRequestsCount}
            </span>
          )}
        </Link>

        {/* Notifications quick icon */}
        <Link
          to="/notifications"
          className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
          title="Notifications"
          aria-label={`Notifications${unreadNotificationsCount > 0 ? `, ${unreadNotificationsCount} unread` : ""}`}
        >
          <Bell className="h-4.5 w-4.5" aria-hidden="true" />
          {unreadNotificationsCount > 0 && (
            <span
              className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-2xs"
              aria-hidden="true"
            >
              {unreadNotificationsCount}
            </span>
          )}
        </Link>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:text-[#F5F5DC] dark:hover:bg-[#231b18] transition cursor-pointer"
          title={isDark ? "Switch to light theme" : "Switch to dark theme"}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        >
          {isDark ? (
            <Sun className="h-4.5 w-4.5 text-[#D8B4A0]" aria-hidden="true" />
          ) : (
            <Moon className="h-4.5 w-4.5 text-[#3B4F8A]" aria-hidden="true" />
          )}
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" aria-hidden="true" />

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl p-1.5 pr-2 transition hover:bg-slate-100 cursor-pointer select-none"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            aria-label="Account menu"
          >
            <Avatar
              src={user?.profileImage}
              name={user?.fullName || "Student"}
              size="sm"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-900 line-clamp-1 leading-tight">
                {user?.fullName || "Medical Student"}
              </p>
              <p className="text-[11px] text-slate-400 line-clamp-1 leading-tight">
                {user?.college || user?.course || "MBBS Student"}
              </p>
            </div>
            <ChevronDown
              className={`hidden lg:block h-3.5 w-3.5 text-slate-400 transition-transform duration-150 ${
                profileOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          {/* Interactive Dropdown */}
          {profileOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-56 rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/10 z-50 py-1.5 animate-slide-up"
              role="menu"
            >
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {user?.fullName || "Student"}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {user?.email}
                </p>
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                >
                  <User className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  My Academic Profile
                </Link>
                <Link
                  to="/settings"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  Account Settings
                </Link>
              </div>

              <div className="border-t border-slate-100 py-1">
                <button
                  role="menuitem"
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ctrl+K Quick Command / Search Modal */}
      {isQuickSearchOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsQuickSearchOpen(false)}
          width="md"
          title="Quick Navigation & Search"
          description="Search students or quickly jump to any curriculum module."
        >
          <div className="space-y-4">
            <form onSubmit={handleSearchSubmit}>
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Type a student name, college, or topic..."
                autoFocus
                size="lg"
              />
            </form>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Quick Jump
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickNavLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.path}
                      onClick={() => {
                        setIsQuickSearchOpen(false);
                        navigate(link.path);
                      }}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 text-left text-xs font-medium text-slate-700 hover:text-indigo-700 transition cursor-pointer"
                    >
                      <Icon className="h-4 w-4 text-indigo-500 shrink-0" />
                      <span className="truncate">{link.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </header>
  );
}

export default Navbar;
