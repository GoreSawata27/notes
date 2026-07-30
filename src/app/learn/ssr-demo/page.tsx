import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SSR demo",
  description: "Rendered on every request",
};

type Todo = { id: number; title: string; completed: boolean };

export default async function SsrDemoPage() {
  const renderedAt = new Date().toISOString();

  let fetchNote = "Live API data (fetch with cache: no-store)";
  let todo: Todo | null = null;

  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/todos/1", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(res.statusText);
    todo = (await res.json()) as Todo;
  } catch {
    fetchNote = "API unavailable — showing server time only (SSR still runs on each request)";
  }

  return (
    <article>
      <h1 className="mb-4 text-2xl font-bold">Dynamic rendering (SSR)</h1>
      <p className="mb-2 text-zinc-600 dark:text-zinc-400">
        <strong>Interview:</strong> SEO excellent · medium speed · always fresh.
      </p>
      <p className="mb-4 text-zinc-600 dark:text-zinc-400">
        This route uses <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">force-dynamic</code> and{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
          fetch(..., {"{ cache: 'no-store' }"})
        </code>
        . Refresh to see a new server time.
      </p>
      <p className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900">
        Server rendered at (UTC): <span className="font-semibold">{renderedAt}</span>
      </p>
      {todo ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900">
          {fetchNote}: #{todo.id} — {todo.title}
        </p>
      ) : (
        <p className="text-sm text-zinc-500">{fetchNote}</p>
      )}
    </article>
  );
}
