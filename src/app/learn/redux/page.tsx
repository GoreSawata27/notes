import type { Metadata } from "next";
import Link from "next/link";
import { REDUX_HUB_NOTES_PATH, REDUX_LEARN_EXAMPLES } from "@/lib/redux-learn-routes";

export const metadata: Metadata = {
  title: "Redux & RTK",
  description: "Progressive Redux Toolkit examples from counter to login and RTK Query",
};

export default function ReduxLearnHubPage() {
  return (
    <article>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Redux &amp; Redux Toolkit</h1>
      <p className="mb-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Six isolated examples (easy → hard). Each route has its own{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">configureStore</code> — copy a folder for
        production patterns. Use the{" "}
        <a
          href="https://github.com/reduxjs/redux-devtools"
          className="text-blue-600 underline dark:text-blue-400"
          target="_blank"
          rel="noreferrer"
        >
          Redux DevTools
        </a>{" "}
        browser extension while clicking through demos. Interview Q&amp;A:{" "}
        <Link href="/notes/redux" className="text-blue-600 underline dark:text-blue-400">
          Redux &amp; RTK notes
        </Link>
        .
      </p>

      <div className="mb-10 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900/70">
              <th className="w-[10%] px-4 py-3 font-semibold">Level</th>
              <th className="w-[28%] px-3 py-3 font-semibold">Example</th>
              <th className="w-[48%] px-3 py-3 font-semibold">Concepts</th>
              <th className="w-[14%] px-4 py-3 font-semibold">Open</th>
            </tr>
          </thead>
          <tbody>
            {REDUX_LEARN_EXAMPLES.map((row) => (
              <tr key={row.slug} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-400">{row.level}</td>
                <td className="px-3 py-3 font-medium">{row.title}</td>
                <td className="px-3 py-3 break-words text-zinc-600 dark:text-zinc-400">
                  {row.concepts.join(", ")}
                </td>
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

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">How to study</h2>
        <ol className="list-inside list-decimal space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
          <li>Read the page intro, then open the listed source files on each example.</li>
          <li>
            Example 4 is the login interview walkthrough — compare with{" "}
            <Link
              href="/learn/redux/example-3-async-thunk"
              className="text-blue-600 underline dark:text-blue-400"
            >
              Example 3
            </Link>{" "}
            for generic async API patterns.
          </li>
          <li>Example 5 shows the same auth API with RTK Query instead of manual thunks.</li>
        </ol>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Markdown notes (repo)</h2>
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          Notes live next to each example as{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">NOTES.md</code>.
        </p>
        <ul className="flex flex-col gap-2 text-sm">
          <li>
            <span className="font-medium">Track overview</span>
            <span className="ml-2 break-all font-mono text-xs text-zinc-500">{REDUX_HUB_NOTES_PATH}</span>
          </li>
          {REDUX_LEARN_EXAMPLES.map(({ title, notesPath }) => (
            <li key={notesPath}>
              <span className="font-medium">{title}</span>
              <span className="ml-2 break-all font-mono text-xs text-zinc-500">{notesPath}</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
