# Next.js Learning Notes

A progressive, hands-on guide to the **Next.js App Router** — from file conventions and React Server Components to rendering modes, Server Actions, metadata, auth, and deployment. Each lesson builds on the last. Read the takeaway first, study the explanation and code, then try the exercise in a small Next.js project (`npx create-next-app@latest`).

---

## App Router file conventions

### Lesson 1. The `app/` directory and route segments

**Takeaway:** In the App Router, folders inside `app/` define URL segments. A `page.tsx` file makes a route publicly accessible; folders without `page.tsx` are layout-only segments that organize code but do not create a URL.

**Explain:** Next.js maps the filesystem to URLs. The folder `app/blog/page.tsx` serves `/blog`. Nested folders create nested paths: `app/blog/post/page.tsx` → `/blog/post`. Special files (`layout.tsx`, `loading.tsx`, etc.) colocate with routes but are not URL segments themselves.

| Type               | Folder                   | Matches        |
| ------------------ | ------------------------ | -------------- |
| Route              | `app/blog/page.tsx`      | `/blog`        |
| Nested             | `app/blog/post/page.tsx` | `/blog/post`   |
| Dynamic            | `[id]`                   | `/blog/1`      |
| Nested Dynamic     | `[user]/[post]`          | `/john/10`     |
| Catch-All          | `[...slug]`              | `/a/b/c`       |
| Optional Catch-All | `[[...slug]]`            | `/` and `/a/b` |

```tsx
// app/page.tsx          → /
// app/about/page.tsx    → /about
// app/blog/page.tsx     → /blog

// app/blog/page.tsx
export default function BlogPage() {
  return <h1>Blog</h1>;
}
```

The root layout at `app/layout.tsx` wraps every page. It must include `<html>` and `<body>` tags. Route segments can share nested layouts — for example, `app/dashboard/layout.tsx` wraps all `/dashboard/*` pages without affecting `/blog`.

**Tip:** Keep route folders shallow and name them after the URL you want. Use `(groupName)` folders (route groups) when you need organization or shared layouts without adding a URL segment — covered in Lesson 4.

**Try it:** Create `app/about/page.tsx` and `app/about/team/page.tsx`. Run `npm run dev`, visit both URLs, and confirm the folder structure matches the path bar.

---

### Lesson 2. `page.tsx`, `layout.tsx`, and `template.tsx`

**Takeaway:** `page.tsx` is the unique UI for a route. `layout.tsx` wraps pages and **persists** across navigations (state in layouts survives client-side route changes). `template.tsx` is like a layout but **remounts** on every navigation, resetting its internal state.

**Explain:** Layouts are ideal for chrome that should stay stable — navbars, sidebars, providers that must not re-initialize. Templates re-create their subtree when the URL changes, which is useful for enter/exit animations or forcing fresh state per page.

```tsx
// app/layout.tsx — root layout (required)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>My App</nav>
        {children}
      </body>
    </html>
  );
}

// app/dashboard/layout.tsx — nested layout
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-shell">
      <aside>Sidebar</aside>
      <main>{children}</main>
    </div>
  );
}

// app/dashboard/template.tsx — remounts on navigation
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return <div className="fade-in">{children}</div>;
}
```

Layouts receive `children` and can also receive `params` and parallel route slots (`@modal`, etc.). Only one `page.tsx` per route segment; you can have nested layouts at each level.

**Tip:** Default to `layout.tsx`. Reach for `template.tsx` only when you explicitly need remounting behavior — it adds a client-side remount cost on every navigation within that segment.

**Try it:** Add a `useState` counter to a dashboard layout and a dashboard template. Navigate between two dashboard pages and observe which counter resets.

---

### Lesson 3. `loading.tsx`, `error.tsx`, and `not-found.tsx`

**Takeaway:** Colocated special files give you built-in UX for async boundaries and failures. `loading.tsx` wraps the route in `<Suspense>`. `error.tsx` catches runtime errors in that segment. `not-found.tsx` renders when you call `notFound()`.

**Explain:** These files keep concerns local — you do not manually wrap every page in Suspense or error boundaries unless you need finer control.

```tsx
// app/blog/loading.tsx
export default function Loading() {
  return <p className="skeleton">Loading posts…</p>;
}

// app/blog/error.tsx — must be a Client Component
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}

// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return <Article post={post} />;
}

// app/blog/[slug]/not-found.tsx
export default function NotFound() {
  return <h2>Post not found</h2>;
}
```

`error.tsx` creates a React error boundary for its segment and below. It does not catch errors thrown in the same segment's `layout.tsx` — place a parent `error.tsx` higher if needed. `loading.tsx` shows instantly while Server Component data fetching completes.

**Tip:** Pair `loading.tsx` with streaming (Lesson 17) for fast perceived performance. Use `notFound()` instead of rendering empty states when a resource truly does not exist — it sets the correct HTTP 404 status.

**Try it:** Add artificial delay to a page fetch, create `loading.tsx`, and confirm the skeleton appears before content. Then throw an error and verify `error.tsx` renders with a working reset button.

---

### Lesson 4. Dynamic routes, catch-all segments, and route groups

**Takeaway:** Bracket folders create dynamic params. `[...slug]` matches one or more segments; `[[...slug]]` also matches zero segments. Parentheses `(name)` group routes without affecting the URL — useful for multiple layouts or organizing code.

**Explain:** Dynamic segments arrive as `params` on pages, layouts, and route handlers. In Next.js 15+, `params` is a Promise and should be awaited.

```tsx
// app/products/[id]/page.tsx
type Props = { params: Promise<{ id: string }> };

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  return <Product id={id} />;
}

// app/docs/[...slug]/page.tsx  →  /docs/a, /docs/a/b
export default async function DocsPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return <Doc path={slug.join("/")} />;
}

// app/(marketing)/about/page.tsx  →  /about  (not /marketing/about)
// app/(shop)/products/page.tsx    →  /products
```

Route groups let you apply different root layouts — e.g., `(marketing)/layout.tsx` with a public navbar vs `(app)/layout.tsx` with an authenticated shell — while keeping clean URLs.

```tsx
// app/(marketing)/layout.tsx
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingNav />
      {children}
    </>
  );
}
```

**Tip:** Use optional catch-all `[[...slug]]` for CMS-driven pages where the root path should also resolve (e.g., `/docs` and `/docs/getting-started`).

**Try it:** Build `app/shop/[category]/[product]/page.tsx`, log `params`, and visit `/shop/shoes/air-max`. Add a `(admin)` group with its own layout and confirm the URL has no `(admin)` segment.

---

## Server vs Client Components

### Lesson 5. Server Components are the default

**Takeaway:** Every component in the App Router is a **React Server Component (RSC)** unless marked with `"use client"`. Server Components run on the server, can be `async`, access databases directly, and send zero JavaScript for their own logic to the browser.

**Explain:** Server Components render to a special payload (RSC stream) that the client stitches into the DOM. They cannot use hooks, browser APIs, or event handlers. This is intentional — they are for data fetching and non-interactive UI.

```tsx
// app/users/page.tsx — Server Component (default)
import { db } from "@/lib/db";

export default async function UsersPage() {
  const users = await db.user.findMany();
  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

Benefits: secrets stay on the server, bundle size stays smaller, and data fetching happens close to the source. The default static rendering model (SSG) works naturally with async Server Components.

**Tip:** Start every new file as a Server Component. Only add `"use client"` when you hit a hard limitation (state, effects, events, browser-only APIs).

**Try it:** Fetch data with `fetch()` directly inside a page component (no `useEffect`). Inspect the Network tab — the HTML arrives with content, and no client fetch runs for that data.

---

### Lesson 6. When and how to use `"use client"`

**Takeaway:** Add `"use client"` at the top of a file when the component needs React state, effects, event handlers, or browser APIs. The directive creates a client/server boundary — that file and its imports become part of the client bundle.

**Explain:** Client Components still render on the server initially (for SSR), then **hydrate** in the browser to become interactive. Once a file is `"use client"`, every component it imports (that is not already a client boundary) ships to the client.

```tsx
// components/Counter.tsx
"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Count: {count}
    </button>
  );
}

// app/page.tsx — Server Component importing Client Component
import { Counter } from "@/components/Counter";

export default function HomePage() {
  return (
    <main>
      <h1>Welcome</h1>
      <Counter />
    </main>
  );
}
```

Common client-only needs: forms with controlled inputs, modals, charts, `localStorage`, `window`, third-party widgets that touch the DOM.

**Tip:** Keep `"use client"` files small — "leaf" components at the bottom of the tree. Fetch data in Server Components and pass it down as props to minimize client JavaScript.

**Try it:** Build a theme toggle with `useState` in a Client Component. Import it into a Server Component page and confirm the page itself stays a Server Component (no `"use client"` on the page).

---

### Lesson 7. Composition — Server Components as children of Client Components

**Takeaway:** You cannot import a Server Component into a Client Component file, but you **can** pass Server Components as `children` or props from a Server parent. This preserves the server/client boundary while enabling flexible UI composition.

**Explain:** The Client Component renders a "slot"; the Server Component is rendered on the server and passed in as serialized output. This pattern is how you combine interactivity with server-fetched content.

```tsx
// components/Modal.tsx
"use client";

import { useState, type ReactNode } from "react";

export function Modal({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      {open && <dialog open>{children}</dialog>}
    </>
  );
}

// app/page.tsx — Server Component
import { Modal } from "@/components/Modal";
import { ServerData } from "@/components/ServerData";

export default async function Page() {
  return (
    <Modal trigger={<button>Open</button>}>
      <ServerData /> {/* rendered on server, passed as children */}
    </Modal>
  );
}
```

Avoid passing non-serializable props (functions, class instances) from Server to Client Components — only plain objects, arrays, strings, numbers, and JSX elements work across the boundary.

**Tip:** Think "client shell, server content." Wrap interactive shells on the client; stream or render heavy content on the server and slot it in.

**Try it:** Create a Client `Tabs` component that accepts `{ tab1, tab2 }` as `ReactNode` props. Pass two Server Components as tab panels from a page.

---

### Lesson 8. Sharing logic — what crosses the server/client boundary

**Takeaway:** Server code can import server-only modules (`db`, `fs`, secret env vars). Client code cannot. Shared utilities must be safe for both sides — or split into `server-only` / client-specific files.

**Explain:** Next.js provides packages to enforce boundaries at build time:

```tsx
// lib/data.server.ts
import "server-only";
import { db } from "@/lib/db";

export async function getPosts() {
  return db.post.findMany();
}

// lib/format.ts — safe on both sides
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}
```

Hooks like `usePathname`, `useRouter`, and `useSearchParams` require `"use client"`. For URL state in Server Components, read `searchParams` from page props instead.

```tsx
// app/search/page.tsx
type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const results = q ? await search(q) : [];
  return <Results query={q} items={results} />;
}
```

Context providers (`createContext`) must live in Client Components because context is a client feature — wrap the provider high in the tree from a small client file.

**Tip:** Install the `server-only` package and add `import "server-only"` to any module that must never reach the browser bundle. Accidental client imports will fail the build.

**Try it:** Create a `lib/secrets.server.ts` with `import "server-only"` and attempt to import it from a Client Component — confirm the build error and fix by passing data through props instead.

---

## Data fetching & caching

### Lesson 9. `fetch()` in Server Components and default caching

**Takeaway:** In the App Router, `fetch()` inside Server Components participates in Next.js Data Cache. The default is **`cache: 'force-cache'`** (static) — identical requests are deduplicated and cached across renders and requests unless you opt out.

**Explain:** This replaces much of the Pages Router `getStaticProps` / `getServerSideProps` split with fetch options and route segment config.

```tsx
// app/blog/page.tsx — cached (SSG behavior by default)
export default async function BlogPage() {
  const posts = await fetch("https://api.example.com/posts", {
    cache: "force-cache", // default; explicit for clarity
  }).then((res) => res.json());

  return <PostList posts={posts} />;
}

// Always fresh — SSR behavior
export default async function LiveFeed() {
  const items = await fetch("https://api.example.com/feed", {
    cache: "no-store",
  }).then((res) => res.json());

  return <Feed items={items} />;
}
```

React also deduplicates identical `fetch` calls in the same render pass — calling the same URL in a layout and page does not double the network request.

**Tip:** Use `next: { revalidate: 60 }` on individual fetches for per-request ISR without a route-level `revalidate` export (Lesson 10).

**Try it:** Fetch the same API URL in both a layout and a page. Add logging on the API side (or use a public echo service) and confirm only one request fires per render.

---

### Lesson 10. Time-based revalidation with `revalidate`

**Takeaway:** Export `revalidate = N` (seconds) on a page, layout, or route handler to enable **ISR** — serve cached static HTML, then regenerate in the background after the interval. Per-fetch `next: { revalidate: N }` offers finer control.

**Explain:** ISR combines SSG speed with controlled freshness. The first visitor after the window triggers background regeneration; others keep seeing the cached version until the new page is ready.

```tsx
// app/products/page.tsx
export const revalidate = 3600; // ISR: refresh at most every hour

export default async function ProductsPage() {
  const products = await fetch("https://api.example.com/products").then((r) => r.json());
  return <ProductGrid products={products} />;
}

// Per-fetch revalidation
const res = await fetch("https://api.example.com/products/1", {
  next: { revalidate: 300 },
});
```

| Setting             | Behavior                              |
| ------------------- | ------------------------------------- |
| `revalidate = false`| Cache forever (SSG)                   |
| `revalidate = 0`    | No cache (SSR)                        |
| `revalidate = N`    | ISR — stale-while-revalidate every N s |

**Tip:** `revalidate` works with SSG/ISR. It cannot combine with `dynamic = "force-dynamic"` — pick one strategy per route.

**Try it:** Set `export const revalidate = 10` on a page, build and start production mode (`next build && next start`), change API data, and observe the page updating without a full rebuild.

---

### Lesson 11. Tag-based revalidation and `unstable_cache`

**Takeaway:** Tag fetches with `next: { tags: ['posts'] }`, then call `revalidateTag('posts')` or `revalidatePath('/blog')` from Server Actions or Route Handlers to invalidate cached data on demand — ideal for CMS webhooks and mutations.

**Explain:** `unstable_cache` wraps non-fetch async work (database queries, file reads) in the same Data Cache layer.

```tsx
// lib/posts.ts
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export const getPosts = unstable_cache(
  async () => db.post.findMany(),
  ["posts-list"],
  { revalidate: 3600, tags: ["posts"] }
);

// app/blog/page.tsx
export default async function BlogPage() {
  const posts = await fetch("https://api.example.com/posts", {
    next: { tags: ["posts"] },
  }).then((r) => r.json());
  return <PostList posts={posts} />;
}

// app/api/revalidate/route.ts
import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ message: "Invalid" }, { status: 401 });
  }
  revalidateTag("posts");
  return Response.json({ revalidated: true });
}
```

On-demand revalidation beats short time windows when updates are event-driven (publish button, Stripe webhook).

**Tip:** Use consistent tag names as constants (`export const TAGS = { posts: 'posts' }`) to avoid typos between fetch sites and invalidation calls.

**Try it:** Tag a fetch, create a Route Handler that calls `revalidateTag`, hit it after changing data, and confirm the page reflects the update without redeploying.

---

### Lesson 12. Route segment config — `dynamic`, `fetchCache`, and runtime

**Takeaway:** Segment exports override defaults for an entire route subtree. `dynamic = 'force-dynamic'` forces SSR; `force-static` forces SSG; `error` fails the build if dynamic APIs appear. These interact with fetch caching — know the table.

**Explain:**

```tsx
// app/orders/[id]/page.tsx — always SSR
export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await fetch(`https://api.example.com/orders/${id}`, {
    cache: "no-store",
  }).then((r) => r.json());
  return <Order order={order} />;
}

// app/docs/page.tsx — strict static; build fails if cookies()/headers() used
export const dynamic = "error";

// app/blog/page.tsx — pure SSG
export const dynamic = "force-static";
```

| Setting             | Rules                            |
| ------------------- | -------------------------------- |
| `revalidate`        | Works with SSG and ISR           |
| `force-dynamic`     | Cannot be used with `revalidate` |
| `force-static`      | Can be used with `revalidate`    |
| `dynamic = "error"` | No dynamic APIs allowed          |

Using `cookies()`, `headers()`, or `searchParams` (in some cases) automatically opts the route into dynamic rendering unless you explicitly force static behavior.

**Tip:** Prefer fetch-level `cache` and `next.revalidate` for granular control; use segment-level `dynamic` when the entire route's nature is fixed (e.g., every admin page is dynamic).

**Try it:** Add `cookies()` to a static page and observe Next.js switch to dynamic rendering in dev logs. Then add `export const dynamic = "error"` and confirm the build fails with a clear message.

---

## Rendering modes — CSR, SSR, SSG, ISR, PPR, and streaming

### Lesson 13. Static Site Generation (SSG) — the App Router default

**Takeaway:** SSG renders HTML **at build time** and serves it from the CDN. In the App Router, routes are static by default when they use only cached fetches and no dynamic APIs — very fast, excellent SEO, same HTML for every user.

**Explain:**

| Paradigm | When HTML is Generated | Speed          | SEO       |
| -------- | ---------------------- | -------------- | --------- |
| SSG      | Build time             | Very fast      | Excellent |

```tsx
// app/blog/page.tsx — SSG (default)
export default async function BlogPage() {
  const posts = await fetch("https://api.example.com/posts", {
    cache: "force-cache",
  }).then((res) => res.json());

  return <PostList posts={posts} />;
}

// Dynamic routes — pre-render known paths at build time
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetch("https://api.example.com/posts").then((r) => r.json());
  return posts.map((p: { slug: string }) => ({ slug: p.slug }));
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetch(`https://api.example.com/posts/${slug}`, {
    cache: "force-cache",
  }).then((r) => r.json());
  return <Article post={post} />;
}
```

**Used when:** marketing pages, docs, blogs, public content that does not vary per user.

**Tip:** Run `next build` and inspect the output — static routes show as `○` (static) in the build table.

**Try it:** Build a blog index and `[slug]` page with `generateStaticParams`. After `next build`, verify HTML files exist in `.next/server/app` for each slug.

---

### Lesson 14. Server-Side Rendering (SSR) — fresh data every request

**Takeaway:** SSR generates HTML **on every request** on the server. Use it for authenticated, personalized, or real-time pages where cached HTML would be wrong or stale.

**Explain:**

| Paradigm | When HTML is Generated | Speed  | SEO       |
| -------- | ---------------------- | ------ | --------- |
| SSR      | Request time           | Medium | Excellent |

SSR is triggered when you use dynamic APIs or opt out of caching:

```tsx
// app/dashboard/page.tsx
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";

export default async function DashboardPage() {
  const session = (await cookies()).get("session")?.value;
  const data = await fetch("https://api.example.com/me", {
    headers: { Cookie: `session=${session}` },
    cache: "no-store",
  }).then((r) => r.json());

  return <Dashboard user={data} />;
}
```

Automatic dynamic triggers: `cookies()`, `headers()`, `searchParams` on pages, and `fetch(..., { cache: 'no-store' })`.

**Tip:** SSR is slower and cannot be globally CDN-cached — use it only where personalization or freshness demands it; keep static everything else.

**Try it:** Build the same page with and without `cache: 'no-store'`. Compare `next build` output (`○` static vs `ƒ` dynamic) and measure response times in production mode.

---

### Lesson 15. Incremental Static Regeneration (ISR)

**Takeaway:** ISR serves **cached static HTML** first, then regenerates the page in the background after a revalidation interval — combining SSG performance with periodic freshness without redeploying.

**Explain:**

| Paradigm | When HTML is Generated | Speed | SEO       |
| -------- | ---------------------- | ----- | --------- |
| ISR      | Build + revalidate     | Fast  | Excellent |

```tsx
// app/products/page.tsx
export const revalidate = 10_000; // seconds

export default async function ProductsPage() {
  const data = await fetch("https://api.example.com/products").then((res) => res.json());
  return <Products data={data} />;
}
```

Flow: first request after the window may still see stale content → Next.js triggers background regeneration → subsequent requests get fresh HTML. For event-driven updates, prefer tag revalidation (Lesson 11).

**Used when:** blogs, product listings, marketing pages that update occasionally but not per-second.

**Tip:** Choose revalidation windows based on acceptable staleness — 60s for semi-live listings, 3600s for blog indexes, on-demand tags for CMS publish events.

**Try it:** Deploy a page with `revalidate = 30` to Vercel or run locally in production mode. Update backend data twice within 30 seconds and document which response shows old vs new content.

---

### Lesson 16. Client-Side Rendering (CSR) in the App Router

**Takeaway:** CSR renders UI **in the browser** after JavaScript loads. In App Router, you opt in deliberately — typically a Client Component that fetches in `useEffect` or with SWR/React Query — while the shell may still be server-rendered.

**Explain:**

| Paradigm | When HTML is Generated | Speed             | SEO       |
| -------- | ---------------------- | ----------------- | --------- |
| CSR      | Client only            | Slower first load | Weak      |

```tsx
// components/AnalyticsDashboard.tsx
"use client";

import { useEffect, useState } from "react";

type Metric = { label: string; value: number };

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/metrics")
      .then((r) => r.json())
      .then(setMetrics)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading chart…</p>;
  return <Chart data={metrics} />;
}

// app/analytics/page.tsx — server shell + client island
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

export default function AnalyticsPage() {
  return (
    <main>
      <h1>Analytics</h1>
      <AnalyticsDashboard />
    </main>
  );
}
```

**Used when:** heavy interactivity, real-time charts, filters, WebSockets — especially after initial load.

**Tip:** Prefer Server Components + streaming for SEO-critical content; reserve CSR islands for parts that truly need browser-only live updates.

**Try it:** Disable JavaScript in DevTools and load a CSR-heavy page — note what content is missing. Compare with a Server Component version of the same data.

---

### Lesson 17. Streaming with Suspense and `loading.tsx`

**Takeaway:** Streaming sends HTML **in chunks** as each async section completes, so slow data does not block the entire page. React `<Suspense>` boundaries and `loading.tsx` files enable this pattern natively.

**Explain:**

| Paradigm  | When HTML is Generated | Speed          | SEO       |
| --------- | ---------------------- | -------------- | --------- |
| Streaming | Incremental            | Fast perceived | Excellent |

```tsx
// app/dashboard/page.tsx
import { Suspense } from "react";

async function SlowStats() {
  const stats = await fetch("https://api.example.com/stats", {
    next: { revalidate: 60 },
  }).then((r) => r.json());
  return <StatsPanel data={stats} />;
}

async function SlowActivity() {
  await new Promise((r) => setTimeout(r, 2000)); // simulate slow query
  const activity = await getActivity();
  return <ActivityFeed items={activity} />;
}

export default function DashboardPage() {
  return (
    <main>
      <h1>Dashboard</h1>
      <Suspense fallback={<p>Loading stats…</p>}>
        <SlowStats />
      </Suspense>
      <Suspense fallback={<p>Loading activity…</p>}>
        <SlowActivity />
      </Suspense>
    </main>
  );
}
```

`loading.tsx` automatically wraps `page.tsx` in Suspense for that segment. Nested Suspense boundaries let fast sections render while slow ones stream later.

**Tip:** Split independent data sources into separate async Server Components each wrapped in Suspense — one slow API should not delay the whole layout.

**Try it:** Add a 3-second delay to one of two parallel Server Components. Confirm the fast section appears immediately while the slow fallback shows until ready.

---

### Lesson 18. Partial Prerendering (PPR)

**Takeaway:** PPR combines a **static shell** (prerendered at build time) with **dynamic holes** that stream in at request time — static speed plus personalized or fresh islands without making the whole page dynamic.

**Explain:**

| Paradigm | When HTML is Generated | Speed | SEO       |
| -------- | ---------------------- | ----- | --------- |
| PPR      | Hybrid                 | Fast  | Excellent |

Enable PPR in `next.config.ts`:

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: true, // or 'incremental' with per-route opt-in
  },
};

export default nextConfig;
```

```tsx
// app/product/[id]/page.tsx
import { Suspense } from "react";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main>
      {/* Static shell — product layout, images, SEO content */}
      <ProductShell params={params} />
      {/* Dynamic hole — stock, price, user-specific promo */}
      <Suspense fallback={<PriceSkeleton />}>
        <LivePrice params={params} />
      </Suspense>
    </main>
  );
}
```

**Used when:** mostly static pages with small dynamic widgets (cart badge, personalized recommendations, live inventory).

**Tip:** PPR is the App Router answer to "I want CDN-cached marketing chrome but fresh user data in one route" — prefer it over marking the entire page `force-dynamic`.

**Try it:** Enable experimental PPR, build a product page with a static description and a Suspense-wrapped dynamic price component, and inspect which parts are included in the prerendered shell at build time.

---

## Server Actions

### Lesson 19. Defining Server Actions with `"use server"`

**Takeaway:** Server Actions are **async functions that run on the server**, invoked from forms or event handlers. Mark a file or inline function with `"use server"` — they integrate with React 19's action model and never expose secrets to the client.

**Explain:** Server Actions replace many API routes for mutations. Next.js generates secure IDs and POST endpoints automatically.

```tsx
// app/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;

  await db.post.create({ data: { title, body } });
  revalidatePath("/blog");
}

// app/blog/new/page.tsx
import { createPost } from "@/app/actions";

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <textarea name="body" required />
      <button type="submit">Publish</button>
    </form>
  );
}
```

Inline server actions inside Server Components:

```tsx
export default function Page() {
  async function deleteItem(id: string) {
    "use server";
    await db.item.delete({ where: { id } });
    revalidatePath("/items");
  }
  return <form action={deleteItem.bind(null, "abc")}>…</form>;
}
```

**Tip:** Keep actions in dedicated `actions.ts` files for clarity and testing. Always validate and authorize inside the action — never trust client-sent IDs alone.

**Try it:** Implement `createPost` with a SQLite or JSON file store. Submit the form without any client-side JavaScript handlers and confirm the post appears after redirect/revalidation.

---

### Lesson 20. Validation, errors, and revalidation in Server Actions

**Takeaway:** Validate input inside Server Actions with Zod or similar, return structured errors for the UI, and call `revalidatePath` / `revalidateTag` after successful mutations so Server Component caches stay fresh.

**Explain:**

```tsx
// app/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

const PostSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(10),
});

export type PostFormState = {
  errors?: { title?: string[]; body?: string[] };
  message?: string;
};

export async function createPost(_prev: PostFormState, formData: FormData): Promise<PostFormState> {
  const parsed = PostSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await savePost(parsed.data);
    revalidatePath("/blog");
    return { message: "Published!" };
  } catch {
    return { message: "Server error. Try again." };
  }
}
```

Authorization checks belong here too — verify the session before any write:

```tsx
import { auth } from "@/auth";

export async function deletePost(id: string) {
  "use server";
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await db.post.delete({ where: { id, authorId: session.user.id } });
  revalidatePath("/blog");
}
```

**Tip:** Return user-safe error messages; log detailed errors server-side. Use `revalidatePath('/blog', 'page')` or `'layout'` when you need to scope invalidation.

**Try it:** Add Zod validation to a form action. Submit empty fields and confirm field errors render without a full page reload when paired with `useActionState` (Lesson 21).

---

### Lesson 21. Progressive enhancement with `useActionState` and pending UI

**Takeaway:** `useActionState` (React 19) wires Server Actions to Client Components for inline validation feedback and pending states — while the form still works without JavaScript via native `<form action>`.

**Explain:**

```tsx
// components/PostForm.tsx
"use client";

import { useActionState } from "react";
import { createPost, type PostFormState } from "@/app/actions";

const initialState: PostFormState = {};

export function PostForm() {
  const [state, formAction, pending] = useActionState(createPost, initialState);

  return (
    <form action={formAction}>
      <input name="title" aria-invalid={!!state.errors?.title} />
      {state.errors?.title && <p>{state.errors.title[0]}</p>}

      <textarea name="body" aria-invalid={!!state.errors?.body} />
      {state.errors?.body && <p>{state.errors.body[0]}</p>}

      <button type="submit" disabled={pending}>
        {pending ? "Publishing…" : "Publish"}
      </button>
      {state.message && <p>{state.message}</p>}
    </form>
  );
}
```

`useFormStatus` (in a child of the form) reads pending state from the nearest form context — useful for disabling submit buttons from a separate component.

```tsx
"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? "Saving…" : "Save"}</button>;
}
```

**Tip:** Progressive enhancement means the form POST works even if JS fails to load — always keep `action={serverAction}` on the `<form>` element.

**Try it:** Load the form with JavaScript disabled, submit valid data, and confirm the mutation succeeds. Re-enable JS and verify pending states and inline errors appear.

---

## Metadata & SEO

### Lesson 22. Static metadata with `export const metadata`

**Takeaway:** Export a `metadata` object from `layout.tsx` or `page.tsx` to control `<title>`, description, icons, and more. Layout metadata applies to all children; page metadata overrides layout values.

**Explain:** Next.js converts the object into proper `<head>` tags at build or request time depending on static vs dynamic rendering.

```tsx
// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | MyApp",
    default: "MyApp",
  },
  description: "Production-ready Next.js starter",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

// app/about/page.tsx
export const metadata: Metadata = {
  title: "About",
  description: "Learn about our team and mission",
};
// Renders: <title>About | MyApp</title>
```

Use `absolute` to skip the parent template:

```tsx
export const metadata: Metadata = {
  title: { absolute: "Login" }, // <title>Login</title> — no suffix
};
```

**Inheritance rules:** layout metadata flows down; page metadata overrides; `template` wraps child titles; `absolute` ignores templates.

**Tip:** Define the title template once in the root layout — child routes only set `title: "Dashboard"` for consistent branding.

**Try it:** View page source (not just DevTools Elements) for `/about` and confirm meta tags are present in the initial HTML — critical for crawlers.

---

### Lesson 23. Dynamic metadata with `generateMetadata`

**Takeaway:** Use `generateMetadata` when titles and descriptions depend on `params`, search params, or fetched data — e.g., blog posts and user profiles.

**Explain:**

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetch(`https://api.example.com/posts/${slug}`, {
    next: { revalidate: 3600 },
  }).then((r) => r.json());

  if (!post) return { title: "Not found" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage, width: 1200, height: 630 }],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  return <Article post={post} />;
}
```

Next.js deduplicates fetch calls shared between `generateMetadata` and the page component when using the same URL and options.

**Tip:** Keep `generateMetadata` fast — avoid heavy unrelated queries. Return sensible fallbacks when data is missing instead of throwing.

**Try it:** Share a blog post URL in a messaging app or use an OG debugger tool — confirm title, description, and image preview match `generateMetadata` output.

---

### Lesson 24. Open Graph, Twitter cards, robots, and sitemaps

**Takeaway:** Social previews and crawl rules are first-class metadata fields. Combine `openGraph`, `twitter`, and `robots` exports with a dynamic `sitemap.ts` for complete SEO coverage.

**Explain:**

```tsx
// app/blog/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    title: "My Blog",
    description: "React and Next.js articles",
    url: "https://example.com/blog",
    siteName: "My Blog",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Blog",
    description: "Frontend articles",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

// app/sitemap.ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  return [
    { url: "https://example.com", lastModified: new Date(), changeFrequency: "yearly", priority: 1 },
    ...posts.map((p) => ({
      url: `https://example.com/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}

// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin/" },
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

**When to use what:** static `metadata` for fixed pages; `generateMetadata` for dynamic routes; `template + %s` for branding; Open Graph for social sharing.

**Tip:** Place default OG images in `public/` and use absolute URLs in production metadata (`https://example.com/og.png`) — some crawlers ignore relative paths.

**Try it:** Generate `/sitemap.xml` and `/robots.txt` locally in production mode. Submit the sitemap URL in Google Search Console (or validate XML structure manually).

---

## Auth and middleware patterns

### Lesson 25. Middleware basics — `middleware.ts` and the matcher

**Takeaway:** `middleware.ts` runs **before a request completes**, at the edge, on matched paths. Use it for redirects, header rewrites, A/B flags, and coarse auth gates — not heavy database work.

**Explain:** Middleware executes on the Edge Runtime with a limited API surface (no Node `fs`, etc.).

```tsx
// middleware.ts (project root)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect www → apex
  if (request.nextUrl.hostname.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.hostname = url.hostname.replace("www.", "");
    return NextResponse.redirect(url);
  }

  // Attach request ID for logging
  const response = NextResponse.next();
  response.headers.set("x-request-id", crypto.randomUUID());
  return response;
}

export const config = {
  matcher: [
    // Skip static files and _next internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

Multiple middleware concerns compose best as early returns — redirect, rewrite, or `NextResponse.next()` with modified headers.

**Tip:** Keep middleware fast — every matched request pays this cost. Narrow the `matcher` to routes that actually need logic.

**Try it:** Log `pathname` in middleware for several routes. Confirm static assets under `_next/static` are excluded when using the recommended matcher pattern.

---

### Lesson 26. Protecting routes with middleware and session cookies

**Takeaway:** Read auth cookies or JWTs in middleware, redirect unauthenticated users to `/login`, and optionally attach user info to request headers for downstream Server Components — but always re-verify authorization in Server Actions and data layers.

**Explain:**

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const session = request.cookies.get("session")?.value;

  if (!isPublic && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session) {
    const response = NextResponse.next();
    response.headers.set("x-session-present", "1");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/api/private/:path*"],
};
```

Middleware can **block navigation** but cannot fully replace server-side auth checks — users can bypass middleware with direct API calls unless Route Handlers and Server Actions validate sessions too.

**Tip:** Store sessions in `httpOnly`, `secure`, `sameSite` cookies. Never trust client-visible JWTs in `localStorage` for security-sensitive apps.

**Try it:** Set a fake `session` cookie in DevTools and access `/dashboard`. Delete the cookie and confirm redirect to `/login?callbackUrl=/dashboard`.

---

### Lesson 27. Auth.js (NextAuth) and session access in Server Components

**Takeaway:** Auth.js v5 integrates with App Router via a central `auth.ts` config. Call `auth()` in Server Components, Server Actions, and Route Handlers to read the session — one source of truth for identity.

**Explain:**

```tsx
// auth.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = request.nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard) return isLoggedIn;
      return true;
    },
  },
});

// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;

// app/dashboard/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <h1>Hello, {session.user?.name}</h1>;
}

// components/SignOutButton.tsx
"use client";
import { signOut } from "@/auth";

export function SignOutButton() {
  return <button onClick={() => signOut()}>Sign out</button>;
}
```

Pair Auth.js `authorized` callback with middleware-style protection, and still verify roles inside Server Actions before mutations.

**Tip:** Export `auth` once from `auth.ts` and import it everywhere — avoid duplicating JWT decode logic in random utilities.

**Try it:** Configure one OAuth provider (or the Credentials provider for local dev). Sign in, read `session.user` in a Server Component, and call a protected Server Action that rejects unauthenticated callers.

---

## Deployment

### Lesson 28. Production build output and what `next build` does

**Takeaway:** `next build` compiles routes, prerenders static pages, computes route modes (static vs dynamic), and produces an optimized `.next` folder for `next start` or platform deployment.

**Explain:** The build table summarizes each route:

```
Route (app)                Size     First Load JS
┌ ○ /                      5 kB         90 kB
├ ○ /blog                  8 kB         93 kB
├ ƒ /dashboard             7 kB         92 kB
└ ● /blog/[slug]           6 kB         91 kB
```

Symbols: `○` static (SSG), `●` SSG with `generateStaticParams`, `ƒ` dynamic (SSR/server-rendered on demand).

```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

Production checklist: run TypeScript checks, fix ESLint errors, verify env vars on the host, test with `next start` locally before pushing.

**Tip:** CI should run `next build` on every PR — runtime-only bugs often surface only at build time (e.g., `dynamic = "error"` violations).

**Try it:** Run `next build` on your project, screenshot the route table, and map each symbol to the caching/rendering choices you made in Lessons 9–18.

---

### Lesson 29. Environment variables and runtime configuration

**Takeaway:** Prefix client-exposed vars with `NEXT_PUBLIC_`. Keep secrets server-only (no prefix). Access env vars in Server Components, Route Handlers, and Server Actions — never embed secrets in Client Components.

**Explain:**

```bash
# .env.local
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXT_PUBLIC_API_BASE="https://api.example.com"
```

```tsx
// Server-only — safe
import { db } from "@/lib/db";

export async function getUsers() {
  return db.user.findMany(); // uses DATABASE_URL on server
}

// Client Component — only NEXT_PUBLIC_* is inlined at build time
"use client";
const base = process.env.NEXT_PUBLIC_API_BASE;
```

For runtime config on self-hosted Node servers, read env at process start — Next.js inlines `NEXT_PUBLIC_` vars at **build** time, so changing them requires a rebuild unless you use a runtime config pattern (e.g., server-provided config endpoint).

```tsx
// next.config.ts — optional build-time env validation
const nextConfig = {
  env: {
    APP_VERSION: process.env.npm_package_version,
  },
};
```

**Tip:** Add `.env.local` to `.gitignore`. Document required variables in `.env.example` for teammates and deployment platforms.

**Try it:** Create `NEXT_PUBLIC_APP_NAME` and a secret `API_KEY`. Confirm the public var is visible in client bundle analysis tools and the secret is absent.

---

### Lesson 30. Deploying to Vercel and self-hosted alternatives

**Takeaway:** Vercel is the zero-config path — git push triggers build, edge middleware, ISR, and previews work out of the box. Self-hosting with `next start`, Docker, or static export trades convenience for control.

**Explain:**

**Vercel deployment (typical flow):**

1. Push repo to GitHub/GitLab/Bitbucket.
2. Import project in Vercel — framework preset: Next.js.
3. Set environment variables in the dashboard (`DATABASE_URL`, `NEXTAUTH_SECRET`, etc.).
4. Deploy — each PR gets a preview URL; merges to main go production.

```tsx
// vercel.json (optional — redirects, headers)
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [{ "key": "X-Frame-Options", "value": "DENY" }]
    }
  ]
}
```

**Self-hosted Docker sketch:**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["npm", "start"]
```

| Host          | ISR | Middleware | Server Actions | Notes                    |
| ------------- | --- | ---------- | -------------- | ------------------------ |
| Vercel        | Yes | Edge       | Yes            | Best App Router fit      |
| Node (`start`)| Yes | Node*      | Yes            | You manage infra         |
| Static export | No  | No         | No             | `output: 'export'` only  |

\*Middleware on self-hosted runs in Node unless configured for edge.

**Interview mental model:** static by default → ISR if data changes periodically → SSR for user-specific content → stream slow parts → CSR only when needed → Server Actions for mutations → middleware for coarse gates → always re-auth on the server.

**Tip:** Use preview deployments to test ISR, middleware, and OG metadata in a production-like environment before shipping to main.

**Try it:** Deploy a demo App Router project to Vercel (free tier). Verify ISR by updating API content without redeploying, and test middleware redirects on the live preview URL.

---
