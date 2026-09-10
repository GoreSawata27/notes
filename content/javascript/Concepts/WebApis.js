// 1. IntersectionObserver
// Fires when a target enters or leaves a root (viewport by default).
// Use for lazy images, infinite scroll, and "was this section seen?".

const io = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      console.log("visible", entry.target, entry.intersectionRatio);
    }
  }
});
io.observe(document.querySelector("#card"));

// 2. IntersectionObserver options
// root — scroll container (null = viewport). rootMargin — CSS-like grow/shrink.
// threshold — 0..1 (or an array). 0.25 = callback when 25% is visible.

const io2 = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => e.target.classList.toggle("in", e.isIntersecting));
  },
  { root: document.querySelector("#scroll"), rootMargin: "100px 0px", threshold: [0, 0.25, 1] },
);
io2.observe(document.querySelector("img[data-src]"));

// 3. unobserve and disconnect
// unobserve drops one target. disconnect() stops every target at once.
// After a one-shot lazy-load, unobserve so the callback stops firing.

const img = document.querySelector("img[data-src]");
const lazy = new IntersectionObserver(([entry], obs) => {
  if (!entry.isIntersecting) return;
  entry.target.src = entry.target.dataset.src;
  obs.unobserve(entry.target);
});
lazy.observe(img);

// 4. ResizeObserver
// Fires when an element's content-box size changes (not window.resize).
// Prefer this over measuring in a window resize listener.
// Cleanup: ro.unobserve(el) or ro.disconnect().

const ro = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { inlineSize, blockSize } = entry.contentBoxSize[0];
    console.log(entry.target, inlineSize, blockSize);
  }
});
ro.observe(document.querySelector("#sidebar"));

// 5. MutationObserver
// Fires when the DOM tree changes: children, attributes, or text.
// Use for integrating with third-party widgets — not as a React state substitute.

const mo = new MutationObserver((mutations) => {
  for (const m of mutations) {
    console.log(m.type, m.target, m.addedNodes);
  }
});
mo.observe(document.querySelector("#list"), { childList: true });

// 6. MutationObserver options
// childList — add/remove kids. attributes — attr changes (filter with attributeFilter).
// subtree — watch descendants. characterData — text node changes.
// disconnect, then takeRecords() to drain queued mutations.

const mo6 = new MutationObserver(() => {});
mo6.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["class", "hidden"],
  characterData: false,
});
const pending = mo6.takeRecords();
mo6.disconnect();
console.log(pending.length);

// 7. Create a Web Worker
// Workers run JS on a background thread — no DOM, no window.
// Offload CPU work (parse, crypto, canvas pixel math) so the UI stays responsive.

const worker = new Worker("/worker.js", { type: "module" });
console.log(worker); // Dedicated: one page. SharedWorker: many tabs.

// 8. postMessage
// Structured-clone data across the thread boundary (no functions).
// Transferables (ArrayBuffer) move ownership instead of copying.
// worker.js: self.onmessage = (e) => self.postMessage({ result: e.data.n * 2 });

const fibWorker = new Worker("/worker.js");
fibWorker.postMessage({ type: "fib", n: 40 });
fibWorker.onmessage = (e) => console.log("result", e.data);

// 9. Worker error and terminate
// onerror / onmessageerror catch script and clone failures.
// terminate() kills the worker from the page; self.close() from inside.

const w = new Worker("/worker.js");
w.onerror = (e) => console.error(e.message, e.filename, e.lineno);
w.onmessageerror = (e) => console.error("clone failed", e);
w.terminate();

// 10. requestIdleCallback
// Run low-priority work when the browser is idle (between frames / input).
// deadline.timeRemaining() is leftover idle ms. Do not do long tasks here.

const tasks = [() => console.log("prefetch"), () => console.log("index")];
const idleId = requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0 && tasks.length) {
    tasks.shift()();
  }
});
console.log(idleId);

// 11. Idle timeout option
// timeout: N forces the callback after N ms even if the page never goes idle.
// cancelIdleCallback cancels a pending id. Safari support is late — feature-detect.

const idle2 = requestIdleCallback(
  (deadline) => {
    console.log("idle or forced", deadline.didTimeout, deadline.timeRemaining());
  },
  { timeout: 2000 },
);
cancelIdleCallback(idle2);
if (typeof requestIdleCallback !== "function") {
  setTimeout(() => {}, 1);
}

// 12. requestAnimationFrame
// Schedules work just before the next paint. Use for animations and visual sync.
// One callback per frame; batch DOM reads, then writes, to avoid layout thrash.

let rafId = requestAnimationFrame(function tick(ts) {
  console.log("frame", ts);
  rafId = requestAnimationFrame(tick);
});

// 13. cancelAnimationFrame
// Cancel the next tick — required when the animation should stop
// (tab hidden, component unmount, user pause).

let x = 0;
function slide(ts) {
  x += 2;
  box.style.transform = `translateX(${x}px)`;
  if (x < 200) rafSlide = requestAnimationFrame(slide);
}
const box = document.querySelector("#box");
let rafSlide = requestAnimationFrame(slide);
cancelAnimationFrame(rafSlide);

// 14. matchMedia
// Parses a CSS media query and tells you if it currently matches.
// Prefer this over reading window.innerWidth for breakpoint logic.

const mq = window.matchMedia("(min-width: 768px)");
console.log(mq.media, mq.matches); // true on tablet/desktop
if (mq.matches) document.body.classList.add("is-wide");

// 15. matchMedia change
// Listen for viewport / preference changes (width, prefers-color-scheme, …).
// Use addEventListener("change") — addListener is deprecated.
// Cleanup: dark.removeEventListener("change", syncTheme).

const dark = window.matchMedia("(prefers-color-scheme: dark)");
function syncTheme(e) {
  document.documentElement.dataset.theme = e.matches ? "dark" : "light";
}
syncTheme(dark);
dark.addEventListener("change", syncTheme);

// 16. Visibility API
// document.hidden / visibilityState tell you if the tab is visible.
// "visible" | "hidden" (prerender/unloaded exist in older notes).

console.log(document.hidden);
console.log(document.visibilityState); // "visible" | "hidden"
document.addEventListener("visibilitychange", () => {
  console.log("now", document.visibilityState);
});

// 17. Pause when hidden
// Stop rAF, videos, and polling while the tab is hidden.
// Saves CPU and battery; resume on visible.

let poll;
function startPoll() {
  poll = setInterval(() => fetch("/api/ping"), 10_000);
}
startPoll();
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearInterval(poll);
    document.querySelector("video")?.pause();
  } else {
    startPoll();
    document.querySelector("video")?.play();
  }
});

// 18. navigator.onLine
// Boolean guess: the browser thinks it has a network.
// true does not mean the API is reachable (captive portal, DNS fail).

console.log(navigator.onLine); // true | false
if (!navigator.onLine) {
  console.log("queue writes in IndexedDB until we reconnect");
}

// 19. online and offline events
// window fires "offline" / "online" when the browser flips that flag.
// Still verify with a real fetch — the event is not a heartbeat.

window.addEventListener("offline", () => document.body.classList.add("offline"));
window.addEventListener("online", async () => {
  document.body.classList.remove("offline");
  try {
    await fetch("/api/health", { cache: "no-store" });
  } catch {
    console.log("online flag lied; still unreachable");
  }
});

// 20. Pick the right API
// IntersectionObserver — is this node on screen?
// ResizeObserver — did this node change size?
// MutationObserver — did the DOM change?
// Worker — heavy CPU off the main thread.
// rAF — visual frames. Idle — leftover time.
// matchMedia — CSS queries. Visibility / onLine — tab and network hints.

const when = {
  lazyImage: "IntersectionObserver",
  sidebarWidth: "ResizeObserver",
  thirdPartyDom: "MutationObserver",
  fib40: "Worker + postMessage",
  tween: "requestAnimationFrame",
  analytics: "requestIdleCallback",
  breakpoint: "matchMedia",
  pauseVideo: "visibilitychange",
  syncQueue: "online / navigator.onLine",
};
console.log(when.lazyImage);
