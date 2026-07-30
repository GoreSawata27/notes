import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import DynamicIsland from "./_components/DynamicIsland";

export const metadata: Metadata = {
  title: "PPR demo",
  description: "Static shell with dynamic streamed sections (PPR pattern)",
};

const shellBuiltAt = "Static shell — same for all users until rebuild";

function DynamicFallback() {
  return <p className="animate-pulse text-sm text-zinc-500">Dynamic hole streaming…</p>;
}

export default function PprDemoPage() {
  return (
    <article>
      <h1 className="mb-4 text-2xl font-bold">Partial Prerendering (PPR)</h1>
      <p className="mb-2 text-zinc-600 dark:text-zinc-400">
        <strong>Interview:</strong> SEO excellent · very fast · static shell + dynamic/streamed parts.
      </p>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        PPR serves a <strong>prebuilt static shell</strong> immediately and fills{" "}
        <strong>dynamic holes</strong> on the server (often via Suspense). This demo mirrors that pattern;
        enable <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">experimental.ppr</code> in{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">next.config</code> when your Next
        version supports it for production PPR. Compare{" "}
        <Link href="/learn/streaming-demo" className="text-blue-600 underline">
          Streaming
        </Link>
        .
      </p>

      <div className="rounded-lg border-2 border-zinc-300 p-4 dark:border-zinc-600">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Static shell</p>
        <p className="mb-4 text-sm">{shellBuiltAt}</p>
        <nav className="mb-4 flex gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          <span>Home</span>
          <span>Docs</span>
          <span>Pricing</span>
        </nav>
        <div className="rounded-lg border border-dashed border-amber-500/60 bg-amber-50/50 p-4 dark:bg-amber-950/20">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            Dynamic hole
          </p>
          <Suspense fallback={<DynamicFallback />}>
            <DynamicIsland />
          </Suspense>
        </div>
      </div>
    </article>
  );
}
