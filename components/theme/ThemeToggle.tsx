"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const STORAGE_KEY = "weconnect-theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const nextTheme: Theme = saved === "dark" ? "dark" : "light";
      applyTheme(nextTheme);
      setTheme(nextTheme);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn("theme-toggle", className)}
      aria-label={`Switch to ${theme === "dark" ? "white" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "white" : "dark"} theme`}
    >
      <span className={cn("theme-toggle__option", theme === "light" && "is-active")}>
        <Sun size={14} />
        <span>White</span>
      </span>
      <span className={cn("theme-toggle__option", theme === "dark" && "is-active")}>
        <Moon size={14} />
        <span>Dark</span>
      </span>
    </button>
  );
}
