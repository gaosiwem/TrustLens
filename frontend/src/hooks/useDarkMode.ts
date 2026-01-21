import { useTheme } from "next-themes";

export function useDarkMode() {
  const { theme, setTheme } = useTheme();
  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");
  return { theme, toggle };
}
