type Props = {
  paths: string[];
};

export default function CodeMap({ paths }: Props) {
  return (
    <section className="mt-8">
      <h2 className="mb-2 text-lg font-semibold">Files to read</h2>
      <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
        Open these in the repo — each example is isolated in its own folder.
      </p>
      <ul className="flex flex-col gap-1 font-mono text-xs text-zinc-700 dark:text-zinc-300">
        {paths.map((path) => (
          <li key={path} className="rounded bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
            {path}
          </li>
        ))}
      </ul>
    </section>
  );
}
