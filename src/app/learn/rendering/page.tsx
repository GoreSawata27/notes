import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Static rendering",
  description: "Default App Router behavior: static at build time (SSG)",
};

export default function RenderingPage() {
  const builtAt = new Date().toISOString();

  return (
    <article>
      <h1 className="mb-4 text-2xl font-bold">Static rendering (SSG)</h1>
      <p className="mb-2 text-zinc-600 dark:text-zinc-400">
        <strong>Interview:</strong> SEO excellent · fastest · stale until rebuild.
      </p>
      <p className="mb-4 text-zinc-600 dark:text-zinc-400">
        This page is a Server Component with no dynamic APIs. Next.js pre-renders it at build time. Compare
        with{" "}
        <a href="/learn/ssr-demo" className="text-blue-600 underline">
          SSR demo
        </a>
        .
      </p>
      <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900">
        Build-time snapshot label (same until rebuild): <span className="font-semibold">{builtAt}</span>
      </p>
      <p className="mt-4 text-sm text-zinc-500">
        Notes: <code>content/notes/next/rendering/1_RenderingParadigms.md</code>
      </p>
    </article>
  );
}
