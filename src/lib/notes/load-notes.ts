import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { PRACTICE_ROUTES } from "@/lib/practice-routes";
import { JS_CONCEPTS, JS_METHODS } from "./js-catalog";
import { blocksToSearchText, slugify } from "./markdown";
import { parseMarkdown, parseProfile } from "./parse-markdown";
import { parseSnippetSource } from "./parse-snippets";
import { NOTE_TOPICS, getTopic } from "./topics";
import type { HubCard, ListItem, ListSection, MdBlock, Question, SnippetCard } from "./types";

function contentRoot() {
  return path.join(process.cwd(), "content");
}

function readContentFile(relativePath: string): string {
  return fs.readFileSync(path.join(contentRoot(), relativePath), "utf8");
}

function questionToItem(question: Question): ListItem {
  return {
    id: slugify(question.text) || `q${question.num}`,
    num: question.num,
    title: question.text,
    badge: question.tag || (question.mustKnow ? "must-know" : undefined),
    searchText: [
      question.text,
      question.shortDef,
      question.say,
      question.followUp,
      question.mistake,
      blocksToSearchText(question.extra),
    ].join(" "),
    shortDef: question.shortDef,
    say: question.say,
    extra: question.extra,
    followUp: question.followUp,
    mistake: question.mistake,
  };
}

function snippetToItem(card: SnippetCard, index: number): ListItem {
  return {
    id: slugify(card.title) || `item-${index + 1}`,
    num: index + 1,
    title: card.title,
    searchText: [card.title, card.explanation, card.code, blocksToSearchText(card.extra ?? [])].join(" "),
    shortDef: card.explanation || undefined,
    extra: [
      ...(card.code ? ([{ type: "code", code: card.code }] satisfies MdBlock[]) : []),
      ...(card.extra ?? []),
    ],
  };
}

export const getTopicPage = cache((id: string) => {
  const topic = getTopic(id);
  if (!topic) return null;
  const raw = readContentFile(path.join("interview-notes", topic.file));
  const { profile, body } = parseProfile(raw);
  const noteSections = parseMarkdown(body);
  const sections: ListSection[] = noteSections.map((section) => ({
    id: section.id,
    title: section.title,
    items: section.questions.map(questionToItem),
  }));
  const questionCount = sections.reduce((sum, section) => sum + section.items.length, 0);
  return { topic, profile, sections, questionCount };
});

export const getSnippetPage = cache((files: string[], sectionTitles?: string[]) => {
  const sections: ListSection[] = files.map((file, fileIndex) => {
    const cards = parseSnippetSource(readContentFile(file));
    const title = sectionTitles?.[fileIndex] ?? path.basename(file);
    return {
      id: `s${fileIndex + 1}-${slugify(title)}`,
      title,
      items: cards.map((card, index) => snippetToItem(card, index)),
    };
  });
  const itemCount = sections.reduce((sum, section) => sum + section.items.length, 0);
  return { sections, itemCount };
});

export const getSnippetCount = cache((files: string[]) => {
  return files.reduce((sum, file) => sum + parseSnippetSource(readContentFile(file)).length, 0);
});

export const getHubData = cache(() => {
  const core: HubCard[] = [];
  const company: HubCard[] = [];
  let totalQuestions = 0;

  for (const topic of NOTE_TOPICS) {
    const page = getTopicPage(topic.id);
    const count = page?.questionCount ?? 0;
    totalQuestions += count;
    const card: HubCard = {
      href: `/notes/${topic.id}`,
      title: topic.title,
      description: topic.description,
      meta: `${count} questions`,
      badge: topic.hubBadge,
      company: topic.category === "company",
    };
    if (topic.category === "company") company.push(card);
    else core.push(card);
  }

  const conceptCount = JS_CONCEPTS.filter((entry) => entry.slug !== "typescript-types").length;
  const cheatsheets: HubCard[] = [
    {
      href: "/notes/javascript/concepts",
      title: "JS Concepts",
      description: "Data types, closures, promises, errors, DOM, and the rest of the snippet track.",
      meta: `${conceptCount} topics`,
    },
    ...JS_METHODS.map((entry) => ({
      href: `/notes/javascript/methods/${entry.slug}`,
      title: entry.title,
      description: entry.description,
      meta: `${getSnippetCount(entry.files)} methods`,
    })),
    {
      href: "/notes/javascript/concepts/typescript-types",
      title: "TypeScript Types",
      description: "Interfaces, unions, generics, and API response types.",
      meta: `${getSnippetCount(["typescript/index.ts"])} snippets`,
    },
  ];

  const playground: HubCard[] = [
    {
      href: "/practice/nested-checkbox",
      title: "Practice",
      description: "Machine-coding exercises with a live React playground.",
      meta: `${PRACTICE_ROUTES.length} exercises`,
    },
    {
      href: "/learn",
      title: "Learn Next.js",
      description: "CSR, SSR, SSG, ISR, PPR, streaming, and metadata demos.",
      meta: "Rendering track",
    },
    {
      href: "/learn/redux",
      title: "Redux track",
      description: "Six isolated RTK examples from counter to RTK Query.",
      meta: "6 examples",
    },
  ];

  return { totalQuestions, core, cheatsheets, company, playground };
});
