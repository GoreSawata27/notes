export const THEME_IDS = [
  "carbon-enterprise",
  "notion-studio",
  "graphite-premium",
  "ocean-cyan",
  "linear-lavender",
  "graphite-dark",
  "linear-obsidian",
  "midnight-dark",
  "vercel-midnight",
  "neon-cyber",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME: ThemeId = "carbon-enterprise";

export const THEME_STORAGE_KEY = "notes-theme";

export type ThemeMeta = {
  id: ThemeId;
  label: string;
  shikiTheme: string;
};

export const THEMES: ThemeMeta[] = [
  { id: "carbon-enterprise", label: "Carbon Enterprise", shikiTheme: "github-light" },
  { id: "notion-studio", label: "Notion Studio", shikiTheme: "catppuccin-latte" },
  { id: "graphite-premium", label: "Graphite Premium", shikiTheme: "vitesse-light" },
  { id: "ocean-cyan", label: "Ocean Cyan", shikiTheme: "github-light" },
  { id: "linear-lavender", label: "Linear Lavender", shikiTheme: "github-light" },
  { id: "graphite-dark", label: "Graphite Dark", shikiTheme: "github-dark-dimmed" },
  { id: "linear-obsidian", label: "Linear Obsidian", shikiTheme: "material-theme-palenight" },
  { id: "midnight-dark", label: "Midnight Dark", shikiTheme: "one-dark-pro" },
  { id: "vercel-midnight", label: "Vercel Midnight", shikiTheme: "github-dark" },
  { id: "neon-cyber", label: "Neon Cyber", shikiTheme: "tokyo-night" },
];

export function isThemeId(value: string): value is ThemeId {
  return THEME_IDS.includes(value as ThemeId);
}

export function getShikiTheme(themeId: ThemeId): string {
  return THEMES.find((theme) => theme.id === themeId)?.shikiTheme ?? "github-light";
}

export const SHIKI_THEMES = [...new Set(THEMES.map((theme) => theme.shikiTheme))];
