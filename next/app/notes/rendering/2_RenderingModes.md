# Static Site Generation (SSG) in Next.js

## What it does

Static Site Generation renders pages **at build time**, not on every request.

- Output is plain HTML + JSON
- Served from CDN
- Very fast and consistent performance
- No server execution at request time

---

## When to use SSG

Use SSG when:

- Content does not change per user
- Data changes infrequently
- SEO is important
- Performance is a priority

### Common use cases

- Marketing pages
- Blogs
- Documentation
- Product listing pages
- Landing pages

---

## When NOT to use SSG

Avoid SSG when:

- Page depends on authentication
- Page depends on cookies or headers
- Data must be real-time
- Content is user-specific or personalized

---

## Server Side Rendering (SSR)

Pages are rendered **on every request** on the server.

- Data is always fresh
- No HTML is reused between requests
- Slower than SSG due to server execution
- Useful for user-specific or real-time data

Common use cases:

- Authenticated pages
- Dashboards with live data
- Pages dependent on headers or cookies

---

## Incremental Static Regeneration (ISR)

Pages are rendered **once at build time** and **re-generated in the background** after a defined interval.

- Initial request serves cached static HTML
- Revalidation happens without blocking users
- Combines SSG performance with controlled freshness
- Slightly stale data is acceptable

Common use cases:

- Blogs
- Product listings
- Content that updates periodically

---

## How to use SSG in Next.js

### 1. App Router

SSG is the **default behavior** in the App Router.

```ts
// app/blog/page.tsx
export default async function BlogPage() {
  const posts = await fetch("https://api.example.com/posts", {
    cache: "force-cache",
  }).then((res) => res.json());

  return <PostList posts={posts} />;
}
```

### 2. Dynamic routes with SSG

Used when pages depend on params like slug.

```ts
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetch("https://api.example.com/posts").then((r) => r.json());

  return posts.map((p: any) => ({
    slug: p.slug,
  }));
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await fetch(`https://api.example.com/posts/${params.slug}`, { cache: "force-cache" }).then(
    (r) => r.json()
  );

  return <Article post={post} />;
}
```

### How SSG works internally

- next build runs locally or on CI
- Data is fetched at build time
- Static HTML files are generated
- Files are deployed to CDN
- Users get instant responses
- No server-side logic runs during page load.

# Next.js Rendering Controls

---

## 1. `export const revalidate = 10000`

### What it does

- Enables Incremental Static Regeneration (ISR)
- Page is cached
- After 10,000 seconds, Next.js revalidates the page in the background
- Users may see stale data until revalidation completes

---

### Component-level usage

```ts
// app/products/page.tsx
export const revalidate = 10000;

export default async function ProductsPage() {
  const data = await fetch("https://api.example.com/products").then((res) => res.json());

  return <Products data={data} />;
}
```

## When to use

- Data changes occasionally
- You want caching with controlled freshness
- Blogs, product lists, non-realtime dashboards

## 2. export const dynamic = "force-dynamic"

## What it does

- Forces Server-Side Rendering (SSR)
- Page renders on every request
- No caching
- Data is always fresh

```ts
// app/orders/[id]/page.tsx
export const dynamic = "force-dynamic";

export default async function OrderPage({ params }) {
  const order = await fetch(`https://api.example.com/orders/${params.id}`).then((res) => res.json());

  return <Order order={order} />;
}

// Fetch-level equivalent

fetch(url, {
  cache: "no-store",
});
```

### When to use

- Authenticated pages
- User-specific data
- Real-time or frequently changing data

## 3. export const dynamic = "force-static"

### What it does

- Forces Static Site Generation (SSG)
- Page is generated at build time
- Cached forever
- No runtime rendering

```ts
// app/blog/page.tsx
export const dynamic = "force-static";

export default async function BlogPage() {
  const posts = await fetch("https://api.example.com/posts").then((res) => res.json());

  return <PostList posts={posts} />;
}

// Fetch-level

fetch(url, {
  cache: "force-cache",
});
```

### When to use

- Marketing pages
- Blogs
- Documentation
- Landing pages

## 4. export const dynamic = "error"

### What it does

Enforces strict Static Site Generation
Build fails if any dynamic behavior is detected
Dynamic behavior includes:
cookies()
headers()

```ts
// app/docs/page.tsx
export const dynamic = "error";

export default async function DocsPage() {
  const docs = await fetch("https://api.example.com/docs").then((res) => res.json());

  return <Docs docs={docs} />;
}
```

- If any dynamic API is used, the build will fail.

| Setting             | Rules                            |
| ------------------- | -------------------------------- |
| `revalidate`        | Works with SSG and ISR           |
| `force-dynamic`     | Cannot be used with `revalidate` |
| `force-static`      | Can be used with `revalidate`    |
| `dynamic = "error"` | No dynamic APIs allowed          |

### One-line summary

- revalidate → cached page with background refresh
- force-dynamic → always SSR
- force-static → pure SSG
- error → strict SSG enforcement
