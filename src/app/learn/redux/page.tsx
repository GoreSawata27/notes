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
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        Six isolated examples (easy → hard). Each route has its own <code>configureStore</code> — copy a folder for
        production patterns. Use the{" "}
        <a
          href="https://github.com/reduxjs/redux-devtools"
          className="text-primary underline"
          target="_blank"
          rel="noreferrer"
        >
          Redux DevTools
        </a>{" "}
        browser extension while clicking through demos. Interview Q&amp;A:{" "}
        <Link href="/notes/redux" className="text-primary underline">
          Redux &amp; RTK notes
        </Link>
        .
      </p>

      <div className="mb-10 overflow-x-auto rounded-xl border border-border">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <thead>
            <tr className="bg-surface-elevated">
              <th className="w-[10%] px-4 py-3 font-semibold">Level</th>
              <th className="w-[28%] px-3 py-3 font-semibold">Example</th>
              <th className="w-[48%] px-3 py-3 font-semibold">Concepts</th>
              <th className="w-[14%] px-4 py-3 font-semibold">Open</th>
            </tr>
          </thead>
          <tbody>
            {REDUX_LEARN_EXAMPLES.map((row) => (
              <tr key={row.slug} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-muted-foreground">{row.level}</td>
                <td className="px-3 py-3 font-medium">{row.title}</td>
                <td className="px-3 py-3 break-words text-muted-foreground">{row.concepts.join(", ")}</td>
                <td className="px-4 py-3">
                  <Link href={row.href} className="font-medium text-primary hover:underline">
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
        <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
          <li>Read the page intro, then open the listed source files on each example.</li>
          <li>
            Example 4 is the login interview walkthrough — compare with{" "}
            <Link href="/learn/redux/example-3-async-thunk" className="text-primary underline">
              Example 3
            </Link>{" "}
            for generic async API patterns.
          </li>
          <li>Example 5 shows the same auth API with RTK Query instead of manual thunks.</li>
        </ol>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Markdown notes (repo)</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Notes live next to each example as <code>NOTES.md</code>.
        </p>
        <ul className="flex flex-col gap-2 text-sm">
          <li>
            <span className="font-medium">Track overview</span>
            <span className="ml-2 break-all font-mono text-xs text-muted-foreground">{REDUX_HUB_NOTES_PATH}</span>
          </li>
          {REDUX_LEARN_EXAMPLES.map(({ title, notesPath }) => (
            <li key={notesPath}>
              <span className="font-medium">{title}</span>
              <span className="ml-2 break-all font-mono text-xs text-muted-foreground">{notesPath}</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
