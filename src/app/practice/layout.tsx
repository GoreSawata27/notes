import Link from "next/link";
import { PRACTICE_ROUTES } from "@/lib/practice-routes";

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-56 shrink-0 border-r border-border bg-surface-elevated p-4">
        <Link href="/" className="mb-4 block text-sm font-semibold text-foreground hover:underline">
          ← Home
        </Link>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Practice</h2>
        <nav className="flex flex-col gap-1">
          {PRACTICE_ROUTES.map(({ slug, label }) => (
            <Link
              key={slug}
              href={`/practice/${slug}`}
              className="rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="practice-demo flex flex-1 items-center justify-center bg-background p-8">{children}</main>
    </div>
  );
}
