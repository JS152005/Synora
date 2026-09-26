import { Outlet } from "react-router-dom";

import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/sidebar/Sidebar";

function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
