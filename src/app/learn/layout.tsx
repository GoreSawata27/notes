import Link from "next/link";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 app-content text-foreground">
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground hover:underline">
          ← Home
        </Link>
        <span aria-hidden className="text-border">
          /
        </span>
        <Link href="/learn" className="hover:text-foreground hover:underline">
          Interview summary
        </Link>
      </nav>
      {children}
    </div>
  );
}
