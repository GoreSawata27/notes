import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Metadata demo",
  },
  description: "Examples aligned with content/notes/next/Metadata.md",
  openGraph: {
    title: "Interview Notes — Metadata demo",
    description: "Open Graph example for link previews",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Metadata demo",
    description: "Twitter card example",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function MetadataDemoPage() {
  return (
    <article>
      <h1 className="mb-4 text-2xl font-bold">Metadata API</h1>
      <p className="mb-4 text-zinc-600 dark:text-zinc-400">
        This page exports static <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">metadata</code>{" "}
        including an absolute title (skips the root template), Open Graph, Twitter, and robots.
      </p>
      <ul className="list-inside list-disc text-sm text-zinc-600 dark:text-zinc-400">
        <li>View page source to inspect generated tags</li>
        <li>Child routes under Practice use titled metadata with the root template</li>
        <li>
          For dynamic routes, use <code>generateMetadata</code> (see your notes)
        </li>
      </ul>
    </article>
  );
}
