type Props = {
  children: React.ReactNode;
};

export default function DemoPanel({ children }: Props) {
  return <div className="rounded-lg border border-border bg-surface-elevated p-4">{children}</div>;
}
