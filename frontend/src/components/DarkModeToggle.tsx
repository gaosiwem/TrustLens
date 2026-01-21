"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface DarkModeToggleProps {
  className?: string;
}

export default function DarkModeToggle({
  className = "",
}: DarkModeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      className={`p-2 rounded-full text-primary bg-white/20 dark:bg-black/20 ${className}`}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle Dark Mode"
    >
      {theme === "dark" ? "🌞" : "🌙"}
    </button>
  );
}
