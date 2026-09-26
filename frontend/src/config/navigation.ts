export interface NavigationItem {
  name: string;
  path: string;
  icon?: string;
  roles?: ("USER" | "ADMIN")[];
}

export const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: "layout-dashboard",
    roles: ["USER", "ADMIN"],
  },
  {
    name: "Profile",
    path: "/profile",
    icon: "user",
    roles: ["USER", "ADMIN"],
  },
  {
    name: "Students",
    path: "/students",
    icon: "search",
    roles: ["USER", "ADMIN"],
  },
  {
    name: "Subjects",
    path: "/subjects",
    icon: "book-open",
    roles: ["USER", "ADMIN"],
  },
  {
    name: "Requests",
    path: "/requests",
    icon: "user-plus",
    roles: ["USER", "ADMIN"],
  },
  {
    name: "Chat",
    path: "/chat",
    icon: "message-circle",
    roles: ["USER", "ADMIN"],
  },
  {
    name: "Notifications",
    path: "/notifications",
    icon: "bell",
    roles: ["USER", "ADMIN"],
  },
  {
    name: "Settings",
    path: "/settings",
    icon: "settings",
    roles: ["USER", "ADMIN"],
  },
  {
    name: "Admin",
    path: "/admin",
    icon: "shield",
    roles: ["ADMIN"],
  },
  {
    name: "Help",
    path: "/help",
    icon: "circle-help",
    roles: ["USER", "ADMIN"],
  },
];
