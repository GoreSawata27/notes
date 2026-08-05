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
      <h1 className="mb-2 text-2xl font-bold">Redux &amp; Redux Toolkit</h1>
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        Six isolated examples (easy → hard). Each route has its own{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">configureStore</code> — copy a
        folder for production patterns. Use the{" "}
        <a
          href="https://github.com/reduxjs/redux-devtools"
          className="text-blue-600 underline dark:text-blue-400"
          target="_blank"
          rel="noreferrer"
        >
          Redux DevTools
        </a>{" "}
        browser extension while clicking through demos.
      </p>

      <div className="mb-8 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="py-2 pr-4 font-semibold">Level</th>
              <th className="py-2 pr-4 font-semibold">Example</th>
              <th className="py-2 pr-4 font-semibold">Concepts</th>
              <th className="py-2 font-semibold">Open</th>
            </tr>
          </thead>
          <tbody>
            {REDUX_LEARN_EXAMPLES.map((row) => (
              <tr key={row.slug} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="py-2 pr-4 font-mono text-zinc-600 dark:text-zinc-400">{row.level}</td>
                <td className="py-2 pr-4 font-medium">{row.title}</td>
                <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">{row.concepts.join(", ")}</td>
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

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">How to study</h2>
        <ol className="list-inside list-decimal space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
          <li>Read the page intro, then open the listed source files on each example.</li>
          <li>
            Example 4 is the login interview walkthrough — compare with{" "}
            <Link href="/learn/redux/example-3-async-thunk" className="text-blue-600 underline">
              Example 3
            </Link>{" "}
            for generic async API patterns.
          </li>
          <li>
            Example 5 shows the same auth API with RTK Query instead of manual thunks.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Markdown notes (repo)</h2>
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          Notes live next to each example as <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">NOTES.md</code>.
        </p>
        <ul className="flex flex-col gap-2 text-sm">
          <li>
            <span className="font-medium">Track overview</span>
            <span className="ml-2 font-mono text-xs text-zinc-500">{REDUX_HUB_NOTES_PATH}</span>
          </li>
          {REDUX_LEARN_EXAMPLES.map(({ title, notesPath }) => (
            <li key={notesPath}>
              <span className="font-medium">{title}</span>
              <span className="ml-2 font-mono text-xs text-zinc-500">{notesPath}</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
