import {
  Bot,
  Boxes,
  FileText,
  Gauge,
  GitBranch,
  Rocket,
  Settings,
  ShieldCheck
} from "lucide-react";
import { NavLink } from "react-router";

const navigation = [
  { label: "Overview", icon: Gauge, path: "/" },
  { label: "Pipeline", icon: GitBranch, path: "/pipeline" },
  { label: "Security", icon: ShieldCheck, path: "/security" },
  { label: "AI Analysis", icon: Bot, path: "/ai-analysis" },
  { label: "Deployments", icon: Rocket, path: "/deployments" },
  { label: "Applications", icon: Boxes, path: "/applications" },
  { label: "Reports", icon: FileText, path: "/reports" }
];

function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] lg:flex lg:flex-col">
      <div className="border-b border-[var(--border)] px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <ShieldCheck size={23} />
          </div>

          <div>
            <p className="m-0 text-sm font-bold">Wanderlust</p>
            <p className="m-0 text-xs text-[var(--text-secondary)]">
              DevSecOps Center
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={label}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              [
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium no-underline transition",
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
              ].join(" ")
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[var(--border)] p-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            [
              "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium no-underline transition",
              isActive
                ? "bg-blue-600 text-white"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
            ].join(" ")
          }
        >
          <Settings size={18} />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
