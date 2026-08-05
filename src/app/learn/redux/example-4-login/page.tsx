import type { Metadata } from "next";
import Link from "next/link";
import DemoPanel from "../_shared/DemoPanel";
import CodeMap from "../_shared/CodeMap";
import { REDUX_LEARN_EXAMPLES } from "@/lib/redux-learn-routes";
import LoginDemoRoot from "./_components/LoginDemoRoot";

const meta = REDUX_LEARN_EXAMPLES[3];

export const metadata: Metadata = {
  title: meta.title,
  description: meta.concepts.join(", "),
};

export default function Example4LoginPage() {
  return (
    <article>
      <p className="mb-4 text-sm">
        <Link href="/learn/redux" className="text-blue-600 hover:underline dark:text-blue-400">
          ← Redux track
        </Link>
      </p>
      <h1 className="mb-4 text-2xl font-bold">{meta.title}</h1>
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
        Interview classic: when the user clicks Login, the form dispatches the{" "}
        <code>login</code> async thunk. Pending shows loading; fulfilled stores user + token; rejected
        shows API error. Components subscribed to <code>state.auth</code> re-render at each step.
      </p>

      <pre className="mb-4 overflow-x-auto rounded bg-zinc-100 p-3 text-xs dark:bg-zinc-800">
        {`User clicks Login
  → dispatch(login({ email, password }))
  → pending: status = loading
  → POST /learn/redux/api/mock-auth
  → fulfilled: user + token in store | rejected: error message`}
      </pre>

      <DemoPanel>
        <LoginDemoRoot />
      </DemoPanel>
      <CodeMap paths={meta.sourcePaths} />
    </article>
  );
}
