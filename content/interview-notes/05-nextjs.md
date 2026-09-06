# Next.js Interview Notes

## Fundamentals & App vs Pages Router

### Q1. What is Next.js and why use it over a plain React SPA? [must-know]

**Short definition:** Next.js is a React framework that adds routing, server rendering, and production optimizations on top of React.

**Answer:** React alone is a UI library — it does not prescribe routing, data fetching strategy, or how HTML reaches the browser. Next.js provides file-based routing, multiple rendering modes (SSR, SSG, ISR), built-in image and font optimization, metadata APIs for SEO, and server capabilities like Route Handlers and Server Actions. For a fintech product site, that means marketing pages can be statically cached on a CDN while authenticated dashboards stay interactive. You ship less boilerplate and get performance defaults that would take weeks to build manually in CRA or Vite.

```ts
// app/loans/page.tsx — route + server data in one file
export default async function LoansPage() {
  const res = await fetch('https://api.example.com/loans', { next: { revalidate: 300 } });
  const loans = await res.json();
  return <LoanGrid loans={loans} />;
}
```

**Follow-up:** What problem do Server Components solve in this stack?

**Common mistake:** Treating Next.js as "just routing for React" and marking every component `"use client"`.

---

### Q2. What are the main Next.js features you have used in production?

**Short definition:** App Router, Server/Client Components, SSR/SSG/ISR, middleware auth, API layer, and performance tooling.

**Answer:** In production I use the App Router with nested layouts, Server Components for initial data, and Client Components only for interactivity. I pick SSR for personalized views, SSG/ISR for marketing and product pages, and CSR inside client islands for dashboards. I integrate REST APIs via server `fetch` or React Query on the client. Auth is handled with middleware plus httpOnly session cookies. SEO uses `generateMetadata`, `next/image`, and sitemap generation. Deployment targets Vercel or a Node server behind a CDN. The key skill is choosing the right rendering mode per route, not applying one pattern everywhere.

```ts
// Typical stack per page type
// Marketing → ISR   Dashboard → CSR island   Offers → SSR
export const revalidate = 300; // loan landing page
```

**Follow-up:** Name one page and justify its rendering strategy.

---

### Q3. What is the App Router and how does it differ from the Pages Router? [must-know]

**Short definition:** App Router (`app/`) is the modern model with Server Components by default; Pages Router (`pages/`) is the legacy file-per-route system.

**Answer:** Pages Router maps files in `pages/` to routes and uses `getServerSideProps`, `getStaticProps`, and `getInitialProps` for data. App Router uses `app/` with `page.tsx`, nested `layout.tsx`, and Server Components as the default. You get built-in `loading.tsx`, `error.tsx`, Route Handlers, Server Actions, and streaming via Suspense. Layouts persist across navigation without remounting. New projects should use App Router; Pages Router remains supported for existing codebases. Both can coexist, but `app/` wins on route conflicts.

```ts
// Pages Router (legacy)
// pages/loans/[slug].tsx + getStaticProps

// App Router (modern)
// app/loans/[slug]/page.tsx — async Server Component
```

**Follow-up:** Can `app/` and `pages/` coexist in one project?

---

### Q4. Can the App Router and Pages Router coexist?

**Short definition:** Yes — both directories can live in the same repo, with App Router taking priority on overlapping paths.

**Answer:** Next.js allows incremental migration: keep legacy routes in `pages/` while new features go in `app/`. If both define the same URL, the App Router version wins. Shared code (components, utils, styles) works across both. You may temporarily duplicate layouts until migration completes. Middleware and `next.config.js` apply globally. Plan migration route-by-route, starting with leaf pages that have no complex data dependencies.

```ts
// next.config.js — no special flag needed
/** @type {import('next').NextConfig} */
const nextConfig = { /* shared config for both routers */ };
export default nextConfig;
```

**Follow-up:** How do you migrate `getServerSideProps` to App Router?

---

### Q5. What is file-based routing in Next.js?

**Short definition:** Folder and file names under `app/` or `pages/` automatically become URL routes.

**Answer:** In App Router, `app/about/page.tsx` maps to `/about`. Nested folders create nested URLs: `app/dashboard/settings/page.tsx` → `/dashboard/settings`. Special files (`layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`) do not add URL segments. Route groups like `(marketing)` organize code without affecting the path. Dynamic segments use brackets: `[id]`, `[...slug]`, `[[...slug]]`. This convention removes manual route configuration and keeps URLs predictable across the team.

```ts
// app/(marketing)/loans/[slug]/page.tsx → /loans/gold-loan
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <h1>Loan: {slug}</h1>;
}
```

**Follow-up:** What is the difference between `[...slug]` and `[[...slug]]`?

---

### Q6. What special files exist in the App Router?

**Short definition:** `page`, `layout`, `loading`, `error`, `not-found`, and `route` files define UI segments and API endpoints.

**Answer:** `page.tsx` is the public UI for a route segment and is required for the route to be accessible. `layout.tsx` wraps child routes and persists on navigation — ideal for headers and sidebars. `loading.tsx` auto-wraps the segment in Suspense. `error.tsx` is a client error boundary with retry support. `not-found.tsx` renders custom 404 UI when you call `notFound()`. `route.ts` defines HTTP handlers for that path. Together they replace much of the manual wiring needed in SPAs.

```ts
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

**Follow-up:** When would you use `template.tsx` instead of `layout.tsx`?

---

### Q7. What is the purpose of `next.config.js`?

**Short definition:** Central configuration for redirects, rewrites, images, env, and experimental features.

**Answer:** `next.config.js` (or `.mjs`/`.ts`) controls build and runtime behavior: image `remotePatterns`, internationalization, headers, redirects, rewrites, and bundler options. Enterprise apps configure strict image domains, proxy API paths, and security headers here. Changes often require a rebuild. Keep secrets out of this file — use environment variables instead. TypeScript projects can use `next.config.ts` for typed config.

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: 'cdn.bajajfinserv.in' }] },
  async redirects() {
    return [{ source: '/old-loans', destination: '/loans', permanent: true }];
  },
};
export default nextConfig;
```

**Follow-up:** What does `output: 'export'` do?

---

### Q8. How does Next.js improve developer experience over manual React setup?

**Short definition:** It bundles routing, rendering, API routes, and optimizations into conventions.

**Answer:** Without Next.js you wire React Router, choose a meta framework for SSR, configure webpack for code splitting, and build SEO tooling yourself. Next.js gives conventions: create a file, get a route; add `fetch` in a Server Component, get caching; drop `middleware.ts`, get edge auth. Hot reload, TypeScript, and ESLint integrate out of the box. Teams move faster because decisions are standardized. The trade-off is framework opinion — you work within Next.js patterns rather than assembling everything à la carte.

```ts
// Zero extra setup — API + page colocated
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok' });
}
```

**Follow-up:** When might you prefer Vite + React instead?

---

### Q9. What runtime does Next.js use for different features?

**Short definition:** Node.js for most server rendering, Edge for middleware, and the browser for Client Components.

**Answer:** Server Components, Route Handlers, and Server Actions typically run on the Node.js runtime unless you opt into Edge. Middleware always runs on the Edge — limited APIs but low latency globally. Client Components hydrate in the browser. You can set `export const runtime = 'edge'` on specific routes when cold-start speed matters and Node APIs are not needed. Database drivers often require Node, so Edge is best for lightweight auth checks and redirects.

```ts
// app/api/edge-ping/route.ts
export const runtime = 'edge';

export async function GET() {
  return Response.json({ region: process.env.VERCEL_REGION ?? 'local' });
}
```

**Follow-up:** Why can't middleware use Mongoose directly?

---

### Q10. What is Turbopack and how does it relate to Next.js?

**Short definition:** Turbopack is Next.js's Rust-based bundler aimed at faster local dev than webpack.

**Answer:** Starting with Next.js 13+, Turbopack powers `next dev --turbo` for faster HMR and cold starts on large apps. Production builds still historically used webpack, though Turbopack for production is evolving. For interviews, know it exists to speed development — it does not change rendering or routing concepts. Enable it when your team wants faster feedback loops on big monorepos.

```json
// package.json
{
  "scripts": {
    "dev": "next dev --turbo"
  }
}
```

**Follow-up:** Does Turbopack change how you write components?

---

### Q11. How would you introduce Next.js on a greenfield fintech project?

**Short definition:** Start with App Router, Server Components by default, and explicit rendering per route type.

**Answer:** Scaffold with `create-next-app`, TypeScript, App Router, and ESLint. Define route groups for marketing `(public)` and app `(authenticated)`. Public loan pages use ISR; dashboards use client data fetching; middleware guards `/dashboard/*`. Set up env vars for API URLs and secrets. Add Auth.js or custom cookie sessions early. Configure `next/image` domains and metadata templates in root layout. Establish CI with `next build` and Lighthouse budgets before launch.

```ts
// middleware.ts — early auth boundary
export const config = { matcher: ['/dashboard/:path*'] };
```

**Follow-up:** How do you structure API integration with a separate backend team?

---

### Q12. What is the difference between Next.js and a headless CMS frontend?

**Short definition:** Next.js is the app framework; the CMS is the content source — they complement each other.

**Answer:** A headless CMS (Contentful, Sanity) stores and delivers content via API. Next.js fetches that content at build time (SSG), on a schedule (ISR), or on demand (SSR). Webhooks from the CMS trigger `revalidatePath` or `revalidateTag` so published content appears without full redeploys. Next.js handles routing, auth, calculators, and user flows the CMS does not own. For Bajaj-style sites, CMS drives blog and FAQ copy; Next.js renders loan applications and authenticated journeys.

```ts
// app/api/revalidate/route.ts — CMS webhook
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  const { path, secret } = await req.json();
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Invalid' }, { status: 401 });
  }
  revalidatePath(path);
  return Response.json({ revalidated: true });
}
```

**Follow-up:** SSG vs ISR for CMS-driven pages?

---

## Rendering CSR/SSR/SSG/ISR/PPR

### Q13. What is Client-Side Rendering (CSR)? [must-know]

**Short definition:** CSR builds the UI in the browser after JavaScript loads and fetches data on the client.

**Answer:** The server sends a minimal HTML shell plus JS bundles. React mounts, runs effects or data hooks, calls APIs, and paints the UI. Users often see loading states first. SEO suffers because crawlers may not wait for client fetches. CSR fits authenticated dashboards, admin panels, and widgets where content is user-specific and indexing is irrelevant. In App Router, any Client Component fetching in `useEffect` or via React Query is CSR for that subtree.

```ts
'use client';
import useSWR from 'swr';

export function ApplicationStatus() {
  const { data, isLoading } = useSWR('/api/applications', fetcher);
  if (isLoading) return <Skeleton />;
  return <StatusList items={data} />;
}
```

**Follow-up:** How do you improve perceived performance for CSR sections?

---

### Q14. What is Server-Side Rendering (SSR)?

**Short definition:** SSR generates full HTML on the server for each request, then React hydrates it in the browser.

**Answer:** When a user hits a URL, the server runs your component tree, fetches data, renders HTML, and sends it immediately — good first paint and SEO. React then hydrates to attach event listeners. SSR suits personalized or frequently changing content: loan offers based on profile, account summaries, or pages needing fresh data every visit. Trade-offs include higher server load and slower TTFB versus static CDN pages. In App Router, `fetch` with `cache: 'no-store'`, `cookies()`, or `dynamic = 'force-dynamic'` opts into SSR-like behavior.

```ts
// app/offers/page.tsx — fresh every request
export const dynamic = 'force-dynamic';

export default async function OffersPage() {
  const session = await getSession();
  const offers = await fetchOffers(session.userId);
  return <OfferCards offers={offers} />;
}
```

**Follow-up:** SSR vs CSR — when is SSR worth the server cost?

---

### Q15. What is Static Site Generation (SSG)?

**Short definition:** SSG pre-renders HTML at build time and serves the same file from a CDN to every user.

**Answer:** During `next build`, Next.js executes pages, fetches data, and saves static HTML. At runtime there is no per-request rendering — the CDN responds instantly. Use SSG for stable public content: About Us, help articles, legal pages, and marketing copy that rarely changes. The downside is staleness until rebuild or ISR. In App Router, routes are static when they avoid dynamic APIs (`cookies`, `headers`, uncached fetch) and do not force dynamic rendering.

```ts
// app/about/page.tsx — static by default
export default function AboutPage() {
  return <article>About Bajaj Finserv Direct</article>;
}
// Build output shows ○ (static) for this route
```

**Follow-up:** How do you confirm a route is static after build?

---

### Q16. What is Incremental Static Regeneration (ISR)? [must-know]

**Short definition:** ISR serves cached static pages and regenerates them in the background on a timer or on demand.

**Answer:** You pre-build pages like SSG but set `revalidate: 60` (seconds) or use `revalidatePath`/`revalidateTag` after updates. The first visitor after expiry still gets the stale page instantly while Next.js rebuilds in the background; the next visitor gets fresh HTML. Perfect for product pages where gold loan rates or offers change hourly but you cannot afford SSR on every hit. On-demand ISR lets CMS or admin actions invalidate specific paths without redeploying the whole site.

```ts
export const revalidate = 300; // 5 minutes

export default async function GoldLoanPage() {
  const rates = await fetch('https://api.example.com/rates/gold', {
    next: { revalidate: 300, tags: ['gold-rates'] },
  }).then((r) => r.json());
  return <RateTable rates={rates} />;
}
```

**Follow-up:** What happens to the user during background revalidation?

---

### Q17. Compare CSR, SSR, SSG, and ISR in one answer. [must-know]

**Short definition:** They differ in where and when HTML is produced, and how fresh data is.

**Answer:** CSR builds in the browser after JS loads — real-time but poor SEO. SSR renders on every request — always fresh, higher server cost. SSG renders at deploy — fastest CDN delivery, stale until rebuild. ISR is SSG plus timed or on-demand regeneration — fast like static with controlled freshness. Pick CSR for logged-in dashboards, SSR for personalized SEO pages, SSG for stable marketing, ISR for semi-dynamic product and rate pages.

| | Where | When | Freshness | SEO | Server load |
|---|---|---|---|---|---|
| **CSR** | Browser | After JS | Real-time | Poor | Low server |
| **SSR** | Server | Per request | Always fresh | Excellent | High |
| **SSG** | Server (build) | Deploy | Stale | Excellent | None at runtime |
| **ISR** | Server (build+regen) | Deploy + interval | Configurable | Excellent | Low periodic |

```ts
// Same data, four strategies
fetch(url, { cache: 'no-store' });           // SSR
fetch(url, { cache: 'force-cache' });          // SSG
fetch(url, { next: { revalidate: 60 } });      // ISR
// useSWR in 'use client' component             // CSR
```

**Follow-up:** They may ask you to pick one for a specific Bajaj page — justify with freshness vs performance.

---

### Q18. Which rendering strategy for loan page, dashboard, blog, and rates page?

**Short definition:** Product/marketing → ISR; dashboard → CSR; blog → SSG; rates → ISR with short revalidation.

**Answer:** A loan product landing page needs SEO and CDN speed but rates change occasionally — use ISR with `revalidate: 300` or on-demand revalidation when CMS updates. A logged-in dashboard shows application status — CSR in Client Components (or SSR if you want faster first paint without SEO). Blog and help articles are stable — SSG with webhook revalidation on publish. Interest rates pages update frequently and must rank — ISR with 60–300 second revalidation or tag-based invalidation when backend rates change.

```ts
// Loan landing → ISR
export const revalidate = 300;

// Dashboard widget → CSR
'use client';
export function DashboardShell() { /* React Query */ }

// Blog → SSG + on-demand
// revalidatePath('/blog/my-post') from CMS webhook
```

**Follow-up:** Can one page mix strategies?

---

### Q19. What is Partial Prerendering (PPR)?

**Short definition:** PPR ships a static shell instantly and streams dynamic holes at request time.

**Answer:** Traditional SSR waits for all data before sending HTML. PPR prerenders the static frame at build (header, layout, marketing copy) and leaves Suspense boundaries open for dynamic segments (cart count, personalized greeting). Users see the shell immediately while personalized parts stream in. Enable experimentally via `experimental.ppr` in config. It blends SSG performance with SSR freshness for hybrid pages common in e-commerce and fintech homepages.

```ts
// next.config.ts
const nextConfig = { experimental: { ppr: true } };

// Static shell + dynamic hole
export default function HomePage() {
  return (
    <>
      <StaticHero />
      <Suspense fallback={<OffersSkeleton />}>
        <PersonalizedOffers />
      </Suspense>
    </>
  );
}
```

**Follow-up:** How does PPR differ from full SSR?

---

### Q20. What is hydration?

**Short definition:** Hydration is React attaching interactivity to server-rendered HTML on the client.

**Answer:** SSR and SSG send HTML that looks correct but buttons do not work until React runs in the browser. Hydration walks the DOM, binds events, and initializes client state. Server and client output must match — mismatches cause errors and duplicate renders. Browser-only values like `Date.now()` or `window` during render cause hydration failures. Server Components skip hydration entirely because their JS never ships to the client. Minimizing client boundaries reduces hydration cost.

```ts
'use client';
import { useEffect, useState } from 'react';

export function ClientClock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => setTime(new Date().toLocaleTimeString()), []); // avoid mismatch
  return <span>{time ?? '--:--'}</span>;
}
```

**Follow-up:** How do you debug hydration mismatch warnings?

---

### Q21. What is streaming in Next.js?

**Short definition:** Streaming sends HTML to the browser in chunks as each segment finishes rendering.

**Answer:** Without streaming, the server blocks until every data source resolves. With streaming, the layout and fast components flush first; slow components wrapped in Suspense arrive later. App Router enables this automatically for Server Components. `loading.tsx` creates a Suspense boundary for the route segment. Users perceive faster loads when a slow eligibility API does not block the entire loan page shell. React 18+ Suspense on the server makes this possible.

```ts
import { Suspense } from 'react';

export default function LoanPage() {
  return (
    <>
      <LoanHero /> {/* fast — streams first */}
      <Suspense fallback={<EligibilitySkeleton />}>
        <EligibilityChecker /> {/* slow — streams when ready */}
      </Suspense>
    </>
  );
}
```

**Follow-up:** Does streaming work with error boundaries?

---

### Q22. How do you opt a route into static vs dynamic rendering?

**Short definition:** Static is default when no dynamic APIs are used; dynamic is forced by cookies, headers, or cache options.

**Answer:** Next.js statically renders routes that only use cached fetches and static params. Calling `cookies()` or `headers()`, reading `searchParams` without Suspense, or using `fetch` with `cache: 'no-store'` makes the route dynamic. Explicit exports: `export const dynamic = 'force-dynamic'` for SSR, `'force-static'` to attempt static, and `export const revalidate = 60` for ISR interval. Always be explicit in production so behavior survives Next.js version default changes.

```ts
export const dynamic = 'force-dynamic'; // always SSR
export const revalidate = 60;           // ISR every 60s
export const dynamic = 'force-static';  // prefer static
```

**Follow-up:** What happens if you call `cookies()` in the root layout?

---

### Q23. What does `export const revalidate` do at the route level?

**Short definition:** It sets the default ISR interval in seconds for all fetches in that route segment.

**Answer:** Route-level `revalidate = 300` applies unless individual fetches override with their own `next.revalidate`. A value of `0` forces dynamic rendering. `false` means cache indefinitely until manual invalidation. Combine with tagged fetches for granular control — route revalidate is the baseline, tags handle surgical updates. Document the chosen interval with product requirements (how stale can loan rates appear).

```ts
// app/loans/gold/page.tsx
export const revalidate = 300;

export default async function GoldLoanPage() {
  const data = await getGoldLoanContent(); // inherits 300s unless overridden
  return <ProductPage data={data} />;
}
```

**Follow-up:** Route `revalidate` vs per-fetch `next.revalidate`?

---

### Q24. What triggers dynamic rendering in the App Router?

**Short definition:** Dynamic functions and uncached data access opt a route out of static generation.

**Answer:** Triggers include: `cookies()`, `headers()`, `connection()`, uncached `fetch`, `searchParams` in a page without Suspense isolation, `dynamic = 'force-dynamic'`, and `revalidate = 0`. Dynamic routes render at request time on the server. Accidentally importing a utility that reads cookies into a marketing page makes it dynamic — a common performance bug. Audit shared helpers used by static pages.

```ts
import { cookies } from 'next/headers';

export default async function Page() {
  const store = await cookies(); // ← makes this route dynamic
  const theme = store.get('theme')?.value;
  return <div data-theme={theme}>...</div>;
}
```

**Follow-up:** How do you keep a layout static but one child dynamic?

---

### Q25. What is `dynamicParams` in dynamic routes?

**Short definition:** It controls whether unknown dynamic segments generate on first visit or return 404.

**Answer:** For `app/loans/[slug]/page.tsx` with `generateStaticParams`, `dynamicParams: true` (default) means slugs not pre-built at deploy still render on first request (then cache with ISR). `dynamicParams: false` returns 404 for unknown slugs — useful when you have a closed set of products. With 10,000 loan variants, pre-build top 100 slugs and leave `dynamicParams: true` for long tail, or SSR the long tail only.

```ts
export const dynamicParams = true;

export async function generateStaticParams() {
  const topLoans = await getTopLoanSlugs(100);
  return topLoans.map((slug) => ({ slug }));
}
```

**Follow-up:** Strategy for 10,000 product pages at build time?

---

### Q26. Can one page mix rendering strategies?

**Short definition:** Yes — Server Component shell with ISR data plus Client Component islands for interactivity.

**Answer:** A gold loan landing page can ISR-fetch rates and marketing copy on the server while embedding a Client Component EMI calculator that runs entirely in the browser. The static/ISR part is SEO-friendly and CDN-cacheable; the calculator handles slider input without server round-trips. Avoid fetching user-specific data in the static shell. Compose with clear boundaries: server for content, client for widgets.

```ts
// Server page (ISR)
export default async function LoanPage() {
  const product = await getProduct('gold-loan');
  return (
    <>
      <ProductHero product={product} />
      <EmiCalculator defaultRate={product.rate} /> {/* client island */}
    </>
  );
}
```

**Follow-up:** Where does the EMI calculator fetch live rates from?

---

### Q27. What is the Full Route Cache vs Data Cache?

**Short definition:** Data Cache stores fetch results; Full Route Cache stores rendered HTML for static routes.

**Answer:** The Data Cache deduplicates and persists `fetch` responses across requests and builds. The Full Route Cache stores the complete rendered output of static routes so repeat visits skip re-rendering. `revalidatePath` clears route cache; `revalidateTag` clears tagged fetch entries. Dynamic routes skip Full Route Cache but may still use Data Cache depending on fetch options. Understanding both explains why ISR feels instant — HTML is served from cache while data refreshes in background.

```ts
fetch(url, { next: { tags: ['loans'], revalidate: 60 } }); // Data Cache
// Static page HTML → Full Route Cache until revalidatePath('/loans')
```

**Follow-up:** Does `router.refresh()` clear both caches?

---

### Q28. How did Next.js 15 change default `fetch` caching?

**Short definition:** Next.js 15 stopped caching `fetch` by default — you must opt in explicitly.

**Answer:** Before Next.js 15, server `fetch` was cached by default (surprising for many). Next.js 15 defaults to `no-store` behavior unless you pass `cache: 'force-cache'` or `next.revalidate`. This makes SSR the default and prevents accidental stale data. In interviews, say you always set cache options explicitly regardless of version. Migration guides add `export const fetchCache = 'default-cache'` where old behavior is needed.

```ts
// Explicit in all versions — interview-safe
const loans = await fetch(`${API}/loans`, {
  next: { revalidate: 300, tags: ['loans'] },
});
```

**Follow-up:** How do you restore old caching defaults project-wide?

---

## App Router Routing

### Q29. What is the purpose of `layout.tsx`? [must-know]

**Short definition:** Layouts wrap child routes and persist across navigations without remounting.

**Answer:** Place shared UI — headers, sidebars, providers that should survive route changes — in `layout.tsx`. Root layout wraps the entire app and must include `<html>` and `<body>`. Nested layouts compose: root → dashboard layout → page. State in layouts persists when navigating between sibling pages under the same layout. Unlike `template.tsx`, layouts do not remount on navigation. Keep auth-sensitive reads out of root layout if you want marketing pages to stay static.

```ts
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[240px_1fr]">
      <DashboardNav />
      {children}
    </div>
  );
}
```

**Follow-up:** Layout vs template — when remount?

---

### Q30. What is the purpose of `page.tsx`?

**Short definition:** `page.tsx` is the unique UI for a route segment and makes that URL publicly accessible.

**Answer:** Each route folder needs exactly one `page.tsx` (or `page.js`) to become a visitable URL. It can be an async Server Component fetching data before render. Without `page.tsx`, the folder is just a layout or organizational segment. Route groups can have their own layouts plus pages. The page component receives `params` and `searchParams` as props (async in Next.js 15+).

```ts
// app/loans/[slug]/page.tsx
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <LoanDetail slug={slug} />;
}
```

**Follow-up:** Can a folder have multiple pages?

---

### Q31. How do `loading.tsx` and `error.tsx` work?

**Short definition:** `loading.tsx` is an automatic Suspense fallback; `error.tsx` is a segment error boundary.

**Answer:** `loading.tsx` shows instantly while the segment's async content loads — no manual Suspense wiring for the page slot. `error.tsx` must be a Client Component; it receives `error` and `reset` props to display fallback UI and retry. Errors bubble to the nearest error boundary without crashing parent segments. Pair with `not-found.tsx` for missing resources. Together they deliver polished UX on slow networks and failure cases.

```ts
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />;
}

// app/dashboard/error.tsx
'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <p>Something went wrong: {error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

**Follow-up:** Why must `error.tsx` be a Client Component?

---

### Q32. How do you trigger a 404 with `notFound()`?

**Short definition:** Call `notFound()` from `next/navigation` to render the nearest `not-found.tsx`.

**Answer:** When data fetching returns empty — invalid loan slug, deleted article — call `notFound()` instead of rendering empty UI. Next.js renders `not-found.tsx` for that segment with HTTP 404. You can customize messaging per section: marketing 404 vs dashboard 404. Combine with `generateStaticParams` and `dynamicParams: false` for strict slug validation.

```ts
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loan = await getLoan(slug);
  if (!loan) notFound();
  return <LoanDetail loan={loan} />;
}
```

**Follow-up:** Difference between `notFound()` and `redirect()`?

---

### Q33. What are route groups?

**Short definition:** Parenthesized folders like `(marketing)` organize routes without affecting the URL.

**Answer:** Route groups let you apply different layouts to sections that share URL structure. `app/(marketing)/about/page.tsx` and `app/(shop)/checkout/page.tsx` can have distinct layouts while URLs stay `/about` and `/checkout`. Useful for separating public marketing from authenticated app shells without prefixing URLs with `/marketing`. Groups can share or omit layouts as needed.

```ts
// app/(public)/loans/page.tsx     → /loans  (marketing layout)
// app/(app)/dashboard/page.tsx    → /dashboard (app shell layout)
```

**Follow-up:** Can route groups share the same URL path?

---

### Q34. How do dynamic route segments work?

**Short definition:** Bracket folders capture URL params passed as `params` to pages and layouts.

**Answer:** `[id]` matches one segment: `/loans/123` → `params.id = '123'`. `[...slug]` is catch-all for `/docs/a/b/c`. `[[...slug]]` is optional catch-all also matching `/docs`. In Next.js 15, `params` and `searchParams` are Promises you must await. Use `generateStaticParams` to pre-render known values at build time for ISR/SSG.

```ts
// app/docs/[...slug]/page.tsx
export default async function DocsPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return <DocViewer path={slug.join('/')} />;
}
```

**Follow-up:** How do you type dynamic params with TypeScript?

---

### Q35. What are parallel routes?

**Short definition:** Parallel routes render multiple pages in the same layout using `@slot` folders.

**Answer:** Define slots like `@modal` and `@sidebar` alongside `page.tsx`. The layout receives each slot as a prop: `layout({ children, modal, sidebar })`. All slots can load independently with their own `loading.tsx`. Common pattern: show a login modal `@modal` while keeping the underlying page visible. Useful for dashboards with simultaneous panels or photo gallery modals.

```ts
// app/@modal/(.)photos/[id]/page.tsx — intercepting + parallel
export default function PhotoModal({ params }: { params: Promise<{ id: string }> }) {
  return <ModalPhoto id={(await params).id} />;
}
```

**Follow-up:** What happens if a slot throws — does the whole layout fail?

---

### Q36. What are intercepting routes?

**Short definition:** Intercepting routes show a route in a overlay/modal while preserving the background URL context.

**Answer:** Use `(.)`, `(..)`, or `(...)` folder prefixes to intercept navigation. Clicking a photo thumbnail navigates to `/photos/1` but renders the detail in a modal over the gallery. Direct URL visit still shows full page. Combines with parallel routes for polished UX without losing shareable URLs. Requires understanding relative path levels: `(.)` same level, `(..)` one level up.

```ts
// app/photos/(..)photos/[id]/page.tsx — soft navigation shows modal
// Direct /photos/1 visit → full page.tsx
```

**Follow-up:** When would intercepting routes be overkill?

---

### Q37. What is `template.tsx` vs `layout.tsx`?

**Short definition:** Templates remount on navigation; layouts persist.

**Answer:** `template.tsx` wraps children like a layout but creates a new instance on every navigation — state resets, effects re-run. Use for enter/exit animations or analytics that should fire per navigation. Layouts preserve state — sidebars stay mounted. Most apps use layouts exclusively; templates are rare. Do not confuse them in interviews — persistence vs remount is the key distinction.

```ts
// app/dashboard/template.tsx
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in">{children}</div>;
}
```

**Follow-up:** Can you use both template and layout in one segment?

---

### Q38. How does navigation work in the App Router? [must-know]

**Short definition:** Use `Link` for client transitions, `useRouter` for imperative navigation, and `redirect()` on the server.

**Answer:** `<Link href="/loans">` prefetches routes in viewport and navigates without full reload. `useRouter` from `next/navigation` provides `push`, `replace`, `back`, and `refresh` (re-fetch server data without navigation). `redirect('/login')` from `next/navigation` works in Server Components and Actions — sends 307/308. `usePathname` and `useSearchParams` read current URL; wrap `useSearchParams` in Suspense on static pages.

```ts
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Nav() {
  const router = useRouter();
  return (
    <>
      <Link href="/loans" prefetch>Loans</Link>
      <button onClick={() => router.push('/apply')}>Apply</button>
    </>
  );
}
```

**Follow-up:** `Link` vs `<a>` tag?

---

### Q39. What is `useSearchParams` and why wrap it in Suspense?

**Short definition:** It reads query strings on the client; Suspense prevents blocking static page generation.

**Answer:** `useSearchParams()` returns a read-only URLSearchParams-like object for `?tab=emi&ref=google`. Reading search params during static generation would force dynamic rendering for the whole page. Wrapping the component that uses it in `<Suspense>` isolates the dynamic part. Server Components should receive `searchParams` as a prop from the page instead of using the hook.

```ts
// app/tools/page.tsx
import { Suspense } from 'react';
import { EmiTool } from './EmiTool';

export default function Page() {
  return (
    <Suspense fallback={<ToolSkeleton />}>
      <EmiTool />
    </Suspense>
  );
}
```

**Follow-up:** How do you read search params in a Server Component?

---

### Q40. What is the difference between `redirect` and `rewrite`?

**Short definition:** Redirect changes the browser URL; rewrite serves different content behind the same URL.

**Answer:** Redirect responds with 307/308 — user sees new URL (`/old-loans` → `/loans`). Rewrite internally maps `/blog` to `/cms/blog` without URL change — useful for proxies and micro-frontends. Configure rewrites in `next.config.js` or Middleware via `NextResponse.rewrite()`. Fintech use cases: hide backend API paths behind `/api/*`, or serve legacy HTML under new marketing URLs during migration.

```ts
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(req: Request) {
  if (new URL(req.url).pathname.startsWith('/legacy')) {
    return NextResponse.rewrite(new URL('/v1/legacy', req.url));
  }
}
```

**Follow-up:** When would you rewrite vs proxy in nginx?

---

### Q41. How does prefetching work with `Link`?

**Short definition:** Next.js prefetches linked routes when `Link` enters the viewport to speed up navigation.

**Answer:** By default, static routes prefetch in production when links scroll into view. Disable with `prefetch={false}` for rarely visited pages to save bandwidth. Dynamic routes prefetch less aggressively. Prefetch loads JS and RSC payload so clicks feel instant. Important for large sites with many nav links — balance UX vs data usage on mobile.

```ts
<Link href="/rare-admin-page" prefetch={false}>Admin</Link>
<Link href="/loans/gold-loan">Gold Loan</Link> {/* prefetched in viewport */}
```

**Follow-up:** Does prefetch run for routes behind auth?

---

### Q42. What is `generateStaticParams`?

**Short definition:** It returns the list of dynamic params to pre-render at build time.

**Answer:** For `app/loans/[slug]/page.tsx`, export `generateStaticParams` to fetch all slugs (or top N) and return `{ slug: 'gold-loan' }` objects. Next.js builds static pages for each at deploy. Combine with `revalidate` for ISR. Empty array means no paths pre-built — all generated on demand if `dynamicParams` is true.

```ts
export async function generateStaticParams() {
  const loans = await fetch(`${API}/loans`).then((r) => r.json());
  return loans.map((loan: { slug: string }) => ({ slug: loan.slug }));
}
```

**Follow-up:** What if the API fails during build?

---

## RSC vs Client Components

### Q43. What are React Server Components (RSC) in Next.js? [must-know]

**Short definition:** Server Components run on the server, fetch data directly, and do not ship their component JavaScript to the browser.

**Answer:** App Router components are Server Components by default. They execute during the request or at build time, can `await` databases and APIs, and access secret env vars safely. Their output is serialized HTML/RSC payload — not client bundle code. They cannot use hooks, event handlers, or browser APIs. When interactivity is needed, import a Client Component. RSC dramatically shrinks JS sent to users on content-heavy fintech marketing pages.

```ts
export default async function LoanList() {
  const loans = await db.loan.findMany();
  return (
    <ul>
      {loans.map((l) => (
        <li key={l.id}>{l.name}</li>
      ))}
    </ul>
  );
}
```

**Follow-up:** Can a Server Component import a Client Component?

---

### Q44. When do you add `"use client"`? [must-know]

**Short definition:** Add it when the component needs hooks, events, or browser-only APIs.

**Answer:** Put `"use client"` at the file top when you use `useState`, `useEffect`, `onClick`, `onChange`, `window`, `localStorage`, or third-party libs built on hooks. Keep the boundary as low as possible — a whole page should not be client unless every part is interactive. Everything imported into a client file becomes part of the client bundle. The page stays server; only the button, form, or chart becomes client.

```ts
'use client';
import { useState } from 'react';

export function ApplyButton({ loanId }: { loanId: string }) {
  const [pending, setPending] = useState(false);
  return (
    <button disabled={pending} onClick={() => submit(loanId)}>
      Apply Now
    </button>
  );
}
```

**Follow-up:** What error do you get using hooks without `"use client"`?

---

### Q45. Can a Server Component render a Client Component?

**Short definition:** Yes — Server Components import and pass serializable props to Client Components.

**Answer:** The server renders the Client Component's initial HTML and sends the client boundary marker plus that component's JS. Props must be serializable — plain objects, strings, numbers, arrays. Do not pass functions except Server Actions (special serialization). Pattern: server page fetches loan data, passes to client EMI widget as props. This is the recommended composition model.

```ts
import { EmiCalculator } from '@/components/EmiCalculator';

export default async function Page() {
  const rate = await getGoldRate();
  return <EmiCalculator defaultRate={rate} />;
}
```

**Follow-up:** Can you pass a Server Component as a prop?

---

### Q46. Why can't Client Components import Server Components directly?

**Short definition:** Client bundles cannot include server-only code — pass Server output as `children` or props instead.

**Answer:** Importing a Server Component into a client file would pull server logic into the browser bundle — forbidden. Workaround: Server parent renders `<ClientModal><ServerDetails id={id} /></ClientModal>`. `children` is already rendered on the server and passed as serialized output. Same for named slots passed from server layouts. This preserves the server/client boundary while composing UI.

```ts
'use client';
export function Modal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return open ? <dialog open>{children}</dialog> : null;
}
```

**Follow-up:** Can Client Components call Server Actions?

---

### Q47. What is the "islands" architecture in Next.js?

**Short definition:** Static or server-rendered page shell with small interactive client "islands" embedded in it.

**Answer:** Most of the page — navigation, product copy, rates table — stays on the server for SEO and minimal JS. Interactive pieces — apply form, chat widget, calculator — are Client Components imported into the server tree. This mirrors Astro's islands but within React. For Bajaj loan pages, 90% server + 10% client is a typical split. Avoid making the root layout client just to share one hook.

```ts
export default async function GoldLoanPage() {
  return (
    <>
      <StaticHero />
      <RateTable rates={await getRates()} />
      <ChatWidget />
    </>
  );
}
```

**Follow-up:** How do you measure if client JS is too large?

---

### Q48. What props can cross the server-to-client boundary?

**Short definition:** Serializable data only — no functions, classes, or Symbols unless they are Server Actions.

**Answer:** JSON-like props work: strings, numbers, booleans, arrays, plain objects, Date (serialized), null. Functions, class instances, and DOM nodes cannot cross. Server Actions are the exception — Next.js serializes a reference callable from the client. Do not pass entire ORM documents with methods — map to plain DTOs. Passing secrets in props exposes them in the RSC payload inspectable in network tab.

```ts
<ClientCard loan={{ id: '1', name: 'Gold Loan', rate: 8.5 }} />
```

**Follow-up:** Are Server Action references secure?

---

### Q49. Can you use third-party UI libraries in Server Components?

**Short definition:** Only if they have no hooks, browser APIs, or client-only dependencies.

**Answer:** Libraries like lodash or pure presentational components without `"use client"` may work on the server. Most component libraries (MUI, many chart libs) require `"use client"` because they use hooks internally. Wrap them in a thin client file and import that wrapper from server pages. Check the library docs for RSC compatibility — Next.js 13+ ecosystem is still adapting.

```ts
'use client';
export { Button, TextField } from '@mui/material';
```

**Follow-up:** How do you SSR a chart library that needs `window`?

---

### Q50. What is the performance cost of a misplaced `"use client"` boundary?

**Short definition:** Moving the boundary too high pulls large subtrees into the client bundle and forces hydration.

**Answer:** Marking `page.tsx` as client means all imports become client JS — you lose server fetching, inflate bundle size, and hydrate everything. A layout marked client forces all child pages client-side. Symptom: Lighthouse shows high JS and slow TTI on a mostly static marketing page. Fix: split — server page + tiny client leaves. Use React DevTools and bundle analyzer to find the boundary.

```ts
'use client';
export default function LoanPage() {
  const [data, setData] = useState(null);
  useEffect(() => { fetch('/api/loans').then(/* ... */); }, []);
  return <div>{/* ... */}</div>;
}
```

**Follow-up:** Can you dynamically import client components from server pages?

---

### Q51. How do Server and Client Components communicate?

**Short definition:** Server passes props down; client triggers server via Server Actions or router.refresh.

**Answer:** Data flows server → client through props. Client → server mutations use Server Actions or fetch to Route Handlers, then `router.refresh()` to re-fetch server components. No direct callback props from client to server (functions are not serializable). For live updates, combine optimistic UI on client with revalidation on server after mutation succeeds.

```ts
'use client';
import { useRouter } from 'next/navigation';
import { updatePreference } from '@/actions/user';

export function ThemeToggle() {
  const router = useRouter();
  async function handleToggle() {
    await updatePreference('theme', 'dark');
    router.refresh();
  }
  return <button onClick={handleToggle}>Dark mode</button>;
}
```

**Follow-up:** Server Actions vs calling `/api` from client?

---

### Q52. What gets sent to the browser for an RSC payload?

**Short definition:** HTML plus a compact serialized component tree — not the full Server Component source.

**Answer:** The browser receives rendered HTML for fast first paint and an RSC flight payload describing the component tree structure and client boundaries. Client Components still download their JS chunks. Server Component code never ships — only output. Network tab shows `text/x-component` responses during navigation. This is why RSC reduces bundle size compared to traditional SSR where all components hydrated.

```ts
export default async function Page() {
  return <LoanList loans={await getLoans()} />;
}
```

**Follow-up:** How is this different from traditional SSR hydration?

---

## Data Fetching & Caching

### Q53. How do you fetch data in a Server Component? [must-know]

**Short definition:** Use async components and `await fetch()` or direct database calls on the server.

**Answer:** Mark the component `async` and await data in the function body — no `useEffect`. Parallelize independent requests with `Promise.all`. Identical fetches in one render pass dedupe automatically. Pass results as props to children. This data is ready before HTML streams — no client loading spinner for initial content. Prefer server fetch for SEO-critical and first-paint data.

```ts
export default async function DashboardSummary() {
  const [apps, notifications] = await Promise.all([
    getApplications(),
    getNotifications(),
  ]);
  return <Summary apps={apps} notifications={notifications} />;
}
```

**Follow-up:** Can you fetch in a Client Component the same way?

---

### Q54. How does `fetch` caching work in the App Router?

**Short definition:** Server `fetch` supports force-cache, no-store, and time-based revalidation via `next` options.

**Answer:** Control caching explicitly: `cache: 'no-store'` for always fresh (SSR), `cache: 'force-cache'` for static, `next: { revalidate: 60 }` for ISR, and `next: { tags: ['loans'] }` for tag invalidation. Next.js 15 defaults to no cache unless you opt in — always set options in interviews. Never cache authenticated or user-specific responses with shared cache keys.

```ts
const publicRates = await fetch(`${API}/rates`, {
  next: { revalidate: 120, tags: ['rates'] },
});
const userApps = await fetch(`${API}/applications`, { cache: 'no-store' });
```

**Follow-up:** What makes a route dynamic regardless of fetch?

---

### Q55. What are cache tags and `revalidateTag`? [must-know]

**Short definition:** Tags label cached fetch entries; `revalidateTag` invalidates all entries with that tag.

**Answer:** Tag fetches with `{ next: { tags: ['gold-rates'] } }`. When rates update in admin or via webhook, call `revalidateTag('gold-rates')` from a Server Action or Route Handler. All pages using that tag refresh on next visit. More granular than `revalidatePath` when one API feeds multiple routes. Ideal for CMS publish and backend rate change events.

```ts
'use server';
import { revalidateTag } from 'next/cache';

export async function publishRates() {
  await syncRatesFromCore();
  revalidateTag('gold-rates');
}
```

**Follow-up:** `revalidateTag` vs `revalidatePath`?

---

### Q56. What is `revalidatePath`?

**Short definition:** It invalidates the cached rendered output for a specific URL path.

**Answer:** Call `revalidatePath('/loans/gold')` after content changes to purge that route's Full Route Cache. Pass `'layout'` as second arg to invalidate nested layouts too. Use when you know exactly which URL changed — CMS webhook with path, admin publish button. Pair with tagged fetches when both route HTML and shared data must refresh.

```ts
'use server';
import { revalidatePath } from 'next/cache';

export async function publishLoan(slug: string) {
  await cms.publish(slug);
  revalidatePath(`/loans/${slug}`);
}
```

**Follow-up:** Can you call revalidation from a Route Handler?

---

### Q57. What is `unstable_cache` / `use cache`?

**Short definition:** They cache results of any async function, not just HTTP `fetch`.

**Answer:** Direct database queries bypass `fetch` caching. Wrap them with `unstable_cache` (Next.js 14+) or the `use cache` directive (15+) to cache DB results with revalidate and tags. Same invalidation APIs apply. Interview line: "If I'm not using fetch, I wrap data access in unstable_cache for ISR benefits."

```ts
import { unstable_cache } from 'next/cache';

export const getLoans = unstable_cache(
  async () => db.loan.findMany(),
  ['all-loans'],
  { revalidate: 300, tags: ['loans'] }
);
```

**Follow-up:** When would you skip caching DB reads entirely?

---

### Q58. How do you fetch data on the client?

**Short definition:** Use SWR, React Query, or `fetch` in effects inside Client Components.

**Answer:** Client fetch suits user-triggered actions, polling, infinite scroll, and dashboard data that changes without navigation. Libraries add caching, deduplication, and stale-while-revalidate. Combine with server fetch: server renders shell + initial data, client hydrates and refetches for freshness. For Bajaj dashboards showing application status, React Query with short `staleTime` works well behind auth.

```ts
'use client';
import { useQuery } from '@tanstack/react-query';

export function ApplicationList() {
  const { data, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => fetch('/api/applications').then((r) => r.json()),
  });
  if (isLoading) return <Skeleton rows={5} />;
  return <List items={data} />;
}
```

**Follow-up:** Can React Query run on the server?

---

### Q59. What is request deduplication in Next.js?

**Short definition:** Identical fetch calls in one render pass share a single network request.

**Answer:** If a layout and page both call `getLoan('gold')` with the same fetch options during one server render, Next.js dedupes to one HTTP call. Works per request, not across users. Helps avoid N+1 patterns when multiple components need the same data. Use consistent fetch URLs and options; wrap in `React.cache` for non-fetch deduplication.

```ts
import { cache } from 'react';

export const getLoan = cache(async (slug: string) => {
  return fetch(`${API}/loans/${slug}`, { next: { tags: [`loan-${slug}`] } }).then((r) => r.json());
});
```

**Follow-up:** Does deduplication work across Server Actions?

---

### Q60. What does `router.refresh()` do?

**Short definition:** It re-fetches server component data for the current route without a full navigation.

**Answer:** After a client-side mutation — toggling a setting, closing a modal that changed data — call `router.refresh()` from `next/navigation`. Next.js re-runs Server Components on the current URL and updates the UI. Does not reset client state in sibling Client Components unless they remount. Lighter than `window.location.reload()`. Often paired with Server Actions.

```ts
'use client';
import { useRouter } from 'next/navigation';

export function RefreshAfterSave() {
  const router = useRouter();
  return <button onClick={() => router.refresh()}>Refresh data</button>;
}
```

**Follow-up:** refresh vs push to same URL?

---

### Q61. Why should you never cache authenticated responses globally?

**Short definition:** Shared cache keys would leak one user's data to another.

**Answer:** ISR and force-cache store responses shared across all users hitting the same URL. A dashboard at `/dashboard` cached globally would show User A's loans to User B. Use `cache: 'no-store'` for personalized pages, or cache only the public shell with user-specific holes in Client Components. Middleware auth plus dynamic rendering ensures per-request personalization on the server.

```ts
export const dynamic = 'force-dynamic'; // dashboard — never ISR
```

**Follow-up:** Can you cache per-user with `unstable_cache`?

---

### Q62. How do `cookies()` and `headers()` affect data fetching?

**Short definition:** Using them opts the route into dynamic rendering — data must be fetched per request.

**Answer:** Reading cookies for session tokens or headers for geo/locale means output varies by request — static generation is impossible for that segment. Fetch user-specific APIs after reading session cookie with `no-store`. Avoid these calls in shared layouts wrapping public ISR pages. Isolate auth reads in `(app)` route group layouts, not root layout.

```ts
import { cookies } from 'next/headers';

export default async function ProtectedPage() {
  const session = (await cookies()).get('session')?.value;
  const data = await fetch(`${API}/me`, { cache: 'no-store' }).then((r) => r.json());
  return <Profile data={data} />;
}
```

**Follow-up:** Async cookies API in Next.js 15?

---

### Q63. What is `React.cache`?

**Short definition:** Per-request memoization for any function — dedupes calls during one server render.

**Answer:** `React.cache` wraps a function so repeated calls with same args during one request return cached result. Unlike `unstable_cache`, it does not persist across requests or builds. Use for DB accessors called from multiple Server Components in one tree. Pairs well with auth helpers that read session once per request.

```ts
import { cache } from 'react';
import { cookies } from 'next/headers';

export const getSession = cache(async () => {
  const token = (await cookies()).get('session')?.value;
  if (!token) return null;
  return verifySession(token);
});
```

**Follow-up:** React.cache vs unstable_cache?

---

### Q64. How do you handle slow APIs without blocking the whole page?

**Short definition:** Wrap slow Server Components in Suspense so fast content streams first.

**Answer:** Identify the slow dependency — credit score API, eligibility check — and isolate it in a child component inside `<Suspense fallback={<Skeleton />}>`. The page hero and navigation stream immediately. Optionally set `loading.tsx` at segment level for automatic boundaries. Consider moving non-critical widgets to client fetch if SEO does not need them in initial HTML.

```ts
export default function ApplyPage() {
  return (
    <>
      <ApplyForm />
      <Suspense fallback={<ScoreSkeleton />}>
        <CreditScorePanel />
      </Suspense>
    </>
  );
}
```

**Follow-up:** Timeout pattern for hung upstream APIs?

---

### Q65. What is the `fetchCache` route segment config?

**Short definition:** `fetchCache` overrides default fetch caching behavior for an entire route segment.

**Answer:** Export `fetchCache = 'default-cache' | 'only-cache' | 'force-cache' | 'force-no-store' | 'default-no-store'` to control all fetches in that segment. Useful when migrating from Next.js 14 to 15 defaults project-wide for specific marketing sections. Prefer explicit per-fetch options for clarity in new code.

```ts
export const fetchCache = 'default-cache';
export const revalidate = 300;
```

**Follow-up:** Segment config vs individual fetch options — which wins?

---

### Q66. How do you validate API responses at the server boundary?

**Short definition:** Parse external API data with Zod or similar before rendering.

**Answer:** Never trust API shape in production. Parse JSON through Zod schemas in Server Components or data layer functions. Fail gracefully with error boundaries if validation fails. TypeScript types alone do not validate runtime data. This pattern prevents malformed CMS or backend responses from crashing render.

```ts
import { z } from 'zod';

const LoanSchema = z.object({ slug: z.string(), rate: z.number(), name: z.string() });

export async function getLoan(slug: string) {
  const raw = await fetch(`${API}/loans/${slug}`).then((r) => r.json());
  return LoanSchema.parse(raw);
}
```

**Follow-up:** Where to put validation — page or lib layer?

---

## Server Actions & Forms

### Q67. What are Server Actions? [must-know]

**Short definition:** Server Actions are async server functions marked with `"use server"` callable from forms and Client Components.

**Answer:** They run only on the server, accept FormData or typed args, perform mutations, and integrate with cache revalidation. No separate API route needed for first-party forms. Progressive enhancement: forms work without JavaScript. Use for loan applications, profile updates, admin publish. Always validate and authorize inside the action — treat it like a POST endpoint.

```ts
'use server';
import { revalidatePath } from 'next/cache';

export async function submitApplication(formData: FormData) {
  const name = String(formData.get('name'));
  await db.application.create({ data: { name } });
  revalidatePath('/dashboard');
}
```

**Follow-up:** Server Action vs Route Handler?

---

### Q68. How does the `"use server"` directive work?

**Short definition:** It marks a file or inline function as server-only executable code.

**Answer:** Place at top of a file to make all exports Server Actions, or inline at the start of a function body inside a Server Component file. The compiler generates secure references for client invocation. Client never receives the function source. Cannot be defined inside Client Components unless imported from a separate server file. One server actions file per domain (auth, loans) keeps boundaries clear.

```ts
'use server';

export async function updateRate(id: string, rate: number) {
  await db.rate.update({ where: { id }, data: { rate } });
}
```

**Follow-up:** Can you colocate actions with page files?

---

### Q69. How do you wire forms to Server Actions?

**Short definition:** Pass the action to the form's `action` prop — with or without JavaScript.

**Answer:** `<form action={submitApplication}>` posts FormData to the server action. Inputs need `name` attributes. Works without JS (full page navigation) and enhances with JS for pending states. Use `useFormStatus` for submit button loading state and `useActionState` for error/success messages returned from the action.

```tsx
'use client';
import { useActionState } from 'react';
import { registerUser } from '@/actions/auth';

export function RegisterForm() {
  const [state, formAction] = useActionState(registerUser, null);
  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <button type="submit">Register</button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
```

**Follow-up:** What is `useFormStatus`?

---

### Q70. How do you secure Server Actions? [must-know]

**Short definition:** Authenticate, authorize, and validate inside every action — never trust the client.

**Answer:** Read session from cookies inside the action. Check role permissions before mutations. Validate FormData with Zod. Next.js includes origin checking for CSRF on actions. Do not expose admin actions without role checks — action IDs are callable if discovered. Rate-limit sensitive actions (OTP, payment) at server or API gateway level.

```ts
'use server';
import { auth } from '@/auth';
import { z } from 'zod';

export async function requestDisbursement(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  const amount = z.coerce.number().positive().parse(formData.get('amount'));
  await disburse(session.user.id, amount);
}
```

**Follow-up:** Are Server Actions public HTTP endpoints?

---

### Q71. Server Actions vs Route Handlers — when to use which?

**Short definition:** Actions for first-party UI mutations; Route Handlers for public HTTP APIs and webhooks.

**Answer:** Server Actions excel at form posts from your React app with automatic integration and revalidation. Route Handlers expose standard REST endpoints for mobile apps, third-party webhooks, CMS callbacks, and external consumers needing GET/PUT/DELETE. Bajaj pattern: Server Action for "Apply Now" form; Route Handler for `/api/revalidate` CMS webhook and mobile BFF endpoints.

```ts
export async function POST(req: Request) {
  const { secret, tag } = await req.json();
  if (secret !== process.env.REVALIDATE_SECRET) return new Response('Forbidden', { status: 403 });
  revalidateTag(tag);
  return Response.json({ ok: true });
}
```

**Follow-up:** Can mobile apps call Server Actions?

---

### Q72. How do you call Server Actions from Client Components manually?

**Short definition:** Import the action and invoke it in event handlers with optional `useTransition` for pending UI.

**Answer:** Beyond forms, call actions on button click: `await deleteLoan(id)`. Wrap in `startTransition` or track local pending state. Return structured `{ success, error }` objects for UI feedback. Call `router.refresh()` after success to update server-rendered lists. Do not expect synchronous return of complex non-serializable values.

```ts
'use client';
import { useTransition } from 'react';
import { deleteLoan } from '@/actions/loans';

export function DeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(async () => { await deleteLoan(id); })}
    >
      Delete
    </button>
  );
}
```

**Follow-up:** Error handling pattern for manual invocation?

---

### Q73. What is `useFormStatus`?

**Short definition:** A hook for child components to read the pending state of a parent form submission.

**Answer:** Must be used inside a component that is a descendant of a `<form>` using a Server Action. Provides `pending` boolean to disable submit buttons and show spinners without lifting state. Cannot be used in the same component that renders the `<form>` — extract a SubmitButton child. Works with progressive enhancement.

```ts
'use client';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>;
}
```

**Follow-up:** useFormStatus vs useActionState?

---

### Q74. How do Server Actions handle errors and validation?

**Short definition:** Return error objects to the client or throw for unexpected failures caught by error boundaries.

**Answer:** Validation errors should return `{ error: 'Invalid PAN format' }` for form display via `useActionState`. Unexpected errors can throw — consider try/catch and map to user-friendly messages. Never leak stack traces to clients. Log server-side for monitoring. Redirect on success with `redirect('/success')` from `next/navigation` inside the action.

```ts
'use server';

export async function applyLoan(_prev: unknown, formData: FormData) {
  const pan = String(formData.get('pan'));
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) return { error: 'Invalid PAN format' };
  await createApplication({ pan });
  redirect('/application/success');
}
```

**Follow-up:** Can redirect and return coexist in one action?

---

## Middleware & Auth

### Q75. What is Next.js Middleware? [must-know]

**Short definition:** Middleware runs on the Edge before a request completes — for auth, redirects, and rewrites.

**Answer:** Create `middleware.ts` at project root (or `src/`). Export a function receiving `NextRequest` and return `NextResponse.next()`, `redirect`, or `rewrite`. Configure `matcher` to limit paths — e.g. `/dashboard/:path*`. Runs globally fast but without full Node APIs. Ideal first gate for session cookie checks before any page renders.

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*'] };
```

**Follow-up:** Middleware vs auth check in layout?

---

### Q76. What is the Middleware `matcher` config?

**Short definition:** Matcher limits which paths trigger middleware — avoiding unnecessary Edge runs.

**Answer:** Use string patterns or arrays: `['/dashboard/:path*', '/api/protected/:path*']`. Exclude static files and `_next` by default in well-written matchers. Over-broad matchers slow every asset request. Negative lookahead regex can exclude file extensions. Document matcher scope in team README to prevent accidental global dynamic behavior.

```ts
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg)$).*)'],
};
```

**Follow-up:** Does middleware run on Server Actions?

---

### Q77. What are Edge runtime limitations in Middleware?

**Short definition:** Edge Middleware lacks full Node.js APIs — no native filesystem, limited DB drivers.

**Answer:** Middleware runs V8 isolates at the edge — fast cold starts globally. You cannot use Mongoose, native bcrypt, or heavy Node modules directly. Validate JWTs with edge-compatible libraries, or check cookie existence and defer full session validation to Server Components/Route Handlers. Auth.js supports edge middleware patterns. Keep middleware logic lightweight: cookie presence, role from JWT claims, geo routing.

```ts
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));
  await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
  return NextResponse.next();
}
```

**Follow-up:** When to validate session fully in layout instead?

---

### Q78. How do you implement cookie-based auth in Next.js?

**Short definition:** Set httpOnly session cookies on login; read them in middleware and Server Components.

**Answer:** Login Route Handler or Server Action validates credentials, creates server session, sets cookie with `httpOnly`, `secure`, `sameSite: 'lax'`, and `maxAge`. Middleware checks cookie on protected routes. Server Components call `cookies()` to load user context. Logout clears cookie. Never store JWT in localStorage on fintech apps — XSS risk. Prefer server-side session store for revocation.

```ts
import { cookies } from 'next/headers';

export async function login(formData: FormData) {
  'use server';
  const user = await verifyUser(formData);
  const store = await cookies();
  store.set('session', user.sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
  });
}
```

**Follow-up:** JWT in cookie vs server session ID?

---

### Q79. Middleware auth vs layout auth — which when?

**Short definition:** Middleware for early redirects; layout for loading user data and role-based UI.

**Answer:** Middleware stops unauthenticated users before rendering — saves compute and prevents flash of protected content. Layout auth fetches full user profile, roles, and permissions for nav rendering. Use both: middleware checks cookie exists; dashboard layout verifies session still valid and loads RBAC. Do not rely on hiding sidebar links alone — always enforce on server.

```ts
// middleware — fast gate
if (!session) return NextResponse.redirect('/login');

// app/dashboard/layout.tsx — full session
const user = await getCurrentUser();
if (!user) redirect('/login');
```

**Follow-up:** Flash of unauthorized content prevention?

---

### Q80. What is Auth.js (NextAuth v5)?

**Short definition:** Auth.js is the standard auth library for Next.js with providers, sessions, and middleware integration.

**Answer:** Configure in `auth.ts` with providers (Google, credentials), callbacks, and session strategy. Export `handlers` for Route Handler at `/api/auth/[...nextauth]`, `auth()` for Server Components, and `signIn`/`signOut` actions. Middleware can wrap `auth` export for protection. Supports database sessions and JWT. Enterprise fintech often wraps Auth.js with custom MFA and backend identity services.

```ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Credentials({ authorize: async (c) => verifyUser(c) })],
});
```

**Follow-up:** Credentials provider security considerations?

---

### Q81. How do you implement RBAC in Next.js?

**Short definition:** Store roles in session; check in middleware, layouts, Server Actions, and Route Handlers.

**Answer:** After login, session includes `role: 'admin' | 'agent' | 'customer'`. Middleware can block `/admin/*` for non-admins. Layouts conditionally render nav. Server Actions verify role before sensitive mutations. Never trust client-side role flags alone. Map roles to permissions in a central module. Bajaj-style apps often mirror backend RBAC with frontend gates plus API enforcement.

```ts
'use server';
import { auth } from '@/auth';

export async function approveLoan(id: string) {
  const session = await auth();
  if (session?.user?.role !== 'admin') throw new Error('Forbidden');
  await api.approveLoan(id);
}
```

**Follow-up:** Attribute-based vs role-based access?

---

### Q82. How do you protect Route Handlers and APIs?

**Short definition:** Verify session or API key inside every handler — UI hiding is not security.

**Answer:** Extract session from cookies or Bearer token at the start of each `GET`/`POST`. Return 401/403 JSON responses on failure. Sensitive operations (disbursement, KYC) should double-check on backend microservices too. Apply rate limiting at edge or API gateway. Log auth failures for security monitoring.

```ts
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  await processPayment(session.user.id, body);
  return Response.json({ ok: true });
}
```

**Follow-up:** CSRF protection for Route Handlers?

---

### Q83. JWT in httpOnly cookie vs localStorage?

**Short definition:** httpOnly cookies resist XSS theft; localStorage is readable by any script on the page.

**Answer:** Storing tokens in localStorage exposes them to XSS attacks — one injected script exfiltrates sessions. httpOnly cookies are not accessible from JavaScript. Combine with SameSite and Secure flags. If using JWT in cookies, keep payloads minimal and use short expiry plus refresh flow. For highest security, opaque session IDs with server-side store allow instant revocation.

```ts
store.set('token', jwt, { httpOnly: true, secure: true, sameSite: 'strict' });
```

**Follow-up:** How do SPAs using localStorage mitigate XSS?

---

### Q84. How do you debug auth redirect loops?

**Short definition:** Redirect loops happen when login and protected pages mutually redirect — usually cookie or matcher misconfiguration.

**Answer:** Check middleware matcher includes `/login` accidentally while login redirects to `/dashboard`. Verify cookie domain/path matches site. Ensure login success actually sets cookie before redirect. Log middleware decisions in dev. Exclude static assets from matcher. Confirm session cookie name consistent across login, middleware, and server reads.

```ts
export const config = { matcher: ['/dashboard/:path*'] };
```

**Follow-up:** SameSite=None requirements for cross-subdomain auth?

---

### Q85. How do you add security headers in Middleware?

**Short definition:** Middleware can inject CSP, HSTS, and X-Frame-Options on responses.

**Answer:** Clone `NextResponse.next()` and set headers before returning. Complements `next.config.js` headers. Useful for per-route policies — stricter CSP on admin. Fintech apps often mandate HSTS and frame denial for clickjacking protection.

```ts
export function middleware(request: NextRequest) {
  const res = NextResponse.next();
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  return res;
}
```

**Follow-up:** CSP nonce generation in App Router?

---

### Q86. How do you handle logout across tabs?

**Short definition:** Clear httpOnly cookie server-side and broadcast logout to other tabs via storage events if needed.

**Answer:** Server Action or Route Handler deletes session server-side and clears cookie with `maxAge: 0`. Client tabs can listen to `storage` event on a non-httpOnly flag for UX sync. Auth.js `signOut()` handles much of this. Ensure middleware immediately blocks after cookie clear.

```ts
'use server';
import { cookies } from 'next/headers';

export async function logout() {
  (await cookies()).delete('session');
  redirect('/login');
}
```

**Follow-up:** Server-side session invalidation importance?

---

## Route Handlers & API

### Q87. What are Route Handlers in the App Router? [must-know]

**Short definition:** Route Handlers are `route.ts` files exporting HTTP method functions for an API endpoint.

**Answer:** Place `app/api/loans/route.ts` to create `/api/loans`. Export `GET`, `POST`, `PUT`, `PATCH`, `DELETE` as needed. Use Web standard `Request` and `Response` objects. Colocate with frontend routes in one repo. Replace Pages Router `pages/api/*.ts`. Cannot exist in same folder as `page.tsx` for the same path.

```ts
export async function GET() {
  const loans = await db.loan.findMany();
  return Response.json(loans);
}

export async function POST(req: Request) {
  const body = await req.json();
  const loan = await db.loan.create({ data: body });
  return Response.json(loan, { status: 201 });
}
```

**Follow-up:** Route Handler vs Server Action?

---

### Q88. How do Route Handlers differ from `pages/api`?

**Short definition:** App Router uses Web Request/Response; Pages Router uses Node req/res objects.

**Answer:** Pages API: `export default function handler(req, res)`. App Router: named exports per HTTP verb with standard Fetch API. Route Handlers support Edge or Node runtime via export. Better alignment with modern standards and edge deployment. Migration rewrites handlers to named exports and replaces `res.status().json()` with `Response.json()`.

```ts
// app/api/loans/route.ts
export async function GET() {
  return Response.json({ loans: [] });
}
```

**Follow-up:** Can you use both API styles in one project?

---

### Q89. How do you read request body and query params in Route Handlers?

**Short definition:** Use `request.json()`, `request.formData()`, and URL searchParams.

**Answer:** `await request.json()` for JSON bodies. `request.nextUrl.searchParams.get('q')` for query strings. Validate all inputs. Set appropriate status codes: 400 validation, 401 auth, 404 missing, 500 server error. Return consistent JSON error shapes for client consumption.

```ts
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q') ?? '';
  return Response.json(await searchLoans(q));
}
```

**Follow-up:** Streaming responses from Route Handlers?

---

### Q90. How do you connect MongoDB in Route Handlers?

**Short definition:** Use a shared connection helper with connection pooling; call it at the start of each handler.

**Answer:** Mongoose connections should be cached globally in dev to survive HMR. Call `connectDB()` before queries. Route Handlers run in Node runtime by default — compatible with Mongoose. Keep DB logic in service modules, not inline in handlers. Handle duplicate key errors (11000) with 409 responses.

```ts
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  cached.conn = await mongoose.connect(process.env.MONGODB_URI!);
  return cached.conn;
}
```

**Follow-up:** Edge runtime with MongoDB?

---

### Q91. How do you handle CORS in Route Handlers?

**Short definition:** Set `Access-Control-*` headers on responses or handle OPTIONS preflight.

**Answer:** For public APIs consumed by other origins, export `OPTIONS` handler returning allowed methods and headers. Production fintech APIs usually restrict origins explicitly — not `*`. Prefer same-origin Next.js apps calling Route Handlers without CORS. BFF pattern keeps cookies same-site.

```ts
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://app.example.com',
      'Access-Control-Allow-Methods': 'GET, POST',
    },
  });
}
```

**Follow-up:** When is CORS unnecessary in Next.js?

---

### Q92. What is a webhook Route Handler pattern?

**Short definition:** Verify secret signature, parse payload, trigger side effects like cache revalidation.

**Answer:** CMS or payment webhooks POST to `/api/webhooks/cms`. Verify HMAC signature or shared secret before processing. Return 200 quickly; defer heavy work if needed. Call `revalidateTag` or enqueue jobs. Idempotency keys prevent duplicate processing on webhook retries.

```ts
export async function POST(req: Request) {
  if (req.headers.get('x-webhook-secret') !== process.env.WEBHOOK_SECRET) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { path } = await req.json();
  revalidatePath(path);
  return Response.json({ ok: true });
}
```

**Follow-up:** Webhook retry handling best practices?

---

### Q93. How do you set cookies from Route Handlers?

**Short definition:** Use `cookies()` from `next/headers` or set `Set-Cookie` on Response headers.

**Answer:** In App Router, `cookies().set()` in Route Handlers works similarly to Server Actions. For fine control, return `new Response(body, { headers: { 'Set-Cookie': '...' } })`. Login handlers set httpOnly cookies; logout clears them. Match attributes across set/delete operations.

```ts
export async function POST(req: Request) {
  const { sessionId } = await createSession(await req.json());
  (await cookies()).set('session', sessionId, { httpOnly: true, secure: true });
  return Response.json({ ok: true });
}
```

**Follow-up:** cookies() sync vs async in Next.js 15?

---

### Q94. How do you return custom status codes and headers?

**Short definition:** Use `Response.json(data, { status, headers })` or `new NextResponse`.

**Answer:** `Response.json({ error: 'Not found' }, { status: 404 })` for JSON APIs. `new Response(null, { status: 204 })` for empty success. Set cache headers on public GET endpoints: `Cache-Control: s-maxage=60, stale-while-revalidate`. Content negotiation via Accept headers when supporting multiple formats.

```ts
export async function GET() {
  return Response.json(await getPublicRates(), {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
  });
}
```

**Follow-up:** When to use 204 vs 200 with empty body?

---

### Q95. Can Route Handlers and `page.tsx` share the same folder?

**Short definition:** No — a route segment is either a page UI or an API handler, not both.

**Answer:** `app/api/loans/route.ts` and `app/loans/page.tsx` can coexist because paths differ. You cannot have `app/loans/page.tsx` and `app/loans/route.ts` — Next.js conflicts. Organize APIs under `app/api/**` and pages elsewhere. Colocate shared logic in `lib/` or `services/`.

```ts
// OK: app/loans/page.tsx + app/api/loans/route.ts
// NOT OK: app/loans/page.tsx + app/loans/route.ts
```

**Follow-up:** Route Handlers in Route Groups?

---

### Q96. How do you test Route Handlers?

**Short definition:** Import handler functions and call them with mock Request objects in Jest/Vitest.

**Answer:** Export handlers and unit test with `new Request('http://localhost/api/loans')`. Assert status and JSON body. Mock database layers. Integration tests hit running dev server with supertest or fetch. Test auth branches (401, 403) explicitly.

```ts
import { GET } from '@/app/api/loans/route';

test('GET returns loans', async () => {
  const res = await GET();
  expect(res.status).toBe(200);
});
```

**Follow-up:** E2E vs unit for API routes?

---

## Metadata & SEO

### Q97. How do you handle SEO metadata in App Router? [must-know]

**Short definition:** Export `metadata` or `generateMetadata` for titles, descriptions, and Open Graph tags.

**Answer:** Static pages export a `metadata` object. Dynamic loan pages use `generateMetadata` async function fetching product data. Metadata renders in `<head>` server-side — crawlers see it without JS. Combine with semantic HTML and ISR/SSG for indexable content. Root layout sets `metadataBase` for absolute OG URLs.

```ts
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loan = await getLoan(slug);
  return {
    title: `${loan.name} | Bajaj Finserv Direct`,
    description: loan.summary,
    openGraph: { images: [loan.ogImage] },
  };
}
```

**Follow-up:** metadata vs `next/head`?

---

### Q98. What is `metadataBase` and why use it?

**Short definition:** `metadataBase` in root layout resolves relative OG and canonical URLs to absolute URLs.

**Answer:** Without it, relative `/og.png` may not resolve correctly for social crawlers. Set `metadataBase: new URL('https://www.bajajfinserv.in')` in root layout metadata. Child pages inherit and override fields. Required for correct Twitter and Facebook preview cards in production.

```ts
export const metadata = {
  metadataBase: new URL('https://www.bajajfinserv.in'),
  title: { default: 'Bajaj Finserv Direct', template: '%s | Bajaj Finserv Direct' },
};
```

**Follow-up:** Dynamic metadataBase per environment?

---

### Q99. How do you generate sitemap and robots.txt?

**Short definition:** Export functions from `app/sitemap.ts` and `app/robots.ts` — Next.js serves them automatically.

**Answer:** `sitemap()` returns array of `{ url, lastModified, changeFrequency, priority }`. Fetch loan slugs from CMS or DB. `robots()` returns rules allowing/disallowing paths and sitemap URL. Keeps SEO files dynamic without manual XML maintenance. Submit sitemap in Google Search Console.

```ts
export default async function sitemap() {
  const loans = await getLoanSlugs();
  return loans.map((slug) => ({
    url: `https://www.bajajfinserv.in/loans/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
}
```

**Follow-up:** Split sitemaps for large sites?

---

### Q100. How do structured data and JSON-LD fit with Next.js?

**Short definition:** Inject JSON-LD script tags in Server Components for rich search results.

**Answer:** Add `<script type="application/ld+json">` with product or FAQ schema in loan pages. Server-render ensures crawlers receive it in initial HTML. Validate with Google Rich Results Test. Keep schema in sync with visible page content — mismatch triggers penalties.

```tsx
const jsonLd = { '@context': 'https://schema.org', '@type': 'FinancialProduct', name: loan.name };
return (
  <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <LoanContent loan={loan} />
  </>
);
```

**Follow-up:** dangerouslySetInnerHTML safety concerns?

---

### Q101. How does Next.js SSR/SSG help crawlers vs CSR SPAs?

**Short definition:** Server-rendered HTML delivers indexable content immediately; CSR SPAs often show empty shells to bots.

**Answer:** Google executes JS better than years ago, but SSR/SSG still gives faster, reliable indexing — critical for loan product SEO. Social crawlers (LinkedIn, WhatsApp) often do not run JS — OG tags and body content must be server-rendered. CSR-only dashboards behind login are fine without SEO. Marketing always gets server HTML.

```ts
export default async function PublicLoanPage() {
  const content = await getLoanContent();
  return <article>{content.body}</article>;
}
```

**Follow-up:** Dynamic rendering vs SEO trade-offs?

---

### Q102. What are canonical URLs in Next.js metadata?

**Short definition:** Canonical tells search engines the preferred URL when duplicate content exists.

**Answer:** Set `alternates: { canonical: 'https://...' }` in metadata. Important when query params (`?ref=`) create URL variants for the same loan page. Prevents duplicate indexing diluting rank. Use absolute URLs with metadataBase.

```ts
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { alternates: { canonical: `/loans/${slug}` } };
}
```

**Follow-up:** hreflang for multi-language sites?

---

## Performance & Images

### Q103. Why use `next/image` instead of `<img>`? [must-know]

**Short definition:** `next/image` optimizes format, size, lazy loading, and layout stability automatically.

**Answer:** It serves WebP/AVIF when supported, generates responsive srcsets, lazy-loads below-fold images, and prevents CLS with required dimensions or `fill`. Images cache on CDN after first optimization. Hero images on loan pages should use `priority` for LCP. Never ship multi-MB unoptimized PNG heroes on fintech marketing sites.

```tsx
import Image from 'next/image';

<Image
  src="/hero-gold-loan.jpg"
  alt="Gold loan at low interest"
  width={1200}
  height={600}
  priority
  sizes="(max-width: 768px) 100vw, 1200px"
/>
```

**Follow-up:** What is LCP and how does priority help?

---

### Q104. How do you configure remote images?

**Short definition:** Allow external hostnames in `next.config` via `remotePatterns` or legacy `domains`.

**Answer:** CMS and CDN images need explicit allowlisting. Use `remotePatterns` with protocol and hostname wildcards for flexibility. Without config, Next.js rejects external URLs at build/runtime. Self-hosted images in `public/` need no config.

```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'cdn.bajajfinserv.in', pathname: '/images/**' },
  ],
},
```

**Follow-up:** Custom image loader for external CDN?

---

### Q105. What are Core Web Vitals and how does Next.js help?

**Short definition:** LCP, INP, and CLS measure loading, interactivity, and visual stability.

**Answer:** LCP — largest paint element; fix with SSR/SSG, `next/image` priority, font preload. INP — input responsiveness; fix with less client JS, code splitting. CLS — layout shift; fix with image dimensions, `next/font`. Next.js defaults (RSC, automatic splitting) help all three. Monitor in production with Vercel Analytics or CrUX.

```ts
const Chart = dynamic(() => import('./HeavyChart'), { loading: () => <Skeleton />, ssr: false });
```

**Follow-up:** Target LCP threshold for good score?

---

### Q106. What is `next/font`?

**Short definition:** Self-hosted fonts at build time with zero layout shift from font swapping.

**Answer:** Import from `next/font/google` or `next/font/local`. Next.js downloads and serves fonts from your domain — no Google Fonts round trip. CSS size-variable fonts prevent CLS. Apply className to body in root layout. Eliminates FOIT/FOUT common with `@import` CSS fonts.

```ts
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], display: 'swap' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={inter.className}><body>{children}</body></html>;
}
```

**Follow-up:** Variable fonts vs static weights?

---

### Q107. What is `next/dynamic`?

**Short definition:** Lazy-loads components into separate JS chunks loaded on demand.

**Answer:** Wrap heavy components — charts, maps, rich editors — with `dynamic(() => import('./Chart'))`. Options: `loading` fallback, `ssr: false` for browser-only libs. Reduces initial bundle on marketing pages that only show charts after scroll or tab click. Do not dynamic-import everything — overhead for tiny components.

```ts
import dynamic from 'next/dynamic';

const EmiChart = dynamic(() => import('@/components/EmiChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
```

**Follow-up:** dynamic vs React.lazy difference in Next.js?

---

### Q108. How do you analyze and reduce bundle size?

**Short definition:** Use `@next/bundle-analyzer`, default to Server Components, and tree-shake imports.

**Answer:** Run analyzer on production build to find large dependencies. Keep pages as Server Components. Dynamic-import client-heavy widgets. Import named exports, not entire libraries. Check if date libraries or icon packs bloat client chunks. `next build` output shows per-route JS sizes — investigate anything over budget.

```js
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' });
module.exports = withBundleAnalyzer({});
```

**Follow-up:** What is a reasonable first-load JS budget?

---

### Q109. How does Link prefetching affect performance?

**Short definition:** Prefetch loads route resources early — faster navigations, higher background bandwidth.

**Answer:** Default prefetch in production for static links in viewport. Disable on low-priority links. Dynamic routes prefetch less. Balance on data-sensitive pages behind auth — consider `prefetch={false}`. Measuring Core Web Vitals on navigation paths validates prefetch strategy.

```tsx
<Link href="/loans/personal-loan" prefetch>Personal Loan</Link>
```

**Follow-up:** Prefetch and authenticated routes?

---

### Q110. What is `loading.tsx` impact on perceived performance?

**Short definition:** Instant skeleton UI improves perceived speed while server data loads.

**Answer:** Without loading UI, users stare at frozen previous page. `loading.tsx` shows immediately on navigation while server fetches. Pair with meaningful skeletons matching final layout to reduce CLS when content swaps. Streaming makes this automatic for Suspense boundaries.

```tsx
export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/2" />
      <div className="h-40 bg-gray-200 rounded" />
    </div>
  );
}
```

**Follow-up:** Skeleton vs spinner — which for fintech?

---

### Q111. How do you optimize third-party scripts?

**Short definition:** Use `@next/third-parties` or `next/script` with appropriate loading strategy.

**Answer:** Analytics and chat widgets block main thread if loaded synchronously. `next/script` strategies: `afterInteractive`, `lazyOnload`, `beforeInteractive` (critical only). Load GTM after hydration. Audit marketing tags quarterly — unused pixels hurt INP.

```tsx
import Script from 'next/script';
<Script src="https://www.googletagmanager.com/gtag/js?id=G-XXX" strategy="afterInteractive" />
```

**Follow-up:** Partytown for third-party offloading?

---

### Q112. What is static asset caching with `public/` folder?

**Short definition:** Files in `public/` serve at root URL with CDN caching — no bundling or optimization.

**Answer:** `/logo.svg` maps to `public/logo.svg`. Good for favicons, robots extras, downloadable PDFs. Large images still prefer `next/image` from public or remote. Set cache headers via config or CDN for immutable assets with hashed filenames from build output in `_next/static`.

```tsx
<a href="/brochures/gold-loan.pdf" download>Download brochure</a>
```

**Follow-up:** When to put images in public vs import?

---

## Error/Loading/Streaming

### Q113. How do Suspense boundaries work in App Router?

**Short definition:** Suspense wraps async Server Components and shows fallback until they resolve.

**Answer:** React suspends rendering when a child awaits data, shows nearest fallback, then streams resolved content. Nest boundaries — outer fast shell, inner slow widgets. Client Suspense also works with `React.lazy` and dynamic imports. Error boundaries do not catch async server errors the same way — use `error.tsx` for segment errors.

```tsx
<Suspense fallback={<RatesSkeleton />}>
  <LiveRates />
</Suspense>
```

**Follow-up:** Can you have Suspense inside Client Components?

---

### Q114. Why must `error.tsx` be a Client Component?

**Short definition:** Error boundaries require client-side React lifecycle to catch and recover from errors.

**Answer:** Server Components cannot be error boundaries in the React sense. `error.tsx` uses `'use client'` and receives `error` + `reset` to retry rendering the segment. Errors in Server Components bubble to nearest client error boundary. Log `error.digest` server-side for monitoring. `global-error.tsx` wraps root layout failures.

```tsx
'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Unable to load applications</h2>
      <button onClick={reset}>Retry</button>
    </div>
  );
}
```

**Follow-up:** error.tsx vs try/catch in Server Component?

---

### Q115. What is `global-error.tsx`?

**Short definition:** Root-level error UI when root layout itself throws — must include html and body tags.

**Answer:** Place `app/global-error.tsx` as client component wrapping entire app failures. Rare but critical for catastrophic errors in root layout. Normal segment errors use nested `error.tsx`. Test by temporarily throwing in root layout during development.

```tsx
'use client';
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html><body><h1>Something went wrong</h1><button onClick={reset}>Try again</button></body></html>
  );
}
```

**Follow-up:** Difference from `not-found.tsx`?

---

### Q116. `error.tsx` vs try/catch in Server Components?

**Short definition:** try/catch handles expected errors inline; error.tsx catches unexpected runtime throws in the segment.

**Answer:** Use try/catch when fetching optional data — show fallback UI for 404 API. Use `error.tsx` for unexpected exceptions — database down, null reference. `notFound()` for missing resources with proper 404 status. Combine: try/catch for business logic, error boundary for unhandled failures.

```ts
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  try {
    return <View data={await fetchData((await params).id)} />;
  } catch {
    notFound();
  }
}
```

**Follow-up:** Does error.tsx catch Server Action errors?

---

### Q117. How does streaming SSR improve TTFB perception?

**Short definition:** Bytes arrive sooner — browser paints partial page while slow parts still compute.

**Answer:** Traditional SSR blocked until all queries finished. Streaming flushes HTML shell early — user sees header and skeleton while eligibility API runs. TTFB improves because response starts immediately. Especially valuable when one third-party API is slow on loan application pages. Works automatically with Suspense in App Router.

```tsx
export default function Page() {
  return (
    <>
      <Header />
      <Suspense fallback={<FormSkeleton />}>
        <ApplicationForm />
      </Suspense>
    </>
  );
}
```

**Follow-up:** HTTP/2 requirement for streaming?

---

### Q118. What is `notFound()` vs error behavior?

**Short definition:** `notFound()` renders 404 UI; uncaught errors render 500 error boundary.

**Answer:** Call `notFound()` when resource legitimately missing — wrong loan slug. Returns 404 status for SEO (soft 404 avoided with proper status). Thrown errors hit `error.tsx` with 500 semantics. Do not call `notFound()` for API timeout — that is an error case. Search engines treat 404 vs 500 differently.

```ts
const loan = await getLoan(slug);
if (!loan) notFound();
```

**Follow-up:** Custom 404 for section vs global?

---

## Pages Router Legacy

### Q119. How does `getServerSideProps` map to App Router? [must-know]

**Short definition:** SSR in Pages Router equals dynamic Server Components with `cache: 'no-store'` or `dynamic = 'force-dynamic'`.

**Answer:** `getServerSideProps` ran on every request and passed props to page. App Router: async page component awaits fetch with no cache or reads cookies. No separate data function — data fetching colocated in component. Return shape becomes direct JSX instead of `{ props }`. Concepts identical, API simplified.

```ts
// App Router equivalent
export const dynamic = 'force-dynamic';
export default async function Page() {
  const data = await fetchData();
  return <View data={data} />;
}
```

**Follow-up:** getServerSideProps notFound and redirect?

---

### Q120. How do `getStaticProps` and `getStaticPaths` map to App Router?

**Short definition:** SSG → static/cached fetch; paths → `generateStaticParams`.

**Answer:** `getStaticProps` at build time maps to default static rendering with cached fetch or `generateStaticParams` for dynamic routes. `getStaticPaths` paths array equals `generateStaticParams` return value. ISR `revalidate` in getStaticProps maps to `export const revalidate` or fetch `next.revalidate`. Fallback behavior maps to `dynamicParams`.

```ts
export async function generateStaticParams() {
  return [{ slug: 'gold-loan' }, { slug: 'personal-loan' }];
}
export const revalidate = 3600;
```

**Follow-up:** fallback: 'blocking' equivalent?

---

### Q121. What are `_app.tsx` and `_document.tsx`?

**Short definition:** `_app` wraps all pages; `_document` customizes HTML document structure.

**Answer:** `_app.tsx` — global providers, layout, persistent state across Pages Router navigation. `_document.tsx` — `<Html>`, `<Head>`, `<body>` customization, lang attribute, third-party scripts in document. App Router replaces these with root `layout.tsx`. Migration moves providers from `_app` to root layout (client provider wrapper if needed).

```tsx
export default function App({ Component, pageProps }) {
  return <Provider store={store}><Component {...pageProps} /></Provider>;
}
```

**Follow-up:** Where do Redux providers go in App Router?

---

### Q122. How did Pages Router handle SEO with `next/head`?

**Short definition:** `next/head` injected tags client/server in Pages Router — replaced by Metadata API in App.

**Answer:** Import `Head` from `next/head`, add `<title>` and meta inside page components. Worked but less type-safe than metadata export. App Router `metadata` and `generateMetadata` are the replacement — do not mix `next/head` in App Router pages. Legacy maintenance only.

```tsx
import Head from 'next/head';
export default function Page({ loan }) {
  return (<><Head><title>{loan.name}</title></Head><main>{loan.body}</main></>);
}
```

**Follow-up:** Can you use next/head in app/ directory?

---

### Q123. What is `getInitialProps` and why avoid it?

**Short definition:** Legacy data fetching on client and server — disables automatic static optimization.

**Answer:** Predates getStatic/ServerSideProps. Ran on server for initial load and client on navigations. Disabled SSG for entire app if used in `_app`. Do not use in new code. Migrate to App Router or at minimum getStaticProps/getServerSideProps. Still seen in very old Next.js codebases.

```ts
Page.getInitialProps = async (ctx) => ({ data: await fetchData(ctx) });
```

**Follow-up:** Migration priority for getInitialProps pages?

---

### Q124. How do Pages Router API routes compare for migration?

**Short definition:** Rename to `route.ts`, split methods into named exports, swap req/res for Request/Response.

**Answer:** `pages/api/users.ts` default export handler becomes `app/api/users/route.ts` with GET/POST exports. Query parsing uses URL API. Response helpers become `Response.json()`. Keep business logic in shared services so both coexist during migration. Test parity before deleting old endpoints.

```ts
export async function GET() {
  return Response.json(await userService.list());
}
```

**Follow-up:** API versioning during migration?

---

### Q125. When would you keep Pages Router in a project?

**Short definition:** Large legacy codebase where incremental migration is safer than big-bang rewrite.

**Answer:** Keep Pages Router when migration cost exceeds benefit for stable modules — old admin panels, rarely touched reports. New features go in App Router. Shared components work across both. Set sunset criteria per module. Bajaj interviews may ask about maintaining hybrid repos — emphasize coexistence strategy.

```ts
// New feature → app/   Legacy admin → pages/admin/ until migration sprint
```

**Follow-up:** Tools to assist Pages → App migration?

---

### Q126. What is `next/router` vs `next/navigation`?

**Short definition:** `next/router` is Pages Router; `next/navigation` is App Router — different APIs.

**Answer:** App Router: `useRouter`, `usePathname`, `useSearchParams`, `useParams` from `next/navigation`. Pages: `useRouter` with `query`, `pathname`, `asPath` from `next/router`. Mixing imports causes runtime errors. New code always uses `next/navigation`. `router.events` for route change listeners exists only in Pages Router.

```ts
'use client';
import { useRouter, usePathname } from 'next/navigation';
```

**Follow-up:** Listening to navigation events in App Router?

---

## Deployment & Env

### Q127. How do environment variables work in Next.js? [must-know]

**Short definition:** Unprefixed vars are server-only; `NEXT_PUBLIC_` vars embed in the client bundle at build time.

**Answer:** `DATABASE_URL`, `API_SECRET` — never reach browser. `NEXT_PUBLIC_API_URL` — visible to anyone inspecting JS. Do not put secrets in NEXT_PUBLIC. Server Components, Route Handlers, and Middleware read unprefixed vars. Client Components only see NEXT_PUBLIC. Changing NEXT_PUBLIC requires rebuild.

```env
DATABASE_URL=postgresql://...
API_SECRET=abc123
NEXT_PUBLIC_SITE_URL=https://www.example.com
```

**Follow-up:** Runtime env vars on self-hosted Node?

---

### Q128. How do you deploy Next.js to Vercel?

**Short definition:** Connect Git repo — Vercel auto-detects Next.js and enables ISR, Edge, and preview URLs.

**Answer:** Push to GitHub, import in Vercel, set env vars in dashboard, deploy. Each PR gets preview URL. Production branch auto-deploys. ISR and middleware work out of box. Zero config for standard apps. Enterprise may add WAF, custom domains, and team access controls.

```json
{ "framework": "nextjs", "regions": ["bom1"] }
```

**Follow-up:** Vercel vs self-host for regulated fintech?

---

### Q129. How do you self-host Next.js?

**Short definition:** `next build` then `next start` on Node server behind reverse proxy/CDN.

**Answer:** Build produces optimized output in `.next`. Run `next start -p 3000` on VM or container. Nginx terminates TLS and proxies to Node. Configure env vars on server. ISR requires Node server — not compatible with pure static export. Scale horizontally with load balancer — sticky sessions rarely needed for stateless Next.

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
CMD ["npm", "start"]
```

**Follow-up:** `output: 'standalone'` for Docker?

---

### Q130. What does `output: 'export'` mean?

**Short definition:** Static HTML export — no SSR, API routes, ISR, or middleware at runtime.

**Answer:** Generates fully static site deployable to S3/any static host. All pages must be statically generatable. No Server Actions at runtime, no dynamic routes without generateStaticParams. Use only for marketing microsites with zero server needs. Wrong choice for authenticated Bajaj dashboard apps.

```ts
const nextConfig = { output: 'export' };
```

**Follow-up:** When is static export acceptable?

---

### Q131. What is `output: 'standalone'`?

**Short definition:** Minimal self-contained build folder for Docker — includes only required node_modules.

**Answer:** Produces `.next/standalone` with traced dependencies — smaller Docker images than full monorepo copy. Copy `public` and `.next/static` into standalone folder per docs. Standard pattern for AWS ECS/Kubernetes deployments. Reduces image size and attack surface.

```dockerfile
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
CMD ["node", "server.js"]
```

**Follow-up:** standalone vs full node_modules copy?

---

### Q132. How do CI/CD pipelines run Next.js builds?

**Short definition:** Install, lint, test, `next build`, then deploy artifact or container.

**Answer:** GitHub Actions typical flow: checkout → npm ci → eslint/tsc → jest → next build → deploy to Vercel or push Docker image. Fail pipeline on build errors — TypeScript and ESLint in CI catch issues pre-merge. Cache `.next/cache` for faster builds. Run Lighthouse CI on preview URLs for performance regression gates.

```yaml
- run: npm ci
- run: npm run lint
- run: npm run build
- run: npm test
```

**Follow-up:** Environment-specific builds vs runtime config?

---

### Q133. How do you manage env vars across dev/staging/prod?

**Short definition:** Separate `.env.local`, platform dashboard secrets, and never commit secrets to Git.

**Answer:** `.env.local` for local dev (gitignored). Staging/prod vars in Vercel/AWS Parameter Store. Use same variable names across environments, different values. Document required vars in `.env.example` without values. Rotate API secrets independently per environment. Audit NEXT_PUBLIC vars — they are public.

```env
# .env.example (committed)
MONGODB_URI=
NEXT_PUBLIC_SITE_URL=
REVALIDATE_SECRET=
```

**Follow-up:** Secret rotation without downtime?

---

## Scenarios & Tricky

### Q134. Design rendering for a gold loan product page. [must-know]

**Short definition:** ISR with 5-minute revalidation plus on-demand invalidation when CMS publishes rate changes.

**Answer:** The page is public, SEO-critical, and identical for anonymous users — perfect for static CDN delivery. Rates and offers change a few times daily, not every second — ISR with `revalidate: 300` balances freshness and performance. Wire CMS webhook to `revalidatePath('/loans/gold-loan')` on publish. Embed EMI calculator as Client Component island. Use `generateMetadata` for OG tags. Pre-build with `generateStaticParams` for known slugs.

```ts
export const revalidate = 300;

export default async function GoldLoanPage() {
  const product = await fetchProduct('gold-loan', { next: { tags: ['gold-loan'] } });
  return (
    <>
      <ProductHero product={product} />
      <EmiCalculator defaultRate={product.rate} />
    </>
  );
}
```

**Follow-up:** What if rates must never appear stale for compliance?

---

### Q135. Design rendering for a logged-in customer dashboard. [must-know]

**Short definition:** CSR or dynamic SSR for user-specific data — never ISR the dashboard HTML.

**Answer:** Dashboard shows application status, documents, and notifications unique per user — no SEO benefit. Use `dynamic = 'force-dynamic'` with server fetch reading session cookie for first paint, or CSR with React Query after lightweight shell. Middleware guards route. Never cache dashboard responses globally. Client widgets handle polling for status updates. SSR optional if faster first meaningful paint matters on mobile networks.

```ts
'use client';
export function Dashboard() {
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard });
  return <StatusGrid applications={data?.applications ?? []} />;
}
```

**Follow-up:** Hybrid — SSR shell + client polling?

---

### Q136. How would you handle interest rates updating every hour?

**Short definition:** ISR with 3600s revalidation plus on-demand `revalidateTag('rates')` when backend pushes updates.

**Answer:** Public rates page uses tagged fetch `{ tags: ['rates'], revalidate: 3600 }`. Backend cron or admin publish calls webhook Route Handler invoking `revalidateTag('rates')` for immediate freshness without waiting for timer. Display "last updated" timestamp from API for transparency. If compliance requires instant updates, shorten revalidate or switch to SSR for rates segment only inside Suspense.

```ts
fetch(`${API}/rates`, { next: { tags: ['rates'], revalidate: 3600 } });
```

**Follow-up:** Stale-while-revalidate UX indicator?

---

### Q137. How do you fix hydration mismatch errors?

**Short definition:** Ensure server and client render identical initial HTML — move browser logic to useEffect.

**Answer:** Common causes: `Date.now()`, `Math.random()`, `window` access during render, browser extensions. Fix by rendering placeholder on server and real value after mount in useEffect. Use `suppressHydrationWarning` only for known safe datetime displays. Compare View Source vs Elements panel to find diff. Never silence warnings without fixing root cause on fintech forms — wrong numbers confuse users.

```ts
'use client';
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <span>--</span>;
return <span>{localStorage.getItem('ref')}</span>;
```

**Follow-up:** Extension-caused mismatches in production?

---

### Q138. Strategy for 10,000 loan product pages at build?

**Short definition:** Pre-build top traffic slugs; generate long tail on first request with ISR.

**Answer:** `generateStaticParams` returns top 200 slugs from analytics. Set `dynamicParams: true` so remaining slugs generate on first visit then cache. Avoid 10k build times blocking deploy pipeline. Monitor cold-first-hit latency for long tail. Alternative: SSR for tail only via separate route group. CMS drives slug list API.

```ts
export async function generateStaticParams() {
  return (await getTopSlugs(200)).map((slug) => ({ slug }));
}
export const dynamicParams = true;
export const revalidate = 600;
```

**Follow-up:** Build timeout mitigation?

---

### Q139. EMI calculator on ISR loan page — architecture?

**Short definition:** Server ISR for product content; client island for calculator interactivity.

**Answer:** Rates in ISR HTML stay SEO-visible. Calculator reads `defaultRate` prop from server but recalculates client-side as user adjusts amount and tenure — no server round-trip per slider move. Optional: fetch live rate on mount if user session needs personalized pricing. Keeps JS small — only calculator bundle hydrates.

```tsx
<EmiCalculator defaultRate={product.rate} minAmount={product.minAmount} />
```

**Follow-up:** When would calculator need server-side validation?

---

### Q140. CMS publish webhook to revalidate pages?

**Short definition:** Secured Route Handler receives CMS event and calls revalidatePath or revalidateTag.

**Answer:** CMS sends POST on publish with secret header and affected paths/tags. Handler validates secret, calls `revalidatePath('/blog/new-post')` or `revalidateTag('cms')`. Returns 200 quickly. Log failures for replay. No full redeploy needed — editors see changes within seconds. Standard pattern for Bajaj content team updating loan copy.

```ts
export async function POST(req: Request) {
  if (req.headers.get('x-secret') !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { path, tag } = await req.json();
  if (path) revalidatePath(path);
  if (tag) revalidateTag(tag);
  return Response.json({ revalidated: true });
}
```

**Follow-up:** Debouncing burst CMS publishes?

---
