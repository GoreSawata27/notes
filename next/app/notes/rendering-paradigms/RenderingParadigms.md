| Paradigm  | When HTML is Generated | Speed             | SEO       |
| --------- | ---------------------- | ----------------- | --------- |
| SSG       | Build time             | Very fast         | Excellent |
| SSR       | Request time           | Medium            | Excellent |
| ISR       | Build + revalidate     | Fast              | Excellent |
| Streaming | Incremental            | Fast perceived    | Excellent |
| CSR       | Client only            | Slower first load | Weak      |
| PPR       | Hybrid                 | Fast              | Excellent |

# Rendering Paradigms in Next.js

---

## Static Rendering (SSG)

Route is rendered **once at build time** and served from CDN.

- HTML is generated during `next build`
- Same HTML is reused for all users
- Very fast and cache-friendly
- Default behavior in App Router

**Used when:**

- Data does not change often
- Page is public and same for everyone
- No user-specific data

**Examples:**

- Landing pages
- Docs
- Blogs

---

## Dynamic Rendering (SSR)

Route is rendered **on every request** on the server.

- HTML is generated at request time
- Always shows latest data
- Slower than static rendering
- Cannot be cached globally

**Triggered when:**

- Using `cookies()` or `headers()`
- Using `fetch` with `cache: "no-store"`
- Marked as `force-dynamic`

**Used when:**

- User-specific or role-based pages
- Authenticated dashboards
- Real-time or frequently changing data

---

## Incremental Static Regeneration (ISR)

Static page that is **re-generated in the background** after a given time.

- First request serves cached HTML
- New HTML is generated after revalidation time
- Combines speed of static + freshness

**Used when:**

- Data updates periodically
- Content does not need real-time updates

**Examples:**

- Blog posts
- Product listings
- Marketing pages with updates

---

## Client-Side Rendering (CSR)

Rendering happens **in the browser** after JavaScript loads.

- Server sends minimal HTML
- Data is fetched on client
- Slower first load
- SEO is weaker

**Used when:**

- Heavy interactivity
- Real-time updates
- Charts, filters, modals

---

## Streaming Rendering

HTML is **sent in parts (chunks)** as data becomes available.

- Page does not wait for all data
- Improves perceived performance
- Works with React Suspense

**Used when:**

- Page has multiple independent sections
- Some data is slow

---

## Partial Prerendering (PPR)

Static page shell with **dynamic sections rendered separately**.

- Layout and shell are static
- Dynamic parts stream later
- Best of static and dynamic

**Used when:**

- Mostly static page
- Small dynamic widgets inside

---

## Server Components (RSC)

Components rendered **only on the server**.

- No JS sent to browser
- Can access backend resources
- Better performance

**Used when:**

- Data fetching
- Rendering static UI
- No interactivity required

---

## Client Components

Components rendered **on the client**.

- Supports hooks and state
- Required for interactivity
- Adds JS to bundle

**Used when:**

- Buttons, forms, modals
- Charts, animations
- WebSockets

---

## Hydration

Process where client JavaScript **attaches interactivity** to server-rendered HTML.

- Happens after HTML is loaded
- Makes page interactive
- Required for client components

---

## Edge Rendering

Rendering happens on **edge servers close to users**.

- Lower latency
- Faster response
- Limited Node APIs

**Used when:**

- Auth checks
- Personalization
- Global users

---

## Revalidation

Process of updating static content **without rebuilding the app**.

- Happens in background
- Keeps data fresh
- Used with ISR

---

## Prefetching

Next.js automatically **fetches code and data ahead of navigation**.

- Improves navigation speed
- Happens on hover or viewport

---

## Interview Mental Model

- Static by default
- ISR if data changes
- SSR for user-specific content
- Stream slow parts
- CSR only when needed
