import type { Metadata } from "next";
import Link from "next/link";
import DemoPanel from "../_shared/DemoPanel";
import CodeMap from "../_shared/CodeMap";
import { REDUX_LEARN_EXAMPLES } from "@/lib/redux-learn-routes";
import CounterDemoRoot from "./_components/CounterDemoRoot";

const meta = REDUX_LEARN_EXAMPLES[0];

export const metadata: Metadata = {
  title: meta.title,
  description: meta.concepts.join(", "),
};

export default function Example1CounterPage() {
  return (
    <article>
      <p className="mb-4 text-sm">
        <Link href="/learn/redux" className="text-blue-600 hover:underline dark:text-blue-400">
          ← Redux track
        </Link>
      </p>
      <h1 className="mb-4 text-2xl font-bold">{meta.title}</h1>
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        One slice, one store: global state lives in the store; components subscribe with selectors and
        send events via dispatch. No async yet.
      </p>
      <DemoPanel>
        <CounterDemoRoot />
      </DemoPanel>
      <CodeMap paths={meta.sourcePaths} />
    </article>
  );
}
