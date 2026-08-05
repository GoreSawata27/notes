import type { Metadata } from "next";
import Link from "next/link";
import DemoPanel from "../_shared/DemoPanel";
import CodeMap from "../_shared/CodeMap";
import { REDUX_LEARN_EXAMPLES } from "@/lib/redux-learn-routes";
import RtkQueryDemoRoot from "./_components/RtkQueryDemoRoot";

const meta = REDUX_LEARN_EXAMPLES[4];

export const metadata: Metadata = {
  title: meta.title,
  description: meta.concepts.join(", "),
};

export default function Example5RtkQueryPage() {
  return (
    <article>
      <p className="mb-4 text-sm">
        <Link href="/learn/redux" className="text-blue-600 hover:underline dark:text-blue-400">
          ← Redux track
        </Link>
      </p>
      <h1 className="mb-4 text-2xl font-bold">{meta.title}</h1>
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        <code>createApi</code> + <code>fetchBaseQuery</code>: login mutation stores token in a small
        session slice; <code>getMe</code> query runs with the Bearer header. Compare with{" "}
        <Link href="/learn/redux/example-4-login" className="underline">
          Example 4
        </Link>{" "}
        manual thunk.
      </p>
      <DemoPanel>
        <RtkQueryDemoRoot />
      </DemoPanel>
      <CodeMap paths={meta.sourcePaths} />
    </article>
  );
}
