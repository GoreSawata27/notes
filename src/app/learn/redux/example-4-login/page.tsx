import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/theme/CodeBlock";
import DemoPanel from "../_shared/DemoPanel";
import CodeMap from "../_shared/CodeMap";
import { REDUX_LEARN_EXAMPLES } from "@/lib/redux-learn-routes";
import LoginDemoRoot from "./_components/LoginDemoRoot";

const meta = REDUX_LEARN_EXAMPLES[3];

export const metadata: Metadata = {
  title: meta.title,
  description: meta.concepts.join(", "),
};

const loginFlow = `User clicks Login
  → dispatch(login({ email, password }))
  → pending: status = loading
  → POST /learn/redux/api/mock-auth
  → fulfilled: user + token in store | rejected: error message`;

export default function Example4LoginPage() {
  return (
    <article>
      <p className="mb-4 text-sm">
        <Link href="/learn/redux" className="text-primary hover:underline">
          ← Redux track
        </Link>
      </p>
      <h1 className="mb-4 text-2xl font-bold">{meta.title}</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Interview classic: when the user clicks Login, the form dispatches the <code>login</code> async thunk.
        Pending shows loading; fulfilled stores user + token; rejected shows API error. Components subscribed
        to <code>state.auth</code> re-render at each step.
      </p>

      <CodeBlock code={loginFlow} lang="text" />

      <DemoPanel>
        <LoginDemoRoot />
      </DemoPanel>
      <CodeMap paths={meta.sourcePaths} />
    </article>
  );
}
