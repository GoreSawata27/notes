"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { ListItem, ListSection } from "@/lib/notes/types";
import { InlineMd } from "./InlineMd";
import { MdBlocks } from "./MdBlocks";

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function badgeLabel(badge: ListItem["badge"]) {
  if (badge === "infosys") return { text: "Infosys", className: "pill pill-info" };
  if (badge === "bajaj") return { text: "Bajaj", className: "pill pill-info" };
  if (badge === "must-know") return { text: "Must know", className: "pill pill-warn" };
  return null;
}

function QuestionCard({
  item,
  open,
  onToggle,
}: {
  item: ListItem;
  open: boolean;
  onToggle: (open: boolean) => void;
}) {
  const badge = badgeLabel(item.badge);
  return (
    <details
      className="qa"
      open={open}
      onToggle={(event) => onToggle(event.currentTarget.open)}
    >
      <summary>
        <span className="q-num">{String(item.num).padStart(2, "0")}</span>
        <span className="q-title">
          <InlineMd text={item.title} />
          {badge ? <span className={badge.className}>{badge.text}</span> : null}
        </span>
      </summary>
      <div className="answer">
        {item.shortDef ? (
          <div className="def">
            <InlineMd text={item.shortDef} />
          </div>
        ) : null}
        {item.say ? (
          <div className="say">
            <InlineMd text={item.say} />
          </div>
        ) : null}
        {item.extra && item.extra.length > 0 ? <MdBlocks blocks={item.extra} /> : null}
        {item.followUp ? (
          <div className="tip">
            <strong>Follow-up:</strong> <InlineMd text={item.followUp} />
          </div>
        ) : null}
        {item.mistake ? (
          <div className="mistake">
            <strong>Common mistake:</strong> <InlineMd text={item.mistake} />
          </div>
        ) : null}
      </div>
    </details>
  );
}

export function NotesTopicList({
  sections,
  hero,
  profile,
  searchPlaceholder = "Search questions…",
}: {
  sections: ListSection[];
  hero?: ReactNode;
  profile?: ReactNode;
  searchPlaceholder?: string;
}) {
  const [term, setTerm] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const query = normalize(term);

  const visible = useMemo(() => {
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => !query || normalize(item.searchText).includes(query)),
      }))
      .filter((section) => section.items.length > 0);
  }, [query, sections]);

  const visibleCount = visible.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <>
      <header className="topbar">
        <input
          className="search"
          type="search"
          placeholder={searchPlaceholder}
          value={term}
          onChange={(event) => setTerm(event.target.value)}
        />
      </header>
      <main className="content">
        {hero}
        {profile}
        <div id="list">
          {visible.map((section) => (
            <section key={section.id} className="topic" id={section.id}>
              <div className="topic-head">
                <h2>{section.title}</h2>
                <span className="count">
                  {section.items.length} {section.items.length === 1 ? "item" : "items"}
                </span>
              </div>
              {section.items.map((item) => {
                const key = `${section.id}-${item.id}-${item.num}`;
                return (
                  <QuestionCard
                    key={key}
                    item={item}
                    open={openId === key}
                    onToggle={(isOpen) => {
                      if (isOpen) setOpenId(key);
                      else setOpenId((current) => (current === key ? null : current));
                    }}
                  />
                );
              })}
            </section>
          ))}
          {visibleCount === 0 ? <p className="empty">No questions match your search.</p> : null}
        </div>
      </main>
    </>
  );
}
