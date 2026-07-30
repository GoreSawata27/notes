import type { Metadata } from "next";
import { Suspense } from "react";
import { FastSection, SlowSection } from "./_components/StreamingSections";

export const metadata: Metadata = {
  title: "Streaming demo",
  description: "Suspense and incremental HTML streaming",
};

function SectionFallback({ label }: { label: string }) {
  return <p className="animate-pulse text-sm text-zinc-500">{label} streaming…</p>;
}

export default function StreamingDemoPage() {
  return (
    <article>
      <h1 className="mb-4 text-2xl font-bold">Streaming</h1>
      <p className="mb-2 text-zinc-600 dark:text-zinc-400">
        <strong>Interview:</strong> SEO excellent · better perceived speed · freshness depends on each
        section&apos;s data source.
      </p>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        This shell renders immediately. Each{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">Suspense</code> boundary can stream
        in when its async Server Component resolves (React 19 / Next.js App Router).
      </p>

      <div className="flex flex-col gap-4">
        <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
          <h2 className="mb-2 font-semibold">Static shell</h2>
          <p className="text-sm">Visible on first byte — no waiting for slow data.</p>
        </section>

        <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
          <h2 className="mb-2 font-semibold">Fast block (~300ms)</h2>
          <Suspense fallback={<SectionFallback label="Fast block" />}>
            <FastSection />
          </Suspense>
        </section>

        <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
          <h2 className="mb-2 font-semibold">Slow block (~2.5s)</h2>
          <Suspense fallback={<SectionFallback label="Slow block" />}>
            <SlowSection />
          </Suspense>
        </section>
      </div>
    </article>
  );
}
