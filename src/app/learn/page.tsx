import type { Metadata } from "next";
import Link from "next/link";
import { LEARN_CONCEPTS, LEARN_EXTRA } from "@/lib/learn-routes";

export const metadata: Metadata = {
  title: "Rendering overview",
  description: "Interview cheat sheet for CSR, SSR, SSG, ISR, PPR, and Streaming",
};

export default function LearnIndexPage() {
  return (
    <article>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Quick interview summary</h1>
      <p className="mb-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Compare rendering modes, then open each demo. Full Q&amp;A:{" "}
        <Link href="/notes/nextjs" className="text-blue-600 underline dark:text-blue-400">
          Next.js interview notes
        </Link>
        .
      </p>

      <div className="mb-10 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900/70">
              <th className="w-[14%] px-4 py-3 font-semibold">Concept</th>
              <th className="w-[16%] px-3 py-3 font-semibold">SEO</th>
              <th className="w-[22%] px-3 py-3 font-semibold">Speed</th>
              <th className="w-[32%] px-3 py-3 font-semibold">Data freshness</th>
              <th className="w-[16%] px-4 py-3 font-semibold">Demo</th>
            </tr>
          </thead>
          <tbody>
            {LEARN_CONCEPTS.map((row) => (
              <tr key={row.slug} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-3 font-medium">{row.title}</td>
                <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">{row.seo}</td>
                <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">{row.speed}</td>
                <td className="px-3 py-3 break-words text-zinc-600 dark:text-zinc-400">{row.freshness}</td>
                <td className="px-4 py-3">
                  <Link
                    href={row.href}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Also in Learn</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {LEARN_EXTRA.map(({ href, title, description }) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              <strong className="block text-sm font-semibold">{title}</strong>
              <span className="mt-1 block text-sm text-zinc-500 dark:text-zinc-400">{description}</span>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
