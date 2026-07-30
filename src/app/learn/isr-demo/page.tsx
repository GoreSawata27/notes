import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ISR demo",
  description: "Revalidated static fetch every 60 seconds",
};

export default async function IsrDemoPage() {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos/1", {
    next: { revalidate: 60 },
  });
  const todo = (await res.json()) as { id: number; title: string; completed: boolean };

  return (
    <article>
      <h1 className="mb-4 text-2xl font-bold">Incremental Static Regeneration (ISR)</h1>
      <p className="mb-2 text-zinc-600 dark:text-zinc-400">
        <strong>Interview:</strong> SEO excellent · very fast · fresh after revalidation window.
      </p>
      <p className="mb-4 text-zinc-600 dark:text-zinc-400">
        Data is fetched with <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">revalidate: 60</code>
        . Cached HTML is served, then refreshed in the background after 60s.
      </p>
      <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900">
        Todo #{todo.id}: {todo.title} — {todo.completed ? "done" : "open"}
      </p>
    </article>
  );
}
