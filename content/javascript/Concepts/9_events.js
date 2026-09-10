// 1. Event flow
// Three phases: capturing (window → target), target, bubbling (target → window).
// Most handlers run on the bubble. addEventListener(type, fn, true) or
// { capture: true } listens on the way down. Click the child to see the order.

const outer = document.querySelector("#outer");
const inner = document.querySelector("#inner");
outer.addEventListener("click", () => console.log("outer bubble"));
outer.addEventListener("click", () => console.log("outer capture"), true);
inner.addEventListener("click", () => console.log("inner target"));
// typical log: outer capture → inner target → outer bubble

// 2. addEventListener options
// Third argument: boolean (capture) or an options object.
// capture, once, passive, signal (AbortController). Default is bubble + not once.

el.addEventListener("click", handler, { capture: false, once: false, passive: false });
el.addEventListener("click", handler, false); // same as capture: false
el.addEventListener("click", handler, true); // capture phase

// 3. Event delegation
// One listener on a parent handles many children via event.target.
// Works for elements added later. Prefer closest() so clicks on inner
// nodes (span inside a button) still match. Check contains() if needed.

list.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn || !list.contains(btn)) return;
  console.log("clicked", btn.dataset.id);
});

// 4. preventDefault
// Stops the browser's default action (navigate, submit, check a box).
// Does not stop the event from traveling to other listeners.
// Returns false from an on* property is a legacy way to do both
// preventDefault and stopPropagation — avoid it.

form.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("submit handled in JS");
});
link.addEventListener("click", (e) => {
  if (!e.target.href.startsWith("https")) e.preventDefault();
});

// 5. stopPropagation vs stopImmediatePropagation
// stopPropagation: no further nodes in capture/bubble see this event.
// Other listeners on the SAME node still run.
// stopImmediatePropagation: also skips remaining listeners on this node.
// Does not imply preventDefault — call both if you need both.

child.addEventListener("click", (e) => {
  e.stopPropagation();
  console.log("child — parent will not see this click");
});
child.addEventListener("click", (e) => {
  e.stopImmediatePropagation();
  console.log("first only");
});
child.addEventListener("click", () => console.log("never — immediate stopped"));

// 6. once
// { once: true } auto-removes the listener after the first fire.
// Same as wrapping the handler and calling removeEventListener yourself.
// Useful for first-interaction, one-shot popovers, or init-on-click.

button.addEventListener("click", () => console.log("only once"), { once: true });

// 7. passive
// Promises the handler will not call preventDefault. The browser can
// scroll/touch immediately without waiting for JS. Use on wheel, touch,
// and touchmove. Calling preventDefault inside a passive listener is ignored
// (and warns in DevTools). Default is false except some browser touch defaults.

window.addEventListener("touchstart", onTouch, { passive: true });
window.addEventListener(
  "wheel",
  (e) => {
    // e.preventDefault(); // ignored if passive: true
  },
  { passive: true },
);

// 8. Custom events
// CustomEvent carries a detail payload. Set bubbles/cancelable or it stays
// on the target only. composed: true crosses shadow DOM. dispatchEvent
// is synchronous — listeners run before the next line.

const ping = new CustomEvent("ping", {
  detail: { from: "child" },
  bubbles: true,
  cancelable: true,
  composed: true,
});
parent.addEventListener("ping", (e) => console.log(e.detail.from));
child.dispatchEvent(ping);
document.dispatchEvent(new Event("ready")); // no detail — use Event or CustomEvent

// 9. removeEventListener pitfalls
// Must pass the same function reference AND the same capture flag.
// Anonymous functions, .bind(), and wrappers are new functions — they never match.
// Options besides capture (once, passive) are ignored when removing.
// AbortController.abort() removes everything subscribed with that signal.

function onSave() {}
el.addEventListener("click", onSave);
el.removeEventListener("click", onSave); // ok

el.addEventListener("click", () => {});
el.removeEventListener("click", () => {}); // no-op — different functions

const bound = onSave.bind(obj);
el.addEventListener("click", bound);
el.removeEventListener("click", onSave); // no-op
el.removeEventListener("click", bound); // ok

el.addEventListener("click", onSave, true);
el.removeEventListener("click", onSave); // no-op — capture mismatch
el.removeEventListener("click", onSave, true); // ok

const ac = new AbortController();
el.addEventListener("click", onSave, { signal: ac.signal });
ac.abort(); // removes it

// 10. Event object essentials
// type, target (origin), currentTarget (the node whose listener is running),
// eventPhase (1 capture / 2 target / 3 bubble), timeStamp.
// Mouse: clientX/Y, button. Keyboard: key, code, repeat.
// Do not confuse target with currentTarget during delegation.

el.addEventListener("click", (e) => {
  e.target; // what was clicked
  e.currentTarget; // always el for this listener
  e.eventPhase;
});
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") e.preventDefault();
});

// 11. Common listener types
// click, dblclick, input, change, submit, focus, blur (no bubble — use
// focusin / focusout if you need delegation), keydown, pointerdown,
// scroll (does not bubble; listen on the scroller), resize on window.

form.addEventListener("input", (e) => console.log(e.target.value)); // live
form.addEventListener("change", (e) => console.log(e.target.value)); // committed
el.addEventListener("focusin", (e) => e.target.classList.add("on"));
