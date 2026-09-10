type Props = {
  paths: string[];
};

export default function CodeMap({ paths }: Props) {
  return (
    <section className="mt-8">
      <h2 className="mb-2 text-lg font-semibold">Files to read</h2>
      <p className="mb-3 text-sm text-muted-foreground">
        Open these in the repo — each example is isolated in its own folder.
      </p>
      <ul className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
        {paths.map((path) => (
          <li key={path} className="rounded border border-code-border bg-code-bg px-2 py-1">
            {path}
          </li>
        ))}
      </ul>
    </section>
  );
}
