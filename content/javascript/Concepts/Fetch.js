// 1. fetch GET
// fetch(url) defaults to GET and returns a Promise<Response>.
// The promise rejects only on network failure, not on 404/500.

const res = await fetch("https://api.example.com/users");
const data = await res.json();
console.log(data);

// 2. Response.ok
// ok is true when status is 200–299. Always check it before trusting the body.
// status / statusText are the raw HTTP code and reason.

const res2 = await fetch("/api/user");
if (!res2.ok) {
  throw new Error(`${res2.status} ${res2.statusText}`);
}
console.log(res2.status); // 200

// 3. Parse JSON
// response.json() reads the body once and parses it.
// Empty or non-JSON bodies throw. Also: text(), blob(), arrayBuffer(), formData().

const res3 = await fetch("/api/me");
const me = await res3.json();
console.log(me.id);

// 4. POST JSON
// Send a string body and set Content-Type. JSON.stringify the object yourself.

const created = await fetch("/api/notes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Fetch", done: false }),
});
console.log(created.ok, created.status); // 201

// 5. Custom headers
// Headers can be an object or a Headers instance.
// Forbidden headers (Cookie, Host, Origin, …) are controlled by the browser.

const headers = new Headers();
headers.set("Accept", "application/json");
headers.set("X-Request-Id", crypto.randomUUID());
const res5 = await fetch("/api/notes", { headers });
console.log(res5.headers.get("content-type"));

// 6. Query parameters
// Build the query string with URL / URLSearchParams — do not concatenate by hand.

const url = new URL("/api/notes", location.origin);
url.searchParams.set("q", "fetch cors");
url.searchParams.set("page", "1");
const list = await fetch(url);
console.log(url.href); // /api/notes?q=fetch+cors&page=1
console.log(await list.json());

// 7. AbortController
// Pass signal to fetch. abort() rejects the fetch with an AbortError.
// One controller can abort several fetches that share the same signal.

const ac = new AbortController();
document.querySelector("#cancel")?.addEventListener("click", () => ac.abort());
try {
  const res7 = await fetch("/api/slow", { signal: ac.signal });
  console.log(await res7.text());
} catch (err) {
  if (err.name === "AbortError") console.log("cancelled");
}

// 8. Timeout pattern
// fetch has no timeout option. Abort after N ms, then always clear the timer.

async function fetchWithTimeout(resource, ms = 8000, options = {}) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), ms);
  try {
    return await fetch(resource, { ...options, signal: ac.signal });
  } finally {
    clearTimeout(timer);
  }
}
const timed = await fetchWithTimeout("/api/data", 3000);
console.log(timed.ok);

// 9. Retry with backoff
// Retry network failures and 5xx. Do not blindly retry 4xx or POST without care.
// Backoff: wait base * 2^attempt (and optionally add jitter).

async function fetchRetry(resource, { retries = 3, base = 300, ...options } = {}) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(resource, options);
      if (res.ok || (res.status >= 400 && res.status < 500)) return res;
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastErr = err;
    }
    if (i < retries) {
      await new Promise((r) => setTimeout(r, base * 2 ** i));
    }
  }
  throw lastErr;
}
const retried = await fetchRetry("/api/flaky");
console.log(retried.status);

// 10. FormData uploads
// FormData builds multipart/form-data. Append strings or File/Blob values.
// Use this for file inputs — not JSON.stringify.

const form = new FormData();
form.append("title", "shot");
form.append("file", document.querySelector("#file")?.files[0]);
const uploaded = await fetch("/api/upload", { method: "POST", body: form });
console.log(uploaded.ok);

// 11. FormData Content-Type
// Do not set Content-Type yourself — the browser adds the multipart boundary.
// Setting application/json or a bare multipart type breaks the upload.

const fd = new FormData();
fd.append("q", "notes");
await fetch("/api/search", {
  method: "POST",
  body: fd,
  // headers: { "Content-Type": "multipart/form-data" } // ← missing boundary, broken
});

// 12. credentials
// same-origin (default) — cookies on same-origin requests only.
// include — cookies on cross-origin too (server must allow credentials).
// omit — never send cookies.

await fetch("/api/me", { credentials: "same-origin" });
await fetch("https://api.other.com/me", { credentials: "include" });
await fetch("/api/public", { credentials: "omit" });

// 13. CORS mental model
// Browser rule: JS on origin A cannot *read* origin B unless B sends
// Access-Control-Allow-Origin (specific origin, or *). curl is unaffected.
// Credentials cannot use *. They need a concrete origin + Allow-Credentials: true.

const corsRes = await fetch("https://api.other.com/data");
console.log(corsRes.ok);

// 14. Simple vs preflight
// Simple: GET/POST/HEAD + a few headers + simple Content-Type → no OPTIONS.
// Anything else (PUT, JSON Content-Type, custom headers) → preflight OPTIONS first.
// Preflight asks: Access-Control-Request-Method / Headers; server answers Allow-*.

await fetch("https://api.other.com/notes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "hi" }),
});
console.log("OPTIONS preflight runs first, then POST if it succeeds");

// 15. fetch mode
// cors (default) — follow CORS; opaque failures throw / hide the body.
// no-cors — you get an opaque response (status 0, body unreadable). Rarely useful.
// same-origin — throw if the URL is cross-origin.

await fetch("/api/me", { mode: "same-origin" });
await fetch("https://cdn.example.com/hit", { mode: "no-cors" }); // opaque

// 16. Network vs HTTP errors
// Network / CORS / abort → fetch rejects (TypeError or AbortError).
// 404 / 500 → fetch resolves; you must check response.ok.

try {
  const res16 = await fetch("/api/missing");
  if (!res16.ok) console.log("HTTP error", res16.status);
} catch (err) {
  console.log("network / CORS / abort", err.name);
}

// 17. Streaming text
// res.body is a ReadableStream. Read chunks before the full payload arrives.
// Useful for SSE-like text, logs, or large files. json() waits for the whole body.

const res17 = await fetch("/api/stream");
const reader = res17.body.getReader();
const decoder = new TextDecoder();
let text = "";
for (;;) {
  const { done, value } = await reader.read();
  if (done) break;
  text += decoder.decode(value, { stream: true });
}
console.log(text);

// 18. response.clone
// The body is a one-shot stream. json() then text() throws.
// clone() before reading if you need two consumers.

const res18 = await fetch("/api/me");
const copy = res18.clone();
console.log(await res18.json());
console.log(await copy.text());

// 19. PUT PATCH DELETE
// method selects the verb. DELETE often has no body; PATCH/PUT usually send JSON.

await fetch("/api/notes/1", { method: "DELETE" });
await fetch("/api/notes/1", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ done: true }),
});
await fetch("/api/notes/1", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Fetch", done: true }),
});

// 20. URLSearchParams body
// application/x-www-form-urlencoded — HTML form default, not multipart.
// fetch sets the Content-Type when the body is URLSearchParams.

const params = new URLSearchParams({ email: "a@b.com", remember: "1" });
await fetch("/login", { method: "POST", body: params });

// 21. Blob download
// res.blob() gives a file-like object. Object URLs can trigger a download.

const res21 = await fetch("/api/report.pdf");
const blob = await res21.blob();
const href = URL.createObjectURL(blob);
const a = Object.assign(document.createElement("a"), { href, download: "report.pdf" });
a.click();
URL.revokeObjectURL(href);

// 22. cache option
// default — browser HTTP cache rules. no-store — always hit the network.
// reload — network then update cache. force-cache / only-if-cached — prefer cache.

await fetch("/api/config", { cache: "no-store" });
await fetch("/icons/app.svg", { cache: "force-cache" });

// 23. redirect option
// follow (default) — follow 3xx. manual — you see the redirect response.
// error — reject on redirect.

const res23 = await fetch("/old-path", { redirect: "follow" });
console.log(res23.redirected, res23.url);

// 24. Parallel requests
// Kick off fetches together, then Promise.all. All fail if one rejects.
// Promise.allSettled if you want partial results.

const [users, notes] = await Promise.all([
  fetch("/api/users").then((r) => r.json()),
  fetch("/api/notes").then((r) => r.json()),
]);
console.log(users.length, notes.length);

// 25. Error handling pattern
// try/catch for network + AbortError. Check ok for HTTP errors.
// Read an error payload when the server sends JSON errors.

async function api(path, options) {
  let res;
  try {
    res = await fetch(path, options);
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error("Network error");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.message ?? `HTTP ${res.status}`);
  return body;
}
const note = await api("/api/notes/1");
console.log(note);
