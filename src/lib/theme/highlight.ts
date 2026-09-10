import { createHighlighter, type Highlighter } from "shiki";
import { SHIKI_THEMES, getShikiTheme, type ThemeId } from "./themes";

const LANGS = [
  "javascript",
  "typescript",
  "tsx",
  "jsx",
  "html",
  "css",
  "json",
  "bash",
  "sql",
  "python",
  "text",
] as const;

const LANG_MAP: Record<string, string> = {
  js: "javascript",
  javascript: "javascript",
  ts: "typescript",
  typescript: "typescript",
  tsx: "tsx",
  jsx: "jsx",
  html: "html",
  css: "css",
  json: "json",
  bash: "bash",
  sh: "bash",
  shell: "bash",
  sql: "sql",
  py: "python",
  python: "python",
  txt: "text",
  text: "text",
};

let highlighter: Highlighter | null = null;
let highlighterPromise: Promise<Highlighter> | null = null;

function normalizeLang(lang?: string): string {
  if (!lang) return "text";
  const key = lang.toLowerCase().trim();
  return LANG_MAP[key] ?? key;
}

async function getHighlighter(): Promise<Highlighter> {
  if (highlighter) return highlighter;
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [...SHIKI_THEMES],
      langs: [...LANGS],
    }).then((instance) => {
      highlighter = instance;
      return instance;
    });
  }
  return highlighterPromise;
}

export async function highlightCode(
  code: string,
  lang: string | undefined,
  themeId: ThemeId,
): Promise<string> {
  const instance = await getHighlighter();
  const shikiLang = normalizeLang(lang);
  const shikiTheme = getShikiTheme(themeId);
  const loadedLangs = instance.getLoadedLanguages();

  try {
    if (!loadedLangs.includes(shikiLang)) {
      return instance.codeToHtml(code, { lang: "text", theme: shikiTheme });
    }
    return instance.codeToHtml(code, { lang: shikiLang, theme: shikiTheme });
  } catch {
    return instance.codeToHtml(code, { lang: "text", theme: shikiTheme });
  }
}
