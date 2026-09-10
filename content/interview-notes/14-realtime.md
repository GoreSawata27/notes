# Realtime Interview Notes

Concise, say-aloud answers for realtime interviews — transports, native WebSocket, production reconnect, the React hook patterns in this repo’s `src/hooks/useWebSocket2.ts`, socket.io-client, SSE, Next.js hosting, and testing. Each card has a **Short definition**, a spoken **Answer**, a follow-up, and a common mistake.

---

## Transport choice

### Q1. What is realtime communication versus HTTP request-response? [must-know]

**Short definition:** Request-response waits for the client to ask. Realtime means the server can push as soon as state changes, without the client polling.

**Answer:** Classic REST is pull: the browser opens a request, the server answers, the connection is done. Realtime is push (or a long-lived pipe): chat lines, live occupancy, AI tokens, and presence appear when they happen. You still use HTTP to start work — login, create a job — then keep a channel open (polling loop, SSE stream, or WebSocket) so the UI does not wait for the next user click. Interviewers want to hear that “realtime” is a product requirement (latency + who speaks first), not a single API.

**Follow-up:** Is GraphQL subscription realtime? — Yes, typically over WebSocket; the transport is still a socket even if the query language is GraphQL.

**Common mistake:** Calling `refetchInterval` on React Query “a WebSocket.” That is polling with a cache.

---

### Q2. What is HTTP polling and when is it still the right choice?

**Short definition:** Polling is a timer that repeats a normal HTTP request to ask “anything new?”

**Answer:** The client hits an endpoint every N seconds and replaces UI state with the snapshot. It is trivial to add on top of REST and React Query (`refetchInterval`). Use it for unread badges, job status, and dashboards that can be tens of seconds stale. At scale it wastes traffic: a thousand tabs at 5s is 200 requests/second even when nothing changed. You also miss updates that happen between ticks unless the API returns a log since a cursor.

```ts
setInterval(() => void fetch("/api/unread").then((r) => r.json()).then(render), 15_000);
```

**Follow-up:** How do you make polling cheaper? — `ETag` / `If-None-Match`, a `since` cursor, or a tiny “version” endpoint before fetching the heavy payload.

**Common mistake:** Polling every 500ms “to feel live.” You have invented a denial-of-service against your own API.

---

### Q3. What is long-polling?

**Short definition:** Long-polling holds one HTTP request open until the server has an event or a timeout fires, then the client immediately opens the next request.

**Answer:** Instead of answering “nothing” every 2s, the server parks the request until event 43 exists or ~25s pass (under proxy idle limits). The client applies the batch, then hangs again with `?since=43`. You cut empty 200s compared with short polling, but you still pay a new HTTP request per batch, you cannot freely push *from the client* on the same hang, and a proxy may still cut the socket. socket.io still uses this as a fallback when the WebSocket upgrade fails.

```ts
async function longPoll(since: number): Promise<void> {
  const res = await fetch(`/api/events?since=${since}`, { signal: AbortSignal.timeout(30_000) });
  if (res.status === 204) return longPoll(since);
  const batch = await res.json();
  apply(batch);
  return longPoll(batch.at(-1).id);
}
```

**Follow-up:** Why cap the hold below 30s? — Many load balancers idle-timeout around 30–60s; a clean 204 is better than a surprise 502.

**Common mistake:** Treating long-polling as “basically a WebSocket.” It is still request-response.

---

### Q4. What are Server-Sent Events? [must-know]

**Short definition:** SSE is a one-way, server-to-client text stream over HTTP (`text/event-stream`) with a native browser client, `EventSource`.

**Answer:** The server keeps an HTTP response open and writes `data:` / `event:` / `id:` blocks. The browser parses them, fires listeners, and auto-reconnects, resending `Last-Event-ID`. That is why AI chat UIs often pick SSE: the user POSTs a prompt, tokens flow down, the client never needs to `send` on the same pipe. SSE is text-oriented, not a general binary duplex channel. You cannot set custom headers on `EventSource` (see Q51).

**Follow-up:** SSE vs WebSocket for AI chat? — SSE is simpler for one-way streaming; WebSocket if the user must send mid-stream on the same connection.

**Common mistake:** Using SSE for a multiplayer game loop that must send 20 cursor updates a second both ways.

---

### Q5. What is a WebSocket? [must-know]

**Short definition:** A WebSocket is a bidirectional, full-duplex connection that starts as an HTTP Upgrade and then exchanges frames instead of HTTP requests.

**Answer:** `new WebSocket("wss://…")` sends a GET with `Upgrade: websocket`. If the server returns `101 Switching Protocols`, the same TCP (or HTTP/2) connection becomes a frame pipe. After that either side can send at any time with low per-message overhead. That is the right tool for chat, live dashboards, presence, and collaborative cursors. It is not magic: you still design a JSON protocol, reconnect, auth, and heartbeats yourself unless you adopt a library.

**Follow-up:** Does CORS apply to WebSockets the way it applies to `fetch`? — The browser will open a cross-origin `wss:` URL; there is no CORS preflight. The server must authenticate and may check `Origin`.

**Common mistake:** Saying WebSocket is “just HTTP with keep-alive.” After 101 it is a different protocol.

---

### Q6. What is WebRTC and when do you use it instead of WebSocket?

**Short definition:** WebRTC is peer-to-peer media and data channels. You use it for camera, microphone, and screen share — not as your app’s default pub/sub bus.

**Answer:** WebRTC gives you audio/video and `RTCDataChannel` between browsers (or browser and an SFU). To connect you still need signaling (often a WebSocket), ICE, STUN, and usually TURN for NAT. That ops cost is justified for calls. It is the wrong answer for “push inventory updates to a dashboard.” A WebSocket to your API is simpler, one-to-many via your server, and does not require a media stack.

**Follow-up:** Can DataChannels replace WebSocket for chat? — They can carry bytes, but you still need a signaling server and TURN. Almost every product still keeps a server socket.

**Common mistake:** Listing WebRTC as the realtime solution for a fintech admin dashboard.

---

### Q7. How do you choose among polling, long-polling, SSE, WebSocket, and WebRTC? [must-know]

**Short definition:** Pick the cheapest transport that matches direction, delay, headers, and where the process can live.

**Answer:** Ask four questions. Who speaks after connect (down only vs both vs peer media)? What delay is acceptable? Can the browser client set `Authorization`? Are you on serverless (no long-lived socket host)? Badges every 30s → polling. AI tokens after a POST → SSE. Chat / live map / subscribe+publish → WebSocket. Camera → WebRTC. Long-polling is a fallback when upgrades fail. This repo’s split matches that table: TimeLens uses a native WebSocket hook; GenE uses SSE; Asset360Hub stays on REST + React Query.

| Need                    | Default        |
| ----------------------- | -------------- |
| Slow one-way snapshot   | Polling        |
| One-way stream + resume | SSE            |
| Bidirectional events    | WebSocket      |
| Audio / video P2P       | WebRTC         |
| WS blocked by proxy     | Long-poll / IO |

**Follow-up:** What if you need a bearer header and one-way stream? — Native `EventSource` cannot do it; use a `fetch` readable stream (Q51) or cookies.

**Common mistake:** Defaulting to socket.io for every “live” label, including a 15s KPI tile.

---

### Q8. Why is naive polling expensive at scale?

**Short definition:** Cost is clients × frequency × payload, most of it empty.

**Answer:** Each poll pays TLS, headers, and origin connection slots whether or not data changed. Mobile radios wake up. Server CPU parses auth on every tick. Horizontal scale looks like “we added users and the read replica died,” not “we have a realtime feature.” Mitigation is longer intervals, conditional GET, or switching to push once the product actually needs sub-second updates.

**Follow-up:** Does HTTP/2 multiplexing fix polling? — It reduces connection count, not the application-level QPS or empty JSON bodies.

**Common mistake:** “We use HTTP/2 so polling is free.”

---

## Native WebSocket

### Q9. Describe the WebSocket handshake. [must-know]

**Short definition:** An HTTP GET with `Upgrade: websocket` that must receive `101` and `Sec-WebSocket-Accept`.

**Answer:** The client sends `Connection: Upgrade`, a random `Sec-WebSocket-Key`, and optional `Sec-WebSocket-Protocol`. The server hashes the key with the RFC 6455 magic string and returns 101. After that you do not speak HTTP on that socket — you send frames. `wss:` is TLS plus WebSocket; an `https` page cannot open `ws://`. Handshake failures in the browser usually surface as `error` then `close` 1006 with no response body to `await`. Debug in DevTools → Network → WS → Headers and look for 101, not 404/401/502.

**Follow-up:** Can you set `Authorization` on `new WebSocket(url)`? — No. Use query, cookie, subprotocol, or a first-message auth (Q24–Q25).

**Common mistake:** Expecting `fetch`-style headers or a JSON error body from a failed upgrade.

---

### Q10. What is `readyState`?

**Short definition:** A numeric lifecycle: `CONNECTING` 0, `OPEN` 1, `CLOSING` 2, `CLOSED` 3. Only `OPEN` may `send`.

**Answer:** Construction starts at 0. `onopen` means 1. `close()` goes 2 then 3. A failed handshake jumps to 3 without a successful open. This repo’s hook does not expose `readyState`; it mirrors it with React state `"idle" | "connecting" | "open" | "closed"`. `idle` is application state — “we are not trying” because `token` is null — not a fifth readyState.

```ts
if (!ws || ws.readyState !== WebSocket.OPEN) throw new Error("not OPEN");
ws.send(JSON.stringify(payload));
```

**Follow-up:** Can you `send` in the same tick as `new WebSocket`? — No. Queue until `onopen`.

**Common mistake:** Treating “I constructed it” as “it is connected.”

---

### Q11. What are the four WebSocket events? [must-know]

**Short definition:** `open`, `message`, `error`, and `close`. Production code assigns all four.

**Answer:** `open` fires once after a successful handshake. `message` fires per complete application message (`event.data` is string, Blob, or ArrayBuffer). `error` is nearly empty in browsers — log it, do not parse a reason. `close` always runs when the socket dies, including after `error` and including when *you* called `close()`. Reconnect belongs on `close`, not on both `error` and `close`, or you double-connect. `CloseEvent` gives `code`, `reason`, and `wasClean`.

**Follow-up:** Why does `useWebSocket2` guard every handler with `isMountedRef`? — A late `onmessage` / `onclose` must not `setState` after unmount (Q37).

**Common mistake:** Reconnecting in `onerror` and again in `onclose`.

---

### Q12. What is a WebSocket frame?

**Short definition:** The unit on the wire after the handshake: text, binary, ping, pong, or close.

**Answer:** Your app almost always sees text frames as a UTF-8 string and binary frames as Blob/ArrayBuffer (`binaryType`). Ping/pong/close are control frames; page JavaScript does not get ping/pong as `message` events. Browsers do not expose `ws.ping()`. Keepalive is therefore server-driven control pings or an application `{ type: "ping" }` you invent. One frame should be one JSON value — do not concatenate two objects.

**Follow-up:** Does native WebSocket know about your `type: "subscribe"` events? — No. That is your application protocol (Q13).

**Common mistake:** Assuming the browser will heartbeat for you in page JS.

---

### Q13. How do you design a JSON message protocol on a raw socket?

**Short definition:** A discriminator (`type`), a payload (`data`), and later `id` / `seq` for dedupe. The spec does not give you events.

**Answer:** Agree a small envelope. This repo’s hook types `WSMessage` as `{ type?, data?, [key: string]: any }` and `JSON.parse`s every frame. A serious protocol makes `type` required, versions the contract, and rejects unknown types in a default branch. Subscribe, event, error, ping, and sync (`since`) cover most dashboards. Binary (protobuf, MessagePack) is an optimization after you measure.

```ts
ws.send(JSON.stringify({ type: "subscribe", data: { channel: "agents.shift" } }));
```

**Follow-up:** Why parse in a try/catch? — A single malformed frame should not kill the handler; `useWebSocket2` logs and continues.

**Common mistake:** One giant untyped `data: any` dump with no `type`, then a 200-line `if` chain.

---

### Q14. What are WebSocket close codes? Name the ones you actually use.

**Short definition:** A numeric why on `close(code, reason)`. `1000` is normal; `1001` going away; `1006` is reserved for abnormal drop.

**Answer:** 1000–1015 are spec codes. 3000–3999 libraries. 4000–4999 yours. This repo closes with **1000** and a short reason: `"Tab closed or refreshed"`, `"Token missing - closing"`, `"Component unmounted"`. That lets the server drop the session instead of waiting for ping timeout. Use an app code like 4001 when the server rejects an expired JWT so the client must not reconnect with the same token. Reason strings are limited to 123 UTF-8 bytes.

**Follow-up:** Who sets 1006? — The user agent, when no close frame arrived. You must not send 1005 or 1006.

**Common mistake:** Calling `close(1006, "oops")` from application code.

---

### Q15. What does close code 1006 mean?

**Short definition:** Abnormal closure — the connection died without a close frame.

**Answer:** Failed handshake, killed tab, yanked wifi, process crash, or a proxy idle timeout all show up as 1006 with `wasClean === false` and usually an empty reason. It is the most common production close you will log. A flood of 1006 at a round minute is often the load balancer, not React. Fix with pings under the idle budget, higher timeouts on the WS path, and intentional 1000 on tab close so the happy path is not 1006.

**Follow-up:** How do you distinguish handshake failure from idle timeout? — Handshake 1006 happens immediately, never `open`. Idle 1006 happens after a quiet `OPEN` period.

**Common mistake:** Treating every 1006 as an auth bug.

---

### Q16. What is a heartbeat and why do you need one?

**Short definition:** A periodic ping/pong (control frames or JSON) so idle NATs, firewalls, and load balancers do not silently drop the socket.

**Answer:** Many paths forget quiet TCP after 30–75s. Servers should send spec ping frames; browsers will pong. Page JS cannot `ws.ping()`, so if the server does not ping you send `{ type: "ping" }` and close when pongs stop. `useWebSocket2.ts` does **not** implement an application heartbeat — it relies on `onclose` plus backoff. That is fine when the backend pings; add a watchdog when you see `readyState === OPEN` and a silent UI.

**Follow-up:** How do you pick the interval? — Shorter than the shortest idle timeout in the path (nginx, ALB, corporate NAT).

**Common mistake:** Spamming a ping every 500ms on top of server pings.

---

### Q17. What is `bufferedAmount`?

**Short definition:** How many outbound bytes the browser has queued but not yet written to the network.

**Answer:** `send` means “accepted by the UA,” not “the peer has it.” High-frequency mouse moves on a slow radio make `bufferedAmount` climb while you still think you are realtime. Gate sends (`if (bufferedAmount > 64_000) return`), coalesce to the latest point, or drop-oldest. `bufferedAmount` is not an application ACK — seq/ack (Q28) tells you the server processed a message. This repo’s hook is receive-only, so it never reads `bufferedAmount`.

**Follow-up:** Is a growing buffer a reason to reconnect? — Sometimes: close and reopen if it never drains, after you already stopped sending.

**Common mistake:** `await`ing `send`. It is synchronous and does not return a promise.

---

### Q18. Why use the native `WebSocket` API with no package?

**Short definition:** Zero bundle, one RFC, full control — if you are willing to own reconnect, auth, and a JSON protocol.

**Answer:** This repo’s TimeLens-style hook is ~100 lines: constructor, four events, token gate, 1s–30s backoff. You avoid Engine.IO packet formats and tens of KB of `socket.io-client`. You also get no fallback if a proxy blocks `Upgrade`, no rooms, no acks. That is a valid production choice when you control the server and the audience is modern browsers. Say both sides in an interview: “we chose native because the backend already spoke JSON frames; we accepted owning backoff and resubscribe.”

**Follow-up:** When would you add a package tomorrow? — Hostile proxies, rooms/acks you do not want to invent, or a team that already runs socket.io on the server.

**Common mistake:** “Native is always better because it is standards-based.” Ops can still force a fallback.

---

### Q19. Text frames versus binary frames?

**Short definition:** Text is UTF-8 (`event.data` is a `string`). Binary is `Blob` or `ArrayBuffer` depending on `binaryType`.

**Answer:** JSON chat and dashboard events stay on text frames. Images, protobuf, and audio chunks go binary. Set `ws.binaryType = "arraybuffer"` when you want bytes, not Blobs. Mixing is allowed — your `onmessage` must branch on `typeof ev.data`. Compression (`permessage-deflate`) is a server/extension concern; do not JSON-stringify ArrayBuffers.

**Follow-up:** Can you JSON.parse a binary frame? — No. Decode first or do not use JSON.

**Common mistake:** `JSON.parse(ev.data as string)` on a Blob and wondering why you get `"[object Blob]"`.

---

### Q20. Can the browser WebSocket constructor set custom headers?

**Short definition:** No. The browser owns the handshake headers.

**Answer:** You cannot pass `Authorization: Bearer`. Cookies for the `wss` origin are sent automatically (SameSite rules apply). Optional protocols go in the second argument (`new WebSocket(url, ["chat", "v1"])`) and become `Sec-WebSocket-Protocol`. That limitation is why this repo puts the JWT on the query string and why SSE has the same header problem (Q51). Node `ws` clients *can* set headers — do not confuse server-side clients with the browser API.

**Follow-up:** Does `credentials: "include"` exist on WebSocket? — Not as a `fetch` option. Cookies are automatic for that origin.

**Common mistake:** Showing `new WebSocket(url, { headers: { Authorization } })` in an interview. That API does not exist in browsers.

---

## Production connections

### Q21. Why reconnect at all, and what goes wrong if you reconnect immediately?

**Short definition:** Sockets die. Instant reconnect from every tab is a thundering herd on a restarting process.

**Answer:** Deploys, laptop sleep, 1006 idle cuts, and server crashes all close the pipe. Users expect the dashboard to come back. If one thousand clients hit `new WebSocket` in the same millisecond, you knock the process over again. You need delay, a cap, and preferably jitter (Q22–Q23). You also need a rule for *when not* to reconnect: logout, unmount, auth-rejected close codes.

**Follow-up:** Should the server also retry outbound? — The server should not “reconnect” to the browser; the client owns the session. The server republishes when the client is back.

**Common mistake:** `onclose = () => connect()` with zero delay.

---

### Q22. What is exponential backoff in a WebSocket client? [must-know]

**Short definition:** Double the wait after each failed close, reset on successful `open`, cap so you do not wait minutes.

**Answer:** `useWebSocket2.ts` starts `retryDelayRef` at **1000 ms**, and on each `onclose` does `Math.min(delay * 2, 30000)` after capturing the current delay for `setTimeout`. Sequence: 1s, 2s, 4s, 8s, 16s, 30s, 30s. `onopen` and effect cleanup reset to 1000 so a healthy connection or a room change does not inherit a 30s wait. Store the timer id and `clearTimeout` on unmount or you leak a ghost `connect`.

```ts
const delay = retryDelayRef.current;
retryDelayRef.current = Math.min(delay * 2, 30_000);
reconnectTimerRef.current = window.setTimeout(connect, delay);
```

**Follow-up:** Why capture `delay` before doubling? — So the wait you schedule is the wait you just used, not the next tier.

**Common mistake:** Doubling before scheduling, so the first retry is already 2s and you never see 1s.

---

### Q23. Why add jitter to backoff?

**Short definition:** Randomize the delay so clients that died together do not retry on the same clock edge.

**Answer:** After a deploy, every tab’s `onclose` fires together. Pure exponential backoff keeps them synchronized: all at 1s, all at 2s. Multiply by `0.5 + Math.random()` (or full jitter) so the spike becomes a ramp. This repo’s hook does **not** add jitter — call that out as an improvement, not as if the file already has it.

```ts
const jittered = Math.floor(delay * (0.5 + Math.random()));
```

**Follow-up:** Full jitter vs equal jitter? — Full jitter picks uniformly in `[0, cap]`; equal jitter adds a random slice on top of the exponential base. Either beats zero jitter.

**Common mistake:** Claiming your hook “already has jitter” because the delay doubles.

---

### Q24. Why is putting a JWT on the WebSocket query string risky?

**Short definition:** Tokens leak into access logs, proxies, browser history, and sometimes `Referer`.

**Answer:** `useWebSocket2` builds `wss://${API_URL}/ws/${url}/?token=${token}`. It is simple and matches many Django / Node tutorials. It is also the leaky option. Prefer an `httpOnly` cookie on a shared site, a short-lived **WS ticket** minted by a Route Handler, or first-message `{ type: "auth" }` if you accept a brief unauthenticated socket that the server must timeout. If you keep query tokens, redact logs and keep TTL short.

**Follow-up:** Why does this repo still use query tokens? — Browser `WebSocket` cannot set `Authorization`; cookie sharing with the API host may not exist; the hook is honest about that constraint.

**Common mistake:** Pasting the same long-lived access token into the query string and into `localStorage` without rotation.

---

### Q25. Query vs `Sec-WebSocket-Protocol` vs cookie vs first-message auth?

**Short definition:** Four ways to get credentials through a handshake the browser will not let you customize.

**Answer:** **Query** — this repo; easy; logs. **Subprotocol** — `new WebSocket(url, ["bearer", token])`; server must echo a protocol; charset is limited; some proxies strip it. **Cookie** — best first-party design; SameSite + CSRF story for any cookie-authenticated HTTP. **First message** — connect, then AUTH; avoid logs; server must disconnect if AUTH never arrives. Logout must close with 1000 and set `token` to `null` so the hook’s idle branch runs.

**Follow-up:** Can Node server-side clients send `Authorization`? — Yes. Do not mix that up with the browser constructor.

**Common mistake:** “We will just pass headers like axios.”

---

### Q26. What do you do on reconnect besides `new WebSocket`? [must-know]

**Short definition:** Resubscribe every channel and request a snapshot since `lastSeq`. A new socket is a blank session.

**Answer:** Rooms, `subscribe` frames, and presence you sent on the first `open` are gone. Keep desired subscriptions in a `Set` (or the Context registry in Q41) and replay them in `onopen`. Then send `{ type: "sync", since }` so you heal the gap. `status === "open"` with a silent UI is almost always a missed resubscribe. If the URL path already *is* the room (`/ws/dashboard/`), you may only need sync — still say the general rule.

**Follow-up:** Should subscribe be idempotent on the server? — Yes. StrictMode and retries will double-join.

**Common mistake:** Subscribing once in the component body and assuming reconnect inherits it.

---

### Q27. How do you queue outbound messages while the socket is down?

**Short definition:** Buffer sends until `OPEN`, flush on `onopen`, and pick a drop policy so the queue cannot grow forever.

**Answer:** UI clicks do not wait for the handshake. If you throw, buttons flake during backoff. If you drop silently, users think the click worked. Cap the queue (for example 50). Drop-oldest for cursors and “latest filter.” Reject/fail the UI for chat and payments. Tag items with `createdAt` and expire fossils. Combine with `bufferedAmount` so flush does not dump 50 frames into a saturated radio. `useWebSocket2` returns only `{ status }` — mention that adding `send` implies this queue.

**Follow-up:** Where do you store the queue? — A ref, not React state, or every enqueue re-renders.

**Common mistake:** An unbounded array of mouse moves during a 10-minute outage.

---

### Q28. How do sequence numbers and dedupe work on a socket?

**Short definition:** Every event gets a server id and/or monotonic `seq`. Ignore ids you have already applied. WebSocket is not exactly-once.

**Answer:** Reconnect + replay + at-least-once brokers duplicate frames. A `Set` of recent ids plus `if (msg.seq <= lastSeq) return` keeps chat bubbles and counters honest. Idempotent reducers (“set slot X booked”) are even better. Persist `lastSeq` in memory, or `sessionStorage` if you must survive reload. Never use `Date.now()` as an id.

```ts
if (seen.has(msg.id) || msg.seq <= lastSeq) return;
seen.add(msg.id);
lastSeq = Math.max(lastSeq, msg.seq);
```

**Follow-up:** At-least-once vs exactly-once? — Sockets give you at-most-once per connection and at-least-once once you add retry/replay. Exactly-once is an application property (idempotency keys), not a transport guarantee.

**Common mistake:** “TCP is reliable so I cannot get duplicates.” Reliability is not uniqueness across reconnects.

---

### Q29. How do `online` / `offline` interact with a WebSocket?

**Short definition:** The browser’s network signals fire when the UA thinks connectivity changed — often before `onclose`.

**Answer:** A socket can sit `OPEN` after wifi dies until a send or ping fails. On `offline`, close yourself to skip the heartbeat wait. On `online`, reset backoff to 1s and `connect()` if you still have a token and are not already open. `useWebSocket2` does **not** listen to these events; it waits for `onclose`. Call that a gap, then describe adding the listeners.

**Follow-up:** Is `navigator.onLine` trustworthy? — It is a hint. False positives exist (captive portals). Still useful to trigger an immediate retry.

**Common mistake:** Opening a new socket on every `online` without checking `readyState`.

---

### Q30. How do `visibilitychange`, `pagehide`, and `beforeunload` affect sockets?

**Short definition:** Tab hide, freeze, refresh, and mobile backgrounding are separate from `onclose`. Close cleanly and reconnect when the user returns.

**Answer:** Hidden tabs freeze timers — a 30s backoff scheduled before lock may fire hours later; reset delay on `visible`. `beforeunload` is flaky on Safari/iOS; **`pagehide`** fires when the page is frozen or discarded. `useWebSocket2` registers both and `close(1000, "Tab closed or refreshed")` so the server does not wait for 1006. Do not reconnect on every `visibilitychange` if you are already `OPEN`.

**Follow-up:** Does App Router client navigation fire `beforeunload`? — Usually not. Effect cleanup (`Component unmounted`) is what closes the socket on route change.

**Common mistake:** Only listening to `beforeunload` and wondering why iOS leaves ghost sessions.

---

### Q31. Why must logout cancel reconnect? [must-know]

**Short definition:** A closed socket with a timer still running will come back with a revoked JWT.

**Answer:** `useWebSocket2` has three layers. The effect re-runs with `token === null`, closes with `"Token missing - closing"`, and sets `status` to `"idle"`. `onclose` returns immediately if `!token`. Cleanup `clearTimeout`s `reconnectTimerRef` and sets `isMountedRef` false so a stale `onclose` cannot schedule `connect`. Skip any one of those and you get a zombie session after logout.

**Follow-up:** What if the token expires while the socket stays open? — Close on expiry (jwt-decode timer) or handle a server 4001 and set token to null. TimeLens-style hooks pair WS with JWT lifecycle.

**Common mistake:** `localStorage.clear()` without going through the hook’s `token` prop.

---

### Q32. What delivery guarantees does a WebSocket give you?

**Short definition:** In-order, reliable bytes *on one connection*. Not exactly-once, not durable across reconnect, not a message bus.

**Answer:** TCP/WebSocket will not reorder frames on a live socket and will retransmit lost packets. The moment you reconnect, you have a new stream. Missed events stay missed unless you `sync` / `since`. Retries produce duplicates unless you dedupe (Q28). If you need durable pub/sub, that is Redis/Kafka on the server plus this pipe to the browser — not a property of `new WebSocket`.

**Follow-up:** Does `wasClean` mean the last message was processed? — No. It means both sides sent a close frame.

**Common mistake:** “We use WebSockets so we have exactly-once delivery.”

---

## React hooks

### Q33. How would you design a `useWebSocket` hook? [must-know]

**Short definition:** A client effect that owns one `WebSocket`, refs for the instance and timers, React state only for `status`, and a JSON `onMessage` callback.

**Answer:** I would match this repo: `"use client"`, args `(url, token, onMessage)`, `wsRef`, `retryDelayRef`, `reconnectTimerRef`, `isMountedRef`, and `status: idle | connecting | open | closed`. Effect depends on `[url, token]`. No token → close and idle. Token → `wss://${API_URL}/ws/${url}/?token=…`, assign the four events, reconnect from `onclose`. Return `{ status }` (and later a stable `send` via ref). I would add `onMessageRef` so the callback can change without reconnecting (Q38).

**Follow-up:** Why not store the socket in `useState`? — Every frame would be tempted to re-render; the instance is an imperative handle.

**Common mistake:** Creating `new WebSocket` during render.

---

### Q34. How does this repo pass the JWT into the socket?

**Short definition:** Query string on the `wss` URL; `null` token means do not connect.

**Answer:** `const fullUrl = \`wss://${API_URL}/ws/${url}/?token=${token}\``. `API_URL` is `process.env.NEXT_PUBLIC_API_URL`. If `!token`, the hook closes any existing socket with `1000` and `"Token missing - closing"` and returns without `connect()`. That ties the socket lifetime to the auth lifetime: login opens, logout closes. I would mention the log-leak tradeoff (Q24) in the same breath.

**Follow-up:** What if `NEXT_PUBLIC_API_URL` is undefined? — You open `wss://undefined/ws/...`. Fail fast in dev.

**Common mistake:** Reading the token from `localStorage` inside the hook so React cannot tear down on logout.

---

### Q35. Explain the 1s → 30s backoff in `useWebSocket2.ts`. [must-know]

**Short definition:** On `onclose`, wait the current delay, double it up to 30s, reset to 1s on `open` and on cleanup.

**Answer:** `retryDelayRef` starts at 1000. `onclose` (after mount and token checks) schedules `connect` with that value, then `retryDelayRef.current = Math.min(delay * 2, 30000)`. A successful `onopen` sets status `"open"` and resets the ref to 1000. Cleanup also resets to 1000 so a remount does not start at 30s. There is no jitter. Reconnect is skipped when `!token` or `!isMountedRef.current`.

**Follow-up:** Why is the timer a `number | null` ref? — `window.setTimeout` returns a number in the browser; you must `clearTimeout` it on unmount.

**Common mistake:** Using `setInterval` for backoff. Interval stacks badly; timeout-per-attempt is the hook’s model.

---

### Q36. Why does the hook listen to both `beforeunload` and `pagehide`?

**Short definition:** Tab close / refresh / mobile freeze do not always run effect cleanup or `beforeunload`. `pagehide` fills the gap. Close with 1000.

**Answer:** A dedicated `useEffect` with `[]` adds both listeners. The handler `close(1000, "Tab closed or refreshed")` and nulls `wsRef`. Desktop refresh often hits `beforeunload`. iOS Safari and page discard more reliably hit `pagehide`. Without this, the server keeps a dead session until ping timeout and presence counts lie. Route changes in the App Router still rely on the *other* cleanup (`Component unmounted`), because client navigations often skip `beforeunload`.

**Follow-up:** Why 1000 instead of letting the browser send 1006? — So the server can distinguish “user left” from “network blip, please wait.”

**Common mistake:** Registering those listeners inside the connect effect without removing them, and leaking handlers per token change.

---

### Q37. What is `isMountedRef` for? [must-know]

**Short definition:** A ref that is `true` only while the hook’s connect effect is alive. Every socket handler bails if it is `false`.

**Answer:** Cleanup sets `isMountedRef.current = false` before `close` and `clearTimeout`. The next effect run sets it `true` at the top. `onopen` / `onmessage` / `onclose` all start with `if (!isMountedRef.current) return`. That prevents `setStatus` on an unmounted component and prevents a stale `onclose` from scheduling reconnect after logout or StrictMode teardown. It is the same idea as an `AbortController` for sockets.

**Follow-up:** Why not a local `let cancelled = false`? — You can, but it must live in the effect closure; a ref is the same cancelled flag that also works in the tab-close handler.

**Common mistake:** Setting `isMountedRef = false` and never setting it `true` on remount — the remount never connects.

---

### Q38. Why is `onMessage` missing from the effect dependency array?

**Short definition:** An inline callback changes every render. If it were a dep, the socket would reconnect on every parent render. Omitting it freezes the first callback — a stale closure — unless you add a ref.

**Answer:** The hook lists `[url, token]` only. That is the correct *reconnect* identity. The callback used inside `ws.onmessage` is whatever existed when that effect last ran. A parent `useWebSocket(url, token, (msg) => setX(msg))` creates a new function every time. The repo calls that first function forever. The fix is `onMessageRef.current = onMessage` during render and `onMessageRef.current(parsed)` in the handler — latest function, stable socket. Exhaustive-deps will complain; keep the ref, do not add the dep.

**Follow-up:** Are `url` and `token` enough? — Yes for this hook. Room or JWT change *should* reconnect.

**Common mistake:** Adding `onMessage` to satisfy the linter and shipping a reconnect storm.

---

### Q39. How does React StrictMode break a naive WebSocket effect?

**Short definition:** Dev StrictMode mount → cleanup → mount. Without cleanup + `isMountedRef`, you get two sockets or a reconnect from the dead one.

**Answer:** The first mount opens a socket. StrictMode immediately runs cleanup: this hook sets `isMountedRef` false, clears the timer, closes with `"Component unmounted"`. Remount sets the ref true and opens a second socket. That is what you want in production on route changes too. A naive effect that only `new WebSocket`s and never closes leaks the first connection. A naive `onclose → connect` without the mount check reconnects the *old* socket after cleanup, so you end up with two live connections in DevTools.

**Follow-up:** Should you disable StrictMode to “fix” sockets? — No. Fix cleanup.

**Common mistake:** Skipping `close` in cleanup “because StrictMode was opening twice.”

---

### Q40. Why share one socket through React Context?

**Short definition:** One hook call per widget is one TCP connection per widget. A provider owns the socket; children subscribe to event types.

**Answer:** Twelve dashboard cards each calling `useWebSocket("dashboard", token, …)` means twelve handshakes, twelve backoffs, twelve server sessions. Lift the hook to a client layout provider. The provider’s `onMessage` fans out through a registry (Q41). Widgets call `useSocketEvent("presence", handler)`. Put the provider above App Router page navigations that should keep the pipe, or you will tear it down every route.

**Follow-up:** Can two features use two sockets on purpose? — Yes: a chat namespace and a notifications stream. Share *within* a feature, not globally at all costs.

**Common mistake:** Instantiating the hook in every card “for isolation.”

---

### Q41. What is a subscription registry on the client?

**Short definition:** `Map<eventType, Set<handler>>` plus unsubscribe. The socket stays one; listeners come and go.

**Answer:** On message, look up `msg.type` and invoke that set, plus an optional `"*"` tap. `subscribe` returns a function that `Set.delete`s the handler — call it in `useEffect` cleanup or you set state on unmounted cards. Keep the latest handler in a ref (same stale-closure fix as Q38). Server-side rooms (socket.io) are the analog; the client registry is how React components attach to one pipe. Desired *server* subscriptions still live in one `Set` replayed on `open` (Q26).

**Follow-up:** Registry vs Redux? — The registry is transport. Put resulting domain state in whatever store you already use.

**Common mistake:** An array of handlers you never remove.

---

### Q42. What do `idle`, `connecting`, `open`, and `closed` mean in this hook?

**Short definition:** UI-facing status: not trying, handshake in flight, live, and down-but-may-retry.

**Answer:** **`idle`** — no token, or cleanup ran; we will not reconnect. **`connecting`** — `new WebSocket` just ran (`readyState` 0). **`open`** — `onopen` fired; delay reset to 1s. **`closed`** — `onclose` fired; a timer may be counting toward the next `connect` if token still exists. The UI can show a banner on `closed`/`connecting` and hide it on `open`. Do not treat `closed` as “logged out”; that is `idle`.

**Follow-up:** Why not bind the UI to `readyState`? — After `wsRef = null` there is no instance; React state still has a last known status.

**Common mistake:** Showing a logout screen on `closed` during a 2s backoff.

---

### Q43. What belongs in the connect effect’s cleanup?

**Short definition:** Mark unmounted, clear the reconnect timer, close the socket with 1000, null the ref, set idle, reset backoff.

**Answer:** Copy the repo: `isMountedRef.current = false`; `clearTimeout(reconnectTimerRef)` and null it; `wsRef.current.close(1000, "Component unmounted")` in a try/catch; `wsRef.current = null`; `setStatus("idle")`; `retryDelayRef.current = 1000`. That is the whole teardown. Forgetting the timer is the bug that reconnects after navigate-away. Forgetting `close` is the StrictMode double-socket. The tab-close effect is separate and only removes its own listeners.

**Follow-up:** Why try/catch around `close`? — A socket already CLOSING/CLOSED can throw in some engines; the repo swallows it.

**Common mistake:** Cleanup that only sets a cancelled flag and never `close()`s.

---

## socket.io-client

### Q44. What does `socket.io-client` add over native WebSocket?

**Short definition:** Engine.IO transport (polling then WS), automatic reconnect, rooms, namespaces, acks, and a named-event API — at the cost of protocol and bundle weight.

**Answer:** You `io(url)` and `emit` / `on` event names instead of JSON.parse yourself. Underneath, Engine.IO often starts on HTTP long-polling and upgrades to WebSocket. Heartbeats exist. Reconnect is built in. You still must re-join rooms on `connect` and still cannot host this on a frozen serverless isolate. It is a product on top of WS, not a prettier `WebSocket` constructor.

**Follow-up:** Can you force WebSocket-only? — `transports: ["websocket"]`. You lose the fallback the library is famous for.

**Common mistake:** `import { io } from "socket.io-client"` in a Server Component.

---

### Q45. What are socket.io fallback transports?

**Short definition:** If the WebSocket upgrade fails, Engine.IO stays on HTTP long-polling with the same session id.

**Answer:** Default dance: poll `/socket.io/?EIO=4&transport=polling`, get `sid`, then try `transport=websocket`. Hostile proxies that strip `Upgrade` keep working. You will see both request types in Network. Native `useWebSocket2` has no equivalent — it backs off against the same `wss` URL forever. That is the main ops reason to pick socket.io for enterprise browsers.

**Follow-up:** How do you debug a stuck poll? — Filter `socket.io` in Network. If you never see a WS line, the upgrade is failing — fix the proxy.

**Common mistake:** Assuming socket.io “is WebSocket” and then being surprised by polling QPS.

---

### Q46. What is the difference between rooms and namespaces?

**Short definition:** Namespaces are separate socket.io apps on one engine (`/chat` vs `/admin`). Rooms are sets of sockets inside a namespace used for fan-out.

**Answer:** `io("/admin")` can have different auth middleware and event names. `socket.join("shift:42")` is a room — `io.to("shift:42").emit(...)` reaches members. One socket can join many rooms. Rooms are in-memory per Node process unless you add the Redis adapter (Q54). Clients cannot magically join without the server agreeing — authorize `join` from the JWT, do not trust the room name.

**Follow-up:** Are rooms available on the browser as a first-class API? — The client emits a join event you define; the server calls `socket.join`.

**Common mistake:** Using a new namespace per chat room. That is a process/middleware split, not a multicast group.

---

### Q47. What are socket.io acknowledgements?

**Short definition:** A callback the receiver invokes so the sender knows the event was handled, optionally with `.timeout()`.

**Answer:** `socket.emit("chat:send", payload, (res) => markDelivered(res.id))`. The server calls that ack with a result. `socket.timeout(5000).emit(...)` turns a hung handler into an error. Use acks for user-critical sends. Do not ack 30 Hz cursors — use fire-and-forget plus `bufferedAmount`/drop-latest. On a raw WebSocket you invent `{ id, type: "ack" }` yourself (Q28).

**Follow-up:** Does an ack mean the other *clients* received the broadcast? — No. It means this server handler ran (and maybe persisted). Fan-out can still fail.

**Common mistake:** Treating ack as end-to-end delivery to every tab.

---

### Q48. How do reconnect and auth work in socket.io-client?

**Short definition:** Built-in reconnection with configurable delay/max; `auth` is sent on the Engine.IO handshake; re-join rooms on `connect`.

**Answer:** Options like `reconnectionDelay: 1000` and `reconnectionDelayMax: 30000` mirror this repo’s cap. `auth: { token }` is the supported place for a JWT (not a custom browser header). `connect_error` with unauthorized should `disconnect()` so you do not retry forever with a bad token — same rule as `if (!token) return`. Rooms do **not** automatically come back; on `connect` / `reconnect` emit `join` again. Do not wrap socket.io in `useWebSocket2` or you double-retry.

**Follow-up:** `withCredentials: true`? — Sends cookies on the handshake for first-party cookie auth.

**Common mistake:** Logging in via `auth` once and never handling token refresh.

---

### Q49. When would you skip socket.io and keep native WebSocket?

**Short definition:** When you control the protocol, need a tiny client, and do not need fallbacks or rooms.

**Answer:** TimeLens-style apps: JSON frames, modern browsers, existing Channels/Node `ws` server, one path per dashboard. You already wrote backoff, token gate, and cleanup. Adding socket.io would duplicate reconnect and add bundle weight. Skip it also on a marketing page that only needs SSE. Choose socket.io when proxies block WS, when the server is already IO, or when rooms/acks would take a week to invent poorly.

| Use native          | Use socket.io        |
| ------------------- | -------------------- |
| You own the frames  | Need poll fallback   |
| Tiny client         | Rooms / acks / nsp   |
| One modern audience | Hostile networks     |

**Follow-up:** Can you mix both to the same feature? — Do not. One pipe per stream.

**Common mistake:** Adding socket.io “just in case” on top of a working native hook.

---

## Server-Sent Events

### Q50. How does `EventSource` reconnect with `Last-Event-ID`? [must-know]

**Short definition:** The browser auto-reconnects and sends the last `id:` field it saw as the `Last-Event-ID` header so the server can resume.

**Answer:** The stream uses `id:`, `event:`, `data:`, and optional `retry:` (ms). If you omit `id:`, resume cannot work and a blip replays from “now” or from the start. `source.close()` stops reconnect — do that on unmount and on a terminal `done` event. `readyState` is 0 CONNECTING, 1 OPEN, 2 CLOSED. You do not write the 1s–30s ladder yourself; you still must close on unmount or the stream continues in the background.

**Follow-up:** Who sets `retry:`? — The server. It hints the browser’s reconnect delay.

**Common mistake:** Forgetting `source.close()` in `useEffect` cleanup.

---

### Q51. Why can’t `EventSource` send `Authorization`, and what is the fetch-stream workaround?

**Short definition:** The constructor only takes a URL (and an optional `withCredentials` flag in some environments). For bearer APIs, `fetch` the `text/event-stream` and parse it yourself.

**Answer:** Same browser limitation as WebSocket headers. Happy path: cookies on the same site and native `EventSource`. Workaround: `fetch(url, { headers: { Authorization, Last-Event-ID } })`, read `response.body` with `TextDecoder`, split on `\n\n`, keep `lastId`, loop on drop. Use `AbortController` in effect cleanup the way `isMountedRef` guards the WS hook. Do not try to hold that stream inside a Server Component’s request lifetime.

**Follow-up:** Query-string token on SSE? — Works, same leak as `useWebSocket2`’s `?token=`.

**Common mistake:** `new EventSource(url, { headers: { Authorization } })` — not a standard browser API.

---

## Next.js

### Q52. Why can’t the App Router hold long-lived sockets? [must-know]

**Short definition:** RSC, Route Handlers, and Server Actions are request/response. Serverless freezes the isolate after the response. A WebSocket needs a process that stays up.

**Answer:** `useWebSocket2` runs in the **browser** and connects to `NEXT_PUBLIC_API_URL`, not to `app/api/ws/route.ts` on Vercel. A Route Handler can upgrade only on a Node server that supports it. On default serverless the function is gone — there is no place to store `Set<WebSocket>`. Architecture: Next.js owns pages and a Client Component hook; a dedicated WS process (Django Channels, Node `ws`, socket.io, or a managed service) owns 101. Optionally mint a short-lived WS ticket from a Route Handler so the query string is not the long-lived access token.

**Follow-up:** Can an Edge Route Handler stream SSE? — Short streams yes, within duration limits. It is still not a general socket host.

**Common mistake:** “I’ll put the WebSocket server in a Server Component.”

---

### Q53. What do serverless, edge, and proxy idle timeouts do to sockets?

**Short definition:** They kill quiet or long-lived connections. You will see 1006 unless you ping and raise timeouts on the WS path.

**Answer:** Function max duration ends the isolate. Edge workers are not a TCP lounge. nginx `proxy_read_timeout`, AWS ALB idle (~60s default), and CDN proxies close idle TCP. Fix: dedicated VM/container or a realtime platform; `pingInterval` under the idle budget; raise timeouts **only** on the upgrade path so ordinary HTTP still recycles. Health-check the WS port separately from Next.js HTTP — a green frontend deploy can hide a dead Channels worker.

**Follow-up:** Why not raise the ALB idle timeout to 10 minutes globally? — Hung HTTP requests pile up. Scope it to the WS target group.

**Common mistake:** Blaming React cleanup for disconnects that happen at exactly 60s in a quiet tab.

---

### Q54. What are sticky sessions and the Redis adapter?

**Short definition:** Stickiness pins a client to one instance so the Engine.IO handshake survives. Redis pub/sub fans events out so rooms work across processes.

**Answer:** socket.io polling + upgrade must hit the same node (`sid`). A load balancer cookie or IP hash provides that. In-memory `socket.join` is local — instance B cannot emit to sockets on A. `@socket.io/redis-adapter` publishes to every node; each writes to its local sockets. Native WS needs the same pattern: Redis (or NATS) plus a local `Set`. Without Redis, “works on one dyno.” Without stickiness, upgrades 400. This is why “we will run socket.io on 12 serverless instances” is a trap.

**Follow-up:** Do you need both? — Stickiness for the handshake/session; Redis for broadcast. Managed realtime products hide both.

**Common mistake:** Horizontal scale by “just adding instances” with rooms in a process `Map`.

---

## Testing

### Q55. How do you test a WebSocket client? [must-know]

**Short definition:** Fake `WebSocket` or `mock-socket` in unit tests, DevTools frames for manual, `wscat` for the server, fake timers for backoff.

**Answer:** Replace `globalThis.WebSocket` with a class that records instances and lets the test fire `onopen` / `onmessage` / `onclose`. `renderHook(() => useWebSocket("agents", "jwt", onMessage))`, `act` an open, assert `status === "open"`, push a JSON string, assert `onMessage`. `jest.useFakeTimers()` + `advanceTimersByTime(1000)` asserts the first reconnect constructs a second fake. On unmount, assert `close` was called with `1000` and `"Component unmounted"`. After `token: null`, advancing 60s must not construct another socket. DevTools → Network → WS → Messages verifies resubscribe and StrictMode doubles. `npx wscat -c "wss://host/ws/...?token=…"` proves the server without React. Do not require staging to test the hook.

```ts
act(() => {
  ws.onclose?.({ code: 1006, reason: "" });
});
act(() => {
  jest.advanceTimersByTime(1_000);
});
expect(FakeWebSocket.instances).toHaveLength(2);
```

**Follow-up:** MSW and WebSockets? — Newer MSW can intercept WS; still pair with a fake for hook unit tests.

**Common mistake:** `sleep(30000)` in CI to test the cap, or hitting a real `wss` from Jest.
