import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex h-20 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-5 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-xl border border-[var(--border)] p-2.5 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="m-0 text-lg font-bold lg:text-xl">
            AI DevSecOps Control Center
          </h1>

          <p className="m-0 mt-1 text-xs text-[var(--text-secondary)] lg:text-sm">
            Monitor pipeline, security and deployment health
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="hidden rounded-xl border border-[var(--border)] p-2.5 text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] sm:block"
          aria-label="Search"
        >
          <Search size={19} />
        </button>

        <button
          type="button"
          className="rounded-xl border border-[var(--border)] p-2.5 text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
          aria-label="Notifications"
        >
          <Bell size={19} />
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl border border-[var(--border)] p-2.5 text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
          aria-label="Change theme"
        >
          {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        <div className="ml-1 grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-sm font-bold text-white">
          PR
        </div>
      </div>
    </header>
  );
}

export default Header;
