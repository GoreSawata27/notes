import type { Metadata } from "next";
import Link from "next/link";
import CsrFetchDemo from "./_components/CsrFetchDemo";

export const metadata: Metadata = {
  title: "CSR demo",
  description: "Client-side rendering — data after hydration",
};

export default function CsrDemoPage() {
  return (
    <article>
      <h1 className="mb-4 text-2xl font-bold">Client-side rendering (CSR)</h1>
      <p className="mb-2 text-zinc-600 dark:text-zinc-400">
        <strong>Interview:</strong> SEO poor · slow first load · data always fresh after fetch.
      </p>
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        The list below is empty in the initial HTML and loads in the browser via{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">useEffect</code>. View page source
        before hydration to compare with{" "}
        <Link href="/learn/ssr-demo" className="text-blue-600 underline">
          SSR
        </Link>
        .
      </p>
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <CsrFetchDemo />
      </div>
    </article>
  );
}
