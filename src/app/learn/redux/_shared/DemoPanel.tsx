type Props = {
  children: React.ReactNode;
};

export default function DemoPanel({ children }: Props) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
      {children}
    </div>
  );
}
