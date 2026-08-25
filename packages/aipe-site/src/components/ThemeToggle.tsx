import { useEffect, useState } from "react";

type Theme = "dark" | "light";

function currentTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Toggles the dark-first canvas and the complete light theme, persisting the choice. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    // Sync in case the pre-paint script resolved a different value.
    setTheme(currentTheme());
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("aipe-theme", next);
    } catch {
      /* storage unavailable — the choice just won't persist */
    }
    setTheme(next);
  }

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted hover:text-brand hover:border-brand transition-colors ${className}`}
    >
      <span aria-hidden="true" className="text-[15px] leading-none">
        {isDark ? "☾" : "☀"}
      </span>
    </button>
  );
}
