import Link from "next/link";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="hover:text-zinc-900 hover:underline dark:hover:text-zinc-200">
          ← Home
        </Link>
        <span aria-hidden className="text-zinc-400 dark:text-zinc-600">
          /
        </span>
        <Link href="/learn" className="hover:text-zinc-900 hover:underline dark:hover:text-zinc-200">
          Interview summary
        </Link>
      </nav>
      {children}
    </div>
  );
}
