# HTML Learning Notes

HTML is the structural layer of the web: it describes what content exists, how it is grouped, and what it means—not how it looks. Every page you build starts as a tree of elements that browsers parse into the DOM, then style with CSS and animate with JavaScript. These 30 lessons walk from first principles through semantics, forms, media, accessibility, SEO, browser APIs, and two hands-on projects so you can ship real pages without relying on external tutorials.

---

## Web Stack & Parsing

### Lesson 1. How the web stack fits together

**Takeaway:** HTML provides structure, CSS presentation, and JavaScript behavior—each layer has a distinct job.

**Explain:** When you type a URL and press Enter, the browser requests an HTML document from a server. That document is plain text marked up with tags. The browser's HTML parser reads the text token by token, builds a Document Object Model (DOM) tree in memory, and only then applies CSS and runs JavaScript. CSS does not change what the content *is*; it changes how it *looks*. JavaScript can read and modify the DOM, handle events, and talk to servers—but the HTML remains the authoritative description of page content.

Understanding this separation helps you write better markup. If you use a `<button>` for navigation, CSS can style it like a link, but assistive technology still knows it is a button. If you hide important text inside a background image, HTML cannot recover that meaning for search engines or screen readers. Start every feature by asking: "What belongs in HTML, what in CSS, and what in JS?"

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Stack Demo</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <button id="greet">Say hello</button>
    <script src="app.js"></script>
  </body>
</html>
```

In this skeleton, HTML declares a button; CSS in `styles.css` might color it; JavaScript in `app.js` might attach a click handler. None of those files replaces the others—they stack.

**Tip:** When debugging, check the DOM in DevTools (Elements panel) before tweaking CSS. Often the problem is markup, not styling.

**Try it:** Create a minimal three-file page (HTML, CSS, JS). Change only the HTML and observe what still works without touching the other files.

---

### Lesson 2. How browsers parse HTML into the DOM

**Takeaway:** Parsing turns tag soup into a live tree; invalid markup is corrected, not rejected.

**Explain:** HTML parsing is more forgiving than XML. The parser scans for `<`, identifies tag names and attributes, and constructs nodes: elements, text nodes, comments. When it sees `<p>Hello</p>`, it creates a `p` element with a text child. If you forget a closing tag—common with `<li>` or `<p>`—the parser applies **error recovery rules** defined in the HTML spec and inserts implied tags so the tree stays well-formed enough to render.

The DOM is not the same as "View Source." View Source shows the bytes the server sent. The DOM may differ after the parser fixes errors and after JavaScript mutates the tree. Scripts without `defer` or `async` can block parsing because the parser must run them before continuing; modern pages usually place scripts at the end of `<body>` or use `defer` so HTML finishes first.

```html
<div>
  <p>First paragraph
  <p>Second paragraph</p>
</div>
```

A strict parser might reject this; HTML5 parsers close the first `<p>` when the second opens, yielding two sibling paragraphs inside the `div`. Knowing this prevents surprises when nesting interactive elements or custom components.

**Tip:** Validate unfamiliar markup with the W3C Nu Html Checker—it explains implied tags and nesting mistakes.

**Try it:** Deliberately omit a closing `</ul>` in a list, reload the page, and compare View Source to the Elements panel in DevTools.

---

### Lesson 3. Elements, tags, attributes, and void elements

**Takeaway:** Elements are nodes in the DOM; tags are syntax; attributes configure elements; void elements never wrap content.

**Explain:** An **element** is the thing in the DOM—e.g. an anchor with href and text content. **Tags** are the `<a>...</a>` delimiters in source code. **Attributes** appear in the start tag: `href="/about"`, `class="nav-link"`, `data-id="42"`. Boolean attributes like `disabled` or `checked` are present or absent; in HTML5 you write `disabled` rather than `disabled="disabled"`.

**Void elements** (also called empty elements) cannot have children: `img`, `br`, `input`, `meta`, `link`, `hr`, and others. In HTML5 you write them as `<img src="photo.jpg" alt="Sunset">` without a closing tag. XHTML-style `<img />` still works but is unnecessary.

Attributes have namespaces in practice: global attributes (`id`, `class`, `hidden`, `title`), element-specific ones (`href` on `a`, `src` on `img`), and `data-*` for custom metadata accessible from JavaScript via `dataset`.

```html
<img src="logo.png" alt="Company logo" width="120" height="40" />
<input type="email" name="user_email" required autocomplete="email" />
<a href="https://example.com" rel="noopener">External site</a>
```

**Tip:** Prefer semantic elements over sprinkling `div` with classes—the element name carries meaning the class name cannot.

**Try it:** Build a small snippet using at least one void element, one boolean attribute, and one `data-*` attribute; log the data attribute from the console.

---

## Document Skeleton & Head

### Lesson 4. The HTML5 document boilerplate

**Takeaway:** Every production page needs `<!DOCTYPE html>`, `lang`, charset, and viewport meta for predictable rendering.

**Explain:** `<!DOCTYPE html>` triggers **standards mode** in browsers so layout matches modern CSS expectations instead of quirky legacy behavior. The root `<html lang="en">` attribute helps screen readers pick pronunciation rules and search engines understand content language. `<meta charset="utf-8">` must appear early in `<head>` so the parser knows how to decode multi-byte characters—place it within the first 1024 bytes.

The viewport meta tag tells mobile browsers to use the device width as the layout width instead of pretending to be a desktop monitor:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>My Page</title>
  </head>
  <body>
    <main>
      <h1>Hello, world</h1>
    </main>
  </body>
</html>
```

Without viewport meta, phones shrink a 980px-wide desktop layout, making text tiny. With it, your CSS media queries can respond to real device widths.

**Tip:** Save a snippet in your editor called `html5-boilerplate` so you never hand-type DOCTYPE and charset from memory under pressure.

**Try it:** Create two copies of a page—one with and one without viewport meta—and compare them in Chrome DevTools device mode.

---

### Lesson 5. Head metadata: title, links, and icons

**Takeaway:** The `<head>` holds machine-readable metadata and resource hints; nothing in `<head>` renders directly on the page.

**Explain:** The `<title>` appears in the browser tab and often in search results—it should be unique and descriptive per page. `<link rel="stylesheet" href="main.css">` pulls in CSS. `<link rel="icon" href="/favicon.ico" sizes="any">` sets the tab icon; you can also supply PNG/SVG icons for high-DPI screens.

Preconnect and preload are performance hints:

```html
<head>
  <title>Product Details — ShopName</title>
  <link rel="stylesheet" href="/css/main.css" />
  <link rel="icon" href="/icon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preload" href="/fonts/brand.woff2" as="font" type="font/woff2" crossorigin />
</head>
```

`preconnect` opens early network connections; `preload` fetches critical assets sooner. Use them sparingly—each hint consumes bandwidth if the resource is not actually needed.

Scripts can live in `<head>` with `defer` (download in parallel, run after HTML parse) or `async` (download and run ASAP, order not guaranteed). Blocking scripts without those attributes pause HTML parsing.

**Tip:** Keep `<title>` under ~60 characters when possible so it is not truncated in search snippets.

**Try it:** Add a favicon and a deferred script to a boilerplate page; confirm in Network tab that the script downloads early but executes after DOM construction.

---

### Lesson 6. Body structure and skip links

**Takeaway:** Organize visible content in `<body>` with a logical landmark order: header, main, footer—plus optional nav and aside.

**Explain:** The `<body>` contains everything users see and interact with. A typical document flow places global navigation in `<header>` or a dedicated `<nav>`, unique page content in `<main>`, supplementary widgets in `<aside>`, and site-wide footers in `<footer>`. There should be only one `<main>` per page unless you use `hidden` on inactive app views—screen readers jump to `main` as the primary content region.

Skip links help keyboard users bypass repetitive navigation:

```html
<body>
  <a class="skip-link" href="#main">Skip to main content</a>
  <header>
    <nav aria-label="Primary">...</nav>
  </header>
  <main id="main">
    <h1>Page heading</h1>
    <!-- unique content -->
  </main>
  <footer>
    <p>&copy; 2026 Example Co.</p>
  </footer>
</body>
```

Visually hide the skip link off-screen until focused—a few lines of CSS make it appear at the top on `:focus`. This pattern is cheap to implement and dramatically improves keyboard UX on nav-heavy sites.

**Tip:** Place `<main>` as early as practical in DOM order after header/nav so tab order matches reading order.

**Try it:** Add a skip link to a page with a long nav; tab from a fresh reload and confirm you can reach main content in one jump.

---

## Semantics & Landmarks

### Lesson 7. Why semantic HTML matters

**Takeaway:** Semantic elements communicate structure and meaning to browsers, assistive tech, and search engines—not just developers.

**Explain:** A `<div class="header">` and a `<header>` might look identical with CSS, but only `<header>` tells user agents "this is introductory content for its section." Semantics improve accessibility defaults: `<button>` is focusable and activated with Space/Enter; `<a href>` navigates; `<input type="checkbox">` toggles state with built-in roles.

Semantic markup also future-proofs your CSS. You can target `article h2` instead of `.card-title`, reducing coupling to component class names. When JavaScript queries `document.querySelector('main')`, it survives redesigns that rename BEM classes.

```html
<article>
  <header>
    <h2>Release notes v2.4</h2>
    <time datetime="2026-03-01">March 1, 2026</time>
  </header>
  <p>We shipped dark mode and faster search.</p>
</article>
```

Prefer the most specific element: `nav` for navigation groups, `section` for thematic grouping with a heading, `article` for self-contained syndicatable content.

**Tip:** If you reach for a `div`, pause and check whether `section`, `article`, `figure`, or `details` fits.

**Try it:** Refactor a div-only card component to use `article`, `header`, and `time`; run Lighthouse accessibility and note any score change.

---

### Lesson 8. Headings and document outlines

**Takeaway:** Use one `<h1>` per page (usually) and descend levels without skipping—headings form a navigable outline.

**Explain:** Headings (`h1`–`h6`) are the primary way screen reader users skim a page. The `<h1>` typically matches the page's main topic; nested sections use `h2`, subsections `h3`, and so on. Skipping from `h2` to `h5` breaks outline algorithms and confuses assistive tech even if visuals look fine.

In HTML5, sectioning elements (`section`, `article`, `nav`, `aside`) create implicit outline nodes when they contain headings. You do not need to wrap every heading in a section, but when you use `<section>`, give it a heading so the section has a name.

```html
<main>
  <h1>Baking basics</h1>
  <section>
    <h2>Equipment</h2>
    <h3>Measuring cups</h3>
    <h3>Mixers</h3>
  </section>
  <section>
    <h2>Techniques</h2>
    <p>...</p>
  </section>
</main>
```

Decorative icons next to headings should use `aria-hidden="true"` so they are not announced as meaningless text.

**Tip:** Style heading sizes with CSS—do not pick `h4` because you want smaller text; pick the correct level and adjust `font-size`.

**Try it:** Outline a blog post with proper heading levels only; use DevTools Accessibility tree to inspect the heading list.

---

### Lesson 9. Landmarks: header, nav, main, aside, footer

**Takeaway:** Landmark roles map to regions users can jump between—use native elements before adding ARIA roles.

**Explain:** Browsers expose landmark roles for `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, and `<form>` (when named). Multiple `<header>` and `<footer>` elements are valid—each belongs to its nearest sectioning ancestor. Multiple `<nav>` elements are fine if labeled: `<nav aria-label="Footer">` vs `<nav aria-label="Primary">`.

Landmarks reduce "navigation fatigue" for screen reader users who otherwise listen to every link on every page load. Combine landmarks with headings inside each region so users hear both region name and content summary.

```html
<body>
  <header role="banner"><!-- implicit with header at body level -->
    <nav aria-label="Primary">...</nav>
  </header>
  <div class="layout">
    <main id="content">
      <h1>Dashboard</h1>
    </main>
    <aside aria-labelledby="tips-heading">
      <h2 id="tips-heading">Tips</h2>
    </aside>
  </div>
  <footer role="contentinfo">...</footer>
</body>
```

Explicit `role` attributes are usually redundant when using correct elements—add them only when retrofitting legacy markup.

**Tip:** Test landmark navigation with NVDA (D key) or VoiceOver (Rotor → Landmarks).

**Try it:** Add two `<nav>` blocks without labels, then add `aria-label` to each; observe the difference in a screen reader's landmarks menu.

---

### Lesson 10. Figures, captions, and supplementary content

**Takeaway:** Use `<figure>` and `<figcaption>` for content referenced from the main flow; use `<aside>` for tangential content.

**Explain:** A figure is self-contained content whose removal would not break the surrounding narrative—charts, code listings, photos with captions, pull quotes. The optional `<figcaption>` provides a title or explanation. Order of figcaption before or after other figure content is flexible; CSS controls presentation.

```html
<figure>
  <img src="chart.png" alt="Bar chart: Q1 revenue up 18% year over year" />
  <figcaption>Figure 1. Quarterly revenue comparison</figcaption>
</figure>

<figure>
  <pre><code>const sum = (a, b) => a + b;</code></pre>
  <figcaption>Listing 1. A simple sum function</figcaption>
</figure>
```

`<blockquote>` marks extended quotations; cite the source in `<footer>` or with `cite` attribute on `<q>` for inline quotes. `<details>` and `<summary>` create native disclosure widgets without JavaScript—great for FAQs:

```html
<details>
  <summary>Shipping policy</summary>
  <p>Orders ship within 2 business days.</p>
</details>
```

**Tip:** Every `<figure>` with an informative image still needs meaningful `alt` on the `img`—figcaption does not replace alt text.

**Try it:** Build an FAQ with three `<details>` elements; ensure keyboard users can expand each with Enter/Space.

---

## Text, Links, Lists & Tables

### Lesson 11. Text-level semantics and emphasis

**Takeaway:** Choose `<strong>`, `<em>`, `<code>`, and friends for meaning; use CSS for purely visual styling.

**Explain:** `<strong>` indicates strong importance or urgency; `<em>` stress emphasis that changes sentence meaning when read aloud. `<mark>` highlights text for reference purposes (search hits). `<abbr title="HyperText Markup Language">HTML</abbr>` expands abbreviations on hover/focus. `<time datetime="2026-09-08">September 8, 2026</time>` encodes machine-readable dates.

For code, use `<code>` inline, `<pre>` for preformatted blocks, and `<kbd>` for user input keys:

```html
<p>
  Press <kbd>Ctrl</kbd>+<kbd>S</kbd> to save. The API returns
  <code>{ "ok": true }</code> on success.
</p>
<p><strong>Warning:</strong> Do not expose API keys in client-side HTML.</p>
```

Avoid `<b>` and `<i>` when meaning matters—they are stylistic hooks without semantic weight in HTML5. Line breaks: `<br>` only for poetry, addresses, or line breaks that are part of content—not for spacing paragraphs (use CSS `margin`).

**Tip:** Screen readers may announce `<strong>` with different inflection—do not wrap entire paragraphs unless truly urgent.

**Try it:** Write a paragraph mixing `em`, `strong`, `abbr`, and `code`; listen with a screen reader and note how emphasis is conveyed.

---

### Lesson 12. Links, URLs, and safe external navigation

**Takeaway:** Anchors require `href`; use descriptive text, meaningful `rel` values, and avoid "click here."

**Explain:** The `<a>` element with an `href` creates a hyperlink. Link text should describe the destination out of context—"Read the installation guide" beats "Click here." For external links opening new tabs, many teams add `target="_blank"` with `rel="noopener noreferrer"` to prevent the new page from accessing `window.opener` and to omit referrer data when desired.

```html
<a href="/docs/install">Installation guide</a>
<a href="https://partner.example" rel="noopener noreferrer" target="_blank">
  Partner portal (opens in new tab)
</a>
<a href="#section-pricing">Jump to pricing</a>
<a href="mailto:support@example.com">Email support</a>
<a href="tel:+15551234567">Call us</a>
```

Fragment identifiers (`#id`) scroll to elements with matching `id`. Email and telephone URLs trigger native handlers on capable devices. Download attributes suggest filenames for same-origin resources: `<a href="/report.pdf" download>Download PDF</a>`.

**Tip:** If a link performs an action instead of navigation (e.g. delete item), use `<button type="button">` styled as a link—do not use `href="#"`.

**Try it:** Create an in-page table of contents linking to three `h2` sections; verify focus moves and URL hash updates.

---

### Lesson 13. Lists: ordered, unordered, and description lists

**Takeaway:** Use the list type that matches the content relationship—`ul` for unordered, `ol` for sequence, `dl` for terms and definitions.

**Explain:** Unordered lists (`ul` > `li`) suit collections without order—features, tags, nav items when order is not meaningful. Ordered lists (`ol` > `li`) imply sequence—steps in a recipe, ranked items. The `start`, `reversed`, and `type` attributes adjust numbering when needed, though CSS counters often replace `type`.

Description lists (`dl`) pair terms (`dt`) with definitions (`dd`). One term can have multiple definitions; multiple terms can share a definition group:

```html
<ol>
  <li>Preheat oven to 180&nbsp;°C.</li>
  <li>Mix dry ingredients.</li>
  <li>Bake for 25 minutes.</li>
</ol>

<dl>
  <dt>HTML</dt>
  <dd>Structure layer of the web.</dd>
  <dt>CSS</dt>
  <dd>Presentation layer.</dd>
</dl>
```

Do not use lists purely for indentation—that is a CSS job. Nested lists belong inside the parent `li`, not as siblings between items.

**Tip:** Navigation menus are often `ul` > `li` > `a` inside `nav`—a pattern browsers and assistive tech understand well.

**Try it:** Mark up a glossary of five terms with `dl`; nest a `ul` inside one `dd` for sub-points.

---

### Lesson 14. Tables for tabular data

**Takeaway:** Tables are for data grids, not page layout—use `<th>`, `scope`, and `<caption>` for clarity.

**Explain:** A table structure: `<table>` > optional `<caption>`, `<thead>`, `<tbody>`, `<tfoot>`, rows `<tr>`, header cells `<th>`, data cells `<td>`. The `scope` attribute on `<th>` clarifies whether the header applies to a column (`col`), row (`row`), or group.

```html
<table>
  <caption>Monthly subscription plans</caption>
  <thead>
    <tr>
      <th scope="col">Plan</th>
      <th scope="col">Price</th>
      <th scope="col">Storage</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Starter</th>
      <td>$9</td>
      <td>10 GB</td>
    </tr>
    <tr>
      <th scope="row">Pro</th>
      <td>$29</td>
      <td>100 GB</td>
    </tr>
  </tbody>
</table>
```

For complex tables spanning multiple rows/columns, `headers` and `id` associate data cells with multiple headers. Responsive tables often scroll horizontally in a wrapper `div` with `overflow-x: auto` rather than breaking semantic structure.

**Tip:** Never use `<table>` for multi-column page layouts—CSS Grid and Flexbox replaced that anti-pattern decades ago.

**Try it:** Build a table with row and column headers; validate that a screen reader reads headers when moving cell to cell.

---

## Forms & Validation

### Lesson 15. Form structure and basic controls

**Takeaway:** Wrap related fields in `<form>`, label every control, and choose the right `input` type.

**Explain:** The `<form>` element defines a submission unit with `action` (URL) and `method` (`get` or `post`). Each control needs an associated `<label>`—wrap the input or use `for` matching input `id`. Labels increase hit area and are required for accessibility.

Common controls:

```html
<form action="/subscribe" method="post">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" autocomplete="email" required />

  <label for="plan">Plan</label>
  <select id="plan" name="plan">
    <option value="free">Free</option>
    <option value="pro" selected>Pro</option>
  </select>

  <label><input type="checkbox" name="newsletter" value="yes" /> Send updates</label>

  <button type="submit">Subscribe</button>
</form>
```

`button type="submit"` submits the form; `type="button"` does not; `type="reset"` clears fields (rarely useful). Group related options with `<fieldset>` and `<legend>`.

**Tip:** `name` attributes determine keys in submitted form data—omit them and the field will not appear in the payload.

**Try it:** Build a signup form with text, email, select, checkbox, and submit; inspect the submitted query string or body with DevTools Network tab.

---

### Lesson 16. Input types and mobile keyboards

**Takeaway:** Specialized input types unlock better UX, built-in validation, and appropriate mobile keyboards.

**Explain:** HTML5 input types include `email`, `url`, `tel`, `number`, `range`, `date`, `time`, `color`, `search`, and `password`. Browsers render suitable pickers and validate formats before submit—`type="email"` rejects strings without `@`. On phones, `type="tel"` shows a numeric keypad; `type="url"` may prefer a URL keyboard layout.

```html
<label for="age">Age</label>
<input id="age" name="age" type="number" min="13" max="120" step="1" />

<label for="site">Website</label>
<input id="site" name="site" type="url" placeholder="https://example.com" />

<label for="birthday">Birthday</label>
<input id="birthday" name="birthday" type="date" />
```

`placeholder` shows hint text but is not a label substitute—it disappears on input and may fail contrast requirements. Use visible labels plus optional hint text linked via `aria-describedby`.

**Tip:** Fall back gracefully—unsupported types behave like `text`, so your server must still validate.

**Try it:** Open a form with `email`, `tel`, and `number` on a phone or emulator; compare keyboards for each field.

---

### Lesson 17. Client-side validation attributes

**Takeaway:** HTML validation attributes catch obvious errors early; server validation remains mandatory.

**Explain:** Attributes like `required`, `minlength`, `maxlength`, `pattern`, `min`, `max`, and `step` participate in **constraint validation**. Invalid fields match `:invalid` in CSS and block form submission until fixed—unless the form has `novalidate`. Custom messages use JavaScript `setCustomValidity()` because there is no native `message` attribute.

```html
<label for="username">Username (3–16 letters)</label>
<input
  id="username"
  name="username"
  required
  minlength="3"
  maxlength="16"
  pattern="[A-Za-z0-9_]+"
  title="Letters, numbers, and underscore only"
/>

<label for="zip">US ZIP</label>
<input id="zip" name="zip" pattern="\d{5}(-\d{4})?" required />
```

The `pattern` attribute takes a JavaScript regular expression without delimiters. For internationalized apps, regex in HTML may be too rigid—combine light client hints with robust server rules.

**Tip:** Style `:focus-visible` and `:user-invalid` (where supported) to show errors without relying solely on browser tooltips.

**Try it:** Submit a form with invalid fields and observe native bubble messages; then add `novalidate` and compare behavior.

---

### Lesson 18. Accessible forms and grouping

**Takeaway:** Group related fields, describe errors programmatically, and never rely on color alone.

**Explain:** Use `<fieldset>` and `<legend>` for radio/checkbox groups:

```html
<fieldset>
  <legend>Preferred contact method</legend>
  <label><input type="radio" name="contact" value="email" checked /> Email</label>
  <label><input type="radio" name="contact" value="phone" /> Phone</label>
</fieldset>
```

When validation fails, associate error text with the field:

```html
<label for="pwd">Password</label>
<input id="pwd" type="password" aria-describedby="pwd-rules pwd-error" required />
<p id="pwd-rules">At least 12 characters.</p>
<p id="pwd-error" role="alert" hidden>Password is too short.</p>
```

Toggle `hidden` or `aria-invalid="true"` from JavaScript when showing errors. Required fields can be indicated visually (`*`) and with `aria-required="true"` if not using the `required` attribute.

**Tip:** Focus the first invalid field on submit so keyboard users immediately know where to fix issues.

**Try it:** Implement a radio group inside a fieldset and an error message linked with `aria-describedby`; trigger an error and listen with a screen reader.

---

## Media & Responsive Images

### Lesson 19. Images: src, alt, and dimensions

**Takeaway:** Every `img` needs `alt`; provide width and height to prevent layout shift.

**Explain:** The `src` attribute points to the image resource. The `alt` attribute provides alternative text when the image cannot be displayed and is announced by screen readers for informative images. Decorative images use empty alt: `alt=""` so assistive tech skips them.

```html
<img
  src="hero.jpg"
  alt="Team collaborating around a laptop in a bright office"
  width="1200"
  height="630"
  loading="lazy"
/>
```

Explicit `width` and `height` let the browser reserve space before the image downloads, improving Cumulative Layout Shift metrics. `loading="lazy"` defers off-screen images until the user scrolls near them—do not lazy-load above-the-fold heroes.

**Tip:** Write alt text as if describing the image to someone on the phone—concise, no "image of" prefix unless the medium itself matters.

**Try it:** Load a page with and without width/height on a large image; watch CLS in Lighthouse or Performance panel.

---

### Lesson 20. Responsive images with srcset and sizes

**Takeaway:** Serve appropriately sized files with `srcset` and `sizes` so mobile users do not download desktop megapixel assets.

**Explain:** `srcset` lists candidate URLs with width (`800w`) or density (`2x`) descriptors. The browser picks one based on viewport and DPR. Pair `srcset` with `sizes` to tell the browser how wide the image will render at different breakpoints:

```html
<img
  src="product-800.jpg"
  srcset="product-400.jpg 400w, product-800.jpg 800w, product-1200.jpg 1200w"
  sizes="(max-width: 600px) 100vw, 400px"
  alt="Wireless headphones, matte black"
  width="400"
  height="400"
/>
```

Here, viewports under 600px use full viewport width; larger viewports assume 400px display width—browser selects the closest resource. `<picture>` adds art direction—different crops per breakpoint:

```html
<picture>
  <source media="(min-width: 800px)" srcset="banner-wide.jpg" />
  <source media="(min-width: 480px)" srcset="banner-medium.jpg" />
  <img src="banner-narrow.jpg" alt="Spring sale banner" />
</picture>
```

**Tip:** Keep `src` as a fallback for older browsers and as the default selected URL.

**Try it:** Create one `img` with three `srcset` widths; throttle network in DevTools and resize the viewport to see which file downloads.

---

### Lesson 21. Audio, video, and track elements

**Takeaway:** Native `<video>` and `<audio>` support multiple sources, posters, and captions via `<track>`.

**Explain:** Media elements accept `<source>` children so browsers pick the first supported format:

```html
<video controls width="640" height="360" poster="preview.jpg">
  <source src="clip.webm" type="video/webm" />
  <source src="clip.mp4" type="video/mp4" />
  <track kind="captions" src="clip.en.vtt" srclang="en" label="English" default />
  <p>Your browser does not support HTML video. <a href="clip.mp4">Download the clip</a>.</p>
</video>
```

The `controls` attribute shows native UI. `poster` displays before playback. `<track kind="captions">` links WebVTT files for subtitles—essential for accessibility and noisy environments. Autoplay with sound is blocked by most browsers; muted autoplay is sometimes allowed but should be used sparingly.

For audio podcasts or sound effects, `<audio controls src="episode.mp3"></audio>` suffices. Always provide fallback content inside the element for unsupported browsers.

**Tip:** Compress media externally; HTML only references files—it does not reduce file size.

**Try it:** Embed a short MP4 with a VTT caption file; toggle captions in the native player and confirm they sync.

---

## Accessibility & ARIA

### Lesson 22. Accessibility fundamentals in HTML

**Takeaway:** Accessible pages work with keyboard alone, visible focus, sufficient contrast, and meaningful names for controls.

**Explain:** Accessibility is not a bolt-on library—it starts with correct HTML. Native buttons, links, and form fields come with keyboard support and roles. Every interactive element must be reachable with Tab and activatable with Enter or Space (buttons) and Enter (links). Do not remove focus outlines without replacing them—use `:focus-visible` styles.

Provide text alternatives: `alt` for images, transcripts or captions for video, visible labels for inputs. Color contrast between text and background should meet WCAG AA (4.5:1 for normal text). Do not convey state by color alone—pair "Error" text or icons with `aria-invalid`.

```html
<button type="button" aria-pressed="false" id="toggle">Dark mode</button>
```

Test with keyboard only, zoom to 200%, and run automated checks (axe, Lighthouse)—but manual testing catches nuance automation misses.

**Tip:** The first rule of ARIA is: do not use ARIA if a native element already solves the problem.

**Try it:** Navigate your page without a mouse for five minutes; note any trap focus or missing focus styles.

---

### Lesson 23. ARIA roles, states, and properties

**Takeaway:** ARIA supplements HTML when patterns like tabs, dialogs, or live regions lack native elements—or when building custom widgets.

**Explain:** **Roles** define what something is (`role="dialog"`, `role="tablist"`). **Properties** describe relationships (`aria-labelledby`, `aria-controls`, `aria-describedby`). **States** reflect dynamic values (`aria-expanded`, `aria-selected`, `aria-hidden`).

```html
<div role="tablist" aria-label="Account settings">
  <button role="tab" id="tab-profile" aria-selected="true" aria-controls="panel-profile">
    Profile
  </button>
  <button role="tab" id="tab-billing" aria-selected="false" aria-controls="panel-billing">
    Billing
  </button>
</div>
<div role="tabpanel" id="panel-profile" aria-labelledby="tab-profile">...</div>
<div role="tabpanel" id="panel-billing" aria-labelledby="tab-billing" hidden>...</div>
```

Custom widgets must implement expected keyboard patterns (Arrow keys for tabs, Escape to close dialogs). Libraries like native `<dialog>` reduce ARIA burden:

```html
<dialog id="confirm">
  <p>Delete this item?</p>
  <form method="dialog">
    <button value="cancel">Cancel</button>
    <button value="confirm">Delete</button>
  </form>
</dialog>
```

**Tip:** Changing `role` does not add behavior—you must implement focus management and keyboard support in JavaScript.

**Try it:** Open/close a `<dialog>` with `showModal()` and confirm focus traps inside until closed.

---

### Lesson 24. Live regions and announcements

**Takeaway:** Use `aria-live` regions so dynamic updates are announced without moving focus.

**Explain:** When content updates via JavaScript—toast notifications, form errors, cart counts—sighted users see the change, but screen reader users may not if focus stays elsewhere. **Live regions** solve this. `aria-live="polite"` queues announcements when the user is idle; `aria-live="assertive"` interrupts immediately for critical alerts.

```html
<div aria-live="polite" aria-atomic="true" id="status"></div>
<!-- JS: status.textContent = '3 items added to cart'; -->

<div role="alert">Payment failed. Check your card number.</div>
<!-- role="alert" implies aria-live="assertive" -->
```

Use `aria-atomic="true"` when the entire region should be read, not just changed nodes. Hide decorative live-region spam—update only when meaningful. Prefer visible text inside live regions; do not rely on `aria-label` alone for complex messages.

**Tip:** Test live regions with VoiceOver or NVDA while triggering AJAX updates—verify announcements are helpful, not noisy.

**Try it:** Build a "Save" button that writes "Saved at 10:42" into a polite live region without moving focus.

---

## SEO & Meta

### Lesson 25. Meta tags for discovery and sharing

**Takeaway:** Title, description, and Open Graph tags shape search snippets and social previews.

**Explain:** `<meta name="description" content="...">` often appears under the blue link in search results—write unique descriptions (~150 characters) per page. Canonical URLs prevent duplicate content issues:

```html
<link rel="canonical" href="https://example.com/docs/html" />
<meta name="description" content="Learn HTML from document structure to forms and accessibility." />
```

Open Graph and Twitter Card tags control link previews on social platforms:

```html
<meta property="og:title" content="HTML Learning Notes" />
<meta property="og:description" content="30 in-depth lessons for modern HTML." />
<meta property="og:image" content="https://example.com/og-cover.jpg" />
<meta property="og:url" content="https://example.com/learn/html" />
<meta name="twitter:card" content="summary_large_image" />
```

Robots meta instructs crawlers: `<meta name="robots" content="noindex, nofollow">` for staging pages. Structured data (JSON-LD) often lives in a `<script type="application/ld+json">` block—complementary to HTML, not a replacement for semantic markup.

**Tip:** Match `og:url` and `canonical` to the preferred URL users should share.

**Try it:** Add Open Graph tags to a page and preview it with Facebook's Sharing Debugger or similar tools.

---

### Lesson 26. Semantic structure for crawlers and humans

**Takeaway:** Clear headings, meaningful link text, and fast-loading semantic HTML help SEO and usability equally.

**Explain:** Search engines infer topic hierarchy from your heading structure and main content landmarks. Keyword stuffing in hidden divs violates guidelines and hurts trust. Legitimate practices: one clear `<h1>`, descriptive `<title>`, internal links with anchor text that names destinations, and `alt` text that describes images honestly.

Performance is an SEO factor: large unoptimized images, render-blocking scripts, and missing dimensions hurt rankings and users. Semantic `<article>` with `<time datetime>` helps parsers recognize publish dates for news content.

```html
<article itemscope itemtype="https://schema.org/Article">
  <header>
    <h1 itemprop="headline">Understanding semantic HTML</h1>
    <p>By <span itemprop="author">Alex Rivera</span></p>
    <time itemprop="datePublished" datetime="2026-09-08">Sep 8, 2026</time>
  </header>
  <div itemprop="articleBody">...</div>
</article>
```

Microdata (shown above) is optional; JSON-LD is often easier to maintain. Focus first on visible structure—rich results follow good HTML.

**Tip:** Publish an HTML sitemap page linking to key sections for humans; submit an XML sitemap via Search Console for crawlers.

**Try it:** Audit a page's `<title>`, single `h1`, and internal links; list three concrete SEO improvements without adding spammy keywords.

---

## Storage & Browser APIs

### Lesson 27. Embedding data with data attributes and template

**Takeaway:** Use `data-*` attributes and `<template>` to hold configuration and inert markup for JavaScript cloning.

**Explain:** Custom `data-*` attributes store small pieces of config accessible from CSS (`attr(data-state)` in modern browsers) and JS (`element.dataset.state`):

```html
<button class="tabs" data-tab="overview" aria-selected="true">Overview</button>
<ul data-page-size="20" id="results"></ul>
```

```javascript
document.querySelector('#results').dataset.pageSize; // "20"
```

`<template>` contents are inert—scripts do not run, images do not load—until cloned into the DOM:

```html
<template id="card-template">
  <article class="card">
    <h2></h2>
    <p class="summary"></p>
  </article>
</template>
```

```javascript
const node = document.getElementById('card-template').content.cloneNode(true);
node.querySelector('h2').textContent = 'Hello';
document.body.appendChild(node);
```

This pattern keeps HTML as the single source for component structure instead of concatenating strings in JavaScript.

**Tip:** Keep data attributes small—large JSON blobs belong in script tags with `type="application/json"` and an id reference.

**Try it:** Define a `<template>` for a list item, clone it three times with different text purely from JavaScript.

---

### Lesson 28. Local storage hooks and progressive enhancement

**Takeaway:** HTML can expose hooks for storage and APIs—enhance with JS, but ensure baseline functionality without it.

**Explain:** Pure HTML forms submit to servers without JavaScript—that is progressive enhancement baseline. Client-side storage (`localStorage`, `sessionStorage`, IndexedDB) has no HTML equivalent but integrates via attributes and conventions: `autocomplete` helps browsers and password managers; `name` values become keys in serialized storage patterns.

The **`contenteditable`** attribute makes elements editable in supporting browsers:

```html
<div contenteditable="true" role="textbox" aria-label="Quick notes">
  Type notes here...
</div>
```

Use cautiously—editable regions need sanitization when syncing to servers. The **`hidden`** attribute removes elements from layout and accessibility tree until removed. **`inert`** (where supported) blocks interaction for off-screen modals:

```html
<div id="app" inert>...</div>
<dialog open>...</dialog>
```

Feature detect in JavaScript and keep critical paths working when APIs are absent.

**Tip:** Prefer `<dialog>` over div-based modals—it handles focus trapping and `inert` backdrop behavior in modern browsers.

**Try it:** Build a notes div with `contenteditable`; save its `innerHTML` to `localStorage` on blur and restore on load.

---

## Mini Projects & Walkthroughs

### Lesson 29. Project: Personal profile page

**Takeaway:** Combine boilerplate, semantics, responsive image, and accessible contact links into one cohesive static page.

**Explain:** Build a single-page profile you could deploy as static HTML. Start from the HTML5 skeleton: charset, viewport, descriptive `<title>`, one stylesheet link. Structure with `<header>` (name and tagline), `<nav aria-label="Primary">` linking to in-page sections, `<main>` with `<section>` blocks for About, Projects, and Contact.

In About, use a responsive `<img>` with meaningful `alt`, `width`, `height`, and `srcset`. Projects should be an `<ul>` of `<article>` cards—each with `h3`, short paragraph, and external link with `rel="noopener noreferrer"`. Contact uses a `<form>` or `mailto:` / `tel:` links labeled clearly.

```html
<main>
  <section id="about" aria-labelledby="about-heading">
    <h2 id="about-heading">About</h2>
    <img src="portrait-400.jpg" srcset="portrait-400.jpg 400w, portrait-800.jpg 800w"
         sizes="(max-width: 600px) 80vw, 200px"
         alt="Portrait of Jordan Lee, software developer" width="200" height="200" />
    <p>I build accessible web interfaces...</p>
  </section>
  <section id="projects" aria-labelledby="projects-heading">
    <h2 id="projects-heading">Projects</h2>
    <ul>
      <li>
        <article>
          <h3>Notes app</h3>
          <p>Offline-first markdown notes.</p>
          <a href="https://github.com/example/notes">View repository</a>
        </article>
      </li>
    </ul>
  </section>
</main>
```

Add a skip link, footer with copyright, and validate with Lighthouse. This project exercises lessons 4–14 and 19–22 in one deliverable.

**Tip:** Deploy to GitHub Pages or Netlify drop—real URLs motivate finishing polish.

**Try it:** Complete the profile page, validate HTML, and score Accessibility ≥ 95 in Lighthouse.

---

### Lesson 30. Project: Accessible multi-step signup form

**Takeaway:** Integrate forms, validation, landmarks, live regions, and progressive enhancement in a realistic flow.

**Explain:** Create a three-step registration: (1) account credentials, (2) profile details, (3) review and confirm. Use one `<form>` wrapping all steps or separate fieldsets per step with JavaScript toggling visibility—either way, maintain labels, `fieldset`/`legend`, and logical tab order.

Step 1: email (`type="email"`, `required`, `autocomplete="email"`), password (`minlength="12"`, described by rules text). Step 2: name, optional website (`type="url"`), plan `<select>`. Step 3: summary list (`dl`) of entered values and a submit button.

Wire validation messages to `aria-describedby` and a `role="alert"` container. On step change, move focus to the step heading (`tabindex="-1"` temporarily) and update a polite live region: "Step 2 of 3: Profile details." Use native constraint validation before custom JS.

```html
<form action="/register" method="post" novalidate>
  <p aria-live="polite" id="step-status">Step 1 of 3: Account</p>
  <fieldset data-step="1">
    <legend>Account</legend>
    <!-- fields -->
    <button type="button" data-next>Continue</button>
  </fieldset>
  <fieldset data-step="2" hidden>
    <legend>Profile</legend>
    <!-- fields -->
    <button type="button" data-back>Back</button>
    <button type="button" data-next>Continue</button>
  </fieldset>
  <fieldset data-step="3" hidden>
    <legend>Review</legend>
    <dl id="review"></dl>
    <button type="submit">Create account</button>
  </fieldset>
</form>
```

Without JavaScript, all fieldsets could display stacked as a long form—still submittable. With JS, enhance to a wizard. This mirrors real product work: HTML baseline, JS enhancement, accessibility throughout.

**Tip:** Log submitted `FormData` in DevTools during development to verify field names before connecting a backend.

**Try it:** Implement the wizard with keyboard-accessible Next/Back, live step announcements, and server-safe field names; test entirely by keyboard.

---
