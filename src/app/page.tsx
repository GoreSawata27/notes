import type { Metadata } from "next";
import Link from "next/link";
import { PRACTICE_ROUTES } from "@/lib/practice-routes";
import { LEARN_CONCEPTS, LEARN_EXTRA } from "@/lib/learn-routes";
import { REDUX_LEARN_EXAMPLES } from "@/lib/redux-learn-routes";

export const metadata: Metadata = {
  title: {
    default: "Interview Notes",
    template: "%s | Interview Notes",
  },
  description: "Next.js and React interview practice",
};

const LEARN_LINKS = [
  { href: "/learn", label: "Rendering cheat sheet (all concepts)" },
  ...LEARN_CONCEPTS.map(({ href, title }) => ({ href, label: `${title} demo` })),
  ...LEARN_EXTRA.map(({ href, title }) => ({ href, label: title })),
  ...REDUX_LEARN_EXAMPLES.map(({ href, title }) => ({ href, label: title })),
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Interview Notes</h1>
      <p className="mb-10 text-zinc-600 dark:text-zinc-400">
        Machine-coding practice and Next.js learning demos in one app.
      </p>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold">Practice</h2>
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          {PRACTICE_ROUTES.length} exercises — pick one from the list or open the hub.
        </p>
        <Link
          href="/practice/nested-checkbox"
          className="inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Open practice hub
        </Link>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold">Learn (Next.js)</h2>
        <ul className="flex flex-col gap-2">
          {LEARN_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Markdown notes</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          See <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">content/notes/next/</code> and{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">src/app/learn/redux/**/NOTES.md</code>{" "}
          in the repo.
        </p>
      </section>
    </div>
  );
}
