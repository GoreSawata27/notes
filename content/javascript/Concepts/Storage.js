// 1. When to use each
// localStorage — persist across tabs and restarts (prefs, cached JSON).
// sessionStorage — this tab only; dies when the tab closes.
// Cookies — sent on HTTP requests; use for auth the server must see.
// IndexedDB — large structured data, files, offline caches.

const pick = {
  theme: "localStorage",
  wizardStep: "sessionStorage",
  sessionId: "cookie (server-set, HttpOnly)",
  offlineNotes: "IndexedDB",
};
console.log(pick.theme);

// 2. localStorage set and get
// Same-origin key/value store. Survives refresh and browser restart.
// All values are strings. Missing keys return null, not undefined.

localStorage.setItem("theme", "dark");
const theme = localStorage.getItem("theme"); // "dark"
console.log(theme);
console.log(localStorage.getItem("missing")); // null

// 3. localStorage remove and clear
// removeItem deletes one key. clear() wipes every key for this origin.
// Prefer removeItem so you do not delete unrelated keys.

localStorage.setItem("a", "1");
localStorage.setItem("b", "2");
localStorage.removeItem("a");
console.log(localStorage.getItem("a")); // null

// 4. localStorage key and length
// length is the number of keys. key(i) reads the name at that index.
// Index order is not something you should rely on.

localStorage.setItem("user", "gore");
console.log(localStorage.length);
console.log(localStorage.key(0));
for (let i = 0; i < localStorage.length; i++) {
  const k = localStorage.key(i);
  console.log(k, localStorage.getItem(k));
}

// 5. sessionStorage tab scope
// API is identical to localStorage, but data is per-tab (not per-origin shared).
// A duplicate tab usually gets a copy; a new tab starts empty.
// Closing the tab deletes it. Refresh keeps it.

sessionStorage.setItem("step", "2");
console.log(sessionStorage.getItem("step")); // "2"
sessionStorage.removeItem("step");

// 6. Values are always strings
// Numbers, booleans, and objects are coerced with ToString.
// [object Object] is the classic bug. Always JSON.stringify objects.

localStorage.setItem("count", 5);
console.log(localStorage.getItem("count") === "5"); // true
localStorage.setItem("on", true);
console.log(localStorage.getItem("on")); // "true"
localStorage.setItem("bad", { a: 1 });
console.log(localStorage.getItem("bad")); // "[object Object]"

// 7. JSON serialize for objects
// Round-trip objects and arrays with JSON.stringify / JSON.parse.
// Guard parse — empty, null, or corrupt strings throw.

const user = { id: 1, name: "Gore" };
localStorage.setItem("user", JSON.stringify(user));
const raw = localStorage.getItem("user");
const parsed = raw ? JSON.parse(raw) : null;
console.log(parsed.name); // Gore

// 8. JSON serialize pitfalls
// undefined in objects is dropped; in arrays it becomes null.
// Date becomes an ISO string. Map/Set become {}.
// Functions and symbols are omitted. Circular refs throw.
// NaN and Infinity become null.

console.log(JSON.stringify({ a: undefined })); // "{}"
console.log(JSON.stringify([undefined])); // "[null]"
console.log(JSON.stringify(new Date("2026-01-01"))); // '"2026-01-01T00:00:00.000Z"'
console.log(JSON.stringify(new Map([["a", 1]]))); // "{}"
console.log(JSON.stringify({ n: NaN })); // '{"n":null}'
const cycle = {};
cycle.self = cycle;
try {
  JSON.stringify(cycle);
} catch (err) {
  console.log(err.name); // TypeError
}

// 9. QuotaExceededError
// localStorage / sessionStorage are small (~5MB per origin, browser-dependent).
// Writes can throw QuotaExceededError (or a DOMException). Always try/catch.

try {
  localStorage.setItem("cache", "x".repeat(10_000_000));
} catch (err) {
  if (err.name === "QuotaExceededError") {
    localStorage.removeItem("cache");
  }
}

// 10. Same-origin isolation
// Storage is keyed by origin: scheme + host + port.
// https://a.com cannot read http://a.com or https://b.com.
// localhost:3000 is not shared with :3001. Subdomains need cookie Domain to share.

console.log(location.origin); // e.g. "http://localhost:3000"

// 11. storage event
// Fires in *other* same-origin documents when localStorage changes.
// The writing tab does not get the event. Other tab: localStorage.setItem(...).
// sessionStorage almost never notifies other tabs (tab-scoped).

window.addEventListener("storage", (e) => {
  console.log(e.key, e.oldValue, e.newValue, e.url);
  console.log(e.storageArea === localStorage);
});

// 12. Read document.cookie
// One semicolon-separated string. HttpOnly cookies are invisible to JS.
// There is no API to read attributes (Path, SameSite) back out.

console.log(document.cookie); // "theme=dark; locale=en"
const cookies = Object.fromEntries(
  document.cookie
    .split("; ")
    .filter(Boolean)
    .map((pair) => pair.split("=").map(decodeURIComponent)),
);
console.log(cookies.theme);

// 13. Write document.cookie
// Assigning document.cookie sets *one* cookie; it does not replace the whole jar.
// Default: session cookie (deleted when the browser closes), current path.

document.cookie = "theme=dark";
document.cookie = "locale=en";
console.log(document.cookie); // both still present

// 14. Cookie expires and max-age
// expires is an HTTP-date. max-age is seconds from now (usually preferred).
// max-age=0 (or a past expires) deletes the cookie.

document.cookie = `token=abc; max-age=${60 * 60 * 24 * 7}`; // 7 days
document.cookie = `old=1; expires=${new Date(Date.now() + 864e5).toUTCString()}`;

// 15. Cookie path and domain
// Path defaults to the current URL path — a cookie set on /notes
// may not be sent to /learn. Use Path=/ for the whole site.
// Domain=example.com shares across subdomains (leading dot is optional now).

document.cookie = "theme=dark; Path=/";
document.cookie = "theme=dark; Domain=example.com; Path=/";

// 16. Secure HttpOnly SameSite
// Secure — only sent on HTTPS (localhost is special-cased).
// HttpOnly — JS cannot read it; only the server can set this (Set-Cookie header).
// SameSite=Lax|Strict|None (None requires Secure). Stops most CSRF cookie sends.

document.cookie = "prefs=1; Path=/; Secure; SameSite=Lax";
console.log(document.cookie.includes("prefs"));

// 17. Encode cookie values
// Values can break on ; , = and spaces. Encode on write, decode on read.
// Cookie names should stay simple tokens.

const value = "Gore; admin=true";
document.cookie = `name=${encodeURIComponent(value)}; Path=/`;
const match = document.cookie.match(/(?:^|; )name=([^;]*)/);
console.log(match ? decodeURIComponent(match[1]) : null);

// 18. Delete a cookie
// Re-set the same name with max-age=0 (or a past expires).
// Path and Domain must match the original or the browser will not delete it.

document.cookie = "theme=; Path=/; max-age=0";
document.cookie = "theme=; Domain=example.com; Path=/; max-age=0";

// 19. Cookies vs Web Storage
// Cookies: ~4KB each, sent on matching requests (payload + CSRF risk).
// Web Storage: ~5MB, never sent automatically, JS-only.
// Never put secrets in localStorage — any XSS can read them.

const sentWithEveryRequest = "cookies";
const staysInTheBrowser = "localStorage / sessionStorage / IndexedDB";
console.log(sentWithEveryRequest, staysInTheBrowser);

// 20. IndexedDB open
// Async, transactional, origin-scoped DB for large structured data.
// onupgradeneeded runs when the version is new or higher.

const openReq = indexedDB.open("notes-db", 1);
openReq.onerror = () => console.error(openReq.error);
openReq.onsuccess = () => {
  const db = openReq.result;
  console.log(db.name, db.version);
  db.close();
};

// 21. IndexedDB object store
// Stores are like tables. Create them only inside onupgradeneeded.
// keyPath uses a field on the value. autoIncrement assigns keys.

const openV1 = indexedDB.open("notes-db", 1);
openV1.onupgradeneeded = () => {
  const db = openV1.result;
  if (!db.objectStoreNames.contains("notes")) {
    const store = db.createObjectStore("notes", { keyPath: "id" });
    store.createIndex("byTitle", "title", { unique: false });
  }
};

// 22. IndexedDB put and add
// Transactions: readonly | readwrite. put upserts; add fails if the key exists.
// Work must happen while the transaction is active (no awaiting extra I/O in between).

function putNote(db, note) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("notes", "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore("notes").put(note); // putNote(db, { id: "n1", title: "Fetch" })
  });
}

// 23. IndexedDB get
// get(key) returns the record or undefined. getAll() pulls a snapshot.

function getNote(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("notes", "readonly");
    const req = tx.objectStore("notes").get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error); // const note = await getNote(db, "n1")
  });
}

// 24. IndexedDB delete and cursor
// delete(key) / clear() for writes. openCursor walks records without loading all.

function deleteNote(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("notes", "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore("notes").delete(id);
  });
}
function walkNotes(db, onRow) {
  const tx = db.transaction("notes", "readonly");
  tx.objectStore("notes").openCursor().onsuccess = (e) => {
    const cursor = e.target.result;
    if (!cursor) return;
    onRow(cursor.value);
    cursor.continue();
  };
}

// 25. Storage quotas
// navigator.storage.estimate() reports usage vs quota (IndexedDB + Cache API).
// persist() asks the browser not to evict the origin under storage pressure.

const { usage, quota } = await navigator.storage.estimate();
console.log(`using ${usage} / ${quota} bytes`);
const persisted = await navigator.storage.persist();
console.log("persistent?", persisted);
console.log(await navigator.storage.persisted());
