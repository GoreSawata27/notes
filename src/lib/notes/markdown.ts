import type { MdBlock } from "./types";

export function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function parseBlocks(block: string): MdBlock[] {
  const lines = normalizeNewlines(block).trim().split("\n");
  const parts: MdBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      i += 1;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length && lines[i].startsWith("```")) i += 1;
      parts.push({ type: "code", code: codeLines.join("\n") });
      continue;
    }

    if (line.trim().startsWith("|") && i + 1 < lines.length && /^\s*\|?\s*-+/.test(lines[i + 1])) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i += 1;
      }
      const table = parseTableLines(tableLines);
      if (table) parts.push(table);
      continue;
    }

    if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].replace(/^[-*] /, ""));
        i += 1;
      }
      parts.push({ type: "ul", items });
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i += 1;
      }
      parts.push({ type: "ol", items });
      continue;
    }

    if (line.trim() === "") {
      i += 1;
      continue;
    }

    parts.push({ type: "p", text: line });
    i += 1;
  }

  return parts;
}

export function parseTableLines(tableLines: string[]): MdBlock | null {
  if (tableLines.length < 2) return null;
  const splitRow = (row: string) =>
    row
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());

  const headers = splitRow(tableLines[0]);
  const dataRows = tableLines.slice(1).filter((row) => !/^\|?\s*:?-/.test(row));
  if (dataRows.length === 0) return null;
  return { type: "table", headers, rows: dataRows.map(splitRow) };
}

export function blocksToSearchText(blocks: MdBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === "p") return block.text;
      if (block.type === "code") return block.code;
      if (block.type === "ul" || block.type === "ol") return block.items.join(" ");
      return [...block.headers, ...block.rows.flat()].join(" ");
    })
    .join(" ");
}
