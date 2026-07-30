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
      <h1 className="mb-2 text-2xl font-bold">Quick interview summary</h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Compare rendering modes, then open each demo. Notes:{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">content/notes/next/rendering/</code>
      </p>

      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="py-2 pr-4 font-semibold">Concept</th>
              <th className="py-2 pr-4 font-semibold">SEO</th>
              <th className="py-2 pr-4 font-semibold">Speed</th>
              <th className="py-2 pr-4 font-semibold">Data freshness</th>
              <th className="py-2 font-semibold">Demo</th>
            </tr>
          </thead>
          <tbody>
            {LEARN_CONCEPTS.map((row) => (
              <tr key={row.slug} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-2 pr-4 font-medium">{row.title}</td>
                <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">{row.seo}</td>
                <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">{row.speed}</td>
                <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">{row.freshness}</td>
                <td className="py-2">
                  <Link href={row.href} className="text-blue-600 hover:underline dark:text-blue-400">
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
        <ul className="flex flex-col gap-2">
          {LEARN_EXTRA.map(({ href, title, description }) => (
            <li key={href}>
              <Link href={href} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                {title}
              </Link>
              <span className="ml-2 text-sm text-zinc-500">— {description}</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
