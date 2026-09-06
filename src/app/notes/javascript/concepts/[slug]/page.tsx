import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotesShell } from "@/components/notes/NotesShell";
import { getConcept, JS_CONCEPTS } from "@/lib/notes/js-catalog";
import { getSnippetPage } from "@/lib/notes/load-notes";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return JS_CONCEPTS.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getConcept(slug);
  if (!entry) return { title: "JS Concept" };
  return { title: entry.title, description: entry.description };
}

export default async function JsConceptPage({ params }: Props) {
  const { slug } = await params;
  const entry = getConcept(slug);
  if (!entry) notFound();

  const page = getSnippetPage(entry.files, entry.sectionTitles ?? [entry.title]);
  const index = JS_CONCEPTS.findIndex((item) => item.slug === slug);
  const next = JS_CONCEPTS[(index + 1) % JS_CONCEPTS.length];

  return (
    <NotesShell
      brand={entry.title}
      description={entry.description}
      pill="JS concept"
      countLabel={`${page.itemCount} cards`}
      sections={page.sections}
      nextHref={`/notes/javascript/concepts/${next.slug}`}
      nextLabel={next.title}
      extraLinks={[
        { href: "/notes/javascript/concepts", label: "All concepts →" },
        { href: "/notes/javascript", label: "JavaScript Q&A →" },
      ]}
      searchPlaceholder="Search cards…"
    />
  );
}
