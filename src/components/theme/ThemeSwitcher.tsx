"use client";

import { THEMES } from "@/lib/theme/themes";
import { useTheme } from "./ThemeProvider";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-switcher">
      <label className="theme-switcher-label" htmlFor="theme-select">
        Theme
      </label>
      <select
        id="theme-select"
        className="theme-switcher-select"
        value={theme}
        onChange={(event) => setTheme(event.target.value as typeof theme)}
        aria-label="Select color theme"
      >
        {THEMES.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
