import type { Metadata } from "next";
import Link from "next/link";
import DemoPanel from "../_shared/DemoPanel";
import CodeMap from "../_shared/CodeMap";
import { REDUX_LEARN_EXAMPLES } from "@/lib/redux-learn-routes";
import PostsDemoRoot from "./_components/PostsDemoRoot";

const meta = REDUX_LEARN_EXAMPLES[2];

export const metadata: Metadata = {
  title: meta.title,
  description: meta.concepts.join(", "),
};

export default function Example3AsyncThunkPage() {
  return (
    <article>
      <p className="mb-4 text-sm">
        <Link href="/learn/redux" className="text-blue-600 hover:underline dark:text-blue-400">
          ← Redux track
        </Link>
      </p>
      <h1 className="mb-4 text-2xl font-bold">{meta.title}</h1>
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        Async API calls use <code>createAsyncThunk</code> and <code>extraReducers</code> for pending,
        fulfilled, and rejected. Same JSONPlaceholder API as the CSR demo.
      </p>
      <DemoPanel>
        <PostsDemoRoot />
      </DemoPanel>
      <CodeMap paths={meta.sourcePaths} />
    </article>
  );
}
