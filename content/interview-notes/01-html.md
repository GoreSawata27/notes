# HTML Interview Notes

Concise, say-aloud answers for front-end interviews. Each question includes a **Short definition** for quick recall and a full **Answer** paragraph you can speak naturally. Use follow-ups and code when the interviewer digs deeper.

---

## HTML5 Fundamentals

### Q1. What is HTML and what role does it play in the web stack? [must-know]

**Short definition:** HTML is the markup language that defines document structure and meaning for the browser.

**Answer:** HTML is the markup language that defines the structure and meaning of web content. Browsers parse HTML into a DOM tree, then CSS styles it and JavaScript makes it interactive. In interviews, treat HTML as the semantic foundation—getting structure right affects accessibility, SEO, and maintainability. A page built with solid HTML remains usable even when CSS fails to load or JavaScript is slow. That resilience is why experienced teams invest in semantics before reaching for framework abstractions.

**Follow-up:** How does HTML differ from the DOM?
**Common mistake:** Treating HTML as purely visual layout instead of document structure.

---

### Q2. What changed in HTML5 compared to earlier HTML versions?

**Short definition:** HTML5 added semantic tags, native media, richer forms, and browser APIs without plugins.

**Answer:** HTML5 added native elements for audio, video, canvas, and richer form controls without Flash or other plugins. It also simplified the DOCTYPE, introduced semantic sectioning elements, and standardized APIs like `localStorage` and `history`. Legacy presentational tags like `<font>` and `<center>` were discouraged in favor of CSS. The spec also defined predictable error recovery for malformed markup, which made cross-browser behavior more consistent. HTML5 is not just new tags—it is a platform upgrade for the open web.

**Follow-up:** Name three HTML5 APIs beyond markup.
**Common mistake:** Assuming HTML5 is only about new tags—it also defines browser behavior and JavaScript APIs.

---

### Q3. What is the purpose of the `<head>` section?

**Short definition:** The `<head>` holds metadata and linked resources that browsers and crawlers read before rendering the body.

**Answer:** The `<head>` holds metadata that is not rendered as primary page content: title, charset, viewport, linked stylesheets, scripts (often deferred), and SEO or social tags. Browsers and crawlers read it before painting the body, so critical hints like charset and viewport belong here early. Keeping resource links organized in the head improves load behavior and avoids flash-of-unstyled-content surprises. Think of the head as the document's configuration block, not a place for visible UI.

```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Product — Acme</title>
  <link rel="stylesheet" href="/app.css" />
</head>
```

**Follow-up:** What belongs in `<body>` vs `<head>`?

---

### Q4. Why declare `charset="utf-8"` early in the document?

**Short definition:** UTF-8 encoding must be declared in the first 1024 bytes so the parser decodes characters correctly from the start.

**Answer:** UTF-8 encodes virtually all characters and avoids mojibake for international text and emoji. Declaring it in the first 1024 bytes lets the parser decode correctly from the start, before any non-ASCII bytes appear. Without an early charset, browsers may guess wrong—often ISO-8859-1—and corrupt content that looks fine in your editor. Even English-only sites benefit because users paste Unicode, APIs return UTF-8, and smart quotes or em dashes appear in copy.

**Follow-up:** What happens if charset is declared too late?
**Common mistake:** Omitting charset on English-only sites—users still paste Unicode and APIs return UTF-8.

---

### Q5. What is the difference between block-level and inline elements? [must-know]

**Short definition:** Block elements start on a new line and span available width; inline elements flow within text lines.

**Answer:** Block elements typically start on a new line and stretch to the available width—think `div`, `p`, `section`. Inline elements flow within text lines—`span`, `a`, `strong`. HTML5 blurs this with CSS `display`, but the default categories still guide valid nesting; for example, avoid placing block elements inside a `p` because the parser will auto-close the paragraph. Understanding defaults helps you write valid markup and predict layout before CSS runs. When in doubt, check whether the element should participate in document flow as a box or as part of a sentence.

**Follow-up:** Is a `button` block or inline by default?
**Common mistake:** Nesting block elements inside `p`, which browsers auto-close incorrectly.

---

### Q6. What are void (empty) elements and why do they matter?

**Short definition:** Void elements have no closing tag and no inner content—examples include `img`, `br`, and `input`.

**Answer:** Void elements like `img`, `br`, `input`, and `meta` have no closing tag and no inner content. In HTML5 they are written without a trailing slash, unlike XHTML habits many developers still carry. Knowing them prevents invalid nesting and parser surprises in JSX or template engines that enforce XML-like rules. They also behave differently in the DOM—there is no `.innerHTML` to set on an `img`. Treat void elements as leaf nodes in your mental document tree.

**Follow-up:** Is `textarea` a void element?

---

### Q7. How do HTML attributes differ from DOM properties?

**Short definition:** Attributes are written in markup; properties are live fields on DOM nodes after parsing, and they can diverge.

**Answer:** Attributes are what you write in markup; properties are live fields on DOM nodes after parsing. Some map one-to-one, like `id`, while others differ—`value` on inputs reflects user edits while the attribute may stay at its initial value. Boolean attributes like `disabled` exist in HTML as presence attributes but appear as true/false properties in the DOM. Frameworks often bind to properties for correctness because they track runtime state. When serializing form data or cloning nodes, know which layer you are reading from.

**Follow-up:** Give an example where attribute and property diverge.
**Common mistake:** Setting `input.value` in JS and expecting the HTML attribute to update for serialization.

---

### Q8. What is progressive enhancement in the context of HTML?

**Short definition:** Build a usable baseline with semantic HTML first, then layer CSS and JavaScript for richer experience.

**Answer:** Build a usable baseline with semantic HTML that works without JavaScript, then layer CSS and JS for richer UX. Forms should submit, links should navigate, and content should be readable with keyboard and screen readers. Interviewers like hearing that HTML is the resilient core—not an afterthought once React mounts. Progressive enhancement also improves performance because critical content appears before bundles download. It is the opposite of building a blank div shell that only works after hydration.

**Follow-up:** How does this relate to server-rendered HTML?

---

### Q9. What is the difference between `div` and `span`?

**Short definition:** `div` is a generic block container; `span` is a generic inline text wrapper—neither conveys semantic meaning.

**Answer:** `div` is a generic flow container and `span` is a generic inline text container. Neither conveys specific meaning to assistive technology or search engines. Use them only after checking whether a semantic element—such as `section`, `button`, or `em`—better describes the content. Overusing `div` leads to "div soup" that requires ARIA patches; overusing `span` for interactive controls creates keyboard and announcement bugs. When you reach for these, ask if native semantics can do the job.

**Follow-up:** When is a `div` still the right choice?

---

## DOCTYPE & Document Structure

### Q10. What does `<!DOCTYPE html>` do? [must-know]

**Short definition:** The HTML5 doctype switches the browser into standards mode for predictable parsing and layout.

**Answer:** It tells the browser to use standards mode for HTML5 parsing and layout. Without a correct DOCTYPE, browsers may enter quirks mode and emulate old bugs like the IE box model surprises. HTML5's DOCTYPE is short and not tied to a DTD URL, unlike XHTML declarations that referenced external schemas. It must be the very first thing in the document—no comments or whitespace before it in strict scenarios. One line prevents an entire class of cross-browser layout inconsistencies.

**Common mistake:** Confusing DOCTYPE with a namespace declaration—it is not XML.

---

### Q11. What is quirks mode vs standards mode?

**Short definition:** Quirks mode applies legacy layout compatibility; standards mode follows modern HTML and CSS specifications.

**Answer:** Quirks mode is legacy compatibility where box model and selector behavior can differ from the spec—think different height calculations and odd percentage rules. Standards mode follows modern CSS and HTML rules consistently across current browsers. A missing or wrong DOCTYPE is a common trigger for subtle layout bugs that look like "CSS randomly broke." You can verify mode in DevTools document properties when debugging unexplained sizing. Always start new projects with `<!DOCTYPE html>` and never remove it to "fix" spacing.

**Follow-up:** How would you detect quirks mode in DevTools?
**Common mistake:** Assuming all modern browsers default to standards mode regardless of DOCTYPE.

---

### Q12. Should you use XHTML syntax in modern HTML?

**Short definition:** Modern HTML5 does not require XML-style self-closing tags; the HTML parser handles void elements without trailing slashes.

**Answer:** Modern HTML5 does not require XML-style self-closing tags or lowercase-only rules for validity in the HTML parser. You can write `<img>` not `<img />` in HTML documents, and both parse the same way. XHTML served as `application/xhtml+xml` is rare today because it demands well-formed XML and breaks on any parse error. Stick to HTML5 unless you have a specific XML pipeline or templating constraint. JSX may look like XHTML, but it compiles to HTML semantics in the browser.

**Follow-up:** When would you serve `application/xhtml+xml`?

---

### Q13. What belongs in a minimal valid HTML5 skeleton?

**Short definition:** A valid skeleton needs doctype, `html` with `lang`, `head` with charset and title, and a `body` with content.

**Answer:** A valid skeleton needs `<!DOCTYPE html>`, `<html lang="...">`, `<head>` with charset and title, and `<body>` with content. Optional but common additions include viewport meta and one stylesheet link. This is enough for parsers, accessibility tools, and SEO basics without framework boilerplate. Every production page should also declare language and charset before any visible content. Interviewers sometimes ask you to write this from memory—practice the ten-line version until it is automatic.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Page</title>
  </head>
  <body>
    <main><h1>Hello</h1></main>
  </body>
</html>
```

---

### Q14. Why set `lang` on the `<html>` element? [must-know]

**Short definition:** The `lang` attribute declares the document's primary language for pronunciation, hyphenation, and translation tools.

**Answer:** It declares the primary document language for screen readers, hyphenation, and translation tools. It helps search engines serve the right locale and improves pronunciation in speech synthesis. For mixed-language snippets, use `lang` on inner elements rather than switching the whole page. WCAG expects a language declaration at the document level so assistive tech picks the correct voice. Missing `lang` does not break the page visually, but it degradates the experience for AT users silently.

**Follow-up:** How do you mark a French quote inside an English page?
**Common mistake:** Setting `lang` only on `body` instead of `html`.

---

### Q15. What is the `<base>` tag and when is it risky?

**Short definition:** `<base href>` sets the default URL prefix for relative links and form actions on the entire page.

**Answer:** `<base href="...">` sets the default URL for relative links and form actions on the page. It can simplify deployed subpaths when assets live under a CDN root, but only one base is allowed per document. One wrong base href can redirect every link and form submission on the site incorrectly. SPAs rarely need it because routers handle paths in JavaScript. Treat `<base>` as a sharp tool—useful in static doc sites, dangerous in apps with dynamic routing.

**Follow-up:** How does `<base>` interact with anchor fragments?

---

### Q16. How does HTML parsing handle malformed markup?

**Short definition:** HTML5 defines error-recovery rules so browsers correct unclosed tags and mis-nested elements predictably.

**Answer:** HTML5 defines error recovery rules—unclosed tags, mis-nested elements, and stray attributes get corrected predictably rather than failing the whole page. That resilience helps users see content even when templates ship bugs, but it can hide problems during development. Do not rely on parser fixes; write valid, intentional structure and validate in CI where possible. Mis-nested interactive elements can still produce confusing focus order even after correction. Valid HTML is a quality signal, not pedantry.

**Follow-up:** Does JSX guarantee valid HTML output?

---

## Semantic Elements

### Q17. Why use semantic HTML instead of div soup? [must-know]

**Short definition:** Semantic tags communicate structure and meaning to assistive tech, search engines, and developers without extra ARIA.

**Answer:** Semantic tags like `header`, `nav`, `main`, `article`, and `footer` communicate structure to assistive tech, search engines, and other developers. They reduce reliance on ARIA when native elements already expose roles and keyboard behavior. Cleaner semantics improve maintainability because the DOM reads like an outline, not an anonymous forest of divs. Search engines use headings and landmarks to distinguish main content from chrome. In interviews, tie semantics to accessibility and SEO together—they share the same HTML foundation.

**Follow-up:** When is a `div` still appropriate?
**Common mistake:** Using `<div onclick>` for buttons instead of `<button>`.

---

### Q18. When should you use `<main>` and how many per page?

**Short definition:** `<main>` wraps the dominant unique content of the page—one visible instance per document.

**Answer:** `<main>` wraps the dominant unique content of the page, excluding repeated chrome like site header, footer, and navigation. The spec allows one visible `main` per document; hidden mains for accessibility hacks should be avoided. Screen readers offer shortcuts to jump directly to main content, which pairs well with skip links. Do not wrap every section in `main`—only the primary purpose of the page belongs there. App shells with multiple routes still swap content inside a single persistent `main` region.

**Follow-up:** What landmark role does `<main>` map to?

---

### Q19. Difference between `<section>` and `<article>`?

**Short definition:** An `article` is self-contained syndicatable content; a `section` groups related content under a thematic heading.

**Answer:** An `<article>` is a self-contained composition that could stand alone in syndication—a blog post, product card, or comment thread. A `<section>` groups thematically related content and usually needs a heading to define its place in the outline. When in doubt, ask if the block makes sense in an RSS feed or shared link by itself. Articles can contain sections, and sections can contain articles—nesting follows document meaning, not visual boxes. Using `<section>` without a heading weakens the outline and confuses outline algorithms.

**Follow-up:** Can an article contain sections?
**Common mistake:** Using `<section>` without a heading, which weakens the outline.

---

### Q20. What is the document outline and do heading levels still matter?

**Short definition:** Headings `h1`–`h6` create a logical document outline for navigation, SEO, and screen reader heading lists.

**Answer:** Heading levels `h1`–`h6` create a logical outline for navigation and SEO. Multiple `h1`s are allowed in HTML5 when used within sectioning roots, but a clear hierarchy is still best practice for predictability. Do not pick heading tags for font size—use CSS to style visual hierarchy independently of semantics. Screen reader users browse by heading level, so skipped levels feel like missing floors in a building. A single meaningful `h1` per view plus nested `h2`/`h3` sections is a safe interview answer.

**Follow-up:** Does the browser expose a heading list to assistive tech?

---

### Q21. When to use `<figure>` and `<figcaption>`?

**Short definition:** `<figure>` groups media or code referenced from prose; `<figcaption>` provides its caption.

**Answer:** Wrap images, diagrams, or code snippets that are referenced from prose in `<figure>`, with `<figcaption>` for the caption. The association is semantic, not merely visual grouping—assistive tech links caption text to the figure content. Captions can be above or below; consistency across the site matters more than position. Figures can contain multiple images or a `<pre>` block when the cited content is code. Do not use figure for every decorative icon—reserve it for content that prose points to.

```html
<figure>
  <img src="chart.png" alt="Q3 revenue up 12% year over year" />
  <figcaption>Figure 1. Quarterly revenue trend.</figcaption>
</figure>
```

---

### Q22. What is `<details>` / `<summary>` useful for?

**Short definition:** Native disclosure widget—`summary` is the control, `details` holds expandable content without JavaScript.

**Answer:** They provide native disclosure widgets without JavaScript—the summary is the control, details holds expandable content. Keyboard and accessibility behavior is built in when used correctly, including Enter/Space activation on summary. Great for FAQs, filter panels, and progressive disclosure patterns that do not warrant a custom component. You can open by default with the `open` attribute for critical content. Avoid nesting interactive controls inside summary in ways that trap focus.

**Follow-up:** How does this compare to an accordion built with ARIA?

---

### Q23. `<b>` vs `<strong>` and `<i>` vs `<em>`?

**Short definition:** `strong`/`em` carry importance and emphasis semantics; `b`/`i` are stylistic hooks without extra meaning by default.

**Answer:** `<strong>` and `<em>` carry importance and emphasis semantics that assistive tech may convey with tone or emphasis. `<b>` and `<i>` are stylistic hooks without additional meaning in the accessibility tree by default. Prefer semantic tags unless you truly only need visual bold or italic with no semantic weight—product names, foreign words, or UI labels may fit `i`/`b`. CSS can style either identically, so the choice is about meaning, not appearance. In design systems, document when you intentionally use presentational tags.

---

### Q24. What landmarks should a typical app shell expose?

**Short definition:** Landmarks are major page regions—banner, navigation, main, complementary, contentinfo—that AT users jump between quickly.

**Answer:** Common landmarks: `banner` (header), `navigation`, `main`, `complementary` (aside), and `contentinfo` (footer). Native elements map to these roles automatically without redundant ARIA. Landmarks help screen reader users jump regions quickly instead of tabbing through every link. Duplicate or nested landmarks without purpose create noisy rotor menus. One clear `nav` for primary navigation and another for footer legal links is a typical pattern.

**Follow-up:** Does `<div role="main">` beat `<main>`?
**Common mistake:** Duplicating landmarks—nested `nav` inside `nav` without purpose.

---

### Q25. What is the `<template>` element?

**Short definition:** `<template>` holds inert HTML fragments cloned by JavaScript without rendering until instantiated.

**Answer:** The `<template>` element stores HTML fragments that are not rendered on parse—they live in a separate document fragment until cloned into the live DOM. Scripts inside templates do not run and images do not load until activation, which makes templates efficient for client-side rendering patterns. Web components often use template content as the basis for shadow DOM markup. Unlike `display:none` hidden markup, template contents are inert and inaccessible to assistive tech until inserted. It is the HTML-native way to ship reusable DOM chunks without string concatenation.

**Follow-up:** How does `<template>` differ from `<slot>` in web components?

---

## Forms & Validation

### Q26. How do HTML forms submit data? [must-know]

**Short definition:** A form's `method`, `action`, and `enctype` define how named controls serialize into an HTTP request.

**Answer:** A form's `method` and `action` define HTTP verb and endpoint; `enctype` controls encoding. GET appends fields to the URL; POST sends a body, typically `application/x-www-form-urlencoded` or `multipart/form-data` for files. Buttons with `type="submit"` trigger submission unless prevented in JavaScript. Only controls with a `name` attribute appear in the payload. Progressive enhancement means the form should work with a plain submit even if your SPA intercepts it.

```html
<form action="/search" method="get">
  <input name="q" required />
  <button type="submit">Search</button>
</form>
```

---

### Q27. Difference between `GET` and `POST` in forms?

**Short definition:** GET puts form data in the URL for safe, cacheable reads; POST sends data in the body for writes and sensitive payloads.

**Answer:** GET is idempotent and cacheable—use for reads and searches where URLs can be bookmarked and shared. POST carries payloads in the body for creates, updates, and sensitive data that should not appear in logs or browser history. Choosing wrong verbs breaks caches, server logs, and REST expectations on the backend. GET submissions have length limits in browsers and proxies; POST handles larger and binary payloads via multipart encoding. Never use GET for operations that change server state.

**Common mistake:** Using GET for operations that change server state.

---

### Q28. What does the `name` attribute do on form controls?

**Short definition:** `name` is the key used when the form serializes data for submission—controls without it are omitted.

**Answer:** `name` is the key sent in the form data payload; without it, the control is omitted from submission even if the user filled it in. It must be stable for server parsing and pairs with `<label for>` association via matching `id`. Arrays and nested objects use server-side conventions like `name="items[]"` or bracket notation. Radio buttons in a group share the same `name` so only one value submits. In React controlled components, `name` still matters for native submit and autofill heuristics.

**Follow-up:** Does `id` participate in form submission?

---

### Q29. How does `<label>` improve forms?

**Short definition:** Labels provide accessible names and enlarge click targets by associating text with inputs via `for`/`id` or wrapping.

**Answer:** Labels enlarge click and tap targets and tie accessible name to inputs via `for`/`id` or by wrapping the control. Screen readers announce the label when the field receives focus, which is essential for blind users. Never rely on placeholder alone—it disappears while typing and is not a reliable accessible name. Visible labels also help users with cognitive disabilities remember what each field expects. For complex labels, combine visible text with `aria-describedby` for hints without cluttering the label itself.

**Follow-up:** What is `aria-labelledby` for?
**Common mistake:** Using placeholder as the only visible label.

---

### Q30. Explain common input types and their UX benefits. [must-know]

**Short definition:** Typed inputs like `email`, `tel`, and `date` trigger appropriate mobile keyboards and basic validation hints.

**Answer:** Types like `email`, `url`, `tel`, `number`, `date`, and `search` trigger appropriate mobile keyboards and basic validation hints before JavaScript runs. They reduce bad data entry and improve mobile UX without custom widgets. Fallback behavior remains text-like on unsupported browsers, so you still validate on the server. `type="password"` enables masking and password manager heuristics; `type="hidden"` carries non-visible tokens. Pick the most specific type that matches the data—you can always layer custom UI on top.

**Follow-up:** What does `inputmode` add beyond `type`?

---

### Q31. What is constraint validation in HTML5?

**Short definition:** Built-in validation via attributes like `required`, `pattern`, and `min`/`max`, exposed through the Constraint Validation API.

**Answer:** Attributes like `required`, `min`, `max`, `pattern`, `minlength`, and `maxlength` enable built-in validation via the Constraint Validation API. Invalid fields expose `:invalid` pseudo-class and methods like `checkValidity()` and `reportValidity()` for custom UI. Always re-validate on the server—client checks are UX, not security, because attackers bypass the browser. Hybrid approaches use native rules for quick feedback plus tailored error messages tied to `aria-invalid`. Disable native UI with `novalidate` on the form when you build fully custom error presentation.

```html
<input
  type="email"
  name="email"
  required
  aria-describedby="email-error"
  aria-invalid="false"
/>
<p id="email-error" role="alert" hidden>Enter a valid email.</p>
```

---

### Q32. Difference between `novalidate` on form vs custom JS validation?

**Short definition:** `novalidate` disables native browser validation UI while you can still read validity state in JavaScript.

**Answer:** `novalidate` disables native browser validation UI while you can still read validity state in JavaScript via the Constraint Validation API. Custom validation must manage focus, error messages, and `aria-invalid` for accessibility—native popups do not announce reliably everywhere. Hybrid approaches use native rules plus tailored messaging in live regions. Always move focus to the first invalid field on submit failure for keyboard users. Document which fields use native types versus fully custom widgets like date pickers.

---

### Q33. What is `autocomplete` and why does it matter?

**Short definition:** The `autocomplete` attribute tells browsers which field type it is so autofill and password managers work correctly.

**Answer:** The `autocomplete` attribute hints browsers which field type it is—`email`, `current-password`, `street-address`—improving autofill accuracy and password manager integration. Correct tokens reduce friction and support accessible form completion for users who rely on saved data. WCAG does not require autofill, but fighting it harms users with motor impairments. Use spec tokens rather than inventing custom values unless you have a documented reason. Login forms especially should use `username` and `current-password` rather than turning autocomplete off.

**Follow-up:** How does `autocomplete="off"` affect login forms?
**Common mistake:** Setting `autocomplete="off"` on login fields and fighting password managers.

---

### Q34. How do `<fieldset>` and `<legend>` help complex forms?

**Short definition:** They group related controls with a programmatic label read by assistive technology as a group name.

**Answer:** They group related controls with a programmatic group label read by assistive tech. Radio groups especially benefit—the legend names the set, each radio has its option label. Visually they can be styled or the legend can be visually hidden while remaining accessible. Fieldsets also disable entire groups with one `disabled` attribute on the fieldset element. Use them for address blocks, payment method selection, and any cluster of radios or checkboxes.

**Follow-up:** Can you nest fieldsets?

---

### Q35. `button type="submit"` vs `type="button"`?

**Short definition:** Submit buttons send the form; plain buttons do not unless scripted—the default type inside a form is submit.

**Answer:** Submit buttons participate in form submission; plain buttons do not unless scripted. The implicit default type for `<button>` is `submit`, which surprises developers when a "Cancel" button submits the form accidentally. Always set `type` explicitly in forms with multiple buttons. `type="reset"` still exists but is rare—most apps avoid reset buttons that wipe user input. Icon-only buttons inside forms need both `type="button"` and an accessible name.

**Common mistake:** Leaving default submit on a "Cancel" button inside a form.

---

### Q36. What is `<datalist>` and when use it?

**Short definition:** `<datalist>` provides suggested values for an input while still allowing free-text entry.

**Answer:** `<datalist>` connects a list of suggestions to an `<input>` via the `list` attribute, giving combobox-like behavior without JavaScript. Unlike `<select>`, users can still type values not in the list, which suits search-as-you-type and tag fields. Suggestions are not enforced validation—you still validate on the server. Support is broad for text-like inputs; styling options are limited compared to custom autocomplete components. Use it when native suggestions are enough and full custom UX is overkill.

```html
<label for="city">City</label>
<input id="city" name="city" list="cities" />
<datalist id="cities">
  <option value="Chennai"></option>
  <option value="Bengaluru"></option>
  <option value="Mumbai"></option>
</datalist>
```

---

### Q37. How do you associate error messages with form fields for accessibility?

**Short definition:** Use `aria-describedby` pointing to error element ids, plus `aria-invalid="true"` when validation fails.

**Answer:** Link hints and errors with `aria-describedby` pointing to the id of help or error text so screen readers read them with the field. Set `aria-invalid="true"` when validation fails and move focus to the first invalid control on submit. Use `role="alert"` or an `aria-live` region for dynamically appearing errors after async validation. Visible error text must not rely on color alone—include text and icons with accessible names. The label names the field; description provides format hints; error text explains what went wrong.

```html
<label for="phone">Phone</label>
<input
  id="phone"
  name="phone"
  type="tel"
  aria-describedby="phone-hint phone-error"
  aria-invalid="true"
/>
<p id="phone-hint">Include country code.</p>
<p id="phone-error" role="alert">Enter at least 10 digits.</p>
```

**Follow-up:** When use `aria-errormessage`?

---

## Media & Responsive Images

### Q38. Why prefer `<img>` with `alt` over CSS background images for content? [must-know]

**Short definition:** Content images belong in HTML with `alt` text; background images are decorative and ignored by assistive tech.

**Answer:** Content images belong in HTML with meaningful `alt` text for accessibility and when images fail to load. Background images are decorative or presentational and are ignored by screen readers unless you add redundant text elsewhere. SEO and RSS also consume `<img>` sources and alt text for indexing and previews. If marketing insists on a hero background, still provide equivalent text in the document flow or use a real `img` with object-fit. Empty `alt=""` is correct only when the image is purely decorative.

**Follow-up:** When is an empty `alt=""` correct?
**Common mistake:** Putting hero text in background-image only with no accessible equivalent.

---

### Q39. How does the `srcset` attribute work? [must-know]

**Short definition:** `srcset` lists candidate image URLs with width or density descriptors so the browser picks the best resource.

**Answer:** `srcset` lists candidate image URLs with width (`800w`) or density (`2x`) descriptors so the browser picks an appropriate resource for the device. It saves bandwidth on small screens and improves sharpness on high-DPI displays without serving everyone the largest file. The `sizes` attribute tells the browser how wide the image will render in layout so width-based selection is accurate. The `src` attribute remains the fallback for older browsers and as default when no descriptor matches. Always pair responsive selection with explicit `width` and `height` to prevent layout shift.

```html
<img
  src="hero-800.jpg"
  srcset="hero-480.jpg 480w, hero-800.jpg 800w, hero-1200.jpg 1200w"
  sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 600px"
  width="1200"
  height="675"
  alt="Dashboard showing quarterly revenue up 12%"
/>
```

---

### Q40. What is `<picture>` for?

**Short definition:** `<picture>` art-directs different crops or formats with `<source>` elements and a required fallback `<img>`.

**Answer:** `<picture>` art-directs different crops or formats with `<source>` elements and a fallback `<img>`. Use it for format negotiation (AVIF/WebP/JPEG) or breakpoint-specific art direction when the same aspect ratio is not enough. The final `<img>` is required for accessibility, fallback, and alt text—sources alone are not rendered. Order matters: first matching `<source>` wins; put modern formats before JPEG fallbacks. CSS still controls display size; picture chooses which file downloads.

```html
<picture>
  <source type="image/avif" srcset="hero-mobile.avif" media="(max-width: 767px)" />
  <source type="image/webp" srcset="hero-desktop.webp" />
  <img
    src="hero-desktop.jpg"
    alt="Team collaborating in open office"
    width="1200"
    height="675"
    fetchpriority="high"
  />
</picture>
```

**Follow-up:** When is `srcset` on `img` enough without `<picture>`?

---

### Q41. Native `<video>` and `<audio>` basics?

**Short definition:** Media elements play audio/video natively with `<source>` codecs, controls, and caption tracks for accessibility.

**Answer:** Media elements expose controls via the `controls` attribute and support multiple `<source>` codecs for compatibility across browsers. Attributes like `poster`, `preload`, `muted`, and `playsinline` affect UX and autoplay policies on mobile. Always caption video with `<track kind="captions">` for deaf and hard-of-hearing users and for muted autoplay contexts. Provide download fallback text inside the element for ancient clients. Autoplay with sound is blocked without user gesture—design for explicit play interaction.

**Follow-up:** Why is autoplay often blocked?
**Common mistake:** Autoplay with sound and no user gesture.

---

### Q42. What is lazy loading for images?

**Short definition:** `loading="lazy"` defers offscreen image loads until the user scrolls near the viewport.

**Answer:** `loading="lazy"` defers offscreen image loads until near the viewport, improving initial page performance and LCP competition for truly critical assets. It is native and works well for content images below the fold without Intersection Observer boilerplate. Avoid lazy loading LCP hero images—it delays largest paint and hurts Core Web Vitals scores. Above-the-fold carousels should use `loading="eager"` or omit the attribute. Test with network throttling because lazy images appear blank until fetched.

**Follow-up:** How does lazy loading interact with `srcset`?

---

### Q43. Responsive embeds for iframes?

**Short definition:** Wrap iframes in a ratio-preserving container and always set a descriptive `title` for screen readers.

**Answer:** Wrap iframes in a ratio box using `aspect-ratio` in CSS or the classic padding-top hack so maps and videos scale with layout. Set explicit `title` on iframes for screen reader context—without it, users hear "frame" with no purpose. Sandbox attributes restrict capabilities for untrusted embeds: `allow-scripts`, `allow-same-origin`, etc. Lazy-load heavy embeds below the fold with `loading="lazy"` where supported. Never allow full permissions on user-generated embed URLs without review.

```html
<div class="embed" style="aspect-ratio: 16/9">
  <iframe
    title="Quarterly earnings call recording"
    src="https://player.example.com/v/123"
    loading="lazy"
    allowfullscreen
  ></iframe>
</div>
```

---

### Q44. `width` and `height` attributes on images—still relevant?

**Short definition:** Intrinsic dimensions reserve layout space before the image loads, reducing cumulative layout shift (CLS).

**Answer:** Explicit intrinsic dimensions reserve space before load, reducing cumulative layout shift when images arrive late on slow networks. CSS can still scale the image responsively with `max-width: 100%` and `height: auto`. Always pair with accurate aspect ratio—wrong height causes as much shift as missing dimensions. Modern browsers use width/height to compute aspect-ratio automatically when one dimension is auto in CSS. This is one of the highest-impact HTML performance tweaks for content sites.

**Follow-up:** What is `fetchpriority="high"` for LCP images?

---

### Q45. When use `fetchpriority` on images?

**Short definition:** `fetchpriority` hints download priority—use `high` for LCP hero images, `low` for decorative ones.

**Answer:** The `fetchpriority` attribute hints to the browser which images to fetch first relative to other resources on the page. Set `fetchpriority="high"` on the LCP hero image so it competes better with scripts and lower-priority assets. Use `low` on below-fold decorative images that should not steal bandwidth from critical content. It complements but does not replace correct `srcset`, preloading, and avoiding lazy on above-the-fold heroes. Measure impact in Lighthouse and WebPageTest rather than applying high priority everywhere.

```html
<img
  src="hero.webp"
  fetchpriority="high"
  width="1200"
  height="675"
  alt="Product hero"
/>
```

---

## Accessibility & ARIA

### Q46. What is the accessibility tree? [must-know]

**Short definition:** A browser-derived tree of roles, names, and states exposed to assistive technology—not every DOM node appears.

**Answer:** After parsing HTML and CSS, browsers build an accessibility tree exposing roles, names, states, and relations to assistive tech. Not every DOM node appears—hidden, decorative, or `aria-hidden` content is pruned or suppressed. Good HTML reduces the need to patch the tree with ARIA because native elements carry correct defaults. The accessible name comes from labels, alt text, `aria-label`, or `aria-labelledby` computation. Debugging with DevTools Accessibility panel shows what AT actually receives.

**Follow-up:** What determines an element's accessible name?
**Common mistake:** Thinking `aria-label` fixes everything while ignoring native semantics.

---

### Q47. First rule of ARIA? [must-know]

**Short definition:** Prefer native HTML elements before adding ARIA roles, states, or properties.

**Answer:** Prefer native HTML elements and attributes before reaching for ARIA roles and properties. A `<button>` beats `<div role="button" tabindex="0">` for keyboard, activation, and announcement behavior out of the box. ARIA is for gaps native HTML cannot fill—custom tabs, tree views, or live regions without native equivalents. Misapplied ARIA can make accessibility worse by overriding correct implicit roles. No ARIA is better than wrong ARIA.

**Follow-up:** What is the second rule of ARIA?

---

### Q48. When is `aria-hidden="true"` appropriate?

**Short definition:** Hide decorative or duplicate content from assistive tech while keeping it visible on screen.

**Answer:** Hide decorative duplicates or off-screen icons from assistive tech while keeping them visual for sighted users. Never hide focusable or essential content from AT users—if it is interactive, fix the UX instead of silencing the tree. Icon fonts paired with visible text often hide the icon from AT with `aria-hidden="true"` on the decorative glyph. Do not put `aria-hidden` on modals that are open and meant to be read. Hidden does not remove elements from focus order if they remain focusable.

**Follow-up:** Does `aria-hidden` affect SEO crawlers?

---

### Q49. Explain `aria-live` regions.

**Short definition:** Live regions announce dynamic content changes without moving keyboard focus.

**Answer:** Live regions announce dynamic updates—`polite` waits for idle, `assertive` interrupts immediately for urgent messages. Use for toast notifications, form errors, or async status without moving focus on every small change. Keep messages concise to avoid notification fatigue during rapid updates. `role="status"` implies `aria-live="polite"`; `role="alert"` implies assertive live behavior. Empty the region before injecting new text if you need repeated announcements of the same pattern.

```html
<div aria-live="polite" id="status" class="visually-hidden"></div>
<div role="alert" id="form-error" hidden></div>
```

---

### Q50. Keyboard focus and tabindex? [must-know]

**Short definition:** Interactive elements are focusable by default; `tabindex` adjusts tab order—avoid positive values.

**Answer:** Interactive elements are focusable by default; `tabindex="0"` adds non-interactive elements to tab order in DOM sequence. `tabindex="-1"` allows programmatic focus only—useful for moving focus into modals without adding them to the tab ring permanently. Avoid positive tabindex values—they disrupt natural order and create maintenance nightmares. Visible focus indicators are required for usability and WCAG; never remove outlines without a `:focus-visible` replacement. Test tab order with keyboard only, not mouse.

**Follow-up:** What is focus trapping in modals?
**Common mistake:** Removing focus outlines without replacing them.

---

### Q51. How do you write good `alt` text?

**Short definition:** Describe the image's purpose in context—not every pixel—and use empty alt for decorative images.

**Answer:** Describe the image's purpose in context, not every pixel—in charts, convey the trend or takeaway; in photos, what matters for the task. Decorative images use `alt=""` so AT skips them without announcing "image." Avoid "image of" prefixes; screen readers already identify graphics. If the image is also a link, alt text should describe the link destination, not just the picture. Long descriptions belong in adjacent text or `aria-describedby`, not a novel in alt.

**Follow-up:** How alt text differs for functional vs informative images?

---

### Q52. `role="presentation"` vs empty alt?

**Short definition:** Both remove semantic exposure for decorative graphics; empty `alt` on `img` is the common pattern.

**Answer:** Both can remove semantic exposure for decorative graphics; empty `alt` on `img` is the common and preferred pattern. Presentation role on SVG or tables removes structure—use carefully when the element truly carries no meaning. Prefer HTML patterns that do not require role stripping—decorative SVGs get `aria-hidden="true"` when adjacent text suffices. Never use presentation role to hide content that conveys information because CSS hid it visually.

---

### Q53. Skip links—what and why?

**Short definition:** A skip link lets keyboard users jump past repetitive navigation straight to main content.

**Answer:** A skip link at the top lets keyboard users jump to `#main` content bypassing repetitive navigation on every page load. It can be visually hidden until focused, which keeps visual design clean while serving power users. Pair with `<main id="main">` and ensure the target is focusable or contains a focusable landmark. Cheap to implement, high impact for keyboard and screen reader users who browse many pages. Every site with global nav should have one.

```html
<a href="#main" class="skip-link">Skip to main content</a>
<main id="main" tabindex="-1">...</main>
```

---

### Q54. When should you not use ARIA?

**Short definition:** Do not use ARIA that duplicates native semantics, hides meaningful content, or fixes bad HTML.

**Answer:** Do not add ARIA that duplicates or overrides correct native semantics, such as `role="button"` on a real `<button>`. Do not use ARIA to hide meaningful content from AT or to compensate for non-semantic div buttons without full keyboard support. Do not set `aria-label` that contradicts visible text without a reason—mismatched labels confuse everyone. Fix HTML first; add ARIA only for custom widgets that have no native element. Interview answer: if you can use a native element, ARIA is the wrong tool.

**Follow-up:** What is the "no ARIA" better than bad ARIA principle?

---

## SEO & Performance

### Q55. Which meta tags affect SEO? [must-know]

**Short definition:** Title, meta description, and canonical URL shape search snippets and duplicate-content signals.

**Answer:** `<title>` and meta description influence snippets; canonical links reduce duplicate content signals when many URLs show the same content. Open Graph and Twitter tags control social previews—they do not rank directly but affect click-through rate. Structured data with JSON-LD can enable rich results when valid and maintained. Robots meta and `rel="nofollow"` guide crawling but do not replace good content and performance. Keep titles unique per page and descriptions human-readable, not keyword lists.

```html
<link rel="canonical" href="https://example.com/product" />
<meta name="description" content="Short accurate summary." />
<meta property="og:title" content="Product — Acme" />
```

---

### Q56. How does semantic structure help SEO?

**Short definition:** Clear headings and landmarks help crawlers understand topic hierarchy and main content vs boilerplate.

**Answer:** Clear headings and landmarks help crawlers understand topic hierarchy and main content versus boilerplate navigation. Semantic HTML does not replace quality content or performance, but it clarifies intent and reduces reliance on heuristic guessing. Avoid hiding text or keyword stuffing—penalties outweigh tricks and harm users. One descriptive `h1` and logical `h2` sections mirror how humans skim pages, which aligns with how machines extract topics. Pair semantics with fast LCP and mobile-friendly viewport settings.

---

### Q57. What is `rel="noopener noreferrer"` on external links?

**Short definition:** Security and privacy attributes for `target="_blank"` links—prevent tab-nabbing and optionally omit referrer.

**Answer:** `noopener` prevents the new page from accessing `window.opener`, closing a tab-nabbing vector when using `target="_blank"`. `noreferrer` omits the referrer header and implies noopener in modern browsers. Use both for untrusted external targets, especially user-generated links in comments or profiles. Modern browsers default `noopener` for `_blank` in many cases, but explicit rel is still best practice in interviews and audits. For affiliate or analytics referrers you need, use only `noopener`.

---

### Q58. Resource hints: `preload`, `prefetch`, `preconnect`? [must-know]

**Short definition:** Early connection and fetch hints that warm DNS/TLS or prioritize critical assets for the current navigation.

**Answer:** `preconnect` warms DNS and TLS early to critical origins like your CDN or font provider. `preload` fetches critical assets with high priority for the current navigation—fonts, hero images, or LCP CSS. `prefetch` loads likely next-page resources at low priority during idle time. Misused preload competes with critical path and can hurt performance—measure in DevTools Network priority column. Hint only what you will use immediately on this page load.

**Follow-up:** When would you preload a font?
**Common mistake:** Preloading everything "just in case."

---

### Q59. Where should scripts load for performance?

**Short definition:** Defer non-critical scripts; use `async` for independent widgets; avoid render-blocking JS above the fold.

**Answer:** Non-critical scripts belong at the end of `body` or use `defer` in `head` to preserve execution order after HTML parse. `async` downloads in parallel and runs when ready—good for independent widgets like analytics, bad for scripts that depend on DOM order. Avoid render-blocking JS on above-the-fold content; module scripts defer by default in modern browsers. Inline critical bootstraps only when measured beneficial. Every script tag is a performance budget line item.

---

### Q60. Critical rendering path basics?

**Short definition:** The sequence from HTML/CSS to DOM, CSSOM, render tree, layout, and paint that determines first paint timing.

**Answer:** HTML builds the DOM, CSS builds the CSSOM, and together they form the render tree before layout and paint. Blocking CSS and synchronous JS delay first paint because the browser waits for resources that affect above-the-fold output. Minimize critical bytes, inline tiny critical CSS if measurement shows benefit, and defer the rest. Fonts and images on the critical path need explicit strategies—preload, font-display, dimensions. Interviewers want you to connect HTML choices (where links and scripts live) to LCP and FCP metrics.

---

### Q61. Why avoid inline event handlers like `onclick=""` in HTML?

**Short definition:** Inline handlers mix behavior with structure, complicate CSP, and are harder to test and maintain.

**Answer:** Inline handlers mix behavior with structure, complicate Content Security Policy without `unsafe-inline`, and are harder to test and maintain. External or module scripts with `addEventListener` separate concerns and allow removal of listeners in SPAs. They also complicate duplicate listener management when partial HTML re-renders. Frameworks compile away inline handlers in templates, but raw HTML should stay clean. Progressive enhancement uses unobtrusive JS bound after parse.

---

## Storage & Browser APIs

### Q62. `localStorage` vs `sessionStorage`? [must-know]

**Short definition:** Both store string key-value pairs per origin; local persists until cleared, session lasts for the tab session.

**Answer:** Both store key-value strings scoped to origin; `localStorage` persists until cleared, `sessionStorage` lasts for the tab session and is isolated per tab. They are synchronous and block the main thread on large payloads—avoid storing megabytes of JSON. Not secure for secrets; any script on the origin can read them, including compromised third-party tags. Serialize objects with `JSON.stringify` and handle quota exceeded errors gracefully. Prefer IndexedDB for large structured client data.

```javascript
localStorage.setItem("theme", "dark");
sessionStorage.setItem("draft", JSON.stringify(data));
```

---

### Q63. Cookies vs web storage? [must-know]

**Short definition:** Cookies ride on HTTP requests with server-readable flags; web storage stays client-side and is not sent automatically.

**Answer:** Cookies ride on HTTP requests with size limits and expiry controls—needed for server sessions when marked HttpOnly. Web storage stays client-side and is not sent automatically, which reduces bandwidth but keeps tokens in JavaScript reach. Choose HttpOnly Secure cookies for session IDs; use storage for client preferences like theme. SameSite attributes mitigate CSRF on cookies; storage has no equivalent protection against XSS exfiltration. Never store refresh tokens in localStorage on high-risk apps without understanding XSS blast radius.

**Follow-up:** What is `SameSite=Lax`?
**Common mistake:** Storing JWTs in localStorage where XSS can exfiltrate them.

---

### Q64. What is IndexedDB used for?

**Short definition:** Async transactional browser database for structured data, blobs, and offline caches in PWAs.

**Answer:** IndexedDB is an async, transactional database for structured data and blobs in the browser—offline caches, large datasets, PWAs. It is more complex than key-value storage but scales better and does not block the main thread on every read. Libraries like Dexie wrap common patterns with promises and schema versioning. Use it when Cache API plus JSON files are insufficient for queryable offline data. Plan migration strategies when upgrading schema versions.

---

### Q65. Cache API vs HTTP cache?

**Short definition:** Cache API stores request/response pairs under Service Worker control; HTTP cache follows response headers from the network.

**Answer:** The Cache API lets Service Workers programmatically store `Request`/`Response` pairs for offline or custom strategies like stale-while-revalidate. HTTP cache still governs network fetches unless the worker intercepts them. Used together in PWAs for resilient repeat visits and instant shell loading. Version cache names and clean old caches on activate events to avoid serving stale bundles forever. HTTP cache headers remain important for assets you do not intercept.

---

### Q66. What does the History API enable?

**Short definition:** `pushState` and `replaceState` update URL and history without full page reloads—foundation of SPA routing.

**Answer:** `pushState` and `replaceState` change URL and history entries without full reloads—foundation of client-side routing in React Router and similar libraries. Pair with `popstate` to handle back and forward navigation and sync UI state. Still provide real URLs and server fallbacks for shareable links and SEO on public pages. Hash routing avoids server config but uglifies URLs and complicates analytics. Test back button behavior explicitly—it is a top user complaint when broken.

**Follow-up:** How does this differ from `location.hash` routing?
**Common mistake:** Breaking back button behavior by not syncing state to history.

---

### Q67. `contenteditable`—when and cautions?

**Short definition:** Makes elements user-editable in place—useful for rich text lite but requires sanitization and a11y testing.

**Answer:** It makes elements user-editable in place—useful for rich text lite experiences like comments or inline notes. Sanitize pasted HTML and sync changes to your data model deliberately; browsers insert varying markup on paste. Accessibility and mobile IME behavior need extra testing because you are reimplementing editor semantics. Prefer textarea or established editor libraries for production forms unless scope is tiny. Never trust contenteditable output without server-side sanitization.

---

### Q68. Web Components at the HTML layer?

**Short definition:** Custom elements define new tags with lifecycle callbacks; shadow DOM encapsulates internal markup and styles.

**Answer:** Custom elements let you define new tags with lifecycle callbacks like `connectedCallback`; shadow DOM encapsulates internal markup and styles from the page. HTML imports are deprecated—use ES modules to load component definitions. They integrate with frameworks or stand alone for design systems shared across apps. Preserve native interactive elements inside components—do not rebuild buttons from divs. Form-associated custom elements now bridge shadow DOM and native form submission in modern browsers.

**Follow-up:** How do custom elements relate to semantic HTML?
**Common mistake:** Replacing native buttons with custom elements that lose built-in a11y.

---

### Q69. What are HTML5 Drag and Drop basics?

**Short definition:** Native drag-and-drop uses `draggable="true"`, drag events, and `DataTransfer` with drop targets calling `preventDefault` on dragover.

**Answer:** The native Drag and Drop API uses `draggable="true"` on the source and events like `dragstart`, `dragover`, and `drop` on targets. A drop target must usually call `preventDefault()` during `dragover` to signal it accepts drops—otherwise the cursor shows "not allowed." Data moves through `event.dataTransfer` as strings or files. Native DnD has accessibility gaps; for sortable lists in production, many teams use libraries with keyboard support. Mention pointer and keyboard alternatives in interviews when discussing DnD UX.

```html
<div draggable="true" id="item">Drag me</div>
<div id="drop-zone">Drop here</div>
```

---

### Q70. `<progress>` vs `<meter>`—when use each?

**Short definition:** `progress` shows task completion; `meter` displays a scalar measurement within a known min/max range.

**Answer:** `<progress>` represents completion of a task—file upload, multi-step wizard, or loading bar—with `value` and `max`. `<meter>` displays a gauge within a known range, like disk usage or a score between 0 and 10, optionally with `low`, `high`, and `optimum` thresholds. Neither replaces a detailed chart for analytics—use them for simple native semantics. Pair with visible text for screen readers when the visual bar alone lacks context. Style with CSS cautiously so color is not the only indicator.

```html
<progress value="70" max="100">70%</progress>
<meter min="0" max="10" value="7" optimum="8">7 out of 10</meter>
```

---

## Scenario Walkthroughs

### Scenario 1: Accessible Multi-Step Checkout Form

**Situation:** Interviewers ask you to walk through a three-step checkout—shipping, payment, review—with native HTML accessibility.

**Walkthrough:** Start with a real `<form>` or three forms with clear step headings (`h2`) inside a `<main>` landmark, not div-only wizardry. Wrap each step's fields in `<fieldset>` with `<legend>` ("Shipping address", "Payment method") so screen readers announce groups. Every input gets a visible `<label>`; hints use `aria-describedby`, errors use `role="alert"` and `aria-invalid="true"` on failure. Use `autocomplete` tokens (`shipping street-address`, `cc-number`) so browsers and password managers assist correctly. Navigation buttons are explicit: `type="button"` for Back, `type="submit"` for Continue—never rely on default submit on secondary actions. On step change, move focus to the step heading with `tabindex="-1"` and announce progress in an `aria-live="polite"` region ("Step 2 of 3: Payment"). On the final step, ensure the submit button text is specific ("Place order — ₹4,999") and that validation runs server-side after native client hints.

```html
<main>
  <h1>Checkout</h1>
  <p aria-live="polite" id="step-status">Step 1 of 3: Shipping</p>
  <form aria-labelledby="ship-heading">
    <fieldset>
      <legend id="ship-heading">Shipping address</legend>
      <label for="addr">Street</label>
      <input id="addr" name="street" autocomplete="shipping street-address" required />
      <button type="button">Back to cart</button>
      <button type="submit">Continue to payment</button>
    </fieldset>
  </form>
</main>
```

---

### Scenario 2: Responsive Hero with `<picture>` and `srcset`

**Situation:** Design wants a wide desktop hero and a cropped mobile image in AVIF/WebP with no layout shift.

**Walkthrough:** Use `<picture>` when art direction differs by breakpoint—mobile crop vs desktop wide shot—not just resolution. First `<source>` uses `media="(max-width: 767px)"` with mobile AVIF/WebP `srcset`; second source serves desktop formats; `<img>` fallback is JPEG with full `alt` describing the hero message. Set explicit `width` and `height` matching the fallback aspect ratio and use CSS `width: 100%; height: auto` so CLS stays zero. Mark the LCP image with `fetchpriority="high"` and do **not** lazy-load it; lazy-load below-fold thumbnails separately. Add `sizes` on the fallback `img` if you use width descriptors so the browser picks the right file width. Test on 1x and 2x devices and throttled 3G to confirm the mobile crop downloads on narrow viewports only.

```html
<picture>
  <source
    type="image/avif"
    media="(max-width: 767px)"
    srcset="hero-mobile.avif 768w"
  />
  <source type="image/webp" srcset="hero-desktop.webp 1600w" />
  <img
    src="hero-desktop.jpg"
    alt="Launch sale — 30% off annual plans"
    width="1600"
    height="900"
    fetchpriority="high"
    decoding="async"
  />
</picture>
```

---

### Scenario 3: Accessible Modal Dialog Pattern

**Situation:** Explain how you would build—or review—a modal for confirming account deletion using HTML and ARIA correctly.

**Walkthrough:** Prefer the native `<dialog>` element where supported—it provides `showModal()`, top layer rendering, and backdrop; enhance with polyfill or fallback focus trap where needed. Trigger is a real `<button type="button">`, not a div; the dialog contains a heading (`h2`), explanation text, and two buttons with clear labels ("Cancel", "Delete account permanently"). On open, call `showModal()`, move focus to the dialog or first focusable control, and trap Tab within the dialog until closed. Mark background content `inert` (or aria-hidden on the app root) while open so AT does not read the page behind. On close, restore focus to the trigger button and remove `inert`. Use `role="alertdialog"` only when interruption is truly urgent; otherwise default dialog semantics with descriptive text suffice. Escape key should close cancellable dialogs; destructive confirm may require typing "DELETE" in an input with associated label.

```html
<button type="button" id="open-delete">Delete account</button>
<dialog id="delete-dialog" aria-labelledby="delete-title">
  <h2 id="delete-title">Delete account?</h2>
  <p>This permanently removes your data. This cannot be undone.</p>
  <button type="button" id="cancel-delete">Cancel</button>
  <button type="button" id="confirm-delete">Delete account permanently</button>
</dialog>
```

---

**Total: 70 Q&As + 3 scenario walkthroughs**
