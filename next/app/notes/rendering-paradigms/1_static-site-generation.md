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

<!-- vs -->

SSG vs SSR vs ISR

## SSG

Build once
Serve forever
Fastest

## SSR

Render on every request
Always fresh
Slower than SSG

## ISR

Build once
Revalidate in background
Balance between speed and freshness
