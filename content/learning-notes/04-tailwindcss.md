# Tailwind CSS Learning Notes

A progressive, hands-on guide to **Tailwind CSS v4** — the CSS-first configuration model used in this Next.js project (`@import "tailwindcss"`, `@tailwindcss/postcss`, `@theme inline`). Each lesson builds on the last. Read the takeaway first, study the explanation and code, then complete the exercise.

---

## v4 setup & philosophy

### Lesson 1. Tailwind v4: CSS-first setup in this project

**Takeaway:** Tailwind v4 is a PostCSS plugin you import directly in CSS. There is no `tailwind.config.js` required — configuration lives in your stylesheet with `@theme`, `@source`, and standard CSS variables.

**Explain:** In v3 you typically had three layers: a JS config file, `@tailwind base/components/utilities` directives, and PostCSS. v4 collapses that into one CSS entry point. This repo already follows the v4 pattern:

```css
/* postcss.config.mjs — only the plugin, no config path */
/* plugins: { "@tailwindcss/postcss": {} } */

/* src/app/globals.css */
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

The `@import "tailwindcss"` line pulls in Tailwind's engine: preflight (modern reset), theme tokens, and every utility class. PostCSS runs at build time, scans your source files for class names, and emits only the CSS you actually use.

**Tip:** Install the **Tailwind CSS IntelliSense** VS Code extension. It reads `@theme` blocks and suggests utilities like `bg-background` and `text-foreground` that map to your custom tokens.

**Try it:** Open `src/app/globals.css` in this project. Confirm `@import "tailwindcss"` is the first line and that `@theme inline` defines at least one custom color. Add `--color-brand: #2563eb;` inside `@theme inline`, then use `bg-brand text-white p-4` on a test `<div>` in any page.

---

### Lesson 2. Utility-first philosophy: constraints beat freedom

**Takeaway:** Tailwind gives you a constrained design system (spacing scale, color palette, type scale) as composable class names in markup. You trade semantic CSS class names for speed, consistency, and fewer context switches between HTML and CSS files.

**Explain:** Traditional CSS often grows like this: you invent `.card-title`, `.card-body`, `.card-footer`, then fight specificity when a variant needs a tweak. Utility-first flips the model — one class does one job:

```html
<article class="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
  <h2 class="text-lg font-semibold text-zinc-900">Weekly report</h2>
  <p class="mt-2 text-sm leading-relaxed text-zinc-600">
    Revenue up 12% compared to last week.
  </p>
  <button class="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
    View details
  </button>
</article>
```

Each utility maps to a single CSS declaration (or a tight group). `mt-4` is always `margin-top: 1rem` (in the default scale). `text-sm` is always the same font size. That predictability is the product — not the HTML verbosity.

When markup feels noisy, the fix is usually **extract a component** (React, Vue, partial), not write a giant stylesheet.

**Tip:** Read utilities left-to-right as a sentence: layout → spacing → typography → color → effects. `flex items-center gap-2 text-sm text-zinc-500` reads naturally once you internalize the vocabulary.

**Try it:** Take a card you styled with plain CSS elsewhere and rebuild it using only Tailwind utilities. List which utilities replaced each of your old class rules.

---

### Lesson 3. `@theme`, design tokens, and how utilities are generated

**Takeaway:** In v4, theme values are CSS custom properties inside `@theme`. Tailwind generates utility classes (`bg-*`, `text-*`, `p-*`, `font-*`) from those variables automatically — including your custom tokens.

**Explain:** The `@theme` block declares design tokens. Tailwind reads them and creates matching utilities:

```css
@import "tailwindcss";

@theme {
  /* Spacing, colors, fonts, breakpoints — all CSS variables */
  --color-brand: oklch(0.55 0.2 260);
  --color-brand-muted: oklch(0.92 0.04 260);
  --font-display: "Inter", system-ui, sans-serif;
  --breakpoint-3xl: 120rem;
}
```

```html
<h1 class="font-display text-3xl text-brand">Dashboard</h1>
<div class="bg-brand-muted p-4">Token-backed surface</div>
```

This project uses `@theme inline` to **alias** existing CSS variables rather than redefine them:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

That pattern lets you swap `:root` values at runtime (e.g., dark mode via `prefers-color-scheme`) while utilities like `bg-background` stay stable.

Spacing utilities (`p-4`, `gap-6`, `mt-8`) come from Tailwind's default `--spacing-*` scale. Colors need the `--color-*` prefix. Fonts need `--font-*`. Breakpoints use `--breakpoint-*` and power responsive prefixes like `md:` and `lg:`.

**Tip:** Name tokens for **role**, not hue: `--color-surface`, `--color-muted`, `--color-danger` survive redesigns better than `--color-blue-500`.

**Try it:** Add three tokens to `@theme inline`: `--color-surface`, `--color-muted`, and `--color-accent`. Build a two-tone layout using `bg-surface`, `text-muted`, and `border-accent` only.

---

## Layout, spacing, typography utilities

### Lesson 4. Box model utilities: size, padding, margin, border

**Takeaway:** Tailwind exposes the box model as predictable shorthand utilities. `p-*` and `m-*` use the spacing scale; `w-*`/`h-*` control dimensions; `border-*` handles edges — all without leaving your markup.

**Explain:** Spacing utilities follow `{property}{side?}-{size}`:

| Pattern | CSS equivalent |
|---------|----------------|
| `p-4` | `padding: 1rem` |
| `px-6` | horizontal padding |
| `pt-2 pb-8` | top and bottom separately |
| `m-auto` | center block horizontally |
| `-mt-2` | negative margin (pull overlap) |

```html
<div class="mx-auto w-full max-w-md border border-zinc-200 p-6">
  <div class="mb-4 h-2 w-full rounded-full bg-zinc-100">
    <div class="h-2 w-3/4 rounded-full bg-emerald-500"></div>
  </div>
  <p class="text-sm text-zinc-600">75% complete</p>
</div>
```

Size utilities: `w-full`, `w-1/2`, `max-w-prose`, `h-screen`, `min-h-0` (critical in flex children). Borders: `border`, `border-2`, `border-t`, `border-zinc-200`, `rounded-lg`, `rounded-full`.

**Tip:** `max-w-*` + `mx-auto` is the standard centered column pattern. Pair `max-w-prose` with long-form text for readable line lengths (~65 characters).

**Try it:** Build a progress bar card with `max-w-sm`, inner padding `p-5`, a `rounded-full` track, and a filled bar at 60% width using `w-3/5`.

---

### Lesson 5. Display, position, and overflow

**Takeaway:** Layout behavior starts with `display` (`block`, `flex`, `grid`, `hidden`), layering with `position` + inset utilities (`absolute inset-0`), and clipping with `overflow-*`.

**Explain:**

```html
<!-- Fixed header over scrolling content -->
<header class="fixed inset-x-0 top-0 z-50 border-b bg-white/80 backdrop-blur">
  <nav class="mx-auto flex h-14 max-w-6xl items-center px-4">...</nav>
</header>

<main class="pt-14">
  <!-- offset for fixed header height -->
</main>

<!-- Badge on avatar -->
<div class="relative inline-block">
  <img class="size-12 rounded-full" src="/avatar.jpg" alt="" />
  <span
    class="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-emerald-500"
  ></span>
</div>

<!-- Scrollable panel -->
<div class="max-h-64 overflow-y-auto rounded-lg border p-4">
  <!-- long list -->
</div>
```

Key utilities: `relative`, `absolute`, `fixed`, `sticky top-0`, `inset-0`, `top-4 right-4`, `z-10`, `z-50`, `overflow-hidden`, `overflow-x-auto`, `truncate` (single-line ellipsis), `line-clamp-3` (multi-line clamp).

**Tip:** `sticky` needs a scrolling ancestor without `overflow-hidden` on the parent chain — a common reason sticky headers fail silently.

**Try it:** Create an avatar with an online-status dot using `relative` on the wrapper and `absolute -bottom-0.5 -right-0.5` on the dot.

---

### Lesson 6. Typography utilities: size, weight, leading, tracking

**Takeaway:** Tailwind's type scale (`text-xs` through `text-9xl`) pairs with `font-*`, `leading-*`, `tracking-*`, and `text-*` color utilities to compose readable hierarchy without custom CSS.

**Explain:**

```html
<article class="max-w-prose space-y-4">
  <p class="text-xs font-medium uppercase tracking-wider text-zinc-500">
    Case study
  </p>
  <h1 class="text-4xl font-bold tracking-tight text-zinc-900">
    Shipping faster with utility-first CSS
  </h1>
  <p class="text-lg leading-relaxed text-zinc-600">
    Body copy benefits from <code class="rounded bg-zinc-100 px-1 py-0.5 text-sm">leading-relaxed</code>
    and a constrained width.
  </p>
  <h2 class="text-2xl font-semibold text-zinc-900">Key results</h2>
  <ul class="list-disc space-y-2 pl-5 text-base text-zinc-700">
    <li>40% fewer CSS files</li>
    <li>Consistent spacing across pages</li>
  </ul>
</article>
```

Font families from theme: `font-sans`, `font-mono`, or your custom `font-display`. Decoration: `underline`, `line-through`, `decoration-2`, `underline-offset-4`. Alignment: `text-left`, `text-center`, `text-right`, `text-balance` (headline wrapping).

**Tip:** Limit yourself to three sizes per view (e.g., `text-sm`, `text-base`, `text-2xl`) until you need more — visual hierarchy stays cleaner.

**Try it:** Style a blog post header with an eyebrow (`text-xs uppercase tracking-wider`), title (`text-4xl font-bold tracking-tight`), and subtitle (`text-lg text-zinc-600`).

---

### Lesson 7. Colors, opacity, gradients, and shadows

**Takeaway:** Color utilities use the `--color-*` theme tokens. Modifiers like `/50` set opacity. Gradients and shadows are single-class effects built from the same token system.

**Explain:**

```html
<!-- Solid colors with opacity modifier -->
<div class="bg-blue-600/10 text-blue-700 ring-1 ring-blue-600/20">
  Info banner
</div>

<!-- Gradient background -->
<div
  class="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-xl"
>
  <h3 class="text-xl font-semibold">Pro plan</h3>
  <p class="mt-2 text-violet-100">Everything you need to scale.</p>
</div>

<!-- Shadow scale: shadow-sm → shadow-2xl -->
<button
  class="rounded-lg bg-zinc-900 px-5 py-2.5 text-white shadow-md transition hover:shadow-lg"
>
  Upgrade
</button>
```

Project tokens: `bg-background`, `text-foreground` resolve through `@theme inline`. Arbitrary values escape the scale when needed: `bg-[#1a1a2e]`, `text-[13px]`, `shadow-[0_8px_30px_rgba(0,0,0,0.12)]`.

**Tip:** Prefer semantic tokens (`bg-background`) in app shells and marketing accents (`from-violet-600`) in hero sections — mixing both is fine when boundaries are clear.

**Try it:** Build a pricing highlight card with a diagonal gradient, white text, and `shadow-xl`. Add a sibling muted card using `bg-zinc-50` and `shadow-sm` for contrast.

---

### Lesson 8. Spacing composition with `space-*` and `gap-*`

**Takeaway:** Instead of sprinkling `mt-*` on every sibling, use `space-y-*` on a parent for vertical rhythm or `gap-*` inside flex/grid containers. Both use the same spacing scale.

**Explain:**

```html
<!-- space-y: adds margin-top to all children except the first -->
<section class="space-y-6">
  <h2 class="text-2xl font-bold">Settings</h2>
  <p class="text-zinc-600">Manage your account preferences.</p>
  <form class="space-y-4">
    <label class="block space-y-1">
      <span class="text-sm font-medium">Email</span>
      <input class="w-full rounded-md border px-3 py-2" type="email" />
    </label>
    <label class="block space-y-1">
      <span class="text-sm font-medium">Password</span>
      <input class="w-full rounded-md border px-3 py-2" type="password" />
    </label>
  </form>
</section>

<!-- gap: preferred inside flex/grid — no margin collapse surprises -->
<div class="flex flex-wrap gap-3">
  <span class="rounded-full bg-zinc-100 px-3 py-1 text-sm">React</span>
  <span class="rounded-full bg-zinc-100 px-3 py-1 text-sm">Next.js</span>
  <span class="rounded-full bg-zinc-100 px-3 py-1 text-sm">Tailwind</span>
</div>
```

Rule of thumb: **`gap-*` in flex/grid**, **`space-y-*` in plain block stacks**, **`space-x-*` for horizontal inline groups** (or switch to flex with `gap`).

**Tip:** `space-y-*` breaks down if you conditionally render children with wrappers — flex + `gap` is more resilient in component frameworks.

**Try it:** Refactor a form that uses `mt-4` on every field into a parent with `space-y-4`. Then rebuild the tag list using `flex gap-2` instead of `mr-2` on each tag.

---

## Flex & grid utilities

### Lesson 9. Flexbox fundamentals: direction, alignment, wrapping

**Takeaway:** `flex` turns on flexbox. Combine `flex-row`/`flex-col`, `items-*` (cross axis), `justify-*` (main axis), and `flex-wrap` to solve most one-dimensional layouts without custom CSS.

**Explain:**

```html
<!-- Toolbar: space between, vertically centered -->
<div class="flex items-center justify-between gap-4 border-b px-4 py-3">
  <span class="font-semibold">Documents</span>
  <button class="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white">
    New
  </button>
</div>

<!-- Vertical stack inside horizontal row -->
<div class="flex gap-4">
  <div class="size-10 shrink-0 rounded-full bg-zinc-200"></div>
  <div class="min-w-0 flex-1">
    <p class="truncate font-medium">Alex Chen</p>
    <p class="truncate text-sm text-zinc-500">Updated 2 hours ago</p>
  </div>
</div>

<!-- Centered modal content -->
<div class="flex min-h-screen items-center justify-center p-4">
  <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">...</div>
</div>
```

Critical utilities: `shrink-0` (icons don't squash), `min-w-0` + `truncate` (text ellipsis in flex children), `flex-1` (grow to fill), `grow`, `basis-1/3`.

**Tip:** When flex children overflow horizontally, add `min-w-0` to the text container before reaching for `overflow-hidden`.

**Try it:** Build a list row with avatar, two-line text (title + subtitle), and a trailing chevron aligned with `justify-between items-center`.

---

### Lesson 10. Flex item sizing: grow, shrink, and order

**Takeaway:** Control how flex children share space with `flex-1`, `grow-0`, `shrink`, and `basis-*`. Use `order-*` sparingly for visual reordering — especially alongside responsive prefixes.

**Explain:**

```html
<div class="flex flex-col gap-4 md:flex-row">
  <!-- Sidebar: fixed width on desktop, full width on mobile -->
  <aside class="w-full shrink-0 md:w-64">
    <nav class="space-y-1">...</nav>
  </aside>

  <!-- Main: consumes remaining space -->
  <main class="min-w-0 flex-1">
    <h1 class="text-2xl font-bold">Overview</h1>
    <!-- content -->
  </main>

  <!-- Optional panel: hide on small screens -->
  <aside class="hidden w-72 shrink-0 lg:block">
    Activity feed
  </aside>
</div>
```

`flex-none` = don't grow or shrink. `basis-1/2` sets initial size before free space distribution. For equal columns: `grid grid-cols-3` is often simpler than three `flex-1` siblings.

**Tip:** Prefer DOM order that matches reading order for accessibility; use `order-*` only for visual tweaks, not to scramble tab focus.

**Try it:** Create a three-column dashboard shell: sidebar `w-64 shrink-0`, main `flex-1`, right rail `w-80 hidden xl:block`.

---

### Lesson 11. CSS Grid: columns, rows, spans, and gaps

**Takeaway:** `grid` handles two-dimensional layouts. Define tracks with `grid-cols-*`, place items with `col-span-*`/`row-span-*`, and unify spacing with `gap-*`.

**Explain:**

```html
<!-- Responsive card grid -->
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
  <article class="rounded-xl border p-5">Card 1</article>
  <article class="rounded-xl border p-5">Card 2</article>
  <article class="rounded-xl border p-5">Card 3</article>
</div>

<!-- Dashboard with spanning hero -->
<div class="grid grid-cols-12 gap-4">
  <header class="col-span-12 rounded-lg bg-zinc-900 p-6 text-white">
    Welcome back
  </header>
  <section class="col-span-12 lg:col-span-8 rounded-lg border p-4">
    Chart area
  </section>
  <aside class="col-span-12 lg:col-span-4 rounded-lg border p-4">
    Stats
  </aside>
</div>
```

Auto-fit pattern for fluid columns: `grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4`. Subgrid (`grid grid-rows-subgrid`) helps aligned card internals when browser support allows.

**Tip:** A 12-column grid mirrors common design tools — `col-span-8` + `col-span-4` maps cleanly to designer comps.

**Try it:** Build a photo gallery: 1 column on mobile, 2 on `sm`, 3 on `lg`, uniform `gap-4`, each image `aspect-square object-cover rounded-lg`.

---

### Lesson 12. Alignment in grid and mixing flex + grid

**Takeaway:** Grid uses `place-items-*`, `items-*`, `justify-items-*`, and `content-*` for alignment. Use grid for page regions and flex for micro-alignment inside cells — they compose well together.

**Explain:**

```html
<!-- Centered icon grid -->
<div class="grid grid-cols-4 place-items-center gap-6 p-8">
  <div class="flex size-16 items-center justify-center rounded-2xl bg-zinc-100">
    📁
  </div>
  <!-- repeat -->
</div>

<!-- Holy-grail-ish layout -->
<div class="grid min-h-screen grid-rows-[auto_1fr_auto]">
  <header class="flex h-14 items-center border-b px-4">Header</header>
  <main class="grid grid-cols-1 lg:grid-cols-[16rem_1fr]">
    <nav class="border-b lg:border-b-0 lg:border-r p-4">Nav</nav>
    <section class="p-6">Content</section>
  </main>
  <footer class="border-t p-4 text-center text-sm text-zinc-500">
    © 2026
  </footer>
</div>
```

Inside a grid cell, a nested `flex items-center justify-between` row is the standard pattern for toolbars and list item actions.

**Tip:** `min-h-screen grid grid-rows-[auto_1fr_auto]` is a robust sticky-footer layout without negative margins or calc hacks.

**Try it:** Build a full-page shell with header, collapsible sidebar + content on `lg`, and footer. Use grid for the outer structure and flex inside the header.

---

## Responsive & dark mode

### Lesson 13. Mobile-first responsive prefixes

**Takeaway:** Tailwind is mobile-first. Unprefixed utilities apply to all sizes; prefixed utilities (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) apply at that breakpoint **and above**.

**Explain:**

```html
<!-- Stack on mobile, row on medium+ -->
<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  <h1 class="text-2xl font-bold md:text-3xl">Team</h1>
  <button class="w-full md:w-auto rounded-lg bg-zinc-900 px-4 py-2 text-white">
    Invite
  </button>
</div>

<!-- Hide / show by breakpoint -->
<nav class="hidden md:flex gap-6">Desktop links</nav>
<button class="md:hidden" aria-label="Open menu">☰</button>
```

Default breakpoints (customize in `@theme`):

| Prefix | Min width |
|--------|-----------|
| `sm:` | 40rem (640px) |
| `md:` | 48rem (768px) |
| `lg:` | 64rem (1024px) |
| `xl:` | 80rem (1280px) |
| `2xl:` | 96rem (1536px) |

Read `md:flex` as "from 768px upward, use flex." Below 768px, earlier classes win.

**Tip:** Design mobile layout first with no prefixes, then add `md:`/`lg:` enhancements. Debugging responsive issues is easier top-down.

**Try it:** Build a hero: centered text + full-width button on mobile; at `lg`, switch to two columns with text left and illustration right (`lg:grid lg:grid-cols-2`).

---

### Lesson 14. Container queries and arbitrary breakpoints

**Takeaway:** v4 supports container queries via `@container` and `@md:`-style container variants. You can also define custom breakpoints in `@theme` or use arbitrary `min-[...]` values.

**Explain:**

```html
<!-- Named container on parent -->
<div class="@container rounded-xl border p-4">
  <article class="flex flex-col gap-4 @md:flex-row @md:items-center">
    <img class="size-24 rounded-lg object-cover" src="/thumb.jpg" alt="" />
    <div>
      <h3 class="font-semibold">Compact when narrow</h3>
      <p class="text-sm text-zinc-600">Layout reacts to card width, not viewport.</p>
    </div>
  </article>
</div>
```

Custom breakpoint in CSS:

```css
@theme {
  --breakpoint-xs: 30rem;
}
```

```html
<div class="xs:grid-cols-2 grid grid-cols-1">...</div>
```

Arbitrary min-width: `min-[900px]:grid-cols-3` when you need a one-off threshold without theme changes.

**Tip:** Container queries shine in reusable components (cards, widgets) used in both narrow sidebars and wide main areas — the component adapts to its box, not the window.

**Try it:** Wrap a card in `@container` and switch from stacked to horizontal layout at `@md` container width. Resize the card's parent to test.

---

### Lesson 15. Dark mode: `prefers-color-scheme`, class strategy, and tokens

**Takeaway:** Dark mode in v4 is a variant prefix (`dark:`) applied to utilities. Pair it with CSS variables in `:root` — exactly how this project's `globals.css` toggles `--background` and `--foreground`.

**Explain:** This project uses **media-based** dark tokens:

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

```html
<!-- Semantic tokens auto-track OS preference -->
<body class="bg-background text-foreground">...</body>

<!-- Explicit dark: overrides when using class strategy -->
<html class="dark">
  <div class="bg-white dark:bg-zinc-900 dark:text-zinc-100">...</div>
</html>
```

For **class-based** dark mode, configure the variant in CSS:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

Then toggle `class="dark"` on `<html>` with JavaScript or a theme button. Use `dark:` on every surface that must flip: `bg-white dark:bg-zinc-950`, `border-zinc-200 dark:border-zinc-800`.

**Tip:** Centralize colors in tokens (`bg-background`) so most components need zero `dark:` classes — only accents and borders need explicit dual themes.

**Try it:** Extend `globals.css` dark `:root` with `--background` contrast. Build a card with `bg-background border-zinc-200 dark:border-zinc-800` and verify in DevTools device emulation → prefers-color-scheme: dark.

---

## State variants hover/focus/active

### Lesson 16. Interactive states: hover, active, and group-hover

**Takeaway:** Variant prefixes compose left-to-right: `hover:bg-zinc-800`, `active:scale-95`, `group-hover:opacity-100`. They only emit CSS for states you actually use.

**Explain:**

```html
<a
  href="/docs"
  class="group flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900"
>
  <span class="text-zinc-400 transition group-hover:text-zinc-600">→</span>
  Documentation
</a>

<button
  class="rounded-lg bg-indigo-600 px-4 py-2 text-white transition
         hover:bg-indigo-500 active:bg-indigo-700 active:scale-[0.98]"
>
  Save changes
</button>
```

Mark a parent with `group` (or `peer` for siblings) to style children on parent interaction: `group-hover:translate-x-1`. Add `transition`, `duration-200`, `ease-out` for polish.

**Tip:** Always pair clickable styling with `:focus-visible` (next lesson). Hover-only affordances fail keyboard and touch users.

**Try it:** Build a link row that highlights background on hover and shifts an arrow icon with `group` + `group-hover:translate-x-1`.

---

### Lesson 17. Focus rings and keyboard accessibility

**Takeaway:** Use `focus-visible:*` for keyboard focus rings and `focus:*` sparingly. Tailwind makes WCAG-visible focus states a one-liner — never remove outlines without replacing them.

**Explain:**

```html
<button
  class="rounded-lg bg-zinc-900 px-4 py-2 text-white
         focus-visible:outline focus-visible:outline-2
         focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
>
  Submit
</button>

<input
  type="search"
  class="w-full rounded-lg border border-zinc-300 px-4 py-2
         focus:border-indigo-500 focus:outline-none
         focus-visible:ring-2 focus-visible:ring-indigo-500/40"
  placeholder="Search..."
/>
```

`focus-visible` matches browsers' "keyboard focus only" heuristic — mouse clicks won't show the ring. For disabled controls: `disabled:opacity-50 disabled:cursor-not-allowed`.

**Tip:** shadcn/ui components in many Next.js apps encode these patterns — study their `focus-visible:ring-*` conventions and reuse them.

**Try it:** Style three interactive elements (button, link, input) with distinct but consistent `focus-visible:ring-2 ring-offset-2` treatments.

---

### Lesson 18. Data attributes, aria states, and complex variants

**Takeaway:** Tailwind v4 supports arbitrary variant syntax for data attributes and ARIA: `data-[state=open]:`, `aria-expanded:`, `has-*:`. These are essential for headless UI patterns without custom CSS files.

**Explain:**

```html
<!-- Toggle panel -->
<button
  data-state="closed"
  class="data-[state=open]:bg-indigo-50 data-[state=open]:text-indigo-700
         flex w-full items-center justify-between rounded-lg px-4 py-3"
  aria-expanded="false"
>
  Section title
  <span class="data-[state=open]:rotate-180 transition-transform">▼</span>
</button>

<!-- Style based on child state with :has -->
<label
  class="has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50
         flex cursor-pointer items-center gap-3 rounded-lg border p-4"
>
  <input type="radio" name="plan" class="size-4 accent-indigo-600" />
  Pro plan
</label>
```

Stack variants: `md:hover:bg-zinc-100` (hover only on medium+ viewports). Order matters — read variant chains right-to-left in specificity terms, but write them naturally left-to-right in class strings.

**Tip:** When using Radix/shadcn, lean on their `data-state` attributes — Tailwind variants map directly without `@apply`.

**Try it:** Build an accordion trigger that rotates a chevron with `data-[state=open]:rotate-180` and swaps background color when open.

---

## Component patterns without @apply abuse

### Lesson 19. Extract components, not `@apply` bundles

**Takeaway:** The Tailwind team discourages large `@apply` blocks that recreate traditional CSS classes. Extract **framework components** or use small, intentional `@apply` for truly static primitives — not whole pages.

**Explain:** Anti-pattern — `@apply` soup:

```css
/* Avoid: hidden stylesheet parallel to your JSX */
.btn-primary {
  @apply rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white
         hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2;
}
```

Preferred — React/JSX component:

```tsx
function Button({
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white
        hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2
        focus-visible:outline-offset-2 disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
```

Acceptable `@apply` — one primitive in CSS when duplicated across non-React HTML:

```css
@layer components {
  .prose-link {
    @apply text-indigo-600 underline-offset-2 hover:underline;
  }
}
```

**Tip:** Use `clsx` or `cn` (clsx + tailwind-merge) to merge `className` props without conflicting utilities — standard in shadcn projects.

**Try it:** Convert three copy-pasted button markup blocks into one `Button` component. Pass `variant="outline"` via conditional classes, not `@apply`.

---

### Lesson 20. Variants with clsx/cn and tailwind-merge

**Takeaway:** Component APIs express variants as props; `tailwind-merge` resolves conflicting utilities so `p-2` + `p-4` becomes `p-4` instead of broken CSS order.

**Explain:**

```tsx
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | false)[]) {
  return twMerge(clsx(inputs));
}

const buttonVariants = {
  primary: "bg-zinc-900 text-white hover:bg-zinc-800",
  outline: "border border-zinc-300 bg-transparent hover:bg-zinc-50",
  ghost: "bg-transparent hover:bg-zinc-100",
};

function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: {
  variant?: keyof typeof buttonVariants;
  size?: "sm" | "md" | "lg";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "rounded-lg font-medium focus-visible:outline focus-visible:outline-2",
        buttonVariants[variant],
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        className
      )}
      {...props}
    />
  );
}
```

Call site override works: `<Button className="w-full" />` merges cleanly.

**Tip:** Define variant strings as plain objects outside the component — easy to scan, test, and share with Storybook.

**Try it:** Implement `Badge` with `variant` (`default`, `success`, `danger`) using `cn()`. Confirm `className="px-6"` overrides default padding via tailwind-merge.

---

### Lesson 21. `@layer`, `@utility`, and extending the framework

**Takeaway:** v4 uses CSS-native extension points: `@layer base` for resets/element defaults, `@layer components` for rare shared classes, `@utility` for custom utility definitions — all in CSS, not JS plugins.

**Explain:**

```css
@import "tailwindcss";

@layer base {
  h1 {
    @apply text-3xl font-bold tracking-tight text-zinc-900;
  }

  a {
    @apply text-indigo-600 underline-offset-2 hover:underline;
  }
}

@utility tab-4 {
  tab-size: 4;
}

@utility content-auto {
  content-visibility: auto;
}
```

Custom utilities appear like built-ins: `<pre class="tab-4">`. Prefer tokens in `@theme` over new utilities when a standard class exists.

For third-party libraries (forms, prose), v4 uses CSS imports:

```css
@import "tailwindcss";
@plugin "@tailwindcss/forms";
@plugin "@tailwindcss/typography";
```

**Tip:** Keep `@layer base` minimal — heavy global element styling fights utility composition. This project's `globals.css` styles `button` globally; new UI often resets with explicit utilities on components.

**Try it:** Add a `@utility scrollbar-thin` that wraps your scrollbar pattern from `globals.css`. Use it on one overflow panel instead of duplicating raw CSS.

---

## Next.js integration

### Lesson 22. Wiring Tailwind in Next.js App Router (this repo)

**Takeaway:** In Next.js, import your Tailwind entry CSS once in the root layout. PostCSS processes it for every route; utilities used in server or client components are both scanned and included.

**Explain:** This project's integration path:

```
postcss.config.mjs          → @tailwindcss/postcss plugin
src/app/globals.css         → @import "tailwindcss" + @theme
src/app/layout.tsx          → import "./globals.css"
```

```tsx
// src/app/layout.tsx
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
```

Route-specific CSS is optional: `import "../notes.css"` in a nested layout for section-specific rules — but Tailwind utilities work everywhere once `globals.css` loads.

**Tip:** Never import `globals.css` in multiple layouts — duplicate imports inflate bundles. Root layout only.

**Try it:** Add a new route under `src/app/demo/page.tsx` with Tailwind classes. Confirm styles apply without any extra CSS import beyond the root layout chain.

---

### Lesson 23. Fonts, `@theme inline`, and CSS variables from `next/font`

**Takeaway:** Load fonts with `next/font` and expose them as CSS variables on `<html>`. Map those variables into `@theme inline` so utilities like `font-sans` use optimized, self-hosted fonts.

**Explain:**

```tsx
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

```css
@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

Now `font-sans` and `font-mono` resolve to Next-optimized faces — no layout shift from external `@font-face` in CSS.

**Tip:** `antialiased` on `<html>` is a one-class win for type rendering on macOS. Pair with `text-balance` on marketing headings.

**Try it:** Add a `<code class="font-mono text-sm">` block to a page and verify in DevTools that Geist Mono loads via Next font variables, not a fallback stack.

---

### Lesson 24. Content detection with `@source` and monorepos

**Takeaway:** Tailwind v4 auto-detects template files, but you can widen or narrow scanning with `@source` in CSS. Critical when components live outside the default app directory or in shared packages.

**Explain:**

```css
@import "tailwindcss";

/* Explicitly include paths Tailwind might miss */
@source "../components/**/*.{tsx,jsx}";
@source "../../packages/ui/src/**/*.{tsx,jsx}";

/* Exclude test fixtures from scanning */
@source not "../**/*.test.tsx";
```

Without correct sources, classes used only in un scanned files **silently disappear** from production CSS — the classic "works in dev, missing in prod" bug is rare with v4 auto-detection but still possible in monorepos.

Dynamic class names remain dangerous:

```tsx
// BAD — build can't see full class names
const color = "red";
<div className={`text-${color}-500`} />

// GOOD — complete strings in code
const styles = { red: "text-red-500", blue: "text-blue-500" };
<div className={styles[color]} />
```

**Tip:** After adding a shared UI package, run `npm run build` and grep the output CSS for a utility you know is package-only — confirms `@source` coverage.

**Try it:** If you add a `src/components/ui/` folder, add an `@source` line in `globals.css` pointing to it. Create a component using `bg-amber-400` and verify it survives production build.

---

## Real UI builds: card, navbar, form

### Lesson 25. Build a product card with hover elevation

**Takeaway:** A polished card combines layout (`flex`, `aspect-*`), spacing tokens, typography hierarchy, border/shadow surfaces, and interactive variants — all in one markup block you can extract into a component.

**Explain:**

```html
<article
  class="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200
         bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg
         dark:border-zinc-800 dark:bg-zinc-900"
>
  <div class="relative aspect-[4/3] overflow-hidden bg-zinc-100">
    <img
      class="size-full object-cover transition duration-300 group-hover:scale-105"
      src="/product.jpg"
      alt="Wireless headphones"
    />
    <span
      class="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5
             text-xs font-medium text-zinc-800 backdrop-blur"
    >
      New
    </span>
  </div>

  <div class="flex flex-1 flex-col p-5">
    <h3 class="font-semibold text-zinc-900 dark:text-zinc-50">
      Studio Headphones
    </h3>
    <p class="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
      Active noise cancellation with 40-hour battery life.
    </p>
    <div class="mt-auto flex items-center justify-between pt-4">
      <span class="text-lg font-bold text-zinc-900 dark:text-white">$249</span>
      <button
        class="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white
               transition hover:bg-zinc-700 focus-visible:outline
               focus-visible:outline-2 focus-visible:outline-offset-2
               dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Add to cart
      </button>
    </div>
  </div>
</article>
```

Patterns used: `group`/`group-hover` for image zoom, `mt-auto` to pin footer actions, `line-clamp-2` for description, dual-theme borders/backgrounds.

**Tip:** `aspect-[4/3]` locks image ratio before load — prevents layout shift. Use real `alt` text for product images.

**Try it:** Build this card in a Next.js page. Extract `ProductCard` accepting `title`, `price`, `image`, and `badge` props. Add it to a `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` listing.

---

### Lesson 26. Build a responsive navbar with mobile menu

**Takeaway:** Navbars combine `flex justify-between`, responsive visibility (`hidden md:flex`), sticky positioning, and a mobile drawer toggled with state — utilities handle every visual layer.

**Explain:**

```html
<header class="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur
               dark:border-zinc-800 dark:bg-zinc-950/80">
  <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
    <a href="/" class="text-lg font-bold tracking-tight">Acme</a>

    <!-- Desktop nav -->
    <nav class="hidden items-center gap-8 md:flex">
      <a class="text-sm font-medium text-zinc-600 hover:text-zinc-900" href="/features">
        Features
      </a>
      <a class="text-sm font-medium text-zinc-600 hover:text-zinc-900" href="/pricing">
        Pricing
      </a>
      <a
        class="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white
               hover:bg-zinc-800"
        href="/signup"
      >
        Sign up
      </a>
    </nav>

    <!-- Mobile menu button -->
    <button
      class="inline-flex size-10 items-center justify-center rounded-lg
             text-zinc-600 hover:bg-zinc-100 md:hidden"
      aria-label="Open menu"
    >
      ☰
    </button>
  </div>

  <!-- Mobile panel (toggle hidden with JS/React state) -->
  <nav class="border-t border-zinc-200 px-4 py-4 md:hidden dark:border-zinc-800">
    <div class="flex flex-col gap-3">
      <a class="rounded-lg px-3 py-2 text-sm font-medium hover:bg-zinc-100" href="/features">
        Features
      </a>
      <a class="rounded-lg px-3 py-2 text-sm font-medium hover:bg-zinc-100" href="/pricing">
        Pricing
      </a>
      <a
        class="rounded-lg bg-zinc-900 px-3 py-2 text-center text-sm font-medium text-white"
        href="/signup"
      >
        Sign up
      </a>
    </div>
  </nav>
</header>
```

In React, replace the bottom `<nav>` with conditional render `{open && ...}` or `data-state` + `hidden data-[state=open]:block`. Add `aria-expanded` on the toggle button.

**Tip:** `backdrop-blur` + semi-transparent `bg-white/80` gives a modern frosted header — test contrast in both light and dark themes.

**Try it:** Implement the navbar as a `"use client"` component with `useState` for mobile open/close. Animate the panel with `transition-all` and `max-h-0` → `max-h-96` or simply toggle `hidden`.

---

### Lesson 27. Build an accessible form with focus states

**Takeaway:** Forms need consistent field sizing, label spacing, validation colors, and `focus-visible` rings. Tailwind replaces bespoke form CSS — optionally enhanced with `@tailwindcss/forms`.

**Explain:**

```html
<form class="mx-auto max-w-md space-y-6 rounded-2xl border border-zinc-200 p-6 shadow-sm">
  <div class="space-y-1">
    <h2 class="text-xl font-semibold text-zinc-900">Create account</h2>
    <p class="text-sm text-zinc-600">Start your 14-day free trial.</p>
  </div>

  <label class="block space-y-1.5">
    <span class="text-sm font-medium text-zinc-700">Full name</span>
    <input
      type="text"
      autocomplete="name"
      class="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2
             text-sm placeholder:text-zinc-400
             focus:border-indigo-500 focus:outline-none focus-visible:ring-2
             focus-visible:ring-indigo-500/30"
      placeholder="Jane Doe"
    />
  </label>

  <label class="block space-y-1.5">
    <span class="text-sm font-medium text-zinc-700">Email</span>
    <input
      type="email"
      autocomplete="email"
      aria-invalid="true"
      aria-describedby="email-error"
      class="block w-full rounded-lg border border-red-400 bg-red-50 px-3 py-2
             text-sm focus:border-red-500 focus:outline-none focus-visible:ring-2
             focus-visible:ring-red-500/30"
    />
    <p id="email-error" class="text-sm text-red-600">Enter a valid email address.</p>
  </label>

  <label class="flex items-start gap-3">
    <input type="checkbox" class="mt-0.5 size-4 rounded border-zinc-300 accent-indigo-600" />
    <span class="text-sm text-zinc-600">
      I agree to the terms and privacy policy.
    </span>
  </label>

  <button
    type="submit"
    class="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white
           transition hover:bg-indigo-500
           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
           focus-visible:outline-indigo-500
           disabled:cursor-not-allowed disabled:opacity-50"
  >
    Continue
  </button>
</form>
```

Error state pattern: red border + light red background + `aria-invalid` + describedby error text. Success/neutral share the same field shell — only border/ring colors change.

**Tip:** `@tailwindcss/forms` normalizes checkbox/radio/select baselines if native styling fights your design — add `@plugin "@tailwindcss/forms"` after the tailwind import.

**Try it:** Build this form as a client component with basic validation state. Toggle email field between neutral and error classes based on regex test.

---

### Lesson 28. Capstone: compose card, navbar, and form into a landing section

**Takeaway:** Real pages stitch together responsive grids, sticky nav, semantic tokens, and component extraction. This capstone mirrors how this notes app structures layout — utility classes at the leaf, components at the branch.

**Explain:**

```html
<!-- Page shell mirroring App Router layout patterns -->
<div class="min-h-screen bg-background text-foreground">
  <!-- Navbar (Lesson 26) -->
  <header class="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">...</header>

  <!-- Hero + signup -->
  <main class="mx-auto max-w-6xl px-4 py-16">
    <div class="grid items-center gap-12 lg:grid-cols-2">
      <section class="space-y-6">
        <p class="text-sm font-medium uppercase tracking-wider text-indigo-600">
          Tailwind v4 + Next.js
        </p>
        <h1 class="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          Build interfaces faster with utility-first CSS
        </h1>
        <p class="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          CSS-first config, design tokens in <code class="font-mono text-sm">@theme</code>,
          and components without @apply abuse.
        </p>

        <!-- Feature cards row (Lesson 25 simplified) -->
        <div class="grid gap-4 sm:grid-cols-3">
          <div class="rounded-xl border p-4">
            <p class="font-semibold">Zero config</p>
            <p class="mt-1 text-sm text-zinc-600">@import "tailwindcss"</p>
          </div>
          <div class="rounded-xl border p-4">
            <p class="font-semibold">Tokens</p>
            <p class="mt-1 text-sm text-zinc-600">@theme inline</p>
          </div>
          <div class="rounded-xl border p-4">
            <p class="font-semibold">React</p>
            <p class="mt-1 text-sm text-zinc-600">cn() + components</p>
          </div>
        </div>
      </section>

      <!-- Form (Lesson 27) -->
      <aside class="rounded-2xl border bg-white p-6 shadow-lg dark:bg-zinc-900">
        <!-- signup form markup -->
      </aside>
    </div>
  </main>

  <footer class="border-t py-8 text-center text-sm text-zinc-500">
    Built with Tailwind CSS v4
  </footer>
</div>
```

Checklist for production quality:

1. **Semantic colors** — `bg-background`, `text-foreground` on shell; zinc/indigo for accents.
2. **Responsive** — single column → `lg:grid-cols-2`; nav collapses at `md`.
3. **Accessibility** — focus rings on all interactives; form labels tied to inputs.
4. **Components** — extract `Navbar`, `ProductCard`, `SignupForm`, `Button` before duplicating a fourth time.
5. **Build verify** — `npm run build` confirms all utilities survive scanning.

**Tip:** Open this project's home page and `src/components/notes/NotesShell.tsx` — notice how layout utilities (`flex`, `min-h-screen`, spacing) compose with route-level content. Your capstone should feel similar: thin layout wrapper, fat reusable leaf components.

**Try it:** Create `src/app/tailwind-capstone/page.tsx` implementing the landing section above. Use at least one server component wrapper and one `"use client"` form. Share the route link with a friend and resize the browser from 320px to 1440px — everything should reflow without horizontal scroll.

---

## Quick reference

| Topic | Key utilities / APIs |
|-------|----------------------|
| Setup | `@import "tailwindcss"`, `@tailwindcss/postcss` |
| Theme | `@theme`, `@theme inline`, `--color-*`, `--font-*` |
| Layout | `flex`, `grid`, `gap-*`, `space-y-*`, `container` |
| Responsive | `sm:`, `md:`, `lg:`, `@container`, `@md:` |
| Dark mode | `dark:`, `:root` variables, `@custom-variant dark` |
| States | `hover:`, `focus-visible:`, `active:`, `group-*`, `data-*` |
| Next.js | `globals.css` in root layout, `next/font` + `@theme inline` |
| Components | Extract JSX, use `cn()` / tailwind-merge, avoid `@apply` soup |

You now have the full v4 workflow used in this repo: CSS entry point, token-backed utilities, responsive and state variants, framework-friendly components, and real UI patterns you can paste into Next.js pages today.
