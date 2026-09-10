import { normalizeNewlines, parseCommentBlocks } from "./markdown";
import type { SnippetCard } from "./types";

function isLineComment(line: string): boolean {
  return line.trimStart().startsWith("//");
}

function commentText(line: string): string {
  return line.replace(/^\s*\/\/\s?/, "");
}

function isNewCardComment(line: string): boolean {
  if (!isLineComment(line)) return false;
  const text = commentText(line).trim();
  if (/^The\s+[\w.]+(?:\(\))\s+/.test(text)) return true;
  if (/^The\s+[\w.]+\s+(?:\(static method\)\s+)?method\b/i.test(text)) return true;
  if (/^\d+\.\s+\S/.test(text)) return true;
  if (/^#{1,3}\s+\S/.test(text)) return true;
  if (/^\w+Error\b/.test(text)) return true;
  if (/\p{Extended_Pictographic}/u.test(text)) return true;
  return false;
}

function isBlockCommentStart(line: string): boolean {
  return line.trim().startsWith("/*");
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/^#{1,3}\s+/, "")
    .replace(/^\d+\.\s+/, "")
    .replace(/^(?:📌|👤|📦|🏠|🔐|🔁|💬|🧱)\s*/, "")
    .replace(/[:.]+$/, "")
    .trim();
}

function extractTitle(commentLines: string[]): string {
  const first =
    commentLines
      .map((l) => l.trim())
      .find((line) => line && !/^[-=*_~]{3,}$/.test(line) && !line.startsWith("|")) ?? "Notes";
  const method = first.match(/^The\s+(`?[\w.]+(?:\(\))?`?)(?:\s+\(static method\))?/i);
  if (method && (/\(\)/.test(method[1]) || /\bmethod\b/i.test(first))) {
    const name = method[1].replace(/`/g, "");
    return /\(static method\)/i.test(first) ? `${name} (static)` : name;
  }
  const numbered = first.match(/^\d+\.\s+(.+)/);
  if (numbered) return cleanTitle(numbered[1]);
  const cleaned = cleanTitle(first);
  if (cleaned.length <= 72) return cleaned;
  return cleaned.split(/[.:]/)[0]?.slice(0, 60) || "Notes";
}

function extractTitleFromText(text: string): string {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((line) => line && !/^[-=*_~]{3,}$/.test(line));
  const first = lines.find((line) => !line.startsWith("|")) ?? "";
  if (first) {
    const cleaned = cleanTitle(first);
    if (cleaned.length <= 72) return cleaned;
    return cleaned.split(/[.:]/)[0]?.slice(0, 60) || "Notes";
  }
  const tableLine = lines.find((line) => line.startsWith("|"));
  if (tableLine) {
    const header = tableLine
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim())
      .filter(Boolean)
      .join(" · ");
    if (header) return header.slice(0, 60);
  }
  return "Notes";
}

function peekNonEmpty(lines: string[], start: number): string | undefined {
  for (let i = start; i < lines.length; i += 1) {
    if (lines[i].trim() !== "") return lines[i];
  }
  return undefined;
}

function readBlockComment(lines: string[], start: number): { body: string; next: number } {
  const first = lines[start];
  const afterOpen = first.slice(first.indexOf("/*") + 2);
  if (afterOpen.includes("*/")) {
    return { body: afterOpen.replace(/\*\/.*/, "").trim(), next: start + 1 };
  }

  const collected: string[] = [];
  if (afterOpen.trim()) collected.push(afterOpen.replace(/^\s*\*/, "").trimEnd());
  let i = start + 1;
  while (i < lines.length && !lines[i].includes("*/")) {
    collected.push(lines[i].replace(/^\s*\*/, "").trimEnd());
    i += 1;
  }
  if (i < lines.length) {
    collected.push(
      lines[i]
        .replace(/\*\/.*/, "")
        .replace(/^\s*\*/, "")
        .trimEnd(),
    );
    i += 1;
  }
  return { body: collected.join("\n").trim(), next: i };
}

function blockToCard(body: string): SnippetCard | null {
  if (!body) return null;
  const extra = parseCommentBlocks(body);
  const explanation = extra
    .filter((block) => block.type === "p" || block.type === "h")
    .map((block) => (block.type === "p" || block.type === "h" ? block.text : ""))
    .join("\n")
    .trim();
  return {
    title: extractTitleFromText(explanation || body),
    explanation: explanation || body,
    code: "",
    extra: extra.length ? extra : undefined,
  };
}

export function parseSnippetSource(source: string): SnippetCard[] {
  const lines = normalizeNewlines(source).split("\n");
  const cards: SnippetCard[] = [];
  let i = 0;

  while (i < lines.length) {
    if (lines[i].trim() === "") {
      i += 1;
      continue;
    }

    if (isBlockCommentStart(lines[i])) {
      const { body, next } = readBlockComment(lines, i);
      const card = blockToCard(body);
      if (card) cards.push(card);
      i = next;
      continue;
    }

    if (isLineComment(lines[i])) {
      const comments: string[] = [];
      while (i < lines.length && isLineComment(lines[i])) {
        if (comments.length > 0 && isNewCardComment(lines[i])) break;
        comments.push(commentText(lines[i]));
        i += 1;
      }

      const code: string[] = [];
      while (i < lines.length) {
        if (lines[i].trim() === "") {
          const next = peekNonEmpty(lines, i + 1);
          if (!next || isNewCardComment(next) || isBlockCommentStart(next)) break;
          code.push(lines[i]);
          i += 1;
          continue;
        }
        if (isNewCardComment(lines[i]) || isBlockCommentStart(lines[i])) break;
        code.push(lines[i]);
        i += 1;
      }

      const explanation = comments.join("\n").trim();
      const codeText = code.join("\n").trim();
      if (explanation || codeText) {
        cards.push({
          title: extractTitle(comments.length ? comments : [codeText.slice(0, 40) || "Example"]),
          explanation,
          code: codeText,
        });
      }
      continue;
    }

    const code: string[] = [];
    while (i < lines.length) {
      if (lines[i].trim() === "") {
        const next = peekNonEmpty(lines, i + 1);
        if (!next || isNewCardComment(next) || isBlockCommentStart(next) || isLineComment(next)) break;
        code.push(lines[i]);
        i += 1;
        continue;
      }
      if (isNewCardComment(lines[i]) || isBlockCommentStart(lines[i])) break;
      if (isLineComment(lines[i]) && code.length > 0) {
        const next = peekNonEmpty(lines, i + 1);
        if (next && !isLineComment(next) && !isNewCardComment(next)) {
          code.push(lines[i]);
          i += 1;
          continue;
        }
        break;
      }
      code.push(lines[i]);
      i += 1;
    }

    const codeText = code.join("\n").trim();
    if (codeText) {
      cards.push({ title: "Example", explanation: "", code: codeText });
    }
  }

  return cards.filter((card) => card.explanation || card.code || card.extra?.length);
}
