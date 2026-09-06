# CSS Interview Notes

Say-aloud answers for CSS and layout interviews. Each question includes a **Short definition** and a full **Answer** you can speak naturally. Code and follow-ups are for when the interviewer pushes deeper.

---

## Fundamentals, Cascade & Specificity

### Q1. How does the CSS cascade decide which rule wins? [must-know]

**Short definition:** The cascade combines origin, importance, specificity, and source order to pick one winning declaration per property.

**Answer:** The cascade combines origin (user, author, browser), importance (`!important`), specificity, and source order. When conflicts remain, higher specificity beats lower; ties break by last rule in the stylesheet at the same origin and importance level. Understanding this prevents "random" overrides in large codebases and explains why a utility class sometimes loses to a nested component selector. Layers (`@layer`) add another ordering dimension on top of specificity for author styles. Interviewers want you to debug conflicts methodically, not reach for `!important` first.

**Follow-up:** What beats specificity?
**Common mistake:** Adding `!important` everywhere instead of fixing selector structure.

---

### Q2. Explain specificity calculation. [must-know]

**Short definition:** Specificity is counted as inline styles, IDs, classes/attributes/pseudo-classes, then types/pseudo-elements.

**Answer:** Count inline styles, IDs, classes/attributes/pseudo-classes, and type/pseudo-elements—in that order as (1,0,0,0) style tuples or the classic a-b-c-d mental model. Universal selector and combinators do not add specificity. Two classes beat one element selector even if the element rule looks "more specific" visually in the stylesheet. Inline styles beat IDs unless `!important` in author stylesheet overrides user rules in specific cases. When teaching aloud, walk through an example selector and add up each bucket explicitly.

```css
#nav .item a { } /* 0,1,1,1 */
ul li.active { } /* 0,0,1,2 */
```

---

### Q3. What is inheritance in CSS?

**Short definition:** Some properties pass computed values from parent to child; layout properties usually do not.

**Answer:** Some properties inherit from parent to child—typical text properties like `color`, `font-family`, and `line-height`. Layout properties usually do not inherit (`margin`, `width`, `border`). Use `inherit`, `initial`, `unset`, or `revert` explicitly when you want controlled propagation. `unset` acts as inherit for inherited properties and initial for others—handy in resets. Knowing defaults saves you from setting `color` on every nested span.

**Follow-up:** Does `border` inherit?
**Common mistake:** Expecting `box-sizing` to inherit when it does not by default.

---

### Q4. Difference between `em`, `rem`, and `%`?

**Short definition:** `em` is relative to the element's font size, `rem` to root, and `%` depends on the property's reference box.

**Answer:** `em` is relative to the element's font size, compounding in nested text—padding in `em` grows with heading font size. `rem` is relative to the root font size, giving stable scaling across the page regardless of nesting depth. `%` depends on the property—width often versus parent width, line-height versus own font size. Prefer `rem` for global spacing and typography tokens; use `em` for component-internal rhythm tied to local text size. Mixing all three without a system creates inconsistent spacing at scale.

---

### Q5. What are CSS custom properties (variables)? [must-know]

**Short definition:** `--token` variables live in the cascade, inherit, and resolve at computed-value time in the browser.

**Answer:** Custom properties like `--color-primary` live in the cascade, inherit, and can change per scope, media query, or JavaScript assignment. They enable theming and runtime updates unlike preprocessor variables compiled away at build time. Invalid references fall back to the guaranteed-invalid value, which enables useful cascade patterns. Set tokens on `:root` or a theme attribute and consume with `var(--token, fallback)`. They are the backbone of modern design systems in plain CSS.

```css
:root {
  --space-md: 1rem;
  --brand: #2563eb;
}
.card {
  padding: var(--space-md);
  color: var(--brand);
}
```

---

### Q6. `@layer` and cascade layers—why use them?

**Short definition:** Layers declare ordered buckets where layer order beats selector specificity within normal importance.

**Answer:** Layers let you declare ordered buckets—reset, components, utilities—where order beats specificity within normal importance. Later-declared layers win over earlier ones regardless of selector weight inside those layers. Great for design systems coexisting with utility classes without specificity arms races. `!important` inverts layer priority—document that carefully if you use important utilities. Layers do not replace thoughtful naming; they organize conflict resolution.

**Follow-up:** Do layers affect `!important` the same way?
**Common mistake:** Assuming utilities always win without layering or specificity context.

---

### Q7. What is the `:is()` pseudo-class for?

**Short definition:** `:is()` groups selectors with the specificity of its most specific argument.

**Answer:** `:is()` groups selectors with the specificity of its most specific argument, reducing repetition in complex lists. `:where()` is similar but contributes zero specificity, ideal for low-specificity resets. Use them to simplify complex selector lists without bloating specificity accidentally. Example: `:is(h1, h2, h3)` shares one rule block without comma duplication errors. They improve readability in large stylesheets and component libraries.

---

### Q8. How do user-agent styles interact with your CSS?

**Short definition:** Browsers ship default styles; resets or normalize establish a predictable baseline before your rules.

**Answer:** Browsers ship default styles for elements—margins on `body`, list bullets, button chrome—that differ slightly between engines. Resets or normalize.css establish a predictable baseline before your rules apply. Never fight UA styles blindly; understand what you are overriding and why. Form controls especially retain platform-specific appearance unless you normalize with `appearance` and custom styles. Document your reset choice in team conventions.

---

### Q9. What are CSS selectors and common types?

**Short definition:** Selectors match elements in the DOM—by type, class, id, attribute, relationship, or state.

**Answer:** Selectors describe which elements a rule applies to: type (`p`), class (`.btn`), ID (`#logo`), attribute (`[disabled]`), combinators (descendant, child `>`, adjacent `+`), and pseudo-classes (`:hover`, `:focus-visible`). Prefer low-specificity, readable selectors that survive maintenance—avoid `#id` chains for styling when a class suffices. The browser matches selectors right-to-left for efficiency internally, but authors should write for clarity. Overly broad selectors like `div div div` become performance and specificity debt.

**Follow-up:** What is the difference between class and ID selectors?

---

### Q10. Class selector vs ID selector?

**Short definition:** Classes are reusable styling hooks; IDs must be unique per page and carry higher specificity.

**Answer:** A class selector such as `.button` can match many elements and is ideal for reusable styling and component variants. An ID selector `#header` must be unique in the document and carries higher specificity that is hard to override without tricks. In CSS architecture, prefer classes for styling; reserve IDs for fragment links, label associations, and scripting hooks. IDs winning specificity battles is a common source of "!important creep" in legacy codebases. Interview answer: style with classes, identify with IDs when uniqueness matters.

**Common mistake:** Using IDs for styling because "it's only used once."

---

## Box Model

### Q11. Explain the CSS box model. [must-know]

**Short definition:** Every element is a box with content, padding, border, and margin layers outward.

**Answer:** Every element is a rectangular box with content, padding, border, and margin layers outward. `width` and `height` by default apply to the content box only unless `box-sizing: border-box` is set. Margin collapses vertically between adjacent block boxes in normal flow. Understanding the box model explains overflow, clickable area, and why padding increases background fill but margin does not. DevTools box model overlay is your friend in layout debugging.

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

---

### Q12. `content-box` vs `border-box`? [must-know]

**Short definition:** `content-box` adds padding and border outside declared width; `border-box` includes them inside the width.

**Answer:** `content-box` adds padding and border on top of declared width, so a 200px box with 20px padding becomes 240px total. `border-box` includes padding and border inside the width, making responsive layouts predictable when padding changes at breakpoints. Most modern resets set border-box globally with the universal inherit trick. Interviewers expect you to say border-box is the default mental model for layout math today. Mixing models across components causes grids to misalign by a few pixels mysteriously.

**Follow-up:** Does `box-sizing` inherit usefully?
**Common mistake:** Mixing models across components and wondering why grids misalign by a few pixels.

---

### Q13. What is margin collapse?

**Short definition:** Adjacent vertical margins of block boxes combine into one margin equal to the largest, not the sum.

**Answer:** Adjacent vertical margins of block-level boxes combine into one margin equal to the largest, not the sum. It affects siblings and parent-first-child relationships in normal flow. Flex and grid containers prevent margin collapse between flex or grid items. Horizontal margins do not collapse. Fix unwanted collapse by creating a new block formatting context or using padding/flex instead of hacking with tiny borders unless necessary.

**Follow-up:** How do you prevent unwanted collapse?
**Common mistake:** Adding padding to parent when a formatting context (`overflow`, flex) is cleaner.

---

### Q14. Difference between margin and padding?

**Short definition:** Padding is inside the border around content; margin is outside the border separating elements.

**Answer:** Padding is space inside an element between its content and border; it receives the element's background and increases the visual hit area inside the border. Margin is space outside the border that separates this element from neighbors and stays transparent. Padding affects clickable area for inline links wrapped in padded buttons; margin affects layout flow and collapse. Use padding for internal breathing room; margin for external spacing between siblings. In flex/grid, `gap` often replaces margin hacks between items.

---

### Q15. How does `outline` differ from `border`?

**Short definition:** Outlines do not affect layout; borders participate in box dimensions.

**Answer:** Outlines do not affect layout or box size—they sit outside the border for focus rings and debug highlights. Borders participate in box dimensions and can be rounded independently with `border-radius`. Use outline or `:focus-visible` styles for keyboard focus, not border swaps alone that shift layout. Outlines can be non-rectangular on complex shapes in some browsers. Never remove focus outlines globally without a visible `:focus-visible` replacement.

---

### Q16. `min-width: 0` in flex/grid children—why?

**Short definition:** Flex/grid items default to `min-width: auto`, which can block shrinking below content size.

**Answer:** Flex and grid items default `min-width: auto`, which can prevent shrinking below content size and cause overflow in narrow containers. Setting `min-width: 0` (or `min-height: 0` on column flex) lets truncation and scrolling work as designers expect. Common fix for ellipsis in flex rows where text refuses to shrink. Also needed for scrollable flex children that must shrink inside a fixed sidebar. Mention this proactively in flex interviews—it signals real layout battle scars.

---

### Q17. What creates a block formatting context (BFC)?

**Short definition:** A BFC is an isolated layout region containing floats and altering margin collapse behavior.

**Answer:** A BFC is an isolated layout region—floats stay inside, margins collapse differently, and content clears floats without extra markup. Triggers include `overflow` not visible, `display: flow-root`, flex/grid items, and floats themselves. Useful for containing floats without clearfix hacks and for preventing margin bleed between nested and parent blocks. `flow-root` was invented explicitly to create a BFC without side effects of `overflow: hidden` clipping focus rings. Choose the lightest trigger that solves your problem.

---

### Q18. `width: 100%` still overflows—why?

**Short definition:** Percent width is relative to the containing block; padding, borders, or min-content size can push past 100%.

**Answer:** Percent width is relative to the containing block; adding padding/border in content-box pushes total width past 100%. Parent min-content size or long unbreakable strings also cause overflow when children cannot shrink. Border-box, wrapping, `overflow-wrap: anywhere`, and `min-width: 0` in flex fix most cases. `100vw` includes scrollbar width and can cause horizontal scroll—often prefer `100%` of a constrained parent. Always trace the containing block chain in DevTools when percentages misbehave.

---

## Display & Positioning

### Q19. Compare `display: block`, `inline`, and `inline-block`. [must-know]

**Short definition:** Block stacks vertically; inline flows in text; inline-block flows inline but accepts width and height.

**Answer:** Block boxes stack vertically and accept width/height; inline boxes flow in lines and ignore vertical margins/height in classic inline layout. Inline-block flows inline but behaves like a block for sizing—useful for buttons and pills before flex ubiquity. Modern layouts often use flex/grid instead of inline-block column hacks. `display: none` removes from layout entirely; `visibility: hidden` preserves space. Know defaults so you understand what `display: flex` overrides.

---

### Q20. When use `position: relative` vs `absolute` vs `fixed`?

**Short definition:** Relative offsets from normal position; absolute removes from flow against positioned ancestor; fixed anchors to viewport.

**Answer:** `relative` offsets from normal position and establishes containing block for absolute descendants without leaving flow. `absolute` removes from flow and positions against the nearest positioned ancestor, not necessarily the viewport. `fixed` anchors to the viewport unless a transform/filter ancestor creates a containing block; `sticky` toggles between relative and fixed at scroll thresholds. Choose the simplest position value that preserves document flow—absolute for overlays inside a card, fixed for viewport toolbars. Sticky needs `top`/`bottom` set and breaks under `overflow: hidden` ancestors.

**Follow-up:** What is the containing block for `fixed`?
**Common mistake:** Absolutely positioning without a positioned parent, landing relative to the viewport unexpectedly.

---

### Q21. What is `position: sticky` and its requirements?

**Short definition:** Sticky stays in flow until scroll crosses a threshold, then sticks within its scroll container.

**Answer:** Sticky stays in flow until scroll crosses a threshold, then sticks within its scroll container like a fixed element scoped to the parent. Requires a `top`/`bottom`/`left`/`right` offset and no ancestor with `overflow: hidden` breaking stickiness unexpectedly. Parent height must allow scrolling room or sticky never triggers—common bug in short containers. Z-index may be needed when sticky headers slide under siblings. Excellent for table headers and section nav without JavaScript scroll listeners.

---

### Q22. How do `z-index` and stacking contexts work?

**Short definition:** `z-index` orders positioned elements within a stacking context; new contexts trap z-index comparisons.

**Answer:** `z-index` orders positioned elements within the same stacking context; new contexts form with opacity less than 1, transforms, filters, `isolation: isolate`, and certain properties. A high `z-index` inside a low context cannot beat elements outside that context. Debug stacking by finding context roots in DevTools 3D view or computed styles. Modals need both portal-like DOM placement and correct context, not just `z-index: 9999`. Document stacking decisions in design systems for overlays, toasts, and tooltips.

**Common mistake:** Raising z-index endlessly on modals without checking parent contexts.

---

### Q23. `visibility: hidden` vs `display: none`?

**Short definition:** `display: none` removes from layout; `visibility: hidden` hides visually but keeps layout space.

**Answer:** `display: none` removes the box from layout and typically from the accessibility tree for non-ARIA toggles. `visibility: hidden` hides visually but preserves layout space unless `collapse` on table rows/columns. For toggling UI, pick based on whether you need space reserved and whether assistive tech should expose the content. `hidden` attribute in HTML maps to similar semantics for visibility in modern browsers. Animating between them requires different techniques—opacity and max-height vs display none blockers.

---

### Q24. What does `overflow: auto` vs `scroll` vs `hidden` do?

**Short definition:** `auto` scrolls when needed; `scroll` always shows scrollbars; `hidden` clips overflow.

**Answer:** `auto` shows scrollbars when content overflows; `scroll` always reserves scrollbars; `hidden` clips content without scrolling. Overflow creates a scroll container and can create a block formatting context. Accessible scroll regions need keyboard focusability if users must interact with clipped content. `overflow: hidden` on ancestors breaks `position: sticky`—a frequent production bug. Prefer `auto` over `scroll` unless you need stable layout with always-visible scrollbar gutters.

---

### Q25. Floats in modern CSS—still relevant?

**Short definition:** Floats wrap text around images; flex/grid replaced most layout float hacks.

**Answer:** Floats originally wrapped text around images; flex/grid replaced most layout float hacks for columns and grids. Floats still matter for legacy support, `shape-outside` typographic effects, and occasional print layouts. Clearfix is historical—prefer flex/grid for component layout. If you see float-based grids in old code, plan migration when touching those modules. Mention `float` only when discussing typography or maintaining legacy CSS.

---

### Q26. What is `aspect-ratio` and when use it?

**Short definition:** `aspect-ratio` sets a preferred width-to-height ratio so boxes keep proportion before content loads.

**Answer:** The `aspect-ratio` property maintains width-to-height proportion independent of explicit height—ideal for video embeds, cards, and image placeholders. Pair with `width: 100%` and `object-fit: cover` on images inside ratio boxes. Replaces padding-top percentage hacks for 16:9 embeds with clearer intent. Helps prevent CLS when combined with HTML width/height attributes on images. Supported broadly in modern browsers for layout and media UI.

```css
.video-wrap {
  aspect-ratio: 16 / 9;
  width: 100%;
}
.video-wrap iframe {
  width: 100%;
  height: 100%;
}
```

---

### Q27. What does `object-fit` do?

**Short definition:** `object-fit` controls how replaced content like images fills its box—cover, contain, fill, etc.

**Answer:** `object-fit` applies to replaced elements—`img`, `video`—controlling how content scales within its box like background-size for foreground media. `cover` crops to fill; `contain` letterboxes; `fill` stretches. Use with fixed aspect-ratio containers for uniform card grids with mixed photo dimensions. `object-position` shifts focal point when cropping with `cover`. Essential for responsive image layouts without squashing aspect ratios.

---

## Flexbox

### Q28. What problems does Flexbox solve? [must-know]

**Short definition:** Flexbox lays out items in one dimension with alignment, distribution, and flexible sizing along the main axis.

**Answer:** Flexbox lays out items in one dimension with alignment, distribution, and flexible sizing along the main axis. It excels at nav bars, centering, equal-height columns in a row, and responsive rows that wrap. Parent controls alignment; children can grow/shrink with `flex` shorthand. It solves the classic vertical centering problem that plagued pre-flex CSS. Use it for component internals and one-dimensional macro layout before reaching for grid.

```css
.row {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}
```

---

### Q29. Explain `flex-direction`, `justify-content`, and `align-items`.

**Short definition:** Direction sets main axis; `justify-content` aligns on main axis; `align-items` on cross axis for one line.

**Answer:** `flex-direction` sets the main axis (row or column). `justify-content` aligns along the main axis; `align-items` aligns on the cross axis for a single line of items. Multi-line cross-axis distribution uses `align-content` when `flex-wrap: wrap` creates multiple lines. `gap` applies between items without margin collapse tricks. Reversing direction with `row-reverse` flips main-start and main-end for RTL-aware patterns when not using logical properties.

**Follow-up:** Where does `gap` apply in flex?
**Common mistake:** Using `justify-content: center` on a wrapping row expecting vertical gaps between wrapped lines without `align-content`.

---

### Q30. Flexbox vs Grid—when to choose which? [must-know]

**Short definition:** Flexbox is one-dimensional; Grid is two-dimensional with explicit rows and columns together.

**Answer:** Flexbox is one-dimensional—row or column as the primary distribution axis. Grid is two-dimensional—rows and columns together with explicit track sizing and placement. Use flex for toolbars, button groups, and linear distributions where items flow in one direction. Use grid for page shells, dashboards, card collections, and anywhere you need both axes coordinated. Nesting flex inside grid cells (or vice versa) is normal—grid for macro layout, flex for micro alignment inside each cell.

| Criterion | Flexbox | Grid |
|-----------|---------|------|
| Dimensions | One axis at a time | Rows and columns together |
| Best for | Nav bars, toolbars, aligning items in a row/column | Page layouts, dashboards, card grids |
| Content-driven sizing | Strong—flex grow/shrink from content | Strong with `auto-fit` / `minmax` tracks |
| Explicit placement | Reorder with `order`; limited 2D placement | `grid-area`, line numbers, named areas |
| Gap support | Yes (`gap`) | Yes (`gap`) |
| Typical pattern | Components and 1D lists | App shell + responsive card grids |
| Interview rule of thumb | "Line things up in a row or column" | "Define the whole layout grid first" |

**Follow-up:** Can you nest flex inside grid?
**Common mistake:** Using flex wrap hacks for 2D layouts grid handles cleanly.

---

### Q31. What does `flex: 1` mean?

**Short definition:** Shorthand for `flex: 1 1 0%`—grow and shrink enabled with zero basis sharing space equally.

**Answer:** Shorthand for `flex: 1 1 0%`—grow and shrink enabled with zero basis so items share free space equally. `flex: auto` uses content-based basis (`1 1 auto`). Read as grow, shrink, basis when debugging uneven columns—developers often confuse `flex: 1` with `flex-grow: 1` alone. `flex: none` locks size to content without growing. Document flex shorthand in design tokens when sidebars and main panes split space.

---

### Q32. `align-self` vs `align-items`?

**Short definition:** `align-items` sets default cross-axis alignment for all children; `align-self` overrides one child.

**Answer:** `align-items` sets default cross-axis alignment for all flex children; `align-self` overrides one child. Handy for baseline alignment exceptions or stretching a single item while siblings stay `flex-start`. Order of precedence: self beats container default. Works in grid too with similar cross-axis meaning. Use sparingly—many exceptions suggest the container alignment choice should change instead.

---

### Q33. When does `flex-wrap` matter?

**Short definition:** Without wrap, flex items shrink onto one line; wrap allows responsive row breaks.

**Answer:** Without wrap, flex items shrink to fit one line, which can crush content unreadably. `flex-wrap: wrap` allows rows to break, pairing with `min-width` on items for responsive card rows. Combine with `gap` instead of negative margin hacks between wrapped rows. Set `align-content` when you need vertical spacing between wrapped lines. Mobile-first card lists often use `flex-wrap` with `minmax`-like flex-basis or switch to grid for stricter columns.

---

### Q34. Flexbox and `margin: auto` trick?

**Short definition:** Auto margins on flex items absorb free space—classic pattern to push one item to the far end.

**Answer:** On flex items, `margin-left: auto` pushes an item to the end of the main axis—classic "push nav link right" pattern in a toolbar. Vertical centering in flex often uses `align-items: center` instead of margin auto, but auto margins work on the cross axis too in some cases. Auto margins absorb free space in flex and override some alignment defaults. Know this pattern for header bars before reaching for `justify-content: space-between` when only one item should move.

---

### Q35. Can flex items shrink below content size?

**Short definition:** Default `min-width: auto` prevents shrinking below content minimum unless you set `min-width: 0`.

**Answer:** Default `min-width: auto` prevents shrinking below content min size; combined with `flex-shrink`, overflow can still happen visibly. Set `min-width: 0` and text truncation rules when you need shrink-to-fit behavior in sidebars and tables inside flex. Same applies to nested flex columns with scrollable areas. Mention overflow, text-overflow, and white-space together when discussing truncation. This triad is a common live-coding follow-up.

---

## Grid

### Q36. Explain `grid-template-columns` and `fr` units. [must-know]

**Short definition:** `fr` distributes leftover space proportionally after fixed tracks and gaps resolve.

**Answer:** `fr` distributes free space proportionally after fixed tracks resolve—`1fr 2fr` gives one third and two thirds of leftover space. `repeat(3, 1fr)` makes three equal columns; `minmax(200px, 1fr)` enforces minimum readable width while allowing growth. Grid calculates tracks from container size, gaps, and auto rows/columns for implicit tracks. `auto-fit` and `auto-fill` with `minmax` create responsive card grids without media queries. Grid is the interview favorite for "build a responsive dashboard" questions.

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}
```

---

### Q37. What is `grid-template-areas`?

**Short definition:** Named areas map human-readable layout regions to grid cells via `grid-area` on children.

**Answer:** Named areas map human-readable layouts to cells via `grid-area` on children—strings like `"header header"` / `"sidebar main"`. Changing layout for breakpoints can swap area assignments in media queries without reordering DOM. Excellent for readable responsive shells without `order` hacks that break accessibility. Every cell must form a rectangle—invalid area shapes invalidate the whole template. Great for marketing pages; app shells often use explicit line-based placement instead.

---

### Q38. `auto-fit` vs `auto-fill` in `repeat()`?

**Short definition:** Both create as many columns as fit; `auto-fit` collapses empty tracks so items expand.

**Answer:** Both create as many columns as fit the container; `auto-fit` collapses empty tracks so items expand to fill width when fewer items exist. `auto-fill` keeps empty tracks occupying space, leaving gaps at the end of the row. Choose auto-fit for fluid card grids that should stretch when the last row is incomplete. Choose auto-fill when you want fixed column slots regardless of item count. Demo both in DevTools when interviewers ask—you remember better after seeing the empty tracks.

---

### Q39. How does `grid-column` / `grid-row` spanning work?

**Short definition:** Items span tracks with line numbers or `span N` syntax; implicit tracks appear if spans exceed the template.

**Answer:** Items span tracks with `grid-column: 1 / 3` or `span 2` shorthand. Implicit tracks appear if spans exceed explicit template—watch auto-placement surprises when items overlap. Named lines and areas reduce off-by-one errors in large layouts. `grid-column: 1 / -1` spans full width—a useful full-bleed pattern inside constrained grids. Subgrid aligns nested internal tracks to parent tracks for typographic alignment across cards.

---

### Q40. Alignment in Grid: `justify-items` vs `justify-content`?

**Short definition:** `justify-items` aligns items inside cells; `justify-content` distributes tracks when grid is smaller than container.

**Answer:** `justify-items` aligns items inside their cells; `justify-content` distributes tracks within the grid container when total track size is smaller than the container. Similar split on the block axis with `align-items` and `align-content`. `place-items` and `place-content` set both axes shorthand. Distinguish item vs track alignment clearly in interviews—mixing them up is a common wrong answer. Flex uses parallel terminology on main and cross axes with different names.

---

### Q41. Subgrid—what problem does it solve?

**Short definition:** Subgrid lets nested grids align internal tracks to the parent grid's track lines.

**Answer:** Subgrid lets nested grids align to parent track lines, keeping typographic columns aligned across sibling components like cards in a row. Support is now broad in modern browsers after years of waiting. Without subgrid, nested grids misalign internal tracks relative to the page grid, breaking visual rhythm. Declare `grid-template-columns: subgrid` on the child grid spanning parent columns. Mention progressive enhancement when subgrid is cosmetic, not structural.

---

## Responsive Design & Media Queries

### Q42. Mobile-first vs desktop-first CSS? [must-know]

**Short definition:** Mobile-first writes base styles for small screens, then adds `min-width` queries for larger layouts.

**Answer:** Mobile-first writes base styles for small screens, then `min-width` media queries add complexity as space grows. Desktop-first uses `max-width` queries to simplify down—harder to maintain and tends to load desktop-heavy defaults on mobile. Mobile-first aligns with progressive enhancement and performance priorities on constrained networks. Base CSS should work on the smallest supported viewport without horizontal scroll. Interviewers associate mobile-first with modern product teams consciously.

```css
.card { padding: 1rem; }
@media (min-width: 768px) {
  .card { padding: 2rem; }
}
```

---

### Q43. Which breakpoints should you use?

**Short definition:** Breakpoints should follow content breakage points, not device catalog lists.

**Answer:** Breakpoints should follow content, not device lists—add a query when layout breaks, not at every phone width in a marketing slide. Common starting points (480, 768, 1024) exist but are guidelines only. Measure in browser with responsive mode and real content, especially long German words or dynamic user data. Container queries reduce viewport breakpoint sprawl for reusable components. Document team breakpoints but allow new ones when designs genuinely break.

**Common mistake:** Copying Bootstrap breakpoints without testing your design.

---

### Q44. `prefers-reduced-motion`—why care?

**Short definition:** OS setting requests minimal animation; CSS should shorten or remove nonessential motion.

**Answer:** Users with vestibular disorders may disable animations OS-wide; `@media (prefers-reduced-motion: reduce)` lets you shorten or remove motion. Respect `prefers-color-scheme` similarly for dark mode defaults. Accessibility and comfort, not polish only—WCAG 2.2 references reduced motion expectations. Never block functionality when motion is removed; essential feedback can remain as instant state changes. Test with OS accessibility settings, not just DevTools emulation.

---

### Q45. Container queries vs media queries?

**Short definition:** Media queries react to viewport; container queries react to a parent container's size.

**Answer:** Media queries react to viewport; container queries (`@container`) react to a parent's size—components adapt in sidebar vs main column independently. Define `@container-type: inline-size` (or `size`) on ancestors, then query with `@container (min-width: ...)`. Better encapsulation for reusable components shipped to unknown page contexts. Container query units (`cqw`, `cqh`) size relative to the container. Not every component needs them—start with viewport queries for page shell, containers for cards and widgets.

**Follow-up:** What is container query size containment?
**Common mistake:** Expecting container queries without setting container type/name.

---

### Q46. Responsive typography strategies?

**Short definition:** Use fluid type with `clamp()` and constrain line length for readable prose at all sizes.

**Answer:** Use fluid type with `clamp(min, preferred, max)` tied to viewport or container units. Maintain readable line-length (~45–75 characters) with `max-width` on prose blocks. Scale heading steps consistently with modular scales or design tokens. Avoid pure `vw` text without clamps—it becomes unreadable on large monitors. Pair typography tokens with `rem` so user font-size settings still respect accessibility.

```css
h1 {
  font-size: clamp(1.75rem, 2vw + 1rem, 3rem);
}
.prose {
  max-width: 65ch;
}
```

---

### Q47. `picture` vs CSS for responsive images?

**Short definition:** HTML chooses which asset downloads; CSS scales the chosen image in layout.

**Answer:** HTML `picture`/`srcset` chooses assets and art direction; CSS scales chosen image within layout boxes. Art direction and format negotiation belong in markup; layout sizing belongs in CSS with `max-width` and `aspect-ratio`. Do not hide wrong-resolution assets purely in CSS—users still download the oversized file. Coordinate with `object-fit` for crop behavior inside fixed-ratio cards. Performance interviews connect this to LCP and byte weight, not just layout.

---

## Units, Variables & Functions

### Q48. When to use `vh`/`vw` and what are their pitfalls? [must-know]

**Short definition:** Viewport units size relative to viewport; mobile dynamic UI makes classic `100vh` unreliable for full-screen sections.

**Answer:** Viewport units size relative to viewport; `100vh` full-screen sections are common for heroes and splash screens. Mobile browsers dynamic UI makes `100vh` taller than visible area—`dvh`, `svh`, and `lvh` address dynamic, small, and large viewport heights. Avoid tiny text with pure `vw` without clamps—use `clamp` for fluid headings. `100vw` can include scrollbar width and cause horizontal overflow. Prefer `%` or flex/grid fr units when sizing relative to components, not the whole screen.

---

### Q49. `calc()` and mixed units?

**Short definition:** `calc()` evaluates expressions mixing px, %, rem, etc. at computed-value time.

**Answer:** `calc()` evaluates expressions mixing px, %, rem, and other lengths at computed-value time—great for gutters and sidebar layouts like `width: calc(100% - 260px)`. Whitespace around `+` and `-` operators is required by the spec. Nested calc is less needed as `min()`, `max()`, and `clamp()` cover many cases. Useful in grid templates: `grid-template-columns: 240px calc(100% - 240px)`. Safe fallback when design needs fixed sidebar plus fluid main.

---

### Q50. `clamp()`, `min()`, and `max()` in modern CSS?

**Short definition:** These functions bound responsive values without many manual breakpoint stair-steps.

**Answer:** These functions bound responsive values without many media queries—`clamp` is min-preferred-max in one call. They work in many properties beyond font-size, like padding and grid tracks. Prefer them over manual breakpoint stair-steps when smooth scaling fits the design. `max(1rem, 2vw)` ensures a floor; `min(90vw, 1200px)` caps width. They reduce CSS size and make intent readable in code review.

---

### Q51. Logical properties (`margin-inline`, `padding-block`)?

**Short definition:** Logical properties map to inline/block sides based on writing mode instead of physical left/right.

**Answer:** Logical properties map to physical sides based on writing mode—inline start/end instead of left/right, block start/end instead of top/bottom. They simplify RTL and vertical writing support without duplicate rules. Prefer logical APIs in new code for internationalization readiness—`margin-inline-start` replaces `margin-left` in many patterns. Shorthands like `padding-inline` and `margin-block` reduce four-property declarations. Physical properties remain fine for purely LTR internal tools but logical scales globally.

---

### Q52. `@property` for registered custom properties?

**Short definition:** `@property` registers type and initial value so custom properties can animate reliably.

**Answer:** `@property` registers type, inheritance, and initial value for a custom property, enabling animatable transitions on variables. Without registration, browsers treat custom properties as untyped strings that cannot interpolate smoothly. Useful for animated theme toggles, gradient stops, and progress indicators driven by `--progress`. Syntax requires a defined syntax like `<color>` or `<length>`. Progressive enhancement—provide static fallbacks where registration is unsupported.

---

### Q53. Color spaces: `oklch` and why designers care?

**Short definition:** OKLCH offers perceptually uniform lightness steps—smoother gradients and palettes than sRGB hex.

**Answer:** OKLCH offers perceptually uniform lightness steps—gradients and palettes look smoother than sRGB hex hacks. Modern browsers support `oklch()` and `color()` for wide-gamut displays. Fall back to sRGB for older clients with `@supports` or layered declarations. Design tokens in OKLCH simplify "slightly lighter variant" generation. Mention accessibility—perceptual uniformity helps contrast tuning but still requires measurement.

---

### Q54. Pseudo-classes vs pseudo-elements?

**Short definition:** Pseudo-classes select elements in a state (`:hover`); pseudo-elements style subparts (`::before`).

**Answer:** Pseudo-classes like `:hover`, `:focus-visible`, and `:nth-child()` select elements in a state or position. Pseudo-elements like `::before`, `::after`, and `::placeholder` style generated or sub-part content. Single colon historically worked for both in old CSS; modern spec uses `::` for pseudo-elements. Pseudo-elements often need `content` for decorative glyphs. Do not put essential text only in `::before`—screen readers may skip it.

---

### Q55. What is the `:has()` relational selector?

**Short definition:** `:has()` selects an element based on descendants or following siblings—parent selection from child conditions.

**Answer:** `:has()` selects an element if it contains a matching descendant or, in some patterns, following siblings—enabling parent styling from child state without JavaScript. Example: `.card:has(img)` adds padding when an image is present. Useful for form error styling when an input has `:invalid` inside a field wrapper. Support is modern and broad enough for progressive enhancement. Changes specificity calculations—use deliberately in component styles.

```css
.field:has(input:invalid) {
  border-color: var(--error);
}
```

---

## Animations & Transitions

### Q56. Transition vs animation? [must-know]

**Short definition:** Transitions interpolate on property changes; animations run keyframed timelines independently.

**Answer:** Transitions interpolate between start and end states on property changes—one-shot, user or state driven. Animations use `@keyframes` for multi-step, looping, or independent timelines. Pick transitions for hovers and focus feedback; animations for loaders and complex sequences. Transitions need explicit start and end values; animations define intermediate keyframes explicitly. Both should respect `prefers-reduced-motion`.

```css
.btn {
  transition: transform 150ms ease, box-shadow 150ms ease;
}
.btn:active {
  transform: scale(0.98);
}
```

---

### Q57. Which properties are cheap to animate?

**Short definition:** Favor `transform` and `opacity`—they often composite on the GPU without triggering layout.

**Answer:** Favor `transform` and `opacity`—they often composite on the GPU without triggering layout or paint of the whole page. Animating `width`, `top`, or `margin` triggers layout and can jank on low-end devices. Use `will-change` sparingly as a hint before animation starts, not as a permanent default. For height animations, consider `grid-template-rows` transitions or FLIP techniques instead of animating `height: auto` directly. Profile with Performance panel when in doubt.

**Follow-up:** What is layout thrashing?
**Common mistake:** Animating `height: auto` without measuring or using alternate patterns.

---

### Q58. Explain easing functions.

**Short definition:** Easing controls acceleration curve—`ease-out` for entrances, `ease-in` for exits.

**Answer:** Easing controls acceleration—`ease-out` for entrances, `ease-in` for exits, custom `cubic-bezier` for brand motion curves. Linear feels mechanical for UI micro-interactions unless used deliberately for progress bars. Match duration to distance—large movement needs longer timing than small opacity fades. Material and Apple HIG document standard curves teams reuse. Spring physics in JS libraries approximates what CSS easing approximates with beziers.

---

### Q59. `animation-fill-mode` and `forwards`?

**Short definition:** `forwards` keeps the final keyframe state after animation ends instead of reverting.

**Answer:** `forwards` keeps the final keyframe state after animation ends instead of reverting to pre-animation values. `both` applies backwards fill before start delay too—useful when initial keyframe should apply during delay. Without fill modes, elements snap back unexpectedly when animation completes. Pair with `animation-iteration-count: 1` for one-shot entrance animations. For toggling classes, consider transitions instead to avoid fill-mode complexity.

---

### Q60. `@media (prefers-reduced-motion)` in animations?

**Short definition:** Replace large motion with instant state changes or subtle opacity when user requests reduced motion.

**Answer:** Replace large parallax or zoom with instant state changes or opacity fades when reduced motion is requested. Never block functionality—motion is decorative in most UI feedback cases. Wrap `@keyframes` overrides inside the reduced-motion media query. Test with Windows and macOS accessibility settings enabled. Some teams store user preference in a data attribute synced from OS query on load.

---

### Q61. View Transitions API (CSS side)?

**Short definition:** Captures old/new snapshots for smooth SPA route or DOM updates with CSS pseudo-elements.

**Answer:** The View Transitions API captures old and new snapshots for smooth page or SPA route changes with pseudo-elements like `::view-transition-old(root)`. CSS can style cross-fades and shared element transitions between routes. Progressive enhancement—fallback is instant swap without breaking navigation. Works in Chromium-family browsers; provide no-op fallback elsewhere. Connects to same-document transitions for tabs and wizards in modern docs.

---

## Modern Practices (BEM, Modules, Tailwind)

### Q62. What is BEM and why use it? [must-know]

**Short definition:** Block Element Modifier naming makes selector intent explicit with flat, predictable specificity.

**Answer:** Block Element Modifier naming—`.card`, `.card__title`, `.card--featured`—makes selector intent explicit and avoids deep nesting. Specificity stays flat and predictable compared to SCSS nesting that compiles to long compound selectors. It scales in large teams when enforced consistently in code review. Modifiers represent state or variant, not duplicate blocks. BEM is methodology, not syntax enforced by the browser—discipline matters.

```css
.card { }
.card__title { }
.card--featured { }
```

---

### Q63. CSS Modules—how do they work?

**Short definition:** Build-time scoped class names prevent global collisions when importing CSS from JS.

**Answer:** CSS Modules scope class names locally at build time—imports return mapped identifiers, avoiding global collisions in React and Vue pipelines. Composition via `composes` shares rules safely between module files. Popular in Vite, webpack, and Next.js with component colocation. Global styles still need `:global()` escape hatches for resets. Modules do not auto-scope element selectors affecting unscoped descendant tags—prefer classes inside modules.

**Follow-up:** How is that different from shadow DOM?
**Common mistake:** Assuming Modules auto-scope element selectors globally affecting descendants.

---

### Q64. Utility-first CSS (Tailwind)—tradeoffs? [must-know]

**Short definition:** Atomic utility classes compose layouts quickly with design tokens baked into config.

**Answer:** Utility classes compose layouts quickly in markup with design tokens baked into config—fast iteration, consistent spacing scale. Downsides: verbose HTML, learning curve, and need for discipline extracting repeated patterns into components. Know `@apply` sparingly to avoid rebuilding traditional CSS files in disguise. Tailwind v4 shifts toward CSS-first configuration in many setups—mention you follow project conventions. Interview balance: praise speed and consistency, acknowledge readability tradeoffs.

---

### Q65. `@import` vs `<link>` for stylesheets?

**Short definition:** `<link>` loads CSS in parallel early; `@import` inside CSS serializes and delays dependent sheets.

**Answer:** `<link>` in HTML loads CSS in parallel early in document parsing; `@import` inside CSS serializes and delays dependent sheets until the importing sheet loads. Prefer link tags or bundler imports for performance in production. Critical CSS inlining is a separate optimization requiring measurement, not default behavior. HTTP/2 multiplexing helps but does not remove `@import` ordering penalties entirely. Build tools concatenate imports—raw `@import` chains in hand-written CSS are the problem.

---

### Q66. Critical CSS and purging unused styles?

**Short definition:** Tree-shake CSS by scanning class usage; inline tiny critical above-the-fold CSS when measured beneficial.

**Answer:** Build tools tree-shake CSS by scanning class names—Tailwind JIT, PurgeCSS, lightningcss. Dynamic class strings may purge needed rules unless safelisted—common bug with `` `text-${color}` `` patterns. Measure coverage in DevTools Coverage tab after production builds. Critical CSS inlining helps first paint only when the critical set is small and cacheable separately. Do not purge without running visual regression tests.

---

### Q67. Design tokens in CSS architecture?

**Short definition:** Centralized color, space, radius, and typography values consumed by components—not raw hex scattered everywhere.

**Answer:** Tokens centralize color, space, radius, and typography as variables or SCSS maps compiled to CSS custom properties. Components consume tokens, not raw hex values—easing theme and white-label products. Document token semantics—`--color-text-muted` not just `--gray-500`—so intent survives palette changes. Sync tokens with Figma variables in mature design ops workflows. Tokens are the contract between design and engineering.

---

### Q68. `:focus-visible` vs `:focus`? [must-know]

**Short definition:** `:focus-visible` shows focus ring when keyboard-like focus is expected, not on every mouse click.

**Answer:** `:focus-visible` matches keyboard-like focus when UA heuristics say the focus ring should show, avoiding rings on mouse clicks for buttons and links. Pair careful resets with `:focus-visible { outline: ... }` for accessible, polished forms. Never remove focus indication entirely—WCAG 2.4.7 Focus Visible applies. Mouse users still need visible focus for accessibility tech and keyboard-first users always. Document the pattern in your component library button styles.

**Follow-up:** How does this relate to WCAG?
**Common mistake:** Removing all outlines globally without `:focus-visible` replacement.

---

### Q69. Dark mode implementation patterns?

**Short definition:** Swap design tokens via `prefers-color-scheme` and/or `data-theme` on `:root`, not duplicate stylesheets.

**Answer:** Use `prefers-color-scheme` media query and/or a `data-theme` attribute toggling custom properties on `:root`. Avoid duplicating entire stylesheets—swap token values for background, text, border, and shadow. Test contrast ratios in both themes, especially muted text and subtle borders. `color-scheme: light dark` hints native form controls and scrollbars to match theme. Persist user override in localStorage when you offer manual theme toggle beyond OS preference.

```css
:root { color-scheme: light dark; }
@media (prefers-color-scheme: dark) {
  :root { --bg: #0f172a; --text: #e2e8f0; }
}
```

---

### Q70. `@scope`—what problem does it solve?

**Short definition:** Scoped CSS limits selector reach to a subtree without heavy BEM prefixes or a build step.

**Answer:** Scoped CSS limits selector reach to a subtree without heavy BEM prefixes or Modules build step. You define a scope root and optional limits—reduces leakage in design systems embedded in legacy pages. Emerging but useful where supported; fallback to Modules or BEM elsewhere. Helps third-party widget CSS isolate from host page styles. Interview as "native scope coming to CSS" showing you follow spec evolution.

---

### Q71. How do you organize CSS in a large app?

**Short definition:** Pick a consistent methodology—ITCSS, feature folders, or utility-plus-component—and document it.

**Answer:** Common patterns: ITCSS layers, feature folders colocated with components, or utility plus component hybrid like Tailwind + headless UI. Consistency beats dogma—document naming, layering, and token usage in CONTRIBUTING or Storybook docs. Avoid global element selectors that fight component styles (`div { margin: 0 }` exceptions aside in resets). Lint in CI with Stylelint and review new global CSS carefully. Refactor toward colocation as frameworks encourage component-scoped styles.

**Follow-up:** Where do global resets live?
**Common mistake:** Letting every developer pick a different methodology per folder.

---

### Q72. Preprocessors (Sass) vs native CSS today?

**Short definition:** Sass added variables and mixins before native features; modern CSS reduces need for preprocessing.

**Answer:** Sass added variables, nesting, and mixins before native features matured in browsers. Modern CSS has custom properties, nesting (in browsers), `@layer`, and math functions—many teams reduce Sass surface area. Keep preprocessors for legacy pipelines or advanced mixins until native parity exists. Nesting in native CSS still requires understanding specificity unlike Sass BEM-friendly patterns. Migration often starts by replacing `$variables` with `--custom-properties`.

---

### Q73. Linting and formatting CSS in teams?

**Short definition:** Stylelint and Prettier enforce conventions and catch errors in CI before merge.

**Answer:** Stylelint enforces property order, disallowed units, and accessibility contrast plugins; Prettier formats consistently. CI gates prevent drift and arguing about tabs in review. Pair with design token lint rules forbidding raw hex outside token files. Document exceptions for third-party overrides. Automated formatting frees review time for architecture questions.

---

### Q74. Print styles—still relevant?

**Short definition:** `@media print` adjusts layout and hides nonessential chrome for invoices, tickets, and documentation pages.

**Answer:** Print styles remove nav, sidebars, and background colors; expand accordion content; show link URLs optionally for legal docs. Use `break-inside: avoid` on tables and figures that must not split awkwardly across pages. Still required for receipts, boarding passes, and admin exports users print to PDF. Test print preview in Chrome and Firefox—colors differ with "background graphics" toggles. Do not rely on JavaScript-only views without print fallback.

---

### Q75. How do you debug a layout bug systematically?

**Short definition:** Trace containing block, flex/grid axes, overflow, and min-size defaults before guessing CSS fixes.

**Answer:** Reproduce minimally, then inspect computed display, position, overflow, and box model in DevTools. Check flex/grid track sizing, `min-width: auto`, margin collapse, and stacking contexts before random tweaks. Toggle `outline: 1px solid red` on suspects or use grid/flex overlays built into DevTools. Compare broken vs working breakpoint—often one `overflow: hidden` or missing `min-width: 0` is the culprit. Explain this process aloud in interviews—it matters as much as knowing properties.

**Follow-up:** What DevTools features help flex/grid debugging?

---

## Scenario Walkthroughs

### Scenario 1: App Shell — Sidebar + Sticky Header + Scrollable Main

**Situation:** Build a dashboard layout: fixed header, 240px sidebar, scrollable main content area that fills remaining viewport height.

**Walkthrough:** Use CSS Grid on the page shell—`grid-template-rows: auto 1fr` and `grid-template-columns: 240px 1fr` with areas for header, sidebar, and main. Place header spanning both columns; sidebar and main share the second row. Give the shell `min-height: 100dvh` so mobile dynamic viewport works; set `main { overflow: auto; min-height: 0 }` so the main pane scrolls inside the grid cell, not the whole body. Header uses `position: sticky; top: 0; z-index` within main only if needed for in-main subheaders—page header stays in grid row one. Sidebar collapses to off-canvas or icon rail under 768px with a media query swapping `grid-template-columns` to `1fr` and toggling sidebar visibility in HTML/JS. Use `gap` for spacing instead of margin collapse between shell regions.

```css
.shell {
  display: grid;
  min-height: 100dvh;
  grid-template-rows: auto 1fr;
  grid-template-columns: 240px 1fr;
  grid-template-areas:
    "header header"
    "sidebar main";
}
.shell > header { grid-area: header; position: sticky; top: 0; z-index: 10; }
.shell > aside { grid-area: sidebar; overflow: auto; }
.shell > main { grid-area: main; overflow: auto; min-height: 0; }
@media (max-width: 767px) {
  .shell { grid-template-columns: 1fr; grid-template-areas: "header" "main"; }
  .shell > aside { display: none; }
}
```

---

### Scenario 2: Responsive Product Card Grid (No Media Queries)

**Situation:** Product listing cards should reflow from one column on phones to as many columns as fit on wide screens without hard-coded breakpoints.

**Walkthrough:** Use `display: grid` with `grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))` and consistent `gap`. Each card is a flex column internally—image on top with `aspect-ratio: 4/3` and `object-fit: cover`, title and price below with `flex: 1` for equal card heights if desired. `minmax(260px, 1fr)` ensures cards never shrink below readable width; `auto-fit` expands cards when fewer items sit on the last row. Add `container-type: inline-size` on the card if inner typography should respond to card width, not viewport. Lazy-load images in HTML; size with `width`/`height` attributes to prevent CLS. This pattern answers "responsive grid without Bootstrap" cleanly in interviews.

```css
.products {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}
.card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
}
.card img {
  aspect-ratio: 4 / 3;
  object-fit: cover;
  width: 100%;
}
```

---

### Scenario 3: Centered Modal Overlay with Flexbox

**Situation:** Full-screen dimmed overlay centers a dialog; background must not scroll; focus stays in dialog.

**Walkthrough:** Overlay uses `position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: 1rem` to center the dialog with safe margin on small screens. Backdrop is semi-transparent `background: rgb(0 0 0 / 0.5)` on the overlay itself or a `::backdrop` with native `<dialog>`. Set `overflow: auto` on overlay if dialog taller than viewport so small phones can scroll the modal content. Dialog gets `max-width: min(90vw, 480px)`, `border-radius`, and `box-shadow`; use `max-height: 90dvh` with internal scroll for long forms. Lock body scroll with `overflow: hidden` on `body` while open or use `inert` on the app root—CSS alone cannot trap focus; mention pairing with JS focus trap. `:focus-visible` styles on buttons inside the dialog complete the accessibility story HTML starts.

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgb(0 0 0 / 0.5);
}
.modal {
  width: min(90vw, 480px);
  max-height: 90dvh;
  overflow: auto;
  background: var(--surface);
  border-radius: 12px;
  padding: 1.5rem;
}
```

---

**Total: 75 Q&As + 3 scenario walkthroughs**
