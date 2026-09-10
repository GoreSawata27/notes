# CSS Learning Notes

CSS (Cascading Style Sheets) controls how HTML looks on screen. These 32 lessons walk from fundamentals — how rules compete and boxes are sized — through layout systems, responsive design, motion, modern features, and real-world architecture choices. Each lesson includes runnable examples you can paste into an HTML file with a `<style>` block or a linked stylesheet.

---
## Cascade & Specificity

### Lesson 1. How the Cascade Resolves Conflicts
**Takeaway:** When multiple rules target the same element, the cascade picks a winner using origin, importance, specificity, and source order — not whichever rule you wrote last in your head.

**Explain:** Every CSS rule that matches an element is a candidate. The browser does not simply use the last rule in the file. It runs a four-step tiebreaker:

1. **Origin** — Author styles (your stylesheet) beat user-agent defaults. Inline styles and `!important` flip the order in special ways.
2. **Importance** — Normal declarations lose to `!important` declarations within the same origin.
3. **Specificity** — More specific selectors win (covered in Lesson 2).
4. **Source order** — If specificity is equal, the rule that appears **later** in the CSS wins.

Understanding this prevents the classic frustration of "I changed the color but nothing happened." Often a more specific rule elsewhere is winning.

```css
/* Both match <p class="intro">, but .intro wins (higher specificity) */
p {
  color: gray;
}

.intro {
  color: navy;
}

/* Same specificity — later rule wins */
.card {
  padding: 1rem;
}

.card {
  padding: 1.5rem; /* this padding applies */
}
```

When debugging, use DevTools **Computed** tab to see which rule won and which were overridden (shown with strikethrough).

**Tip:** Keep a single source of truth for base styles (e.g., element defaults in one file) and avoid scattering duplicate selectors across many files — source-order surprises multiply quickly.

**Try it:** Create an HTML page with `<p class="intro">Hello</p>`. Write two color rules as above, then add a third rule `p.intro { color: crimson; }` and predict the final color before refreshing.

---
### Lesson 2. Specificity Scored Like a Game
**Takeaway:** Specificity is `(inline, IDs, classes/attributes/pseudo-classes, elements/pseudo-elements)`. Compare left to right; never add the numbers as plain integers.

**Explain:** Specificity determines which selector wins when two rules have equal importance and origin. Think of it as four columns, not one big number:

| Column | Examples | Weight |
|--------|----------|--------|
| Inline styles | `style="color: red"` | 1,0,0,0 |
| IDs | `#header` | 0,1,0,0 |
| Classes, attributes, `:hover`, `:nth-child()` | `.btn`, `[type="text"]`, `:focus` | 0,0,1,0 |
| Elements, `::before`, `::after` | `div`, `p`, `::before` | 0,0,0,1 |

```css
/* 0,0,1,1 — one class + one element */
nav a.active {
  color: white;
}

/* 0,0,2,0 — two classes, beats nav a.active */
.sidebar .active {
  color: lime;
}

/* 0,1,0,0 — one ID beats any number of classes */
#logo {
  width: 120px;
}
```

**Never** write selectors like `#nav .menu ul li a.link` just to "force" a win. High specificity makes future overrides painful and leads to `!important` wars.

The universal selector `*`, combinators (`>`, `+`, `~`), and pseudo-elements like `::placeholder` add **zero** specificity.

**Tip:** Prefer low-specificity patterns: a single class per component (`.card__title`) beats long chained selectors and keeps the cascade predictable.

**Try it:** Given selectors `#app .btn`, `.btn.primary`, and `button.btn`, rank them by specificity and determine which color applies to `<button class="btn primary" id="app">`.

---
### Lesson 3. Inheritance — What Flows Down the Tree
**Takeaway:** Some properties inherit from parent to child (color, font-family); others do not (margin, padding, border, width). Use `inherit`, `initial`, `unset`, and `revert` deliberately.

**Explain:** Inheritance is separate from the cascade. Child elements automatically receive **inherited** properties from ancestors unless a closer rule sets a value.

**Commonly inherited:** `color`, `font-family`, `font-size`, `line-height`, `text-align`, `visibility`, `cursor`.

**Not inherited:** `margin`, `padding`, `border`, `background`, `width`, `height`, `display`, `position`.

```css
body {
  font-family: system-ui, sans-serif;
  color: #222;
  line-height: 1.6;
}

/* Links don't inherit color by default in most browsers — set explicitly */
a {
  color: inherit;
}

.card {
  /* Reset margin that headings might carry */
  margin: 0;
}

.reset-input {
  font: inherit; /* shorthand inherits all font-* properties */
  color: inherit;
}
```

Keyword values:

- `inherit` — force inheritance even when property normally wouldn't.
- `initial` — spec default (often not the same as browser default).
- `unset` — inherit if inheritable, else initial.
- `revert` — roll back to user-agent stylesheet default.

**Tip:** Set typography on `body` or `:root` once; components inherit a consistent base instead of re-declaring `font-family` everywhere.

**Try it:** Nest a `<span>` inside a `<div style="color: blue">`. Set `span { border: 1px solid currentColor; }` and observe how `currentColor` uses the inherited text color for the border.

---
### Lesson 4. Specificity Wars and When !important Backfires
**Takeaway:** `!important` breaks normal cascade order and creates maintenance debt. Reach for it only for utility overrides or third-party CSS you cannot edit — never as a default tool.

**Explain:** Appending `!important` to a declaration makes it win over normal declarations, even with lower specificity — unless another `!important` with higher specificity also exists.

```css
.button {
  background: steelblue !important; /* wins over .sidebar .button */
}

.sidebar .button {
  background: coral; /* ignored */
}

/* Utility escape hatch — common in design systems */
.u-hidden {
  display: none !important;
}
```

Problems with overusing `!important`:

1. Every future override also needs `!important`.
2. Specificity stops mattering, so source order becomes the only lever — chaos in large codebases.
3. DevTools debugging becomes harder.

Better strategies before `!important`:

- Increase selector **appropriateness**, not length: target `.btn--danger` instead of `#page .content div .btn`.
- Restructure HTML to avoid fighting existing rules.
- Use cascade layers (`@layer`, Lesson 28) for intentional ordering.

**Tip:** If you need one-off overrides in a prototype, a `.is-active` or `[data-state="open"]` modifier class keeps specificity flat and avoids `!important`.

**Try it:** Write two background rules for the same element — one with `!important`, one with an ID selector. Remove `!important` and add a modifier class instead; confirm both approaches work but note which is easier to override later.

---
## Box Model

### Lesson 5. Content, Padding, Border, and Margin
**Takeaway:** Every element is a rectangular box built from content → padding → border → margin, outside in. Total space an element occupies depends on all four layers.

**Explain:** The CSS box model describes how dimensions and spacing compose:

```
┌──────── margin ────────┐
│ ┌──── border ────────┐ │
│ │ ┌── padding ─────┐ │ │
│ │ │    content     │ │ │
│ │ └────────────────┘ │ │
│ └────────────────────┘ │
└────────────────────────┘
```

```css
.box {
  width: 200px;       /* content width (default box-sizing) */
  height: 100px;
  padding: 16px;      /* space inside the border */
  border: 2px solid #333;
  margin: 24px;       /* space outside the border, between siblings */
  background: #eef;
}

/* Margin collapse: vertical margins between block siblings merge
   to the larger value, not the sum */
.block-a { margin-bottom: 30px; }
.block-b { margin-top: 20px; }
/* Gap between them is 30px, not 50px */
```

`width` and `height` by default apply to the **content box** only — padding and border add to the total rendered size (see Lesson 6).

**Tip:** Use DevTools box-model diagram on any element to see computed content, padding, border, and margin at a glance.

**Try it:** Create three stacked `<div class="box">` elements with different margins and borders. Measure total height in DevTools with default vs `border-box` (next lesson).

---
### Lesson 6. box-sizing: border-box Changes Everything
**Takeaway:** `box-sizing: border-box` makes `width`/`height` include padding and border, which makes layout math intuitive. Set it globally.

**Explain:** Default `content-box` means `width: 300px` plus padding and border expands the element beyond 300px. `border-box` includes padding and border inside the declared width.

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

.card {
  width: 300px;
  padding: 20px;
  border: 4px solid #ccc;
  /* Total outer width stays 300px with border-box */
}

/* Without border-box, total width = 300 + 40 + 8 = 348px */
.old-card {
  box-sizing: content-box;
  width: 300px;
  padding: 20px;
  border: 4px solid #ccc;
}
```

This is especially critical in grid/flex layouts where children with percentage widths and padding would otherwise overflow.

**Tip:** The global reset above is industry standard. Pair it with `margin: 0` on `body` if you want a clean slate (many reset/normalize libraries do this).

**Try it:** Build two 50%-width columns with `padding: 20px` — one with `content-box`, one with `border-box`. Observe which pair fits on one row without wrapping.

---
### Lesson 7. Block, Inline, and Inline-Block Display Types
**Takeaway:** Block elements stack vertically and fill available width; inline elements flow with text and ignore vertical margin/height; inline-block combines horizontal flow with box model control.

**Explain:**

| `display` | Behavior |
|-----------|----------|
| `block` | New line, full width available, respects width/height/margin |
| `inline` | Flows with text, no width/height, horizontal margin/padding only |
| `inline-block` | Sits in text flow but accepts box dimensions |
| `none` | Removed from layout entirely |

```css
span.blocky {
  display: block;
  background: #ffd;
  margin: 8px 0;
  padding: 8px;
}

a.buttonish {
  display: inline-block;
  padding: 0.5em 1em;
  background: #2563eb;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

/* Modern alternative to inline-block for nav items: flex on parent */
nav {
  display: flex;
  gap: 1rem;
}
```

Inline elements also introduce subtle spacing from whitespace in HTML between tags — flex/grid or setting `font-size: 0` on the parent (hacky) can eliminate gaps between inline-blocks.

**Tip:** Don't use `inline-block` for whole-page layout anymore — flex and grid (Lessons 10–19) replace most historical inline-block patterns.

**Try it:** Style three `<span>` elements as inline, then inline-block with fixed width/height, then block. Note which properties (`margin-top`, `width`) take effect in each mode.

---
## Units & Typography

### Lesson 8. CSS Units — When to Use px, rem, em, %, and Viewport Units
**Takeaway:** Prefer `rem` for scalable typography and spacing; use `%` and `fr` for fluid layouts; reserve `px` for hairlines and precise borders; use viewport units sparingly for hero typography.

**Explain:**

```css
:root {
  font-size: 100%; /* usually 16px in browsers */
  --space-md: 1rem; /* 16px if root is 16px */
}

html {
  font-size: 16px; /* explicit root for rem math */
}

body {
  font-size: 1rem;    /* 16px — scales if user changes root */
  padding: 1.5rem;
}

.hero-title {
  font-size: clamp(2rem, 5vw + 1rem, 4rem);
  /* fluid between 32px and 64px */
}

.container {
  width: min(100% - 2rem, 1200px); /* modern centered container */
  margin-inline: auto;
}

.sidebar {
  width: 25%; /* relative to parent, not viewport */
}

.icon {
  width: 24px; /* fixed pixel art / borders often stay px */
  border: 1px solid #ccc;
}
```

**rem** — relative to root font size; consistent across nested components.

**em** — relative to **current element's** font size; useful for padding proportional to text (`padding: 0.5em 1em` on buttons).

**vw/vh** — 1vw = 1% of viewport width; watch out for mobile browser chrome causing `100vh` bugs (use `dvh` where supported).

**Tip:** Use `clamp(min, preferred, max)` for responsive type without dozens of media queries.

**Try it:** Set `html { font-size: 62.5%; }` so `1rem = 10px` mentally, then build spacing scale `--space-1: 0.8rem` through `--space-6: 3.2rem`.

---
### Lesson 9. Typography — Readable, Consistent, Accessible Type
**Takeaway:** Limit font families, establish a modular scale, set comfortable line-length (~60–75 characters), and never disable user zoom with fixed pixel font sizes on root.

**Explain:** Good typography is mostly rhythm and restraint:

```css
:root {
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.5rem;
  --text-2xl: 2rem;

  --leading-tight: 1.25;
  --leading-normal: 1.6;
  --leading-loose: 1.75;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: #1a1a1a;
}

h1, h2, h3 {
  line-height: var(--leading-tight);
  font-weight: 700;
  text-wrap: balance; /* avoids orphaned words in headings */
}

.prose {
  max-width: 65ch; /* character-based measure */
}

code, pre {
  font-family: var(--font-mono);
  font-size: 0.9em;
}

/* OpenType features when available */
body {
  font-feature-settings: "kern" 1, "liga" 1;
  -webkit-font-smoothing: antialiased;
}
```

Pair heading sizes using a ratio (e.g., 1.25 major third): each level ~1.25× the previous. Use `font-weight` and `letter-spacing` for labels (`0.05em` uppercase microcopy).

**Tip:** Load max two font families (one sans, one mono). Every additional webfont is latency and layout shift.

**Try it:** Build a `.prose` article with `h1`, paragraphs, and `code`. Set `max-width: 65ch` and toggle `line-height` between 1.4 and 1.8 to feel the readability difference.

---
## Flexbox Complete

### Lesson 10. Flex Container Fundamentals
**Takeaway:** `display: flex` on a parent turns direct children into flex items laid out along a main axis; everything else stays normal block flow.

**Explain:** Flexbox is a one-dimensional layout system — one primary axis at a time (row **or** column, not both simultaneously like grid).

```css
.toolbar {
  display: flex;
  /* main axis defaults to horizontal (row) */
  /* cross axis is perpendicular (vertical in row mode) */
}

.toolbar > * {
  /* each direct child becomes a flex item */
}

/* Minimal centered layout — extremely common pattern */
.center-screen {
  display: flex;
  justify-content: center; /* main axis */
  align-items: center;     /* cross axis */
  min-height: 100vh;
}
```

Only **direct children** participate. Nested elements are unaffected unless their parent is also a flex container.

Flex items default to `flex-shrink: 1` (they can shrink below content size) and `flex-grow: 0` (they won't expand to fill extra space).

**Tip:** Add `gap: 1rem` instead of margin hacks between flex children — gap works in flex and grid in modern browsers.

**Try it:** Make a horizontal toolbar with logo, nav links, and a button. Use `display: flex` and `gap` only — no floats.

---
### Lesson 11. flex-direction and flex-wrap
**Takeaway:** `flex-direction` chooses the main axis; `flex-wrap` controls whether items stay on one line or wrap to new flex lines.

**Explain:**

```css
.stack {
  display: flex;
  flex-direction: column; /* main axis top → bottom */
  gap: 1rem;
}

.row-wrap {
  display: flex;
  flex-direction: row; /* default: left → right in LTR */
  flex-wrap: wrap;     /* items wrap to next line when needed */
  gap: 1rem;
}

/* Shorthand */
.flex-row-wrap {
  display: flex;
  flex-flow: row wrap; /* direction + wrap */
}

/* Reverse variants flip start/end of main axis */
.rtl-row {
  flex-direction: row-reverse;
}
```

When items wrap, each line is its own flex line with independent cross-axis alignment. `align-content` (Lesson 12) controls spacing **between** wrapped lines.

Without `flex-wrap: wrap`, shrinking items (`flex-shrink: 1`) may crush content rather than wrapping — set `flex-wrap: wrap` for responsive component rows.

**Tip:** Mobile-first pattern: `flex-direction: column` by default, switch to `row` in a media query for wider screens.

**Try it:** Create eight `.tag` items in a flex row with `flex-wrap: wrap` and fixed `gap`. Resize the browser and count how flex lines form.

---
### Lesson 12. justify-content and align-items — Axis Alignment
**Takeaway:** `justify-content` aligns items along the **main axis**; `align-items` aligns along the **cross axis**. Confusing them is the #1 flexbox mistake.

**Explain:**

```css
.card-row {
  display: flex;
  justify-content: space-between; /* main: spread items apart */
  align-items: center;            /* cross: vertically center in row mode */
  min-height: 80px;
  padding: 1rem;
  border: 1px solid #ddd;
}

/* justify-content values */
.space-demo {
  display: flex;
  justify-content: flex-start;   /* default */
  /* flex-end | center | space-between | space-around | space-evenly */
}

/* align-items values */
.cross-demo {
  display: flex;
  align-items: stretch;    /* default — items fill cross size */
  /* flex-start | flex-end | center | baseline */
}

/* Per-item override */
.tall-item {
  align-self: flex-end; /* overrides align-items for one item */
}
```

For wrapped flex containers, `align-content` distributes **lines** along the cross axis (e.g., `align-content: center` when extra vertical space exists).

Memory aid: **justify** = main axis (think "justifying text" horizontally in a row); **align** = cross axis.

**Tip:** `margin-left: auto` on a flex item pushes it (and following items) to the far end — handy for "logo left, nav right" without `space-between`.

**Try it:** Build a header with logo and nav. Center nav items with `justify-content: center`, then push nav right using `margin-left: auto` on the nav element.

---
### Lesson 13. flex-grow, flex-shrink, and flex-basis
**Takeaway:** The `flex` shorthand controls how items grow to fill space, shrink when cramped, and their starting size before free space is distributed.

**Explain:**

```css
.sidebar-layout {
  display: flex;
  gap: 1rem;
}

.sidebar {
  flex: 0 0 240px; /* grow shrink basis — fixed 240px sidebar */
  /* don't grow, don't shrink, start at 240px */
}

.main {
  flex: 1 1 auto; /* grow to fill remaining space */
  /* equivalent to flex: 1 in most cases */
}

.equal-columns {
  display: flex;
}

.equal-columns > * {
  flex: 1; /* shorthand for 1 1 0% — equal width columns */
}

/* Prevent crushing: shrink-0 on icons or labels */
.icon {
  flex-shrink: 0;
}
```

`flex-basis` is the hypothetical starting size before free space distribution. `flex: 1` sets basis to `0%`, so all items share space equally regardless of content width.

```css
/* Explicit longhand when debugging */
.item {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 200px;
}
```

**Tip:** Use `min-width: 0` on flex children that contain text — otherwise default `min-width: auto` prevents shrinking and breaks overflow ellipsis.

**Try it:** Build sidebar + main layout. Set sidebar to `flex: 0 0 200px` and main to `flex: 1`. Narrow the viewport and confirm sidebar stays 200px until wrap (if you add `flex-wrap`).

---
### Lesson 14. Practical Flexbox Patterns — Holy Grail, Cards, and Forms
**Takeaway:** Flexbox excels at navigation bars, sticky footers, equal-height card rows, and form field groups — patterns you'll use daily.

**Explain:**

**Sticky footer** — page fills viewport, footer sticks to bottom:

```css
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-main {
  flex: 1; /* absorbs extra vertical space */
}
```

**Equal-height cards in a row:**

```css
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.card {
  flex: 1 1 280px; /* at least 280px, grow equally */
  display: flex;
  flex-direction: column;
}

.card-body {
  flex: 1; /* pushes footer/button to bottom of card */
}
```

**Inline form row:**

```css
.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
}

.form-row label {
  display: flex;
  flex-direction: column;
  flex: 1 1 200px;
}
```

**Tip:** When a flex pattern gets two-dimensional (rows **and** columns of complex tracks), switch to CSS Grid (Lessons 15–19).

**Try it:** Implement the sticky footer with header, expanding main, and footer. Confirm footer stays at bottom on a short page and flows naturally on a long page.

---
## Grid Complete

### Lesson 15. Grid Container Fundamentals
**Takeaway:** `display: grid` creates a two-dimensional layout of rows and columns simultaneously; direct children become grid items placed by explicit or implicit tracks.

**Explain:** Unlike flexbox's single axis, grid defines **both** dimensions at once:

```css
.grid {
  display: grid;
  /* items flow row-by-row into auto-generated columns by default */
}

/* Explicit tracks */
.simple-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto 200px auto;
  gap: 16px;
}

.grid-item {
  /* default: spans 1 column, 1 row */
  background: #e0f2fe;
  padding: 1rem;
}
```

Grid introduces powerful concepts:

- **Tracks** — rows and columns (explicit via template or implicit via auto-placement).
- **Gap** — gutters between tracks (replaces old grid hacks with margins).
- **fr unit** — fractional free space (like flex-grow for tracks).

```css
.auto-fit-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
```

One line produces a fully responsive card grid without media queries.

**Tip:** Use `display: grid` for page layouts and card matrices; use flex for toolbars and one-dimensional component internals.

**Try it:** Create a 3×3 grid of numbered divs with `gap: 8px`. Toggle `grid-template-columns` between `repeat(3, 1fr)` and `repeat(auto-fit, minmax(100px, 1fr))` while resizing.

---
### Lesson 16. grid-template-columns and grid-template-rows
**Takeaway:** Define track sizes with px, fr, minmax(), auto, and repeat(); mix fixed sidebars with fluid centers using fr intelligently.

**Explain:**

```css
.layout {
  display: grid;
  grid-template-columns: 240px 1fr 240px; /* holy grail columns */
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 0;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(12, 1fr); /* 12-column system */
  gap: 1rem;
}

.span-8 {
  grid-column: span 8;
}

.span-4 {
  grid-column: span 4;
}

/* minmax prevents tracks from collapsing too small */
.responsive {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

/* Named line syntax (advanced) */
.complex {
  grid-template-columns:
    [sidebar-start] 200px
    [sidebar-end main-start] 1fr
    [main-end];
}
```

`auto-fill` vs `auto-fit`: `auto-fill` keeps empty tracks; `auto-fit` collapses empty tracks so items stretch to fill the row.

**Tip:** A 12-column grid mirrors Bootstrap/Tailwind conventions — span utilities map naturally (`col-span-8` = `grid-column: span 8`).

**Try it:** Build a dashboard with 12-column grid. Place a chart spanning 8 columns and a sidebar widget spanning 4 on the same row.

---
### Lesson 17. grid-template-areas for Semantic Layouts
**Takeaway:** Name regions with `grid-template-areas` and assign items via `grid-area` for readable, refactor-friendly page layouts.

**Explain:** Area-based layout maps ASCII art directly to CSS:

```css
.site {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  gap: 1rem;
}

.site-header  { grid-area: header; }
.site-nav     { grid-area: nav; }
.site-main    { grid-area: main; }
.site-aside   { grid-area: aside; }
.site-footer  { grid-area: footer; }

/* Responsive: stack on small screens */
@media (max-width: 768px) {
  .site {
    grid-template-areas:
      "header"
      "nav"
      "main"
      "aside"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

Rules for `grid-template-areas`:

- Each row must have the same number of cells.
- Each named area must be rectangular (no L-shapes).
- Use `.` for empty cells.

**Tip:** Redesigning layout becomes rearranging the ASCII template — no hunting through dozens of `grid-column` values.

**Try it:** Create the five-area layout above with colored backgrounds per region. At 768px, switch to single-column areas without changing individual item properties.

---
### Lesson 18. Gap, Alignment, and Justification in Grid
**Takeaway:** `gap` sets track spacing; `justify-items`/`align-items` position items inside cells; `justify-content`/`align-content` position the whole grid when tracks don't fill the container.

**Explain:**

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(3, 150px);
  gap: 1rem 2rem; /* row-gap column-gap */
  justify-content: center; /* entire grid block horizontal */
  align-content: center;   /* entire grid block vertical */
  min-height: 400px;
}

.gallery-item {
  justify-self: stretch; /* default — fill cell width */
  align-self: center;    /* vertical within cell */
}

/* Place single item precisely */
.featured {
  grid-column: 2 / 4; /* lines 2 through 4 (spans 2 columns) */
  grid-row: 1 / 3;
}
```

Line-based placement uses **grid lines** (1-indexed): `grid-column: 1 / 3` spans from line 1 to line 3 (two columns).

Shorthand: `place-items: center` (= align + justify items), `place-content: center` (= align + justify content).

**Tip:** `justify-items: center` with fixed-size tracks centers each item in its cell — different from centering the whole grid with `justify-content`.

**Try it:** Make a 3×3 gallery where the center item spans 2×2 using line numbers. Center the entire grid in a 800px container with `justify-content: center`.

---
### Lesson 19. Practical Grid Patterns — Dashboard, Gallery, and Subgrid
**Takeaway:** Combine auto-fit, minmax, and areas for production layouts; use `subgrid` (where supported) to align nested content with parent tracks.

**Explain:**

**Auto-responsive photo gallery:**

```css
.photos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 4px;
}

.photos img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}
```

**Dashboard with dense packing:**

```css
.widgets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  grid-auto-flow: dense; /* fills holes with smaller items */
}

.widget-wide {
  grid-column: span 2;
}
```

**Subgrid** — child grid inherits parent tracks:

```css
.card-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.card {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3; /* title, body, footer align across cards */
}
```

Subgrid solves equal-height card internals without flex hacks. Check [caniuse.com](https://caniuse.com) for browser support in your target audience.

**Tip:** `aspect-ratio` pairs beautifully with grid — uniform thumbnails without fixed heights.

**Try it:** Build an auto-fit widget dashboard. Add one `.widget-wide` spanning two columns and enable `grid-auto-flow: dense` to see gap-filling behavior.

---
## Positioning & Stacking

### Lesson 20. static, relative, absolute, fixed, and sticky
**Takeaway:** `position` removes elements from normal flow (except `relative`) and anchors them to containing blocks; `sticky` hybrid sticks within its scroll container.

**Explain:**

```css
/* static — default, normal flow */
.box { position: static; }

/* relative — offset from normal position, still occupies original space */
.badge-parent {
  position: relative;
}

.badge {
  position: relative;
  top: -8px;
  left: 4px;
}

/* absolute — removed from flow, positioned vs nearest positioned ancestor */
.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
}

.icon-btn {
  position: relative; /* establishes containing block for .dropdown */
}

/* fixed — relative to viewport, removed from flow */
.modal-backdrop {
  position: fixed;
  inset: 0; /* top/right/bottom/left: 0 */
  background: rgba(0, 0, 0, 0.5);
}

/* sticky — toggles between relative and fixed */
.sticky-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 100;
}
```

Key rules:

- Absolutely positioned elements use the nearest ancestor with `position` not `static` (or the viewport).
- `sticky` requires a scrolling ancestor and a `top`/`bottom` threshold; parent `overflow: hidden` breaks it.
- `inset: 0` is shorthand for pinning all edges.

**Tip:** Always set `position: relative` on the direct parent of an absolutely positioned dropdown — not `<body>` unless intentional.

**Try it:** Build a card with `position: relative` and a "Sale" badge in the top-right corner using `position: absolute; top: 8px; right: 8px`.

---
### Lesson 21. z-index and Stacking Contexts
**Takeaway:** `z-index` only compares elements within the same stacking context; new contexts are created by `position` + `z-index`, `opacity < 1`, `transform`, `filter`, and more.

**Explain:** Developers often set `z-index: 9999` and wonder why it still hides behind something. The issue is almost always **stacking contexts** — isolated layers.

```css
.modal {
  position: fixed;
  z-index: 1000;
  /* creates its own stacking context */
}

.dropdown {
  position: absolute;
  z-index: 50; /* only competes within parent context */
}

.sidebar {
  position: relative;
  z-index: 1; /* creates context — traps children inside */
}

/* Common context creators */
.context-trap {
  transform: translateZ(0); /* or any transform */
  opacity: 0.99;
  filter: blur(0);
  isolation: isolate; /* explicit new context */
}
```

Stacking order (simplified, same context):

1. Background/border of stacking context root
2. Negative z-index children
3. Block-level in-flow content
4. Floats
5. In-flow inline content
6. z-index: auto / 0 positioned elements
7. Positive z-index positioned elements

**Tip:** Define a z-index scale in design tokens (`--z-dropdown: 100`, `--z-modal: 200`, `--z-toast: 300`) instead of arbitrary large numbers.

**Try it:** Nest a dropdown inside a sidebar with `z-index: 1`. Give dropdown `z-index: 9999` and watch it still clip behind a sibling modal — then fix by raising sidebar's context or portal the dropdown to `body`.

---
## Responsive Patterns

### Lesson 22. Media Queries and Mobile-First Design
**Takeaway:** Mobile-first means default styles target small screens; `min-width` media queries progressively enhance for larger viewports.

**Explain:**

```css
/* Base: mobile */
.container {
  padding: 1rem;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }

  .nav {
    flex-direction: row;
    justify-content: space-between;
  }

  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Common breakpoints (guidelines, not gospel): 640px, 768px, 1024px, 1280px. Prefer **content-based** breakpoints — resize until layout breaks, then add a query.

Modern alternatives: container queries (Lesson 27) for component-level responsiveness; `clamp()` for fluid spacing without queries.

**Tip:** Use `min-width` (mobile-first), not `max-width` (desktop-first), unless maintaining legacy desktop-first code.

**Try it:** Build a single-column card list that becomes 2 columns at 768px and 3 at 1024px using only `min-width` queries.

---
### Lesson 23. Responsive Images, Fluid Type, and Container Width
**Takeaway:** Combine `max-width: 100%`, `srcset`/`sizes` in HTML, `object-fit`, and fluid typography so content adapts without horizontal scroll or blurry images.

**Explain:**

```css
img, video {
  max-width: 100%;
  height: auto;
  display: block;
}

.hero-img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover; /* crop to fill box */
}

.avatar {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 50%;
}

/* Fluid type without breakpoints */
h1 {
  font-size: clamp(1.75rem, 4vw, 3rem);
}

/* Prevent overflow from long URLs */
.prose {
  overflow-wrap: break-word;
  word-break: break-word;
}

/* Safe area for notched phones */
.footer {
  padding-bottom: env(safe-area-inset-bottom);
}
```

HTML side (pair with CSS):

```html
<img
  src="photo-800.jpg"
  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w"
  sizes="(min-width: 768px) 50vw, 100vw"
  alt="Description"
/>
```

`sizes` tells the browser how wide the image renders at each viewport — critical for picking the right `srcset` candidate.

**Tip:** Always set explicit `width` and `height` attributes on `<img>` (or `aspect-ratio` in CSS) to prevent cumulative layout shift (CLS).

**Try it:** Place a wide image in a narrow column with `max-width: 100%`. Add `aspect-ratio: 16/9` and `object-fit: cover` and compare layout stability with and without dimensions.

---
## Transitions & Animations

### Lesson 24. Transitions — Smooth Property Changes
**Takeaway:** `transition` animates property changes between two states over time; always specify what triggers the change (`:hover`, class toggle, JS).

**Explain:** Transitions need a start value, end value, and trigger:

```css
.button {
  background: #2563eb;
  color: white;
  padding: 0.75em 1.5em;
  border: none;
  border-radius: 6px;
  transition: background 0.2s ease, transform 0.15s ease;
}

.button:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
}

.button:active {
  transform: translateY(0);
}

.card {
  transition: box-shadow 0.3s ease, opacity 0.3s ease;
}

.card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* Transition only animatable properties */
.panel {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease;
}

.panel.is-open {
  max-height: 500px; /* approximate — see grid-template-rows trick for smooth auto height */
}
```

Syntax: `transition: property duration timing-function delay`.

Timing functions: `ease`, `linear`, `ease-in-out`, or `cubic-bezier(0.4, 0, 0.2, 1)`.

**Tip:** Prefer transitioning `transform` and `opacity` — they are GPU-friendly and don't trigger layout reflow. Avoid transitioning `width`/`height` on large pages.

**Try it:** Create a button with hover lift (`translateY`) and shadow transition. Toggle a class with JS to expand a panel using `max-height` transition.

---
### Lesson 25. @keyframes Animations — Loops, Choreography, and Performance
**Takeaway:** `@keyframes` define multi-step animations independent of user interaction; use `animation` shorthand for repeats, direction, and fill modes.

**Explain:**

```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toast {
  animation: fade-in-up 0.4s ease both;
  /* both = forwards + backwards fill mode */
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}

.skeleton {
  background: #e5e7eb;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #ccc;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Pause off-screen animations for performance */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
    border-top-color: #2563eb;
  }
}
```

`animation` properties: `name`, `duration`, `timing-function`, `delay`, `iteration-count`, `direction`, `fill-mode`, `play-state`.

Choreograph entrance with staggered delays in JS or `animation-delay` per child (`nth-child`).

**Tip:** One-shot entrance animations (`forwards` fill mode) prevent elements from snapping back when animation ends.

**Try it:** Build a loading spinner and a toast that fades in from below. Add `prefers-reduced-motion` to disable the spinner rotation.

---
## Modern CSS: Custom Props, Container Queries, @layer

### Lesson 26. Custom Properties (CSS Variables)
**Takeaway:** `--token: value` on `:root` creates reusable, cascade-aware, runtime-updatable design tokens — superior to preprocessor variables for theming.

**Explain:**

```css
:root {
  --color-bg: #ffffff;
  --color-text: #111827;
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --radius-md: 8px;
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --space-unit: 0.25rem;
}

[data-theme="dark"] {
  --color-bg: #111827;
  --color-text: #f9fafb;
  --color-primary: #60a5fa;
  --color-primary-hover: #93c5fd;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
}

.btn-primary {
  background: var(--color-primary);
  border-radius: var(--radius-md);
  padding: calc(var(--space-unit) * 4) calc(var(--space-unit) * 6);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

/* Local scope — overrides inherit down subtree */
.card {
  --card-padding: 1.5rem;
  padding: var(--card-padding);
}

.card-compact {
  --card-padding: 0.75rem;
}

/* Fallback syntax */
.muted {
  color: var(--color-muted, #6b7280);
}
```

Unlike Sass variables, custom properties are live in the browser — toggle `[data-theme="dark"]` on `<html>` and everything updates. They inherit and participate in the cascade.

**Tip:** Name tokens by role (`--color-surface-elevated`), not appearance (`--color-light-gray`), so dark mode swaps stay semantic.

**Try it:** Define light/dark token sets on `:root` and `[data-theme="dark"]`. Add a JS button that toggles the attribute and watch colors update without reloading CSS.

---
### Lesson 27. Container Queries — Component-Level Responsiveness
**Takeaway:** `@container` lets components respond to their **parent container's width**, not the viewport — essential for reusable cards, sidebars, and widgets.

**Explain:**

```css
.card-wrapper {
  container-type: inline-size;
  container-name: card; /* optional */
}

@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 1rem;
  }

  .card-image {
    aspect-ratio: 1;
  }
}

@container (min-width: 600px) {
  .product {
    flex-direction: row;
  }
}

/* Container query units */
.sidebar-widget {
  container-type: inline-size;
}

.widget-title {
  font-size: clamp(1rem, 4cqw, 1.5rem);
  /* cqw = 1% of container width */
}
```

Setup requirements:

1. Parent declares `container-type: inline-size` (or `size` for both axes).
2. Child styles use `@container (min-width: …)` instead of `@media`.

This fixes the problem of a "mobile" card layout inside a wide sidebar because the viewport is desktop-sized.

Shorthand: `container: card / inline-size`.

**Tip:** Pair container queries with fluid `clamp()` — component adapts to both container **and** typographic bounds.

**Try it:** Place the same `.card` component in a narrow (250px) and wide (500px) container. Use `@container (min-width: 400px)` to switch from stacked to horizontal layout — no viewport media query.

---
### Lesson 28. @layer — Explicit Cascade Control
**Takeaway:** `@layer` lets you declare intentional precedence order among stylesheet groups, reducing specificity hacks when combining resets, components, and utilities.

**Explain:**

```css
/* Declare order — first layer loses, last wins (among layers) */
@layer reset, base, components, utilities;

@layer reset {
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
  }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    line-height: 1.6;
  }

  a {
    color: var(--color-primary);
  }
}

@layer components {
  .btn {
    padding: 0.5em 1em;
    border-radius: 4px;
    background: var(--color-primary);
    color: white;
  }
}

@layer utilities {
  .text-center { text-align: center; }
  .mt-4 { margin-top: 1rem; }
}

/* Unlayered styles beat ALL layered styles */
.critical-fix {
  color: red;
}
```

Import with layer assignment:

```css
@import url("vendor.css") layer(vendor);
@import url("components.css") layer(components);
```

Layers compare **before** specificity within a layer. Two `.btn` rules in different layers — the higher layer wins regardless of specificity (unless unlayered).

**Tip:** Match layer names to your file structure (`tokens`, `base`, `components`, `utilities`) for predictable overrides in design systems.

**Try it:** Define `.btn` in both `components` (blue) and `utilities` (green) layers. Confirm utilities layer wins with equal specificity, then add an unlayered rule and see it trump both.

---
## Architecture: BEM, Modules, Tailwind Tradeoffs

### Lesson 29. BEM Naming — Block, Element, Modifier
**Takeaway:** BEM (`Block__Element--Modifier`) produces flat, readable class names with predictable specificity — one class per element, state via modifiers.

**Explain:**

```css
/* Block */
.card { }

/* Element — part of block */
.card__title { }
.card__body { }
.card__footer { }

/* Modifier — variant or state */
.card--featured {
  border: 2px solid gold;
}

.card__title--large {
  font-size: 1.5rem;
}

.btn {
  display: inline-block;
  padding: 0.5em 1em;
}

.btn--primary { background: #2563eb; color: white; }
.btn--ghost   { background: transparent; border: 1px solid currentColor; }
.btn--disabled { opacity: 0.5; pointer-events: none; }
```

HTML:

```html
<article class="card card--featured">
  <h2 class="card__title card__title--large">Featured</h2>
  <div class="card__body">Content</div>
  <footer class="card__footer">
    <button class="btn btn--primary">Buy</button>
  </footer>
</article>
```

Rules:

- Don't nest selectors (`.card .title`) — use `.card__title`.
- Modifiers aren't standalone — combine with block/element: `btn btn--primary`.
- Avoid deep chains; if names get long (`search-form__input--error`), the block might need splitting.

**Tip:** BEM pairs well with SCSS `&__element` nesting for authoring, as long as compiled CSS stays flat.

**Try it:** Refactor a nested CSS snippet (`.nav ul li a.active`) into BEM classes and update HTML accordingly. Count selector specificity before and after.

---
### Lesson 30. CSS Modules — Scoped Styles by Default
**Takeaway:** CSS Modules hash class names at build time so styles are locally scoped to components — no global namespace collisions, with explicit `:global()` escapes when needed.

**Explain:** In frameworks like Next.js, Vite, or Webpack, importing a `.module.css` file returns a map of scoped class names:

```css
/* Button.module.css */
.root {
  composes: base from "./typography.module.css";
  padding: 0.5em 1em;
  border-radius: 6px;
  background: var(--color-primary);
  color: white;
}

.root:hover {
  filter: brightness(1.1);
}

.icon {
  margin-right: 0.5em;
}

/* Escape hatch for global styles */
:global(.theme-dark) .root {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
}
```

```jsx
import styles from "./Button.module.css";

export function Button({ children, icon }) {
  return (
    <button className={styles.root}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
}
```

Compiled output might become `.Button_root_x7f3a` — unique per file.

Benefits: colocation with components, dead-code elimination, no accidental global overrides.

Tradeoffs: no built-in theming story (use custom properties), `composes` behavior varies by bundler, dynamic class names need careful handling.

**Tip:** Use camelCase class names in modules (`.primaryButton`) for ergonomic JS access: `styles.primaryButton`.

**Try it:** If using a bundler with CSS Modules, create `Card.module.css` with `.card`, `.title`, `.body`. Import in a component and verify hashed class names in DevTools.

---
### Lesson 31. Tailwind CSS — Utility-First Tradeoffs
**Takeaway:** Tailwind trades semantic class names for composable utility classes applied in markup — fast iteration and consistent design tokens, but verbose HTML and learning curve.

**Explain:**

Utility-first example (conceptual — requires Tailwind in project):

```html
<article class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
  <h2 class="text-xl font-semibold text-gray-900 mb-2">Card Title</h2>
  <p class="text-gray-600 leading-relaxed mb-4">Description text.</p>
  <button class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
    Action
  </button>
</article>
```

**Pros:**

- No naming fatigue — no debates over `.card__title--highlighted`.
- Design tokens enforced via config (`theme.extend.colors`).
- Purge/tree-shake removes unused utilities in production.
- Responsive prefixes: `md:flex`, `lg:grid-cols-3`.

**Cons:**

- HTML verbosity and readability suffer in complex UIs.
- Repeating long class strings across files — extract components (React/Vue), not `@apply` everywhere.
- `@apply` in CSS files reintroduces indirection Tailwind tries to avoid.
- Harder for designers to read markup; requires Tailwind IntelliSense.

When `@apply` makes sense (sparingly):

```css
@layer components {
  .btn-primary {
    @apply inline-flex rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700;
  }
}
```

**Tip:** Extract repeated utility combos into framework components (`<Button variant="primary">`), not large `@apply` blocks — keeps purge working and markup clean.

**Try it:** Build the same card in plain BEM CSS and utility classes side by side. Compare line counts, readability, and how you'd change the primary color globally in each approach.

---
### Lesson 32. Choosing Your CSS Architecture — Decision Framework
**Takeaway:** No single "best" approach — match architecture to team size, project lifespan, and framework; combine layers, tokens, and scoping where each shines.

**Explain:** Use this decision framework:

| Factor | Lean toward |
|--------|-------------|
| Small static site, few pages | Plain CSS + `@layer` + custom properties |
| Component framework (React/Vue) | CSS Modules or scoped `<style>` |
| Design system, many contributors | Tokens on `:root` + documented components |
| Rapid prototyping, solo dev | Tailwind utilities |
| Large legacy codebase | BEM refactor zones + `@layer` to tame cascade |
| Theming / white-label | Custom properties + `[data-theme]` |
| Third-party widget isolation | Shadow DOM or strict BEM prefixes |

Recommended modern stack for many apps:

```css
@layer reset, tokens, base, components, utilities;

@layer tokens {
  :root {
    --color-primary: #2563eb;
    --space-4: 1rem;
  }
}

@layer components {
  /* BEM-ish or module-composed components */
  .dialog { /* ... */ }
}
```

```jsx
// Component uses CSS Module + design tokens
import styles from "./Dialog.module.css";

export function Dialog() {
  return (
    <div className={styles.overlay} role="dialog">
      <div className={styles.panel}>...</div>
    </div>
  );
}
```

Principles that outlive any tool:

1. **Low specificity** — easy overrides without `!important`.
2. **Design tokens** — single source for color, space, type.
3. **Colocation** — styles live near the component they style.
4. **Document conventions** — naming, layers, and file structure in README or Storybook.

Avoid mixing all paradigms unplanned (BEM + Tailwind + global SCSS nesting) — pick primary strategy per codebase region.

**Tip:** Revisit architecture at project milestones (MVP, v1, scale) — what saved time prototyping may hurt maintainability at scale.

**Try it:** Audit a small open-source project: identify which architecture it uses, locate token definitions, and list one thing you'd change if joining the team.

---
