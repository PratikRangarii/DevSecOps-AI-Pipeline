import { Outlet } from "react-router";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";

function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Header />

        <main className="p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
