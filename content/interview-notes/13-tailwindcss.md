# Tailwind CSS Interview Notes

Say-aloud answers for Tailwind CSS v4 interviews. Each card has a **Short definition**, a spoken **Answer**, optional HTML/CSS, a follow-up, and a common mistake.

---

## v4 CSS-first configuration

### Q1. What is Tailwind CSS and why do teams use it? [must-know]

**Short definition:** Tailwind is a utility-first CSS framework: small, composable classes in markup that map to a constrained design scale.

**Answer:** Tailwind is not a component library like Bootstrap. It ships spacing, color, type, and layout as single-purpose classes (`p-4`, `flex`, `text-sm`) generated from design tokens. Teams adopt it because it removes naming debates, keeps styles next to the markup that uses them, and produces a small production stylesheet of only the utilities you actually wrote. In interviews, say you still extract React/Vue components for reuse — you do not copy a 20-class button around the app. The product is a design system encoded as class names, not a dump of random CSS.

```html
<article class="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
  <h2 class="text-lg font-semibold text-zinc-900">Weekly report</h2>
  <p class="mt-2 text-sm text-zinc-600">Revenue up 12% vs last week.</p>
</article>
```

**Follow-up:** Is Tailwind “inline styles with extra steps”? — No. Inline styles cannot do hover, media queries, or a shared scale. Utilities are real CSS classes generated at build time.

**Common mistake:** Calling Tailwind a UI kit. There is no default Button component — you compose utilities or extract your own.

---

### Q2. How does Tailwind v4’s CSS-first configuration work? [must-know]

**Short definition:** v4 is configured in CSS: `@import "tailwindcss"`, `@theme` tokens, `@source` paths, `@utility`, and `@layer` — no required `tailwind.config.js`.

**Answer:** Tailwind v3 split config across a JavaScript file, `@tailwind` directives, and PostCSS. v4 collapses that into your stylesheet. You import the engine, declare tokens as CSS variables in `@theme`, and extend behavior with CSS at-rules. The PostCSS plugin is `@tailwindcss/postcss` (or `@tailwindcss/vite` on Vite). Interviewers want to hear that the source of truth moved from JS to CSS, which matches how browsers already theme with custom properties.

```css
@import "tailwindcss";

@theme {
  --color-brand: oklch(0.55 0.2 260);
  --breakpoint-3xl: 120rem;
}
```

**Follow-up:** Can you still use a JS config? — Yes, via `@config "./tailwind.config.js"` during migration, but new projects should stay CSS-first.

**Common mistake:** Looking for `@tailwind base; @tailwind components; @tailwind utilities;` in a v4 app. Those directives are the v3 entry point.

---

### Q3. What does `@import "tailwindcss"` load?

**Short definition:** One import pulls in theme tokens, Preflight (the reset), and the utility engine.

**Answer:** `@import "tailwindcss"` is the v4 equivalent of the three v3 layers. It registers cascade layers, injects Preflight so boxes and typography start from a known baseline, exposes default theme variables, and enables every utility class. You can split the import if you need control — theme, preflight, and utilities as separate layers — but most apps use the single import. After that line, any scanned template that contains `flex` or `p-4` will emit those rules in the compiled CSS.

```css
@import "tailwindcss";

/* Split form when you need to insert custom CSS between layers */
@import "tailwindcss/theme" layer(theme);
@import "tailwindcss/preflight" layer(base);
@import "tailwindcss/utilities" layer(utilities);
```

**Follow-up:** Where does this file get imported in Next.js? — Once, from the root layout (`globals.css`).

**Common mistake:** Importing Tailwind CSS in every component file. One global entry is enough; extra imports duplicate work and can bloat CSS.

---

### Q4. What is `@theme` and how do tokens become utilities? [must-know]

**Short definition:** `@theme` declares CSS custom properties with reserved prefixes; Tailwind generates matching utilities from those names.

**Answer:** Theme values are CSS variables, not a JS object. Prefixes are the contract: `--color-*` generates `bg-*`, `text-*`, `border-*`; `--font-*` generates `font-*`; `--breakpoint-*` generates `sm:`/`md:`-style variants; `--spacing` is the base step for `p-*`, `m-*`, `gap-*`. Add `--color-brand: …` and `bg-brand` exists without a plugin. Tokens live in the cascade, so they can change in media queries or on `.dark` and every utility that references them updates.

```css
@theme {
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

**Follow-up:** Why `--color-brand` and not `--brand`? — Without the `--color-` namespace Tailwind will not generate color utilities.

**Common mistake:** Naming tokens by hue (`--color-blue-button`) instead of role (`--color-brand`, `--color-danger`). Hues die in a rebrand; roles survive.

---

### Q5. `@theme` vs `@theme inline`?

**Short definition:** `@theme` emits new CSS variables. `@theme inline` aliases existing variables so utilities reference them without a second copy.

**Answer:** Use `@theme` when you own the value. Use `@theme inline` when the value already exists — for example `next/font` exposing `--font-geist-sans` on `<html>`, or `:root` already defining `--background`. Inline mapping says: generate `bg-background` and `font-sans`, but point those utilities at the variable you already have. That is how this notes app wires theme colors and fonts without duplicating tokens.

```css
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

**Follow-up:** Why not put `next/font` variables only in `@theme`? — The font variable is created at runtime on the HTML element. Inline aliases that live variable instead of inventing a disconnected token.

**Common mistake:** Copying hex values into both `:root` and `@theme`, then updating one and wondering why dark mode did not follow.

---

### Q6. How do you add a custom color, font, or breakpoint in v4?

**Short definition:** Add a namespaced variable inside `@theme`; the matching utilities and variants appear automatically.

**Answer:** You do not register a `theme.extend.colors` object anymore. Drop `--color-accent`, `--font-display`, or `--breakpoint-xs` into `@theme` and use `bg-accent`, `font-display`, `xs:grid-cols-2`. Breakpoints should be rem-based to respect user font size. Prefer a short token list over cloning Tailwind’s entire palette into your brand.

```css
@theme {
  --color-accent: #2563eb;
  --font-display: "Georgia", serif;
  --breakpoint-xs: 30rem;
  --radius-box: 0.75rem;
}
```

```html
<section class="xs:grid-cols-2 grid rounded-box bg-accent font-display">...</section>
```

**Follow-up:** How do you remove a default color? — Override or unset the `--color-*` theme key rather than fighting utilities in components.

**Common mistake:** Adding a CSS variable on `:root` without putting it in `@theme`, then expecting `bg-accent` to exist.

---

### Q7. What is `@layer` in Tailwind v4?

**Short definition:** `@layer` puts rules into cascade layers (`theme`, `base`, `components`, `utilities`) so layer order beats selector weight.

**Answer:** Tailwind emits CSS into cascade layers. Later layers win over earlier ones regardless of specificity — that is why a one-class utility like `mt-4` reliably overrides Preflight and most component CSS. You use `@layer base` for element defaults, `@layer components` for rare shared classes, and you let utilities stay last. `!important` inverts layer priority, so important utilities still win, but you should almost never need them. Interviewers are checking that you can debug “my class lost” by asking which layer the rule lives in, not by stacking more selectors.

```css
@layer base {
  h1 {
    @apply text-3xl font-bold tracking-tight;
  }
}

@layer components {
  .prose-link {
    @apply text-indigo-600 underline-offset-2 hover:underline;
  }
}
```

**Follow-up:** What if your custom CSS is unlayered? — Unlayered author CSS wins over layered CSS, which is why a global `button { padding: 10px }` in `globals.css` can fight Tailwind utilities.

**Common mistake:** Assuming utilities always win. Unlayered global element styles, or a later unlayered import, can override them.

---

### Q8. What is `@utility` and when do you use it?

**Short definition:** `@utility` defines a custom utility that lives in the utilities layer and automatically works with variants like `hover:` and `md:`.

**Answer:** When a real CSS feature has no Tailwind class — `tab-size`, `content-visibility`, a scrollbar hide pattern — define it with `@utility` instead of a random CSS class. Because it is a utility, `md:scrollbar-thin` and `hover:tab-4` work without extra wiring. Prefer `@theme` when you are only adding a token that existing utilities already consume (`--color-*`). Prefer `@utility` when you need a new class name.

```css
@utility tab-4 {
  tab-size: 4;
}

@utility content-auto {
  content-visibility: auto;
}

@utility scrollbar-hidden {
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
```

```html
<pre class="tab-4 overflow-auto scrollbar-hidden">npm run build</pre>
```

**Follow-up:** Why not a plain `.scrollbar-hidden { }` rule? — A raw class is not variant-aware and may sit in the wrong layer.

**Common mistake:** Recreating `p-4` or `flex` as custom utilities. Extend the theme; do not fork the framework.

---

### Q9. What is `@source` and why do monorepos need it? [must-know]

**Short definition:** `@source` tells Tailwind which files to scan for class names; v4 auto-detects many paths but shared packages often sit outside that tree.

**Answer:** Tailwind generates CSS by scanning templates for complete class strings. v4 infers sources from the project, but a design-system package under `packages/ui` or a component folder the scanner misses will silently drop utilities in production. `@source` adds globs; `@source not` excludes tests and stories. After you add a workspace package, grep the production CSS for a unique class from that package to prove coverage.

```css
@import "tailwindcss";

@source "../components/**/*.{tsx,jsx}";
@source "../../packages/ui/src/**/*.{tsx,jsx}";
@source not "../**/*.test.tsx";
@source not "../**/*.stories.tsx";
```

**Follow-up:** What is the classic production bug? — A class used only in an unscanned package works in a wide-open dev build and vanishes after `next build`.

**Common mistake:** Assuming `content: []` from v3 still drives scanning. In v4 the CSS `@source` rule is the equivalent.

---

### Q10. How do plugins work in v4 (`@plugin`)?

**Short definition:** JS plugins load from CSS with `@plugin`, not from `tailwind.config.js` `plugins: []`.

**Answer:** Official extras like typography and forms are still packages, but you register them in the stylesheet. That keeps the CSS file the single entry. Custom plugins that added utilities in v3 often become `@utility` or `@theme` instead — you only need a JS plugin for non-trivial codegen. In interviews, mention you would check whether a plugin is still required before porting it.

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@plugin "@tailwindcss/forms";
```

```html
<article class="prose dark:prose-invert max-w-prose">
  <h1>Release notes</h1>
  <p>Markdown rendered into styled HTML.</p>
</article>
```

**Follow-up:** Do you need `@tailwindcss/typography` for app UI? — Usually no. `prose` is for long-form HTML. App chrome should stay on utilities.

**Common mistake:** Adding a plugin and also hand-writing the same utilities, doubling CSS.

---

### Q11. What is `@custom-variant`?

**Short definition:** `@custom-variant` defines a new variant prefix, such as class-based `dark:` or a data-attribute variant.

**Answer:** Built-in variants cover hover, breakpoints, and many ARIA/data cases. When you need a project-specific switch — `dark` tied to `.dark` on `<html>`, a `theme-brand` class, or a parent data attribute — you declare it once. After that, `dark:bg-zinc-900` compiles to the selector you described. This replaced `darkMode: 'class'` in `tailwind.config.js`.

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
@custom-variant theme-brand (&:where(.theme-brand, .theme-brand *));
```

**Follow-up:** Default v4 `dark:`? — Media query `prefers-color-scheme: dark`, until you override it with `@custom-variant`.

**Common mistake:** Toggling `class="dark"` on `<html>` while `dark:` still means “OS dark mode,” so the toggle appears to do nothing.

---

## Utility-first philosophy

### Q12. What is the utility-first philosophy? [must-know]

**Short definition:** Style by composing constrained, single-purpose classes in markup instead of inventing semantic CSS class names for every block.

**Answer:** Traditional CSS grows `.card`, `.card-title`, `.card--featured`, then fights specificity when a variant needs two extra pixels. Utility-first says one class does one job and the design scale is the API: `mt-4` is always the same step, `text-sm` is always the same size. You trade HTML verbosity for speed, consistency, and fewer context switches between JSX and a stylesheet. When markup feels noisy, extract a component in the framework, not a giant CSS class that restarts the naming problem.

```html
<button class="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
  Save
</button>
```

**Follow-up:** How do you read a long class list? — Left to right: layout, spacing, type, color, states. `flex items-center gap-2 text-sm text-zinc-500`.

**Common mistake:** Treating utilities as a reason to skip components. Duplicated 12-class buttons are still duplication.

---

### Q13. What are the tradeoffs of utility-first CSS?

**Short definition:** You gain speed and consistency; you pay with noisier markup, a learning curve, and a build step that must see every class name.

**Answer:** Pros: no selector archaeology, a shared scale, tiny production CSS, easy deletion because styles die with the JSX. Cons: class strings look messy to CSS-module veterans; designers who think in semantic sheets need onboarding; dynamic class construction is unsafe; global theming still needs tokens, not a thousand `dark:` copies. A strong answer names both sides and says you mitigate noise with components, `cn()`, and IntelliSense.

**Follow-up:** When would you not use Tailwind? — A tiny static page, a team already invested in a mature CSS-in-JS system, or a product that must consume an external design CSS you do not control.

**Common mistake:** Pretending there are no tradeoffs. Interviewers trust people who can argue against their tools.

---

### Q14. When do you extract a component vs keep utilities in markup?

**Short definition:** Extract when the same visual pattern repeats or needs a variant API; keep utilities inline for one-off layout.

**Answer:** A page hero used once can stay as classes on the JSX. A button, input, badge, or card used in five places becomes a component with props (`variant`, `size`) and a `className` escape hatch. Extraction is about reuse and change-in-one-place, not about hiding Tailwind. Do not extract because a class list is long — extract because the UI concept is a product primitive.

```tsx
function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800",
        className,
      )}
      {...props}
    />
  );
}
```

**Follow-up:** Three identical cards with one different heading — component or copy-paste? — Component with `title`/`children` props.

**Common mistake:** Creating a CSS class with `@apply` as the extraction strategy in a React app. Extract JSX.

---

### Q15. How do you keep long class strings maintainable?

**Short definition:** Consistent order, components for primitives, `cn()` for conditionals, and tokens so you are not listing twenty palette classes.

**Answer:** Agree on a class order (layout → spacing → type → color → effects → variants) so diffs are readable. Use Prettier’s Tailwind plugin to sort automatically. Put repeated primitives in components. Drive theme with semantic tokens (`bg-background`) so dark mode does not double every string. Break classes across lines in JSX; the compiler does not care. IntelliSense is part of maintainability — without it, teams guess wrong class names.

**Follow-up:** Is sorting class names a real win? — Yes. Unsorted strings make code review noisy and hide accidental duplicates.

**Common mistake:** Fighting the Prettier plugin by hand-ordering classes that get reshuffled on save.

---

### Q16. Does Tailwind cause specificity wars?

**Short definition:** Usually no — utilities are equal-weight classes in a late cascade layer, so source order and `cn()`/`twMerge` decide conflicts.

**Answer:** Two utilities like `p-2` and `p-4` have the same specificity. Whichever rule appears last in the generated CSS wins, which is not the same as last in the `className` string. That is why `tailwind-merge` exists: it drops the conflicting class before it hits the DOM. Specificity wars start when you mix unlayered global CSS, leftover BEM, and `@apply` component classes with utilities. Keep custom CSS in layers and merge class props with `cn()`.

**Follow-up:** Does `!p-4` fix conflicts? — It can, but it is a smell. Merge classes or fix layers instead of sprinkling important.

**Common mistake:** Believing HTML class order controls which Tailwind utility wins.

---

### Q17. Utility-first vs CSS modules vs CSS-in-JS — how do you choose?

**Short definition:** Tailwind is build-time utilities; CSS modules are local class names; CSS-in-JS is styles colocated in JS, often with runtime cost.

**Answer:** CSS modules keep semantic names and local scope but you still invent names and jump files. Runtime CSS-in-JS (styled-components, Emotion) colocates styles and supports dynamic values, but it costs JS execution and can delay paint. Tailwind colocates styles as classes, has zero style runtime, and constrains the scale. Many Next.js teams pick Tailwind plus a few CSS modules for one-off animations. Choose CSS-in-JS when styles must be computed from data every render and you accept the cost.

**Follow-up:** Is Tailwind CSS-in-JS? — No. Classes are generated at build time. JS only concatenates strings.

**Common mistake:** Comparing Tailwind to Bootstrap. Bootstrap is components and a theme; Tailwind is a token-backed utility engine.

---

## Spacing, typography, and color

### Q18. How does Tailwind’s spacing scale work? [must-know]

**Short definition:** Numeric spacing utilities are steps on a scale (v4: multiples of `--spacing`, default `0.25rem`), so `p-4` is `1rem`.

**Answer:** `p-4`, `m-2`, `gap-6`, `w-8` share one scale. That constraint is the design system: you do not type `13px` everywhere. Named values exist too (`px`, `auto`, `full`). Negative margins use `-mt-2`. Arbitrary spacing (`p-[18px]`) is an escape hatch for a spec that refuses the scale — if you need it constantly, the scale is wrong. Speak the conversion in interviews: divide by 4 to get rem (`16 → 4`).

```html
<div class="mx-auto w-full max-w-md border border-zinc-200 p-6">
  <div class="mb-4 h-2 w-full rounded-full bg-zinc-100">
    <div class="h-2 w-3/4 rounded-full bg-emerald-500"></div>
  </div>
</div>
```

**Follow-up:** `p-4` vs `p-[1rem]`? — Same computed padding, but `p-4` stays on the scale and compresses better in the mental model.

**Common mistake:** Mixing `p-4`, `padding: 18px` in CSS, and `p-[13px]` in the same component until rhythm looks accidental.

---

### Q19. Padding vs margin vs `gap` vs `space-y`?

**Short definition:** Padding is inside the box; margin is outside; `gap` is flex/grid gutters; `space-y-*` adds margin between stacked siblings.

**Answer:** Use padding for inner breathing room. Use margin for separation from siblings when you are not in flex/grid. Prefer `gap-*` inside `flex` or `grid` — it does not collapse and does not require “not last child” hacks. `space-y-*` is for block stacks (`<form class="space-y-4">`) where you do not want to turn the parent into flex. In React, `gap` is more resilient because conditional children and wrappers break `space-y` more often.

```html
<form class="space-y-4">
  <label class="block space-y-1">...</label>
  <label class="block space-y-1">...</label>
</form>

<div class="flex flex-wrap gap-3">
  <span class="rounded-full bg-zinc-100 px-3 py-1 text-sm">React</span>
</div>
```

**Follow-up:** Why not `mt-4` on every field? — It duplicates, forgets the first item, and fights later insertions.

**Common mistake:** Using `space-x-*` on a flex row that already has `gap` — double gutters.

---

### Q20. Explain typography utilities: size, weight, leading, tracking.

**Short definition:** `text-*` sets size (and often a default line-height), `font-*` weight/family, `leading-*` line-height, `tracking-*` letter-spacing.

**Answer:** Hierarchy comes from a small set of sizes, not from ten one-off pixel values. Pair `text-4xl font-bold tracking-tight` for titles, `text-sm text-zinc-600 leading-relaxed` for supporting copy, `text-xs uppercase tracking-wider` for eyebrows. `font-sans` / `font-mono` / custom `font-display` come from `@theme`. `text-balance` helps headlines wrap evenly; `max-w-prose` caps line length. Limit a view to about three sizes so it looks designed.

```html
<p class="text-xs font-medium uppercase tracking-wider text-zinc-500">Case study</p>
<h1 class="text-4xl font-bold tracking-tight">Shipping faster with utilities</h1>
<p class="text-lg leading-relaxed text-zinc-600">Body copy with a constrained measure.</p>
```

**Follow-up:** `text-base` vs browser default? — Preflight sets a consistent root; `text-base` is the theme’s body size, typically `1rem`.

**Common mistake:** Setting `leading-none` on paragraphs to “tighten” them and destroying readability.

---

### Q21. How do colors and opacity modifiers work?

**Short definition:** Color utilities read `--color-*` tokens; `/50` is alpha on that color (`bg-blue-600/10`).

**Answer:** Palettes are numbered (`zinc-900`, `indigo-600`). Opacity is a modifier, not a separate `bg-opacity-*` class (that v3 pattern is gone). Use `/10` for tinted surfaces, `/40` for rings, and solid colors for text that must pass contrast. Gradients compose `bg-gradient-to-br from-* via-* to-*`. Prefer semantic tokens for app chrome and palette colors for marketing accents.

```html
<div class="bg-blue-600/10 text-blue-700 ring-1 ring-blue-600/20">Info banner</div>
<div class="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-xl">
  Pro plan
</div>
```

**Follow-up:** `text-zinc-500` on white — is it accessible? — Often it fails WCAG for small body text. Check contrast; use `zinc-600`/`zinc-700` for copy.

**Common mistake:** Using `bg-opacity-50` as if this were v3. Write `bg-black/50`.

---

### Q22. Semantic color tokens vs palette colors?

**Short definition:** Palette classes name a hue (`bg-zinc-900`). Semantic tokens name a role (`bg-background`, `text-danger`).

**Answer:** Palettes are fine for one-off marketing. Product UI should talk in roles so a rebrand or dark theme does not touch every component. Map `--color-background`, `--color-foreground`, `--color-muted`, `--color-accent` in `@theme` and use those utilities. You can still reach for `bg-emerald-500` on a success toast if success is not a token yet — but repeating it twelve times is a signal to promote it.

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
}
```

**Follow-up:** Can semantic tokens still change in dark mode? — Yes. Change the underlying CSS variables; utilities stay the same class names.

**Common mistake:** Building the whole app in `bg-white dark:bg-zinc-950` copies instead of one `bg-background`.

---

### Q23. What are arbitrary values and when are they a smell?

**Short definition:** Square-bracket utilities (`top-[13px]`, `bg-[#1a1a2e]`, `min-[900px]:`) escape the scale for one-off values.

**Answer:** Arbitrary values are the sanctioned escape hatch when a mock is not on the scale. They are a smell when the same `p-[18px]` appears in ten files — that value should be a token. Arbitrary properties (`[mask-type:luminance]`) exist for CSS Tailwind has not wrapped yet. Interviewers like hearing you use them rarely and promote repeats into `@theme`.

```html
<div class="top-[13px] bg-[#1a1a2e] shadow-[0_8px_30px_rgba(0,0,0,0.12)] min-[900px]:grid-cols-3">
  One-off spec
</div>
```

**Follow-up:** Arbitrary vs `@theme`? — One use: arbitrary. Three uses: token. Team-wide: breakpoint or color in `@theme`.

**Common mistake:** Using arbitrary values as the default styling method and throwing away the design scale.

---

### Q24. How do you center a layout and constrain width?

**Short definition:** The standard pattern is `mx-auto w-full max-w-*` plus horizontal padding; flex/grid centering uses `items-center justify-center`.

**Answer:** Reading-width columns use `max-w-prose` or `max-w-6xl` depending on whether you are setting type or a page shell. Always add `px-4` (or similar) so content does not kiss the viewport on mobile. A modal is `flex min-h-screen items-center justify-center p-4` with an inner `w-full max-w-lg`. `m-auto` on a block with a width also centers. Do not use absolute positioning to center page content.

```html
<main class="mx-auto w-full max-w-6xl px-4 py-8">
  <article class="mx-auto max-w-prose">...</article>
</main>
```

**Follow-up:** `max-w-screen-xl` vs `max-w-7xl`? — Know they are different scales; pick one system and stick to it.

**Common mistake:** `w-screen` on inner layouts, which includes the scrollbar and causes horizontal overflow.

---

### Q25. What is Preflight?

**Short definition:** Preflight is Tailwind’s opinionated reset: `box-sizing`, stripped margins, border defaults, sensible form/image baselines.

**Answer:** Preflight makes browsers start from the same box model so `w-full` and `border` behave predictably. Headings are unstyled until you add utilities — that surprises people coming from user-agent styles. Buttons and lists lose default look, which is why a global `button { border: 2px solid black }` in an app can fight you. If a third-party widget looks “naked,” Preflight is often why; wrap it and restore what you need, or disable Preflight only as a last resort.

**Follow-up:** Can you turn Preflight off? — Yes, but you lose the shared baseline. Prefer layering base styles over disabling it.

**Common mistake:** Styling `h1` in unlayered CSS “because Preflight removed the size,” then wondering why `text-sm` on a heading loses.

---

## Flex and Grid utilities

### Q26. How do you build common Flexbox layouts with utilities? [must-know]

**Short definition:** `flex` plus `flex-row`/`flex-col`, `items-*` (cross axis), `justify-*` (main axis), `gap-*`, and `flex-wrap`.

**Answer:** Most app chrome is one-dimensional: toolbars, list rows, nav clusters. `flex items-center justify-between gap-4` is the toolbar. `flex min-h-screen items-center justify-center` is the empty state or modal. Stacks are `flex flex-col gap-6`. On small screens start `flex-col` and switch `md:flex-row`. Name the axes in the interview: justify is main, items is cross — people mix them constantly.

```html
<div class="flex items-center justify-between gap-4 border-b px-4 py-3">
  <span class="font-semibold">Documents</span>
  <button class="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white">New</button>
</div>
```

**Follow-up:** How do you wrap chips? — `flex flex-wrap gap-2`.

**Common mistake:** Using `justify-center` when you meant `items-center` (vertical centering in a row).

---

### Q27. Why do flex children need `min-w-0` for truncation?

**Short definition:** Flex items default `min-width: auto`, so they will not shrink below content width; `min-w-0` allows shrinking so `truncate` can ellipsis.

**Answer:** A classic bug: avatar + name + chevron in a row, the name refuses to ellipsis and overflows. The text flex child needs `min-w-0 flex-1` and then `truncate` (or `overflow-hidden text-ellipsis whitespace-nowrap`). `shrink-0` on the avatar and icon so they do not squash. This is a CSS flex gotcha Tailwind does not hide — you still have to know it.

```html
<div class="flex items-center gap-4">
  <div class="size-10 shrink-0 rounded-full bg-zinc-200"></div>
  <div class="min-w-0 flex-1">
    <p class="truncate font-medium">Alex Chen</p>
    <p class="truncate text-sm text-zinc-500">Updated 2 hours ago</p>
  </div>
</div>
```

**Follow-up:** Grid version of the same bug? — `minmax(0, 1fr)` or `min-w-0` on the grid child.

**Common mistake:** Putting `truncate` on the flex parent instead of the text node that actually overflows.

---

### Q28. Explain `flex-1`, `grow`, `shrink-0`, and `basis-*`.

**Short definition:** `flex-1` is grow+shrink with `basis: 0` (share leftover space). `grow`/`shrink` control those axes separately. `basis-*` is the starting width. `shrink-0` refuses to shrink.

**Answer:** Sidebars often `w-64 shrink-0`; main is `min-w-0 flex-1`. Icons and avatars are `shrink-0`. `basis-1/3` sets a starting share before grow/shrink. `order-*` reorders visually — use it sparingly and keep DOM order accessible. Speak in layout terms, not class trivia: “the main pane eats remaining space; the aside keeps 16rem.”

```html
<div class="flex flex-col gap-4 md:flex-row">
  <aside class="w-full shrink-0 md:w-64">...</aside>
  <main class="min-w-0 flex-1">...</main>
</div>
```

**Follow-up:** `flex-1` vs `grow`? — `grow` keeps default basis (`auto`); `flex-1` is `1 1 0%` and distributes more evenly among siblings.

**Common mistake:** `flex-1` on every child and then wondering why a fixed sidebar stretches.

---

### Q29. How do CSS Grid utilities work in Tailwind? [must-know]

**Short definition:** `grid` plus `grid-cols-*`, `grid-rows-*`, `col-span-*`, `row-span-*`, `gap-*`, and `place-*` for two-dimensional layout.

**Answer:** Use Grid when rows and columns both matter: dashboards, card galleries, form label/input pairs, holy-grail pages. `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` is the card grid. Spans: `col-span-2`. Named line placement is possible with arbitrary values, but most UI never needs it. `place-items-center` is a fast full-cell center. Subgrid exists in modern browsers; Tailwind exposes `grid-cols-subgrid` when you need children to align to a parent grid.

```html
<section class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  <article class="md:col-span-2 rounded-xl border p-6">Featured</article>
  <article class="rounded-xl border p-6">Card</article>
</section>
```

**Follow-up:** `grid-cols-12` vs `grid-cols-3`? — 12 is a layout framework for uneven spans; 3 is a simple gallery. Do not default to 12 if you do not span.

**Common mistake:** Using Grid for a single row of three buttons. Flex with `gap` is simpler.

---

### Q30. Flex vs Grid — how do you choose in an interview?

**Short definition:** Flex is one axis plus wrapping; Grid is two axes with alignment in both dimensions.

**Answer:** If you can describe the layout as a row or a column, use Flex. If you need items to line up in columns *and* rows — equal-height cards in a matrix, a sidebar that matches a header track — use Grid. Mixing is normal: a page grid with flex toolbars inside cells. The wrong choice still works until wrapping or spanning appears; pick the model that matches the constraint you will hit next.

**Follow-up:** Can Grid replace Flex entirely? — Technically often yes; practically Flex is less ceremony for navs and clusters.

**Common mistake:** Forcing Grid because it “sounds more senior,” then fighting `grid-cols` for a simple navbar.

---

### Q31. How do you build a responsive card grid?

**Short definition:** Mobile-first `grid-cols-1`, then add column counts at breakpoints, with `gap-*` and optional featured `col-span-*`.

**Answer:** Start stacked. At `md` two columns, at `lg` three. Featured items span two columns on medium+. Images use `aspect-*` and `object-cover` so cards share height rhythm. Do not use a 12-column grid unless you need uneven spans. Container queries are the upgrade when the same card grid lives in a narrow sidebar and a wide main — columns should follow container width, not the viewport.

```html
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
  <article class="rounded-2xl border p-4">...</article>
</div>
```

**Follow-up:** What about auto-fit? — Arbitrary `grid-cols-[repeat(auto-fill,minmax(16rem,1fr))]` when breakpoint prefixes feel coarse.

**Common mistake:** `grid-cols-3` with no mobile override, crushing three cards on a 320px phone.

---

### Q32. How do positioning, sticky, and z-index utilities work?

**Short definition:** `relative`/`absolute`/`fixed`/`sticky` plus inset utilities (`inset-0`, `top-0`) and `z-*` for stacking.

**Answer:** Overlays are `fixed inset-0 z-50` with a centered panel. Badges sit `absolute -right-1 -top-1` on a `relative` wrapper. Sticky table headers need `sticky top-0 z-10` and a scrolling ancestor that does **not** have `overflow-hidden` on the parent chain — the number-one sticky failure. Keep `z-*` on a small documented scale (`z-10` dropdown, `z-50` modal) instead of `z-[9999]` everywhere.

```html
<header class="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
  <nav class="mx-auto flex h-14 max-w-6xl items-center px-4">...</nav>
</header>
```

**Follow-up:** `fixed` vs `sticky`? — Fixed is viewport; sticky is in-flow until a threshold, then sticks within its ancestor.

**Common mistake:** `overflow-hidden` on a parent “for border-radius” and then a `sticky` header that never sticks.

---

## Responsive breakpoints and container queries

### Q33. How do responsive prefixes work? [must-know]

**Short definition:** Unprefixed classes are the mobile default; `md:flex` applies from that min-width upward (mobile-first min-width media queries).

**Answer:** Tailwind breakpoints are min-width. `flex-col md:flex-row` means stacked until `md`, then a row. There is no `max-md:` required for the common case — you design the small layout first. Default v4 breakpoints are rem-based (`md` is `48rem` / 768px at 16px root). Arbitrary `max-md:` and `min-[900px]:` exist when a design needs a max-width query. Read `md:flex` aloud as “from md up, display flex.”

```html
<div class="flex flex-col gap-4 md:flex-row md:items-center">
  <h1 class="text-2xl font-bold md:text-3xl">Team</h1>
  <button class="w-full rounded-lg bg-zinc-900 px-4 py-2 text-white md:w-auto">Invite</button>
</div>
```

**Follow-up:** What is `sm:` if you already designed for phones? — Often you skip `sm` and jump `md`/`lg`. Unused prefixes are not a virtue.

**Common mistake:** Writing desktop styles unprefixed and trying to “undo” them with `max-sm:` everywhere.

---

### Q34. Why is Tailwind mobile-first?

**Short definition:** Min-width variants layer enhancements on a base that already works on small screens, matching how CSS media queries should be written.

**Answer:** Mobile-first means the default is the constrained layout: full-width buttons, stacked columns, larger tap targets. Larger breakpoints add columns, sidebars, and tighter spacing. Debugging is easier because you start from the simplest layout. It also matches performance: you do not download a desktop layout and then hide it with `hidden`. If a product is desktop-only, you can still use the same prefixes; you just have fewer of them.

**Follow-up:** How do you do a max-width tweak? — `max-md:flex-col` or an arbitrary `max-[720px]:hidden`.

**Common mistake:** Pairing `md:hidden` and `hidden md:flex` incorrectly so both navs show or neither does.

---

### Q35. How do you hide and show UI at breakpoints?

**Short definition:** Combine `hidden` with a breakpoint display utility: `hidden md:flex` for desktop-only, `md:hidden` for mobile-only.

**Answer:** A desktop nav is `hidden md:flex`. A hamburger is `md:hidden`. Do not use `opacity-0` or `invisible` to “hide” navigation you still want out of the accessibility tree — `hidden` is `display: none`. For content that should remain readable by screen readers but visually hidden, use `sr-only`. Test keyboard focus: hidden desktop menus should not be tabbable on mobile.

```html
<nav class="hidden gap-6 md:flex">Desktop links</nav>
<button class="md:hidden" type="button" aria-label="Open menu">Menu</button>
```

**Follow-up:** `hidden` vs `invisible` vs `sr-only`? — `hidden` removes from layout and a11y tree; `invisible` hides visually but keeps space; `sr-only` is visually hidden but announced.

**Common mistake:** Two menus both in the tab order because you used `opacity-0` instead of `hidden`.

---

### Q36. How do you define custom breakpoints in v4?

**Short definition:** Set `--breakpoint-*` in `@theme`; the name becomes a variant (`xs:`, `3xl:`).

**Answer:** Defaults cover most apps. Add a breakpoint when the design system has a real named width, not when one page feels awkward — that page can use `min-[900px]:`. Use rem so zoom and root font-size stay respected. If you override `md`, you change it everywhere; document that in the design token file.

```css
@theme {
  --breakpoint-xs: 30rem;
  --breakpoint-3xl: 120rem;
}
```

```html
<div class="grid grid-cols-1 xs:grid-cols-2 3xl:grid-cols-6">...</div>
```

**Follow-up:** Can you rename `md`? — You can override `--breakpoint-md`, but you will confuse every Tailwind example on the internet. Add a new name instead.

**Common mistake:** Defining breakpoints as `px` in a way that ignores user font scaling.

---

### Q37. What are container queries in Tailwind? [must-know]

**Short definition:** `@container` on a parent makes children respond to that box’s width with `@sm:` / `@md:` variants, not the viewport.

**Answer:** Viewport breakpoints fail for reusable cards: the same card in a sidebar and in the main column sees the same `md:` even though the sidebar is 20rem wide. Mark the parent `@container` and use `@md:flex-row` on the child. Named containers (`@container/card` and `@md/card:`) disambiguate nested containers. This is the modern answer for component-level responsiveness.

```html
<div class="@container rounded-xl border p-4">
  <article class="flex flex-col gap-4 @md:flex-row @md:items-center">
    <img class="size-24 rounded-lg object-cover" src="/thumb.jpg" alt="" />
    <div>
      <h3 class="font-semibold">Compact when narrow</h3>
      <p class="text-sm text-zinc-600">Layout follows card width, not the window.</p>
    </div>
  </article>
</div>
```

**Follow-up:** `@md:` vs `md:`? — `@md:` is a container query; `md:` is a viewport media query.

**Common mistake:** Putting `@md:flex-row` on an element whose ancestor is not a `@container`, so the variant never matches.

---

### Q38. Viewport media queries vs container queries — when each?

**Short definition:** Viewport queries for page chrome (nav, multi-column page grids). Container queries for reusable components that appear in multiple widths.

**Answer:** The site header still cares about the window: a hamburger vs a link row is a viewport concern. A `ProductCard` used in a 4-column gallery and a 1-column sidebar should use `@container`. Mixing both on one element is valid: `md:` for page-level, `@md:` for the card internals. In interviews, this distinction signals you have built design systems, not just landing pages.

**Follow-up:** Do container queries replace Flex/Grid? — No. They only choose *when* those layouts apply.

**Common mistake:** Converting every `md:` in the app to `@md:` and breaking the navbar.

---

## Dark mode

### Q39. How does dark mode work in Tailwind v4? [must-know]

**Short definition:** `dark:` is a variant. v4 defaults to `prefers-color-scheme`; class strategy is an explicit `@custom-variant`.

**Answer:** Two strategies. Media: OS dark mode flips `dark:` automatically — good for docs and marketing, bad when users expect an in-app toggle. Class: put `dark` on `<html>` and define `@custom-variant dark (&:where(.dark, .dark *));`. Better still, put colors in CSS variables on `:root` and `.dark` (or a media query) so most components use `bg-background` and never write `dark:` at all. This notes app uses media-updated CSS variables plus `@theme inline`.

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

```html
<body class="bg-background text-foreground">...</body>
<div class="bg-white dark:bg-zinc-900 dark:text-zinc-100">Explicit dual palette</div>
```

**Follow-up:** Can you support OS preference *and* a user toggle? — Yes. Store a preference; `theme === 'system'` follows media, otherwise force `dark`/`light` on `<html>`.

**Common mistake:** Adding `dark:` classes while also switching CSS variables, so you double-theme and they drift apart.

---

### Q40. Class strategy vs media strategy — how do you pick?

**Short definition:** Media follows the OS with no JS. Class enables a toggle, per-user override, and SSR-stable themes if you set the class before paint.

**Answer:** Dashboards, docs with a sun/moon button, and products with branded dark palettes want class (or a `data-theme` attribute). Marketing sites that should respect the OS can stay on media. Class strategy needs a tiny script or cookie to avoid a flash of the wrong theme on first paint. Tailwind does not store the user’s choice — you do, in `localStorage`, a cookie, or a user profile.

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

**Follow-up:** Why `dark` on `<html>` not `<body>`? — Portals, modals, and `fixed` overlays often render outside `body` children; `html` covers the document.

**Common mistake:** Toggling `dark` on a wrapper `div` and wondering why `position: fixed` modals stay light.

---

### Q41. Why prefer CSS variables over repeating `dark:` on every class?

**Short definition:** One token swap rethemes every `bg-background`; per-utility `dark:` must be remembered on every surface, border, and text color.

**Answer:** `dark:bg-zinc-950 dark:text-zinc-50 dark:border-zinc-800` on every card is unmaintainable and easy to miss. Semantic tokens mean the component markup is theme-agnostic. Keep `dark:` for things that are not tokens: a decorative gradient, a screenshot frame, an illustration blend. shadcn/ui’s pattern is HSL/oklch variables plus a `.dark` selector — that is the production answer.

**Follow-up:** What still needs `dark:` with tokens? — Shadows, invert-on-dark images, and one-off accents you have not tokenized.

**Common mistake:** Tokenizing only background and then hand-writing `dark:text-white` on fifty headings.

---

### Q42. How do you avoid a flash of the wrong theme (FOUC)?

**Short definition:** Apply the theme class before first paint: inline script in `<head>`, cookie readable on the server, or `color-scheme` plus matching CSS variables.

**Answer:** If you read `localStorage` in a `useEffect`, the first server render is light and then flips — that is the flash. Set a blocking inline script that reads the preference and adds `dark` to `<html>`, or persist the choice in a cookie so the Next.js server can render the right class. Pair with `color-scheme: dark` so native form controls match. CSS-variable theming still needs the correct class or media query on the first HTML.

```html
<script>
  document.documentElement.classList.toggle(
    "dark",
    localStorage.theme === "dark" ||
      (!localStorage.theme && matchMedia("(prefers-color-scheme: dark)").matches),
  );
</script>
```

**Follow-up:** Why not `useEffect` in the root layout client component? — Effects run after paint. Users will see the wrong theme for a frame.

**Common mistake:** `suppressHydrationWarning` on `<html>` without actually computing the same class on the server, so you hide the mismatch instead of fixing it.

---

## Hover, focus, aria, and data variants

### Q43. How do hover, focus, active, and disabled variants work? [must-know]

**Short definition:** Variant prefixes compile to pseudo-classes: `hover:bg-zinc-800`, `active:scale-95`, `disabled:opacity-50`.

**Answer:** States are first-class in the class string. Add `transition` so color and transform changes are not instant. `disabled:` must pair with the real `disabled` attribute (or `aria-disabled` plus a variant) so mouse and keyboard both stop. Touch devices have weak hover; do not put essential information only in `hover:`. Compose with breakpoints: `md:hover:bg-zinc-100` if hover-only chrome is desktop-only.

```html
<button
  class="rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-500 active:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
>
  Save
</button>
```

**Follow-up:** `hover:` on mobile? — Many browsers persist “sticky hover” after tap. Prefer `active:` for press feedback.

**Common mistake:** Styling hover but not disabled, so a submitting button still looks clickable.

---

### Q44. `focus` vs `focus-visible` — which do you use and why?

**Short definition:** `focus` matches any focus including mouse click; `focus-visible` matches keyboard (and other explicit) focus so rings do not appear on every click.

**Answer:** Visible focus is an accessibility requirement. `focus-visible:ring-2` (or `outline`) gives keyboard users a ring without punishing mouse users. Never `outline-none` without a replacement ring. For inputs, a border color change on `focus` plus a ring on `focus-visible` is a common pattern. `:focus-visible` is the modern default; Tailwind just prefixes it.

```html
<button
  class="rounded-lg bg-zinc-900 px-4 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
>
  Submit
</button>
```

**Follow-up:** Is `ring` better than `outline`? — Rings use box-shadow and do not affect layout; outlines can be offset. Either is fine if contrast is strong.

**Common mistake:** `outline-none` globally “because it is ugly” and shipping a keyboard trap with no focus indicator.

---

### Q45. What are `group` and `peer` variants?

**Short definition:** `group` styles descendants from a parent state (`group-hover:`). `peer` styles a sibling based on a preceding sibling’s state (`peer-invalid:`).

**Answer:** `group` on a card lets the title underline or an arrow translate on card hover without JS. Named groups (`group/nav`) avoid nested-group collisions. `peer` on an input plus `peer-invalid:text-red-600` on a sibling message is the CSS-only form error pattern. These replace a lot of small className toggles. Do not use `group-hover` as the only affordance for a control that must work on touch.

```html
<a class="group flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-zinc-100">
  <span class="transition group-hover:translate-x-1">→</span>
  Documentation
</a>
```

**Follow-up:** `group-hover` vs `hover` on the child? — Child `hover` only reacts when the pointer is on that child; `group-hover` reacts to the whole row.

**Common mistake:** Nesting two `group` classes without names so the inner group steals the variant.

---

### Q46. How do `aria-*` and `data-*` variants work? [must-know]

**Short definition:** Tailwind compiles `aria-expanded:`, `data-[state=open]:`, and similar into attribute selectors — ideal for Radix/shadcn headless UI.

**Answer:** Headless libraries expose state as `data-state="open"` or ARIA. You style those attributes instead of copying Boolean class names in React. `aria-invalid:border-red-500` ties validation UI to the accessibility tree. `data-[state=open]:rotate-180` on a chevron is the accordion pattern. This is how you keep Tailwind in JSX without `@apply` and without restyling in JS.

```html
<button
  class="flex w-full items-center justify-between rounded-lg px-4 py-3 data-[state=open]:bg-indigo-50"
  data-state="closed"
  aria-expanded="false"
>
  Section
  <span class="transition-transform data-[state=open]:rotate-180">▼</span>
</button>
```

**Follow-up:** `aria-expanded:` vs `data-[state=open]:`? — Prefer ARIA when the attribute is already required for a11y; use data attributes when the library owns them (Radix).

**Common mistake:** Toggling a `open` class in React while the library already sets `data-state`, so the two sources of truth fight.

---

### Q47. How do you stack variants like `md:hover:`?

**Short definition:** Variants compose left to right in the class name; each adds a condition. `md:hover:bg-zinc-100` is “min-width md AND hover.”

**Answer:** Order in the string is conventional (`responsive` then `state`): `dark:md:hover:bg-zinc-800`. All must match. You can also stack `group-hover:md:translate-x-1`. There is no practical limit for interviews beyond readability — if a stack is five deep, extract a component or use a data-attribute variant. Remember each stacked class is still a complete static string the scanner can see.

```html
<button class="bg-zinc-900 text-white md:hover:bg-zinc-700 dark:md:hover:bg-zinc-600">
  Filter
</button>
```

**Follow-up:** Does source order of variants in the HTML matter for CSS specificity? — Stacked variants are one class. Conflict with another class is still merge/source-order, not the letters in the name.

**Common mistake:** Writing `hover:md:bg-zinc-100` and `md:hover:bg-zinc-100` as if they were different features — they are the same conditions; pick one order and stay consistent.

---

### Q48. What are `has-*` and arbitrary variants?

**Short definition:** `has-[:checked]:` uses CSS `:has()`. Arbitrary variants like `[&_p]:mt-2` or `[&[open]]:shadow-lg` target custom selectors.

**Answer:** `:has()` lets a parent style itself based on a child — a radio card that highlights when checked without JS. Arbitrary variants cover one-off selectors you refuse to put in a CSS file: `[&>svg]:size-4`. They are powerful and easy to abuse; if the same arbitrary variant appears three times, make a `@custom-variant` or a component. Support is excellent in modern browsers; know your target matrix.

```html
<label class="flex cursor-pointer items-center gap-3 rounded-lg border p-4 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50">
  <input type="radio" name="plan" class="size-4 accent-indigo-600" />
  Pro plan
</label>
```

**Follow-up:** Arbitrary variant vs `@utility`? — One selector: arbitrary. Shared pattern: custom variant or utility.

**Common mistake:** `[&_*]:mt-2` resetting every descendant and destroying nested layouts.

---

## `@apply`, `cn()`, and content detection

### Q49. What is `@apply` and why is overusing it a problem? [must-know]

**Short definition:** `@apply` inlines utility declarations into a custom CSS class. Large `@apply` blocks recreate the stylesheet you left behind.

**Answer:** Tailwind’s authors discourage `@apply` as a component system. It hides the same utilities in CSS, breaks the “look at the markup” workflow, and fights variants and IDE tooling. In React, extract a component. Acceptable uses: a tiny primitive in a non-component HTML codebase, or `@layer base` element defaults (`a { @apply underline-offset-2 }`). If your `.btn-primary` is twenty utilities, you did not adopt Tailwind — you built BEM with extra steps.

```css
/* Avoid — parallel stylesheet */
.btn-primary {
  @apply rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800;
}

/* Acceptable — small base primitive */
@layer components {
  .prose-link {
    @apply text-indigo-600 underline-offset-2 hover:underline;
  }
}
```

**Follow-up:** Does `@apply` work with `hover:`? — Often yes inside `@apply`, but you lose composability and debugging clarity.

**Common mistake:** `@apply` of entire pages (“`.home-hero { @apply ... }`”) as a migration off utilities.

---

### Q50. How does `cn()` with `tailwind-merge` work? [must-know]

**Short definition:** `cn` is usually `twMerge(clsx(...))`: `clsx` handles conditionals; `tailwind-merge` drops conflicting utilities so the last one wins.

**Answer:** React components take a `className` prop. Naive string concat leaves both `p-2` and `p-4` in the DOM; CSS source order, not prop order, decides the padding. `tailwind-merge` understands groups (padding, color, display) and keeps the last conflicting class. `clsx`/`cva` build the list. This is the shadcn standard and the expected interview answer for “how do you override a Button’s padding from the outside?”

```tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

<button className={cn("px-4 py-2 text-sm", isWide && "w-full", className)} />
```

**Follow-up:** Why not only `clsx`? — `clsx` cannot know that `p-2` and `p-4` conflict.

**Common mistake:** Implementing `cn` as `filter(Boolean).join(" ")` and shipping unmergeable conflicts.

---

### Q51. Why do dynamically constructed class names disappear in production? [must-know]

**Short definition:** The scanner is a static text search. `text-${color}-500` never appears as a complete string, so the utility is not generated.

**Answer:** Tailwind does not execute your JavaScript. It greps source files for candidates that look like class names. Template literals, concatenation, and class names coming from an API are invisible. The fix is a complete string in source: a map object, a ternary of full classes, or (rarely) a safelist. This is the number-one “works in dev, broken in prod” Tailwind bug — and in v4 it can even fail in dev depending on how detection runs.

```tsx
// BAD — scanner never sees text-red-500
<div className={`text-${color}-500`} />

// GOOD — complete strings exist in the file
const styles = { red: "text-red-500", blue: "text-blue-500" } as const;
<div className={styles[color]} />
```

**Follow-up:** Can you safelist every color? — You can, and you will bloat CSS. Map objects are the real fix.

**Common mistake:** Building a “flexible” `bg-${props.color}` API in a design system. That API is incompatible with Tailwind’s compiler.

---

### Q52. How does content detection (formerly purge) work?

**Short definition:** Tailwind scans template files for class-like strings and emits only those utilities. v3 called this purge/content; v4 auto-detects plus `@source`.

**Answer:** v2 had a separate purge step. v3 JIT used `content` globs in `tailwind.config.js`. v4 infers sources and lets you extend them with `@source`. The mechanism is the same idea: unused utilities never ship, so a huge framework becomes a small CSS file. Detection is greedy about complete tokens but blind to runtime strings. HTML, JSX, Vue, even Markdown in `content/` can be sources if scanned.

**Follow-up:** Does commenting out a class still emit it? — If the string remains in the file, often yes. Delete it if you want it gone.

**Common mistake:** Putting class names only in a CMS or database with no safelist and no map — production CSS will not contain them.

---

### Q53. How do you force a class to exist (`@source inline` / safelist)?

**Short definition:** When a name cannot appear statically, safelist it: v4 `@source inline("…")`, v3 `safelist` in config.

**Answer:** Use this for true dynamics: user-picked accent from a fixed set you cannot reasonably map in one file, or classes inside a string coming from MDX you do not scan. Keep the list finite and documented. Prefer scanning the file that contains the map. `@source inline("bg-red-500 bg-blue-500")` is an explicit allowlist, not a substitute for fixing concatenation.

```css
@import "tailwindcss";
@source inline("bg-red-500 bg-emerald-500 bg-amber-500");
```

**Follow-up:** Safelist vs `@source` glob? — Glob scans files for any classes. Inline forces specific names. Prefer globs when you own the files.

**Common mistake:** Safelisting `bg-red-*` patterns so widely that the CSS file is megabytes.

---

### Q54. How do you handle component variants without `@apply`? (CVA)

**Short definition:** `cva` (class-variance-authority) or a plain variant map plus `cn()` expresses `variant`/`size` as complete class strings.

**Answer:** A Button has `primary | outline | ghost` and `sm | md | lg`. Each combination is a static string in source so the scanner sees every class. `cva` adds `compoundVariants` and a typed API. A simple object is enough in interviews if you explain merging with `cn(button({ variant, size }), className)`. This is the design-system pattern that replaced `@apply .btn-primary`.

```tsx
const buttonVariants = {
  primary: "bg-zinc-900 text-white hover:bg-zinc-800",
  outline: "border border-zinc-300 bg-transparent hover:bg-zinc-50",
};

<Button className={cn("rounded-lg font-medium", buttonVariants[variant], className)} />
```

**Follow-up:** CVA vs a switch statement? — Same idea. CVA is structure and types; a switch is fine for two variants.

**Common mistake:** Computing class names with string replace (`variant.replace("primary", "bg-zinc-900")`) so the scanner sees none of them.

---

### Q55. What happens when two utilities conflict without `twMerge`?

**Short definition:** Both classes are in the HTML; the one that appears later in the generated stylesheet wins, which is not predictable from JSX order.

**Answer:** `class="p-4 p-2"` does not mean “p-2 because it is last in the string.” Tailwind emits one rule per utility; conflict resolution is CSS cascade (layer, then source order in the CSS file). That is why passing `className="p-2"` into a component whose root already has `p-4` often does nothing visible. `twMerge` removes `p-4` when `p-2` is later in its input list, aligning developer intuition with output.

**Follow-up:** Do Tailwind layers fix this? — Both utilities are in the same layer. Merge is still required for component APIs.

**Common mistake:** Using `!p-2` on every override instead of merging.

---

## Next.js integration and v3 vs v4

### Q56. How do you integrate Tailwind with Next.js App Router? [must-know]

**Short definition:** PostCSS plugin `@tailwindcss/postcss`, a `globals.css` that `@import "tailwindcss"`, imported once from the root layout.

**Answer:** Next.js compiles CSS through PostCSS. The pipeline is: `postcss.config.mjs` registers Tailwind, `src/app/globals.css` is the CSS-first entry, `app/layout.tsx` imports that file. Server and Client Components are both scanned; you do not import Tailwind per route. Nested layouts can add extra CSS, but utilities already work globally. Vite projects use `@tailwindcss/vite` instead of PostCSS — say that if they ask about SPA tooling.

```css
/* postcss.config.mjs — plugins: { "@tailwindcss/postcss": {} } */
@import "tailwindcss";
```

```tsx
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
```

**Follow-up:** Pages Router? — Same PostCSS + a global CSS import in `_app.tsx`.

**Common mistake:** Importing `globals.css` from multiple layouts and duplicating the stylesheet.

---

### Q57. How do `next/font` and `@theme inline` work together?

**Short definition:** `next/font` exposes a CSS variable on `<html>`; `@theme inline` maps that variable to `font-sans` / `font-mono` utilities.

**Answer:** Self-hosted fonts via `next/font` avoid layout shift and GDPR-unfriendly Google CSS. You set `variable: "--font-geist-sans"`, put the variable class on `<html>`, and alias it in `@theme inline`. Then `className="font-sans"` on `body` uses the optimized face. Do not also `@import` Google Fonts in CSS — you would load fonts twice.

```tsx
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
<html className={`${geistSans.variable} antialiased`}>
```

```css
@theme inline {
  --font-sans: var(--font-geist-sans);
}
```

**Follow-up:** Why `antialiased`? — Sets `smoothing` on macOS; a one-class polish for type.

**Common mistake:** Applying the font class only to a inner wrapper so portals and `<title>`-adjacent UI miss it. Put variables on `<html>`.

---

### Q58. What changes when migrating from Tailwind v3 to v4? [must-know]

**Short definition:** CSS-first config, new engine (Oxide / Lightning CSS), new PostCSS package, `@import` instead of `@tailwind` directives, and several utility renames.

**Answer:** Replace `@tailwind base/components/utilities` with `@import "tailwindcss"`. Move `theme.extend` into `@theme`. Change the PostCSS plugin from `tailwindcss` to `@tailwindcss/postcss`. `content` globs become `@source` only if auto-detect misses paths. `darkMode: 'class'` becomes `@custom-variant dark`. Opacity: `bg-black/50` not `bg-opacity-50`. Some utilities were renamed or removed; the official upgrade tool catches a lot. Plugins re-register with `@plugin`. Expect faster builds from the Rust engine.

**Follow-up:** Must you delete `tailwind.config.js` on day one? — No. `@config` can bridge, but finish the move so tokens live in CSS.

**Common mistake:** Upgrading the npm package and leaving the v3 PostCSS plugin name, then getting an empty or broken CSS bundle.

---

### Q59. What happened to `tailwind.config.js`?

**Short definition:** It is optional. v4 prefers CSS at-rules; JS config remains as an escape hatch for migration and some plugins.

**Answer:** You no longer need `content`, `theme`, `plugins`, or `darkMode` in JS for a typical app. The CSS file is easier to share with designers and matches runtime theming. Keep a JS config if a third-party plugin has not been ported, or during a gradual migrate. Interviewers want “config is CSS-first now,” not “Tailwind removed configuration.”

```css
@import "tailwindcss";
@config "./tailwind.config.js"; /* migration bridge */
```

**Follow-up:** Where do `corePlugins` go? — Most are unnecessary in v4; disable pieces by not importing them or by using the split imports.

**Common mistake:** Maintaining both a full JS theme and a full `@theme` block that disagree.

---

## Design systems, accessibility, and performance

### Q60. How do you use Tailwind as a design system?

**Short definition:** Tokens in `@theme`, a small component library with `cn()`/`cva`, documented do/don’t, and a constrained palette — not every default color.

**Answer:** A design system is tokens plus components plus rules. Tailwind gives you the token engine and utilities. You add Button, Input, Dialog, and layout primitives that encode spacing and type. Lock the palette: if the brand has one accent and four neutrals, do not let engineers use `bg-fuchsia-300` in product UI. Lint or review for arbitrary values. Publish the token list (`--color-background`, `--radius-box`) as the contract. Tailwind is the implementation; Figma variables should match those names.

**Follow-up:** Who owns new tokens? — Design + engineering together. Random `--color-card-2` from one feature branch is how systems rot.

**Common mistake:** Installing Tailwind and calling it a design system without components or token discipline.

---

### Q61. How does shadcn/ui relate to Tailwind?

**Short definition:** shadcn is not an npm component library — it copies accessible, Tailwind-styled primitives into your repo, built on Radix (or similar) plus `cn()`.

**Answer:** You own the source, so you restyle with your tokens. Variants use `cva`; class merging uses `cn`; state uses `data-[state=…]`. That is why shadcn interviews overlap Tailwind interviews. Alternatives: a fully packaged library (MUI) that fights utilities, or a headless-only approach (Radix + your own classes). Know that updating shadcn is merging code, not bumping a single dependency.

**Follow-up:** Why copy-paste components? — You can delete or rewrite them without fighting `node_modules` CSS specificity.

**Common mistake:** Treating shadcn as “Bootstrap for Tailwind” and never opening the generated files.

---

### Q62. How do you keep Tailwind UIs accessible? [must-know]

**Short definition:** Utilities do not replace semantics, keyboard support, contrast, or focus management — they only style those things.

**Answer:** Use real buttons and labels, not `div` + `onClick` with `cursor-pointer`. Provide `focus-visible` rings; never remove outlines without a replacement. Check contrast — `text-zinc-400` on white often fails WCAG AA. Use `sr-only` for extra context, `aria-*` variants bound to real attributes, and `motion-reduce:transition-none` for vestibular safety. Hit targets: `min-h-11 min-w-11` on icon buttons. Color cannot be the only error signal — pair `border-red-500` with text. Tailwind’s `sr-only` and `not-sr-only` are the utilities to name in an interview.

```html
<button type="button" class="inline-flex size-11 items-center justify-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
  <span class="sr-only">Close</span>
  <svg class="size-4" aria-hidden="true">...</svg>
</button>
```

**Follow-up:** Does `disabled:opacity-50` make it accessible? — It is a visual cue only. The `disabled` attribute (or `aria-disabled` plus no pointer events and keyboard skip) is the behavior.

**Common mistake:** `hover:underline` as the only link affordance, with contrast too low and no focus ring.

---

### Q63. How does Tailwind affect CSS performance?

**Short definition:** Production CSS contains only used utilities, so the stylesheet stays small; HTML class attributes are larger; there is no style-runtime JS.

**Answer:** The win is CSS cacheability and tiny files — often tens of kilobytes even on large apps — versus growing one giant handwritten sheet or shipping unused Bootstrap. The cost is slightly heavier HTML. JIT/v4 generation is fast enough that compile time is rarely the issue; huge safelists and scanning `node_modules` blindly are. Avoid `@apply` duplication that emits the same declarations many times. `content-visibility` via a custom utility can help long lists; it is not Tailwind-specific magic.

**Follow-up:** Is Tailwind slower at runtime than CSS modules? — No. Both are static CSS. Tailwind’s extra cost is HTML bytes and the build scan.

**Common mistake:** Measuring “Tailwind is slow” by looking at development CSS, which is more complete than production.

---

### Q64. What runtime costs does Tailwind avoid compared to CSS-in-JS?

**Short definition:** Styled-components/Emotion insert or compute styles in JavaScript; Tailwind classes are baked into a `.css` file at build time.

**Answer:** Runtime CSS-in-JS costs parse/execute JS, can block or delay first paint, and complicates SSR streaming. Tailwind’s work is compile-time. Dynamic *values* (a width from user data) still need inline styles or CSS variables you set on the element — Tailwind is not a replacement for `style={{ width: percent }}`. For theme switches, update CSS variables, do not regenerate classes. That hybrid — utilities for the scale, variables for runtime — is the performance story.

```tsx
<div className="h-2 rounded-full bg-zinc-100">
  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
</div>
```

**Follow-up:** Zero-runtime CSS-in-JS (Linaria, Pigment)? — Closer to Tailwind’s model. Compare on DX and tokens, not 2019 Emotion benchmarks.

**Common mistake:** Using Tailwind *and* runtime styled-components for the same surfaces, paying both costs.

---

### Q65. Give a 30-second Tailwind interview sound bite. [must-know]

**Short definition:** Tailwind is a build-time, utility-first design system: tokens in CSS (`@theme`), classes in markup, components in the framework.

**Answer:** I use Tailwind v4 as CSS-first: `@import "tailwindcss"`, tokens in `@theme`, one global import in the Next.js root layout. I style with utilities on a spacing and type scale, extract React components instead of `@apply` soup, and merge overrides with `cn()` and tailwind-merge. I never concatenate partial class names because the scanner only sees complete strings. Dark mode is CSS variables, with `dark:` only for exceptions. Responsive work is mobile-first viewport prefixes for page chrome and `@container` for reusable cards. The result is a small static stylesheet, no style runtime, and UI that stays on-brand because the scale is the API.

**Follow-up:** What would you improve in a messy Tailwind codebase? — Tokenize colors, extract buttons, add `cn()`, fix dynamic classes, and delete dead `@apply` layers.

**Common mistake:** Ending with “it makes CSS faster to write” without mentioning tokens, scanning, or components — that sounds like a tutorial, not production experience.

---
