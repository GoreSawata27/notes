import Link from "next/link";
import { PRACTICE_ROUTES } from "@/lib/practice-routes";

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <Link href="/" className="mb-4 block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          ← Home
        </Link>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Practice</h2>
        <nav className="flex flex-col gap-1">
          {PRACTICE_ROUTES.map(({ slug, label }) => (
            <Link
              key={slug}
              href={`/practice/${slug}`}
              className="rounded px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="practice-demo flex flex-1 items-center justify-center p-8">{children}</main>
    </div>
  );
}
