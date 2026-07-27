import Link from "next/link";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="mb-6 inline-block text-sm text-zinc-600 hover:underline dark:text-zinc-400">
        ← Home
      </Link>
      {children}
    </div>
  );
}
