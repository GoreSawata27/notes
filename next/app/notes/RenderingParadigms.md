| Paradigm  | When HTML is Generated | Speed             | SEO       |
| --------- | ---------------------- | ----------------- | --------- |
| SSG       | Build time             | Very fast         | Excellent |
| SSR       | Request time           | Medium            | Excellent |
| ISR       | Build + revalidate     | Fast              | Excellent |
| Streaming | Incremental            | Fast perceived    | Excellent |
| CSR       | Client only            | Slower first load | Weak      |
| PPR       | Hybrid                 | Fast              | Excellent |

# Next.js Rendering Paradigms

## SSR – Server-Side Rendering

HTML is generated on the **server for every request** using fresh data.

---

## SSG – Static Site Generation

HTML is generated **at build time** and reused for all users.

---

## ISR – Incremental Static Regeneration

Static HTML that is **revalidated and regenerated in the background** after a set time.

---

## CSR – Client-Side Rendering

Rendering happens **in the browser** after JavaScript loads.

---

## Streaming Rendering

HTML is **sent in chunks** as data resolves instead of waiting for everything.

---

## Partial Prerendering (PPR)

Static page shell with **dynamic parts rendered separately**.

---

## Static Rendering

Route is rendered **once at build time** and served from CDN.

---

## Dynamic Rendering

Route is rendered **on every request** on the server.

---

## Server Components (RSC)

Components that render **only on the server** and send no JS to the browser.

---

## Client Components

Components that render on the client and support **interactivity and hooks**.

---

## Hydration

Process where client JavaScript **adds interactivity** to server-rendered HTML.

---

## Edge Rendering

Rendering happens **on edge servers**, closer to the user.

---

## Prefetching

Next.js **loads code and data early** before navigation.

---

## Revalidation

Refreshing static data **without rebuilding the entire app**.

---

## Fallback Rendering

Showing a temporary UI while **content is loading or generating**.

---

## CSR-only Page

Page rendered **entirely in the browser**, no server HTML.

---

## Rule

- Static first
- ISR if data changes
- SSR for user-specific data
- Stream slow parts
- CSR only when needed
