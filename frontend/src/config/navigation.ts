import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  UserCheck,
  MessageSquare,
  Bell,
  User,
  Settings,
} from "lucide-react";

export interface NavigationItem {
  name: string;
  path: string;
  icon: LucideIcon;
  badgeKey?: "requests" | "notifications";
}

export const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Discover Students",
    path: "/students",
    icon: Users,
  },
  {
    name: "Medical Subjects",
    path: "/subjects",
    icon: BookOpen,
  },
  {
    name: "Partner Requests",
    path: "/requests",
    icon: UserCheck,
    badgeKey: "requests",
  },
  {
    name: "Study Chat",
    path: "/chat",
    icon: MessageSquare,
  },
  {
    name: "Notifications",
    path: "/notifications",
    icon: Bell,
    badgeKey: "notifications",
  },
  {
    name: "My Profile",
    path: "/profile",
    icon: User,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];
