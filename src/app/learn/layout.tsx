import Link from "next/link";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-6 flex flex-wrap gap-4 text-sm">
        <Link href="/" className="text-zinc-600 hover:underline dark:text-zinc-400">
          ← Home
        </Link>
        <Link href="/learn" className="text-zinc-600 hover:underline dark:text-zinc-400">
          Interview summary
        </Link>
      </div>
      {children}
    </div>
  );
}
