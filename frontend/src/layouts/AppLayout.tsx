import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/sidebar/Sidebar";
import Drawer from "../components/ui/Drawer";

function AppLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const isChat = location.pathname.startsWith("/chat");

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50/70 dark:bg-[#181311] text-slate-900 dark:text-[#F5F5DC]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        side="left"
        width="w-64 max-w-[80vw]"
      >
        <div className="-m-4 h-full">
          <Sidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
        </div>
      </Drawer>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Navbar
          onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        <main
          key={location.pathname}
          className={`
            flex-1 min-w-0 page-enter
            ${
              isChat
                ? "overflow-hidden p-2 sm:p-4 flex flex-col"
                : "overflow-y-auto p-4 md:p-6 lg:p-8"
            }
          `.trim().replace(/\s+/g, " ")}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
