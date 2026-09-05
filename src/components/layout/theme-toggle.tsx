"use client";

import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      aria-label="테마 변경"
      className="rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {resolvedTheme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
