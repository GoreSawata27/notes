import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SSR demo",
  description: "Rendered on every request",
};

export default async function SsrDemoPage() {
  const res = await fetch("https://worldtimeapi.org/api/timezone/Etc/UTC", {
    cache: "no-store",
  });
  const data = (await res.json()) as { datetime: string; utc_datetime: string };

  return (
    <article>
      <h1 className="mb-4 text-2xl font-bold">Dynamic rendering (SSR)</h1>
      <p className="mb-4 text-zinc-600 dark:text-zinc-400">
        This route uses <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">force-dynamic</code> and{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
          fetch(..., {"{ cache: 'no-store' }"})
        </code>
        . Refresh to see a new server time.
      </p>
      <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900">
        UTC from API: <span className="font-semibold">{data.utc_datetime ?? data.datetime}</span>
      </p>
    </article>
  );
}
