import type { Metadata } from "next";
import Link from "next/link";
import { JS_CONCEPTS } from "@/lib/notes/js-catalog";
import { getSnippetCount } from "@/lib/notes/load-notes";

export const metadata: Metadata = {
  title: "JS Concepts",
  description: "JavaScript concept cards from the content snippets",
};

export default function JsConceptsIndexPage() {
  return (
    <div className="hub-page">
      <p className="links" style={{ marginTop: 0, marginBottom: "1.25rem" }}>
        <Link href="/">← Hub</Link>
        <Link href="/notes/javascript">JavaScript Q&amp;A →</Link>
        <Link href="/notes/javascript/methods">JS Methods →</Link>
      </p>
      <h1 className="hub-brand">
        JS <span>Concepts</span>
      </h1>
      <p className="hub-lede">
        The old snippet folder, arranged as cards. Each topic is parsed from comments and examples —
        nothing here is executed.
      </p>
      <div className="cards">
        {JS_CONCEPTS.map((entry) => (
          <Link key={entry.slug} href={`/notes/javascript/concepts/${entry.slug}`} className="card">
            <strong>{entry.title}</strong>
            <span>{entry.description}</span>
            <span className="meta">{getSnippetCount(entry.files)} cards</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
