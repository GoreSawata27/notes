import type { Metadata } from "next";
import Link from "next/link";
import { JS_METHODS } from "@/lib/notes/js-catalog";
import { getSnippetCount } from "@/lib/notes/load-notes";

export const metadata: Metadata = {
  title: "JS Methods",
  description: "Array, Object, and String method cheatsheets",
};

export default function JsMethodsIndexPage() {
  return (
    <div className="hub-page">
      <p className="links" style={{ marginTop: 0, marginBottom: "1.25rem" }}>
        <Link href="/">← Hub</Link>
        <Link href="/notes/learn/javascript">JavaScript learning →</Link>
        <Link href="/notes/javascript">JavaScript Q&amp;A →</Link>
        <Link href="/notes/javascript/concepts">JS Concepts →</Link>
      </p>
      <h1 className="hub-brand">
        JS <span>Methods</span>
      </h1>
      <p className="hub-lede">
        Legacy index — all method cards now live on the{" "}
        <Link href="/notes/learn/javascript">JavaScript learning page</Link>.
      </p>
      <div className="cards">
        {JS_METHODS.map((entry) => (
          <Link key={entry.slug} href={`/notes/javascript/methods/${entry.slug}`} className="card">
            <strong>{entry.title}</strong>
            <span>{entry.description}</span>
            <span className="meta">{getSnippetCount(entry.files)} methods</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
