import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotesShell } from "@/components/notes/NotesShell";
import { getMethod, JS_METHODS } from "@/lib/notes/js-catalog";
import { getSnippetPage } from "@/lib/notes/load-notes";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return JS_METHODS.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getMethod(slug);
  if (!entry) return { title: "JS Methods" };
  return { title: entry.title, description: entry.description };
}

export default async function JsMethodPage({ params }: Props) {
  const { slug } = await params;
  const entry = getMethod(slug);
  if (!entry) notFound();

  const page = getSnippetPage(entry.files, [entry.title]);
  const index = JS_METHODS.findIndex((item) => item.slug === slug);
  const next = JS_METHODS[(index + 1) % JS_METHODS.length];

  return (
    <NotesShell
      brand={entry.title}
      description={entry.description}
      pill="JS methods"
      countLabel={`${page.itemCount} methods`}
      sections={page.sections}
      nextHref={`/notes/javascript/methods/${next.slug}`}
      nextLabel={next.title}
      extraLinks={[
        { href: "/notes/javascript/methods", label: "All methods →" },
        { href: "/notes/learn/javascript", label: "JavaScript learning →" },
        { href: "/notes/javascript", label: "JavaScript Q&A →" },
      ]}
      searchPlaceholder="Search methods…"
    />
  );
}
