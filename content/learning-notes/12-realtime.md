# Realtime Learning Notes

A progressive, hands-on guide to realtime in the browser — from transport choice through native WebSocket, production reconnect, a React hook that matches this repo’s `useWebSocket2.ts`, socket.io-client, SSE, Next.js deployment, and testing. Each lesson builds on the last. Read the takeaway first, study the explanation and code, then try the exercise in a small Vite + React + TS project or a Next.js Client Component.

This track assumes you already know `fetch`, React hooks, and that Next.js Server Components cannot keep a TCP socket open. The React lessons copy the patterns in `src/hooks/useWebSocket2.ts`: JWT on the query string, exponential backoff capped at 30s, `beforeunload` / `pagehide`, and `isMountedRef`.

---

## Transport choice

### Lesson 1. HTTP polling: cheap to start, expensive to scale

**Takeaway:** Polling is a timer that asks “anything new?” over normal HTTP. It is the simplest realtime *illusion* and the worst default once many clients or low latency matter.

**Explain:** Request-response HTTP has no way for the server to speak first. Polling fakes push: the client calls an endpoint on an interval, the server returns the latest snapshot or an empty “no change” body, and the UI replaces state. React Query’s `refetchInterval` is polling with a cache. It works for job status, unread counts, and dashboards that can be 10–30 seconds stale.

```ts
async function pollInbox(userId: string) {
  const res = await fetch(`/api/inbox?userId=${userId}`);
  if (!res.ok) throw new Error(`poll failed: ${res.status}`);
  return res.json() as Promise<{ unread: number; latestId: string | null }>;
}

const timer = window.setInterval(() => {
  void pollInbox("u_1").then((data) => {
    renderBadge(data.unread);
  });
}, 5_000);

// Always clear — a leaked interval is a leaked request storm
window.addEventListener("pagehide", () => clearInterval(timer));
```

The cost is multiplicative. One thousand tabs polling every 5s is 200 requests/second even when nothing changed. You also pay HTTP header overhead, TLS, and origin connection limits. Missed updates sit in the gap between ticks; two updates in one window collapse into one snapshot unless you return a log, not just the latest row.

Use polling when updates are rare, payloads are small, and you already have REST. Do not use it for chat, live cursors, or trading ticks.

**Tip:** If you poll, poll a cheap “has anything changed?” endpoint (`ETag` / `If-None-Match` or a `since` cursor) instead of refetching a huge dashboard every tick.

**Try it:** Build a badge that polls `/api/unread` every 3s. Open DevTools Network, count requests for one minute, then double the interval and compare. Note how many responses were identical.

---

### Lesson 2. Long-polling: hold the request until something happens

**Takeaway:** Long-polling keeps one HTTP request open until the server has an event or a timeout fires. It cuts empty traffic versus short polling, but it is still request-response wearing a costume.

**Explain:** The client opens `GET /events?since=42` and the server *does not answer* until event 43 exists or ~25s elapse (under typical proxy idle limits). The client immediately opens the next request. That hang-and-replace loop is how many chat systems worked before WebSockets were universal.

```ts
async function longPoll(since: number): Promise<void> {
  const res = await fetch(`/api/events?since=${since}`, {
    signal: AbortSignal.timeout(30_000),
  });

  if (res.status === 204 || res.status === 408) {
    return longPoll(since); // timeout with no data — hang again
  }

  const batch = (await res.json()) as { id: number; type: string; payload: unknown }[];
  for (const event of batch) applyEvent(event);
  const next = batch.at(-1)?.id ?? since;
  return longPoll(next);
}

void longPoll(0).catch((err) => {
  if (err.name !== "AbortError") console.error(err);
});
```

Compared with short polling you waste fewer empty 200s. Compared with WebSocket you still pay a new HTTP handshake (or at least a new request) per event batch, you cannot easily push *from the client* on the same pipe, and intermediaries may still cut the hung request. You also must serialize events so a timeout retry does not skip or double-apply work — the `since` cursor is the whole protocol.

Long-polling is a fallback, not a destination: socket.io still uses it when a WebSocket upgrade fails (Lesson 23).

**Tip:** Cap server hold time below your load balancer’s idle timeout (often 30–60s). Returning 204 just before the proxy kills the socket is cleaner than a surprise 502.

**Try it:** Write a Node handler that `await`s a promise resolved by `setTimeout` or an EventEmitter. Point `fetch` at it. Kill the server mid-hang and confirm your client retries with the same `since`.

---

### Lesson 3. SSE vs WebSocket vs WebRTC: one-way, two-way, and peer media

**Takeaway:** **SSE** is server→client text over HTTP. **WebSocket** is a bidirectional, full-duplex TCP (or HTTP/2) pipe after an HTTP upgrade. **WebRTC** is peer-to-peer media and data channels — a different problem than “the API should push to my dashboard.”

**Explain:** Server-Sent Events (`EventSource`) look like a never-ending HTTP response with `Content-Type: text/event-stream`. The browser parses `data:` lines, reconnects for you, and resends `Last-Event-ID` (Lesson 28). That is why AI chat UIs (this repo’s GenE-style streaming) often pick SSE: the user sends a normal POST to start a job, then the model tokens flow one way.

```ts
// SSE — server speaks, client only listens
const source = new EventSource("/api/stream?job=42");
source.addEventListener("token", (ev) => {
  appendChat(ev.data);
});

// WebSocket — both sides send any time after open
const ws = new WebSocket("wss://api.example.com/ws/dashboard");
ws.addEventListener("open", () => {
  ws.send(JSON.stringify({ type: "subscribe", channel: "presence" }));
});
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data as string);
  if (msg.type === "presence") renderPresence(msg.data);
});
```

WebSocket is the default for chat, multiplayer, collaborative cursors, and live ops dashboards (this repo’s TimeLens-style hook). After the 101 upgrade, frames go both ways with little per-message overhead.

WebRTC DataChannels can also send arbitrary bytes, but you need ICE, STUN/TURN, and a signaling channel (often a WebSocket) just to connect two browsers. Use WebRTC for camera, microphone, and screen share; do not pick it as your app’s pub/sub bus.

**Tip:** “Realtime” is not one protocol. Ask: who initiates, is the stream one-way, do peers talk to each other, and must it work through corporate proxies?

**Try it:** Open two tabs. In tab A, connect a WebSocket that echoes `send`. In tab B, open an `EventSource` to a stream endpoint. Confirm only tab A can send after connect without opening a second HTTP request.

---

### Lesson 4. Transport decision table: pick the right pipe

**Takeaway:** Choose the cheapest transport that meets direction, latency, and ops constraints. Most product UIs need either React Query polling, SSE, or one shared WebSocket — not WebRTC.

**Explain:** Write the requirement as a row, not a brand name. Direction (client→server, server→client, both, peer), acceptable delay, whether you need binary frames, whether the client can set headers, and where the process lives (long-lived Node vs serverless) decide the pipe.

| Need                                         | Polling | Long-poll | SSE          | WebSocket     | WebRTC        |
| -------------------------------------------- | ------- | --------- | ------------ | ------------- | ------------- |
| Unread badge every 30s                       | Best    | Overkill  | Overkill     | Overkill      | No            |
| AI token stream, client already POSTed       | Poor    | OK        | **Best**     | Fine          | No            |
| Chat / live dashboard / subscribe+publish    | Poor    | Fallback  | Half (no up) | **Best**      | Wrong tool    |
| Camera / mic / screen                        | No      | No        | No           | Signaling only| **Best**      |
| Custom `Authorization` header from JS        | Yes     | Yes       | **No**       | Handshake only| Signaling     |
| Auto reconnect in the browser platform       | You     | You       | **Yes**      | You           | You           |
| Works when WS is blocked by a proxy          | Yes     | Yes       | Often        | Fails         | TURN helps    |
| Serverless function as the *socket host*     | Yes     | Awkward   | Awkward      | **No**        | No            |

```ts
type Transport = "poll" | "sse" | "ws" | "webrtc";

function pickTransport(need: {
  direction: "down" | "both" | "media";
  maxDelayMs: number;
  needsAuthHeader: boolean;
}): Transport {
  if (need.direction === "media") return "webrtc";
  if (need.direction === "down" && need.maxDelayMs > 2_000) {
    return need.needsAuthHeader ? "poll" : "sse";
  }
  return "ws";
}

pickTransport({ direction: "both", maxDelayMs: 200, needsAuthHeader: false }); // "ws"
```

This repo’s production split matches the table: TimeLens uses a native WebSocket hook for bidirectional workforce events; GenE uses SSE for one-way model tokens; Asset360Hub stays on REST + React Query because nothing is live enough to justify a socket.

**Tip:** If the only “realtime” is a 15s dashboard refresh, ship polling first. Adding a socket is an ops project (Lessons 30–31), not a `new WebSocket` one-liner.

**Try it:** For three features — unread count, AI chat tokens, live agent map — write one sentence each of direction + delay, then pick a cell in the table. Defend one pick you almost got wrong.

---

## Native WebSocket (no package)

### Lesson 5. The handshake: HTTP Upgrade, 101, and then it is no longer HTTP

**Takeaway:** A browser WebSocket starts as a normal HTTPS request that asks to switch protocols. If the server answers `101 Switching Protocols`, the same TCP connection becomes a WebSocket. There is no second URL family beyond `ws:` / `wss:`.

**Explain:** `new WebSocket(url)` sends a GET with `Upgrade: websocket`, `Connection: Upgrade`, a random `Sec-WebSocket-Key`, and an optional `Sec-WebSocket-Protocol` list. The server hashes the key with a RFC 6455 magic string and returns `Sec-WebSocket-Accept` plus status 101. After that, you do not send HTTP verbs on that socket. You send frames (Lesson 8).

```ts
const ws = new WebSocket("wss://api.example.com/ws/dashboard/?token=eyJ...");

// You cannot set arbitrary headers here — the browser owns the handshake.
// Cookies for the wss origin are sent automatically (same-site rules apply).

ws.addEventListener("open", () => {
  console.log("upgrade succeeded — readyState is OPEN");
});

ws.addEventListener("error", () => {
  // Handshake failures often show up as error + close 1006 with no body
  console.error("upgrade or transport failed");
});
```

`wss:` is TLS + WebSocket, the same relationship as `https:` to `http:`. Mixed content rules apply: an `https` page cannot open `ws://`. This repo builds `wss://${process.env.NEXT_PUBLIC_API_URL}/ws/${url}/?token=${token}` so the page origin and the API host can differ (cross-origin WebSocket is allowed; CORS does not apply the way `fetch` does — the server must still authenticate).

If a proxy or serverless platform answers 200 HTML instead of 101, the constructor still fires `error`/`close`. There is no response body for you to `await`.

**Tip:** Debug handshake failures in DevTools → Network → the WS line → Headers. You want status 101, not 404/401/502. A 401 on upgrade means your token never became a socket.

**Try it:** Point `new WebSocket` at a normal `https` REST URL. Observe `error` then `close` with code 1006. Then point it at a real WS echo server and confirm 101 in the Headers pane.

---

### Lesson 6. `readyState`: CONNECTING, OPEN, CLOSING, CLOSED

**Takeaway:** `WebSocket.readyState` is a number the browser updates for you. Only `OPEN` (1) may `send`. Treating “I constructed it” as “it is connected” is the first production bug.

**Explain:** The four values are constants on the constructor: `WebSocket.CONNECTING` (0), `OPEN` (1), `CLOSING` (2), `CLOSED` (3). Construction starts CONNECTING. `onopen` means OPEN. `close()` moves to CLOSING then CLOSED. A failed handshake jumps to CLOSED without a successful OPEN.

```ts
type SocketStatus = "idle" | "connecting" | "open" | "closed";

function statusFromReadyState(ws: WebSocket | null): SocketStatus {
  if (!ws) return "idle";
  switch (ws.readyState) {
    case WebSocket.CONNECTING:
      return "connecting";
    case WebSocket.OPEN:
      return "open";
    case WebSocket.CLOSING:
    case WebSocket.CLOSED:
      return "closed";
    default:
      return "closed";
  }
}

function safeSend(ws: WebSocket | null, payload: unknown) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error("socket is not OPEN");
  }
  ws.send(JSON.stringify(payload));
}
```

This repo’s hook does not read `readyState` in the UI. It mirrors it with React state: `"idle" | "connecting" | "open" | "closed"`. `idle` means “we are not trying” (no token). `connecting` is set the moment `new WebSocket` runs. `open` is set in `onopen`. `closed` is set in `onclose` before the reconnect timer. That extra `idle` is application state, not a fifth readyState.

Never `send` in the same tick you construct. Queue (Lesson 15) or send from `onopen`.

**Tip:** Log `ws.readyState` next to your React `status`. If they disagree, you have a stale `wsRef` or you called `setStatus` after unmount (Lesson 20).

**Try it:** Create a socket, `console.log` readyState immediately, in `onopen`, after `close()`, and in `onclose`. You should see 0 → 1 → 2 → 3 on a clean shutdown.

---

### Lesson 7. The four events: `open`, `message`, `error`, `close`

**Takeaway:** The browser WebSocket API is four callbacks (or `addEventListener` equivalents). Production hooks assign all four. `error` does not include a useful reason; `close` does.

**Explain:** `onopen` fires once per successful handshake. `onmessage` fires for every complete application message (`event.data` is a string, `Blob`, or `ArrayBuffer`). `onerror` fires on failures but the event is nearly empty in browsers — treat it as a log hook. `onclose` always fires when the socket dies, including after `error`, including when *you* called `close()`.

```ts
function attachNativeHandlers(ws: WebSocket) {
  ws.onopen = () => {
    console.log("open");
  };

  ws.onmessage = (ev: MessageEvent<string>) => {
    try {
      const parsed = JSON.parse(ev.data);
      console.log("message", parsed);
    } catch (err) {
      console.error("Failed to parse WS message:", err, ev.data);
    }
  };

  ws.onerror = (e) => {
    console.error("WebSocket error:", e);
  };

  ws.onclose = (event: CloseEvent) => {
    console.log("close", event.code, event.reason, event.wasClean);
  };
}
```

This is the same quartet as `useWebSocket2.ts`. The hook wraps each handler with `if (!isMountedRef.current) return` so a socket that outlives the component cannot `setState`. `onmessage` JSON-parses and forwards to `onMessage`. `onclose` is where reconnect is scheduled — not `onerror`. If you reconnect in both, you double-connect.

`CloseEvent.wasClean` is true when both sides sent a close frame. Abnormal drops (tab kill, network yank, proxy idle) are `wasClean === false` and usually code 1006.

**Tip:** Put *business* logic in `onmessage` and *lifecycle* logic in `onopen` / `onclose`. If you mix “resubscribe” into `onmessage`, you will resubscribe on every chat line.

**Try it:** Echo server: send `{ type: "ping" }` from `onopen`, log the reply in `onmessage`, then call `ws.close(1000, "done")` and record `code`, `reason`, and `wasClean`.

---

### Lesson 8. Frames and a JSON application protocol

**Takeaway:** The wire uses frames (text, binary, ping, pong, close). Your app almost always treats `event.data` as a UTF-8 JSON string with a `type` discriminator. Native WebSocket does not know your events — you invent that protocol.

**Explain:** RFC 6455 frames are not HTTP messages. Text frames become `string`. Binary frames become `Blob` by default (`ws.binaryType = "arraybuffer"` if you want bytes). Control frames (ping/pong/close) are handled by the browser; you do not see ping/pong as `message` events. Keepalive is therefore either the browser/server ping or an application `{ type: "ping" }` you send yourself (Lesson 10).

```ts
interface WSMessage {
  type?: string;
  data?: unknown;
  [key: string]: unknown;
}

function encode(msg: WSMessage): string {
  return JSON.stringify(msg);
}

function decode(raw: string): WSMessage {
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("WS payload must be an object");
  }
  return parsed as WSMessage;
}

// Application protocol — not part of the WebSocket spec
ws.send(encode({ type: "subscribe", data: { channel: "agents.shift" } }));
ws.send(encode({ type: "chat.send", data: { roomId: "r1", body: "hello" } }));
```

This repo’s hook types that envelope as `WSMessage` and blindly `JSON.parse`s. A good protocol adds `type` (required), `data` (payload), and later `seq` / `id` (Lesson 16). Version the contract (`v: 1`) if multiple clients ship. Never concatenate two JSON objects in one frame — one frame, one value.

Binary protocols (protobuf, MessagePack) belong on `binaryType = "arraybuffer"` when payload size or CPU matters. Start with JSON; switch when you measure.

**Tip:** Reject unknown `type` values in a default branch. Silent ignore hides server/client skew until a launch.

**Try it:** Define three types — `subscribe`, `event`, `error` — and a `switch (msg.type)` that exhausts them in TypeScript. Send a fourth type from the server mock and confirm you log it.

---

### Lesson 9. Close codes: 1000 is success, 1006 is “we never got a code”

**Takeaway:** `close(code, reason)` is how you tell the peer *why*. `1000` is normal. `1001` is going away (tab, server shutdown). `1006` is reserved — the browser sets it when the connection dropped with no close frame.

**Explain:** Codes 1000–1015 are spec-defined. Codes 3000–3999 are for libraries. Codes 4000–4999 are for your app. The constructor’s `close` reason string must be ≤123 UTF-8 bytes. This repo uses 1000 with human reasons: `"Tab closed or refreshed"`, `"Token missing - closing"`, `"Component unmounted"`.

```ts
ws.close(1000, "Component unmounted");

ws.onclose = (event) => {
  switch (event.code) {
    case 1000:
      console.log("normal:", event.reason);
      break;
    case 1001:
      console.log("peer going away");
      break;
    case 1008:
      console.log("policy / auth rejected");
      break;
    case 4001:
      console.log("app: token expired — do not reconnect");
      break;
    case 1006:
      console.log("abnormal — network, proxy, or failed handshake");
      break;
    default:
      console.log("other", event.code, event.reason);
  }
};
```

Use 1000 on intentional client shutdown so the server can drop the session cleanly instead of waiting for a ping timeout. Use an application code (for example 4001) when the server invalidates the JWT so the client *must not* reconnect with the same token — `useWebSocket2` approximates that by refusing to reconnect when `token` is null, not by reading the close code.

Do not call `close(1006, ...)`. The spec forbids sending 1005 or 1006. The UA synthesizes 1006 for you.

**Tip:** Log `code` + `reason` on every close in staging. A flood of 1006 at :30 past the minute is usually a load balancer idle timeout, not your React cleanup.

**Try it:** Close with `1000` and `"done"`. Then kill the tab without calling `close` and inspect the server’s received code (or DevTools on a second client). Compare 1000 vs 1006.

---

### Lesson 10. Heartbeat: protocol ping/pong vs application ping

**Takeaway:** Idle connections die. Firewalls, NATs, and load balancers forget sockets that stay quiet. A heartbeat proves liveness; missing pongs mean you should reconnect instead of waiting for a silent `close`.

**Explain:** The WebSocket spec has ping and pong *control frames*. Browsers do not expose `ws.ping()` in page JavaScript. Servers (ws, uWebSockets, Django Channels) should ping clients. If your server already pings, do not also spam application pings every second.

When you cannot control the server, send a small JSON ping and expect a pong. If no pong arrives before a deadline, call `close()` and let your reconnect path run.

```ts
function startHeartbeat(ws: WebSocket, onDead: () => void) {
  let alive = true;

  const pingTimer = window.setInterval(() => {
    if (ws.readyState !== WebSocket.OPEN) return;
    alive = false;
    ws.send(JSON.stringify({ type: "ping", t: Date.now() }));
  }, 20_000);

  const watchdog = window.setInterval(() => {
    if (ws.readyState !== WebSocket.OPEN) return;
    if (!alive) {
      ws.close(4000, "heartbeat timeout");
      onDead();
    }
  }, 40_000);

  const prev = ws.onmessage;
  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data as string) as { type?: string };
      if (msg.type === "pong" || msg.type === "ping") alive = true;
    } catch {
      /* fall through to app parser */
    }
    prev?.call(ws, ev);
  };

  return () => {
    clearInterval(pingTimer);
    clearInterval(watchdog);
  };
}
```

`useWebSocket2.ts` does **not** implement an application heartbeat. It relies on `onclose` (including proxy kills) plus backoff. That is acceptable when the server pings; add the snippet above when you see silent stalls with `readyState === OPEN` and no messages.

**Tip:** Heartbeat interval must be shorter than the shortest idle timeout in the path (nginx `proxy_read_timeout`, AWS ALB idle, corporate NAT). Measure with a quiet tab left open for an hour.

**Try it:** Connect to a local `ws` server. Disable server pings. After 60s of silence, note whether the client still thinks it is open. Add an application ping and confirm `onclose` fires when you drop pong replies.

---

### Lesson 11. `bufferedAmount`: stop sending when the pipe is backed up

**Takeaway:** `ws.send` is not “the peer has the bytes.” It means “the browser queued them.” `bufferedAmount` is how many bytes are still sitting in the client’s outbound buffer.

**Explain:** If you stream mouse moves or high-frequency ticks into a slow mobile radio, `send` succeeds while `bufferedAmount` climbs. Memory grows, latency becomes “whatever was queued,” and you still think you are realtime. The fix is to skip, coalesce, or queue-with-drop-old when the buffer is above a threshold.

```ts
const MAX_BUFFER = 64_000;

function sendMove(ws: WebSocket, point: { x: number; y: number }) {
  if (ws.readyState !== WebSocket.OPEN) return;

  if (ws.bufferedAmount > MAX_BUFFER) {
    // Drop this sample — the next rAF will send a newer point
    return;
  }

  ws.send(JSON.stringify({ type: "cursor", data: point }));
}

function onFrame(ws: WebSocket, point: { x: number; y: number }) {
  sendMove(ws, point);
}
```

`bufferedAmount` resets toward 0 as the network drains. It is not a round-trip ACK. Application-level acks (Lesson 16 / socket.io acks in Lesson 25) tell you the *server* processed a message. Use both: buffer to protect the client, seq/ack to protect the protocol.

This repo’s hook does not expose `send` — it is receive-only from the React side, which is why TimeLens can skip `bufferedAmount` until the UI starts publishing.

**Tip:** For telemetry, keep only the latest payload (`latestRef.current = point`) and send on an interval. That is cheaper than a growing queue of stale cursors.

**Try it:** In a loop, `send` 1 MB strings without waiting. Log `bufferedAmount` each iteration. Then gate on `bufferedAmount < 16_000` and compare memory in DevTools.

---

## Production connections

### Lesson 12. Reconnect with exponential backoff and jitter

**Takeaway:** Immediate reconnect after `close` thunders a downed server. Double the wait each failure, cap it, and add random jitter so clients do not share one clock.

**Explain:** `useWebSocket2.ts` starts at 1s, doubles after every `onclose`, and caps at 30s. On `onopen` it resets to 1s. That is classic exponential backoff. It does **not** add jitter — every tab that dies together will retry together.

```ts
const retryDelayRef = { current: 1_000 };

function nextDelay() {
  const delay = retryDelayRef.current;
  retryDelayRef.current = Math.min(delay * 2, 30_000);
  return delay;
}

function nextDelayWithJitter() {
  const base = nextDelay();
  const jitter = base * (0.5 + Math.random()); // 50–150% of base
  return Math.floor(jitter);
}

// useWebSocket2 onclose (no jitter):
// const delay = retryDelayRef.current;
// retryDelayRef.current = Math.min(delay * 2, 30000);
// reconnectTimerRef.current = window.setTimeout(connect, delay);
```

Sequence without jitter: 1s, 2s, 4s, 8s, 16s, 30s, 30s, … Sequence with full jitter: each client picks a different slice of that window. When a deploy restarts the WS process, jitter turns a spike into a ramp.

Never reconnect if the close was intentional (logout, unmount). The repo checks `if (!token) return` inside `onclose` and sets `isMountedRef.current = false` in cleanup so the stale socket cannot schedule `connect`.

**Tip:** Store the timer id (`reconnectTimerRef`) and `clearTimeout` on unmount. A timer that outlives the component is a ghost socket (Lesson 20).

**Try it:** Simulate `onclose` ten times in a test with fake timers (Lesson 32). Assert delays are 1, 2, 4, … 30, 30. Then add jitter and assert two clients rarely share the exact same timeout.

---

### Lesson 13. Auth: query string vs subprotocol vs cookie

**Takeaway:** The browser `WebSocket` constructor cannot set `Authorization`. Teams stuff the JWT into the query string, into `Sec-WebSocket-Protocol`, or rely on `httpOnly` cookies on the handshake. This repo uses the query string.

**Explain:** `useWebSocket2.ts` builds `wss://${API_URL}/ws/${url}/?token=${token}` and refuses to connect when `token` is null. That matches Django Channels / many Node tutorials. It is also the leaky option: tokens appear in access logs, proxies, browser history, and `Referer` on some misconfigured assets.

```ts
// 1) Query string — this repo
const fullUrl = `wss://${API_URL}/ws/${url}/?token=${token}`;
const ws = new WebSocket(fullUrl);

// 2) Subprotocol slot — second constructor argument
// Server must echo one of the protocols. Some stacks treat the first
// value as a bearer token (non-standard but common).
const wsProto = new WebSocket(`wss://${API_URL}/ws/${url}/`, [
  "bearer",
  token.replace(/\+/g, "-"), // protocols have a limited charset
]);

// 3) Cookie — best when API and page share a site
// `credentials` are automatic for wss on that registrable domain.
const wsCookie = new WebSocket(`wss://api.example.com/ws/${url}/`);
```

Cookie auth (SameSite=Lax/Strict, `__Host-` prefix, CSRF story for any cookie-authenticated POST) is the clean browser design. Query tokens are fine for first-party internal tools if logs are redacted and tokens are short-lived. Subprotocol auth is a workaround when you cannot share cookies and refuse to log query strings — test it; not every proxy forwards `Sec-WebSocket-Protocol` the way you hope.

After connect, you can still send `{ type: "auth", token }` as the first message. That avoids logs but leaves a brief unauthenticated socket — the server must timeout if auth never arrives.

**Tip:** On logout, close with 1000 and set `token` to `null` so the effect’s “no token” branch runs. Do not leave a socket open with a revoked JWT.

**Try it:** Capture your WS request in DevTools Headers. Find the token. Then try the same handshake with only a cookie and no query param against a local server. Note which one appears in the server access log.

---

### Lesson 14. Resubscribe after every reconnect

**Takeaway:** A new socket is a blank session. Channels, rooms, and cursor state you sent on the first `open` are gone. Treat `onopen` as “replay my subscriptions,” not “I am already subscribed.”

**Explain:** `useWebSocket2` connects to a path (`/ws/${url}/`) that may already imply a room. Many APIs still require an explicit `{ type: "subscribe", channel }` because one connection multiplexes many topics. After backoff reconnect, if you do not send those again, the UI looks “connected” (`status === "open"`) while remaining silent.

```ts
const subscriptionsRef = { current: new Set<string>(["agents.shift", "alerts"]) };

function connect(fullUrl: string) {
  const ws = new WebSocket(fullUrl);

  ws.onopen = () => {
    for (const channel of subscriptionsRef.current) {
      ws.send(JSON.stringify({ type: "subscribe", data: { channel } }));
    }
  };

  return ws;
}

function subscribe(ws: WebSocket | null, channel: string) {
  subscriptionsRef.current.add(channel);
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "subscribe", data: { channel } }));
  }
}
```

Keep desired subscriptions in a ref or a store, not only in “what I sent once.” The registry pattern in Lesson 21 is the React version of this set. Server-side, prefer making subscribe idempotent so a double `open` from StrictMode does not create two consumers.

**Tip:** After resubscribe, request a snapshot (`{ type: "sync", since: lastSeq }`) so you heal events missed while disconnected (Lesson 16).

**Try it:** Subscribe to two channels. Kill the server, wait for reconnect, and confirm you send two `subscribe` frames on the new socket (DevTools WS messages).

---

### Lesson 15. Outbound queue while connecting or closed

**Takeaway:** UI events do not wait for `OPEN`. Buffer outbound messages, flush on `onopen`, and cap or drop stale ones so a long outage does not replay a megabyte of “typing” events.

**Explain:** `useWebSocket2` currently returns only `{ status }` — callers do not `send`. The moment you add `send`, you need a queue. If you `throw` when not open, buttons flake during reconnect. If you silently drop, users think the click worked.

```ts
type Outbound = { type: string; data?: unknown };

const queue: Outbound[] = [];
const MAX_QUEUE = 50;

function enqueue(ws: WebSocket | null, msg: Outbound) {
  if (ws?.readyState === WebSocket.OPEN && queue.length === 0) {
    ws.send(JSON.stringify(msg));
    return;
  }
  if (queue.length >= MAX_QUEUE) queue.shift(); // drop oldest
  queue.push(msg);
}

function flush(ws: WebSocket) {
  while (queue.length && ws.readyState === WebSocket.OPEN) {
    const next = queue.shift();
    if (next) ws.send(JSON.stringify(next));
  }
}

ws.onopen = () => {
  flush(ws);
};
```

Drop-oldest is correct for cursors and “latest filter.” Drop-newest or “reject send” is correct for payments and chat — those need an error in the UI, not silent loss. Combine with `bufferedAmount` (Lesson 11) so flush does not dump 50 messages into a saturated buffer.

**Tip:** Tag queued items with `createdAt`. After 30s in the queue, fail them to the UI instead of surprising the server with a fossil.

**Try it:** Click “send” ten times while offline. Go online. Assert the server receives ten frames in order — then change the policy to keep only the latest and assert one frame.

---

### Lesson 16. Sequence numbers, dedupe, and “at least once”

**Takeaway:** Reconnect + resubscribe + a snapshot almost always delivers duplicates. Give every event an id or monotonic `seq` per stream and ignore ids you have already applied.

**Explain:** Networks and servers retry. Your client reconnects and asks `since: lastSeq`, and the server also replays the last second. Without dedupe, a chat bubble doubles and a reducer increments twice. WebSocket is a byte pipe; it does not give you exactly-once.

```ts
const seen = new Set<string>();
const SEEN_CAP = 500;
let lastSeq = 0;

function applyEvent(msg: { id: string; seq: number; type: string; data: unknown }) {
  if (seen.has(msg.id) || msg.seq <= lastSeq) return;

  seen.add(msg.id);
  lastSeq = Math.max(lastSeq, msg.seq);
  if (seen.size > SEEN_CAP) {
    const first = seen.values().next().value;
    if (first) seen.delete(first);
  }

  switch (msg.type) {
    case "chat":
      appendChat(msg.data);
      break;
    default:
      break;
  }
}

ws.onopen = () => {
  ws.send(JSON.stringify({ type: "sync", since: lastSeq }));
};
```

Idempotent handlers are even better: applying the same “set slot X to booked” twice is a no-op. Use seq for ordering (“ignore older occupancy”) and ids for exact dupes. Persist `lastSeq` in memory only unless you must survive a full page reload — then store it in `sessionStorage` keyed by user + topic.

**Tip:** Do not use `Date.now()` as an id. Two events in the same millisecond collide. Use server-generated ids.

**Try it:** Feed the same `{ id: "e1", seq: 1 }` into `applyEvent` twice and a `{ id: "e2", seq: 0 }` once. Only the first `e1` should change UI state.

---

### Lesson 17. `online` / `offline` and page visibility

**Takeaway:** `onclose` is not the only signal. The browser knows the network dropped (`offline`) and when the tab is hidden. Use those to pause heartbeats, close cleanly, and reconnect immediately when the user comes back.

**Explain:** `window.addEventListener("offline")` fires when the UA believes there is no network. Sockets often sit in OPEN until a send or ping fails — you can close yourself to skip the heartbeat timeout. `online` is the moment to reset backoff to 1s and call `connect()` if `status !== "open"` and you still have a token.

```ts
function attachNetworkHooks(connect: () => void, disconnect: () => void) {
  const onOffline = () => disconnect();
  const onOnline = () => connect();

  window.addEventListener("offline", onOffline);
  window.addEventListener("online", onOnline);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") onOnline();
  });

  return () => {
    window.removeEventListener("offline", onOffline);
    window.removeEventListener("online", onOnline);
  };
}
```

`useWebSocket2.ts` does not listen to `online`/`offline` or `visibilitychange`. It *does* listen to `beforeunload` and `pagehide` to close with 1000 (Lesson 20). That covers tab close and iOS Safari backgrounding better than `beforeunload` alone. Adding `online` is the usual next step when reconnect feels “stuck” after a laptop sleep.

Do not spin a new socket on every `visibilitychange` if you are already OPEN — check `readyState` / React `status` first.

**Tip:** Mobile browsers freeze timers in background tabs. A 30s backoff scheduled just before lock may fire hours later; reset delay on `visibilitychange` → `visible`.

**Try it:** Open a socket, toggle airplane mode, and log `offline`, `onclose`, and `online` order. Then background the tab on a phone and see whether `pagehide` fires (it often does; `beforeunload` often does not).

---

## React: `useWebSocket` like this repo

### Lesson 18. Build `useWebSocket`: token, URL, and status

**Takeaway:** This repo’s hook is a Client Component effect that opens `wss://${API_URL}/ws/${url}/?token=${token}`, parses JSON messages, and returns `{ status }`. No token means no socket.

**Explain:** `src/hooks/useWebSocket2.ts` is `"use client"`. It takes `url` (path segment), `token` (`string | null`), and `onMessage`. Refs hold the socket, the retry delay, the reconnect timer, and a mount flag. React state is only the four-way `status`.

```tsx
"use client";
import { useEffect, useRef, useState } from "react";

interface WSMessage {
  type?: string;
  data?: unknown;
  [key: string]: unknown;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useWebSocket(
  url: string,
  token: string | null,
  onMessage: (msg: WSMessage) => void,
) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "open" | "closed">("idle");
  const retryDelayRef = useRef(1000);
  const reconnectTimerRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (!token) {
      if (wsRef.current) {
        wsRef.current.close(1000, "Token missing - closing");
        wsRef.current = null;
      }
      setStatus("idle");
      return;
    }

    const fullUrl = `wss://${API_URL}/ws/${url}/?token=${token}`;

    function connect() {
      if (!token || !isMountedRef.current) return;
      setStatus("connecting");
      const ws = new WebSocket(fullUrl);
      wsRef.current = ws;
      ws.onopen = () => {
        if (!isMountedRef.current) return;
        setStatus("open");
        retryDelayRef.current = 1000;
      };
      ws.onmessage = (ev) => {
        if (!isMountedRef.current) return;
        try {
          const parsed: WSMessage = JSON.parse(ev.data);
          onMessage(parsed);
        } catch (err) {
          console.error("Failed to parse WS message:", err, ev.data);
        }
      };
      // onerror + onclose: Lessons 19–20
    }

    connect();
    return () => {
      /* Lesson 20 */
    };
  }, [url, token]);

  return { status };
}
```

The effect depends on `[url, token]` only. Changing room or JWT tears down the old socket and opens a new one. Missing `NEXT_PUBLIC_API_URL` produces a nonsense `wss://undefined/ws/...` — fail fast in dev if it is unset.

**Tip:** Keep this hook receive-oriented like the repo. Put `send` behind a ref that no-ops unless `status === "open"`, or you will fight StrictMode double-connects.

**Try it:** Mount a client page that calls `useWebSocket("dashboard", token, console.log)`. Log `status` as you pass a real token, then `null`. Confirm the socket appears and disappears in DevTools.

---

### Lesson 19. Exponential backoff capped at 30s, and do not reconnect after logout

**Takeaway:** On `close`, if a token still exists and the component is mounted, wait `retryDelayRef` (1s → 2s → … → 30s) and call `connect` again. Opening resets the delay to 1s. Logout must not schedule a retry.

**Explain:** The production behavior lives in `onclose`. Copy it exactly before you “improve” it. Capture `delay`, double-and-cap *after*, schedule with the captured value. That matches the repo and is easy to test with fake timers.

```ts
ws.onerror = (e) => {
  console.error("WebSocket error:", e);
};

ws.onclose = () => {
  if (!isMountedRef.current) return;

  setStatus("closed");
  wsRef.current = null;

  // If user logged out → do NOT reconnect
  if (!token) return;

  const delay = retryDelayRef.current;
  retryDelayRef.current = Math.min(delay * 2, 30_000);

  reconnectTimerRef.current = window.setTimeout(connect, delay);
};
```

`token` inside `onclose` is the value from the effect closure. When the user logs out, React re-runs the effect with `token === null`, cleanup closes the socket, and the new effect body hits the “Token missing” branch. The `if (!token) return` is defense in depth if `onclose` races cleanup.

Reset `retryDelayRef.current = 1000` in `onopen` *and* in the effect cleanup. Otherwise a flaky room change inherits a 30s wait.

**Tip:** Do not reconnect on `onerror` *and* `onclose`. Browsers fire both; you would stack two timers.

**Try it:** Point the hook at a port with nothing listening. Watch status flip `connecting` → `closed` → `connecting` and measure gaps: ~1s, 2s, 4s, up to 30s. Then set `token` to `null` mid-retry and confirm the timer is cleared (Lesson 20).

---

### Lesson 20. `beforeunload`, `pagehide`, and `isMountedRef`

**Takeaway:** Close the socket when the tab dies or the component unmounts. Ignore events from sockets that outlived the hook. This repo uses two window listeners plus a mount ref — not just the effect cleanup.

**Explain:** A dedicated effect (empty deps) registers `beforeunload` and `pagehide`. Both call `close(1000, "Tab closed or refreshed")` and null `wsRef`. Safari and mobile often skip `beforeunload` but fire `pagehide` when the page is frozen or discarded. Without this, the server waits for ping timeout and the user count stays wrong.

```tsx
useEffect(() => {
  function handleTabClose() {
    if (wsRef.current) {
      wsRef.current.close(1000, "Tab closed or refreshed");
      wsRef.current = null;
    }
  }

  window.addEventListener("beforeunload", handleTabClose);
  window.addEventListener("pagehide", handleTabClose);

  return () => {
    window.removeEventListener("beforeunload", handleTabClose);
    window.removeEventListener("pagehide", handleTabClose);
  };
}, []);
```

The connect effect’s cleanup is the other half: `isMountedRef.current = false`, `clearTimeout(reconnectTimerRef)`, `close(1000, "Component unmounted")`, `setStatus("idle")`, reset delay to 1000. Every handler on the socket starts with `if (!isMountedRef.current) return` so a late `onmessage` cannot `setStatus` on an unmounted tree.

`isMountedRef` starts `true`. Cleanup sets `false`. The next effect run sets `true` again at the top. That pairing is what makes StrictMode (Lesson 22) safe.

**Tip:** `setStatus` in cleanup is legal in React 18+ for this pattern but unnecessary if the component is gone. The repo still sets `"idle"` so a fast remount does not flash `"open"`.

**Try it:** Add a `console.log` in `handleTabClose` and in cleanup. Refresh the page (expect `pagehide`/`beforeunload`). Navigate away in the App Router (expect cleanup, not always `beforeunload`).

---

### Lesson 21. Shared socket via Context and a subscription registry

**Takeaway:** One hook per component means one TCP connection per mount. Dashboards with many widgets should share a single `WebSocket` and dispatch by `msg.type` / channel through a registry.

**Explain:** `useWebSocket2` is safe when one layout calls it. If twelve cards each call it with the same `url` and `token`, you open twelve upgrades, twelve backoffs, and twelve heartbeats. Lift the socket to a provider. Widgets register callbacks; the provider’s `onMessage` fans out.

```tsx
"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useWebSocket } from "@/hooks/useWebSocket2";

type Handler = (msg: { type?: string; data?: unknown }) => void;

const SocketCtx = createContext<{
  status: "idle" | "connecting" | "open" | "closed";
  subscribe: (type: string, handler: Handler) => () => void;
} | null>(null);

export function SocketProvider({
  token,
  children,
}: {
  token: string | null;
  children: ReactNode;
}) {
  const registry = useRef(new Map<string, Set<Handler>>());

  const { status } = useWebSocket("dashboard", token, (msg) => {
    const set = registry.current.get(msg.type ?? "*");
    set?.forEach((fn) => fn(msg));
    registry.current.get("*")?.forEach((fn) => fn(msg));
  });

  function subscribe(type: string, handler: Handler) {
    const set = registry.current.get(type) ?? new Set<Handler>();
    set.add(handler);
    registry.current.set(type, set);
    return () => {
      set.delete(handler);
    };
  }

  return <SocketCtx.Provider value={{ status, subscribe }}>{children}</SocketCtx.Provider>;
}

export function useSocketEvent(type: string, handler: Handler) {
  const ctx = useContext(SocketCtx);
  if (!ctx) throw new Error("useSocketEvent outside SocketProvider");

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => ctx.subscribe(type, (msg) => handlerRef.current(msg)), [ctx, type]);
  return ctx.status;
}
```

The registry is a `Map<string, Set<Handler>>` so two widgets can listen to `presence`. Unsubscribe on unmount or you leak handlers and set state on dead cards. Resubscribe-on-open (Lesson 14) still happens once, inside the provider’s hook, not per widget.

**Tip:** Put `SocketProvider` in a client layout, not in each page, or App Router navigations will tear the socket down and replay backoff.

**Try it:** Mount two children that `useSocketEvent("tick", ...)`. Confirm DevTools shows **one** WS connection. Unmount one child and confirm the other still receives ticks.

---

### Lesson 22. StrictMode, stale closures, and why `onMessage` is not a dependency

**Takeaway:** React 18 StrictMode mounts, unmounts, remounts in development. Combined with an `onMessage` that changes every render, a naive `[url, token, onMessage]` effect reconnects forever. This repo omits `onMessage` from the dependency array — which creates a stale-closure bug unless you add a ref.

**Explain:** StrictMode cleanup runs your Lesson 20 teardown (`isMountedRef = false`, `close(1000, "Component unmounted")`). The remount sets `isMountedRef = true` and connects again. That is correct. What is *incorrect* is putting an inline `onMessage` in the dependency list:

```tsx
// Parent re-renders often
useWebSocket("dashboard", token, (msg) => setTicks((n) => n + 1));
```

That callback is a new function every render. If it were a dep, you would close and reopen the socket on every tick — a reconnect storm. `useWebSocket2.ts` uses `[url, token]` only and calls `onMessage` from the closure created when `url`/`token` last changed. After that, the socket talks to the **first** callback. State setters inside it may be stale, or you may log into a dead closure.

```tsx
const onMessageRef = useRef(onMessage);
onMessageRef.current = onMessage;

ws.onmessage = (ev) => {
  if (!isMountedRef.current) return;
  try {
    onMessageRef.current(JSON.parse(ev.data));
  } catch (err) {
    console.error("Failed to parse WS message:", err, ev.data);
  }
};
```

Assign `onMessageRef.current = onMessage` during render (legal for refs). The socket always invokes the latest handler. Lesson 21’s `handlerRef` is the same pattern at the registry boundary.

Do not “fix” StrictMode by skipping cleanup. You need cleanup in production for route changes.

**Tip:** If the exhaustive-deps lint rule complains about `onMessage`, do not add it — add the ref and a comment pointing at this lesson.

**Try it:** Log a `renderId` from the parent callback without a ref, then with `onMessageRef`. Change parent state that does *not* change `url`/`token`. Only the ref version sees the new `renderId` on the next WS message.

---

## socket.io-client

### Lesson 23. Fallbacks: Engine.IO starts on HTTP, then upgrades to WebSocket

**Takeaway:** `socket.io-client` is not a thin `WebSocket` wrapper. It speaks Engine.IO: long-polling first (by default), then an upgrade to WebSocket if the handshake allows it. That is why it still works on hostile proxies.

**Explain:** On `io(url)`, the client opens an HTTP poll (`/socket.io/?EIO=4&transport=polling`), receives a session id (`sid`), then tries `transport=websocket`. If the upgrade fails, it stays on polling. You pay an extra round trip and a different URL shape than `wss://host/ws/dashboard`.

```ts
import { io, type Socket } from "socket.io-client";

const socket: Socket = io("https://api.example.com", {
  path: "/socket.io",
  transports: ["websocket", "polling"], // try WS first if you control the proxy
  auth: { token },
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("id", socket.id, "ws?", socket.io.engine.transport.name);
});
```

Native `useWebSocket2` has no fallback: a blocked upgrade is `error` + `close` + backoff against the same `wss` URL forever. If your enterprise users sit behind proxies that strip `Upgrade`, socket.io (or your own long-poll fallback) is the product decision, not a style preference.

Force `transports: ["websocket"]` only when you have proven 101 works everywhere you ship. That removes the polling machinery but also removes the safety net.

**Tip:** In Network, filter `socket.io`. You should see a poll and then a WS. If you only see polls, the upgrade is failing — fix infra before blaming React.

**Try it:** Connect with default transports and log `engine.transport.name` on `connect` and `upgrade`. Then set `transports: ["polling"]` and confirm messages still flow, slower.

---

### Lesson 24. Rooms: fan-out without inventing a registry on the server

**Takeaway:** A **room** is a server-side set of socket ids. `join`/`leave` changes membership; `to(room).emit` fans out. This is the server analog of Lesson 21’s client registry.

**Explain:** Rooms are not a client API you “subscribe” without the server’s help. The client emits `join` (or the server joins you from JWT claims). Everyone in `shift:42` receives `attendance:update`. One socket can sit in many rooms. Rooms are in-memory per Node process unless you add Redis (Lesson 31).

```ts
// Client
socket.emit("join", { room: "shift:42" });
socket.on("attendance:update", (row) => {
  upsertRow(row);
});

// Server (Node) — conceptual
io.on("connection", (socket) => {
  socket.on("join", ({ room }: { room: string }) => {
    void socket.join(room);
  });
  socket.on("attendance:ping", (row) => {
    socket.to(row.room).emit("attendance:update", row);
  });
});
```

Native WebSocket needs the same design — you just write `subscribe` frames and a `Map<room, Set<ws>>` yourself. socket.io’s rooms are why teams adopt it for chat. They are also why serverless is a poor host: rooms die when the isolate dies.

**Tip:** Authorize `join` on the server using the same JWT you used to connect. Never trust the client’s room name alone.

**Try it:** Two browser tabs, same room, one emit. Both should render the event. Leave the room in tab B and confirm silence.

---

### Lesson 25. Acknowledgements, reconnect, and namespaces

**Takeaway:** An **ack** is a callback the receiver fires so the sender knows the event was handled. **Namespaces** are separate socket.io apps on one engine (`/chat` vs `/admin`). Reconnect is built in — you still must resubscribe rooms that are not auto-joined on `connect`.

**Explain:** Native WS has no ack. You invent `{ id, type: "ack" }` (Lesson 16). socket.io lets you pass a function as the last argument to `emit`. The server calls it with a payload. Timeouts are supported so a hung ack becomes an error.

```ts
socket.emit("chat:send", { room: "r1", body: "hello" }, (res: { ok: boolean; id: string }) => {
  if (!res.ok) markFailed();
  else markDelivered(res.id);
});

socket.timeout(5_000).emit("chat:send", payload, (err: Error | null, res?: { id: string }) => {
  if (err) markFailed();
  else if (res) markDelivered(res.id);
});

const admin = io("https://api.example.com/admin", { auth: { token } });

socket.on("connect", () => {
  socket.emit("join", { room: "shift:42" }); // rooms do not survive reconnect unless you redo this
});
```

`socket.io-client` reconnects with its own backoff (`reconnectionAttempts`, `reconnectionDelayMax`). That overlaps `useWebSocket2` — do not wrap socket.io in that hook or you will double-retry. Listen to `reconnect` / `connect` to flush queues and re-join rooms. Namespaces (`io("/admin")`) are not rooms; they can have different middleware and event names.

**Tip:** Use acks for “user clicked send.” Use rooms for broadcast. Do not ack every high-frequency cursor event.

**Try it:** Emit with an ack that the server calls after 2s. Then kill the server before the ack and confirm your `timeout(1000)` path runs.

---

### Lesson 26. Auth on socket.io and what it costs in the bundle

**Takeaway:** Prefer `auth` / `extraHeaders` (Node) / cookies over copying `?token=` from the native hook. You pay for that convenience with Engine.IO + socket.io parser code in the client bundle.

**Explain:** The official client sends `auth` as a payload during the Engine.IO handshake (not as an arbitrary browser header — browsers still cannot set `Authorization` on the WS upgrade). On Node you *can* set `extraHeaders`. Cookies work like native WS.

```ts
const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
  auth: { token },
  withCredentials: true, // cookies
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1_000,
  reconnectionDelayMax: 30_000,
});

socket.on("connect_error", (err) => {
  if (err.message === "unauthorized") socket.disconnect();
});
```

Bundle: a minimal native hook is a few kilobytes of *your* code. `socket.io-client` is tens of KB gzipped depending on version and tree-shaking. For a Next.js dashboard that already ships React, that may be fine. For a marketing page that needs one notification stream, SSE or native WS is the smaller choice.

Do not import socket.io from a Server Component. Same rule as `useWebSocket2`: client only.

**Tip:** Dynamically `import("socket.io-client")` inside the provider if only one route needs it. That keeps the home page’s JS smaller.

**Try it:** Run `@next/bundle-analyzer` once with a page that imports `socket.io-client` and once with only `useWebSocket2`. Record the delta on that route.

---

### Lesson 27. Native WebSocket vs socket.io — comparison table

**Takeaway:** Use native WS (this repo) when you control the server protocol, want a tiny client, and can own reconnect. Use socket.io when you need fallbacks, rooms, acks, and a batteries-included server.

**Explain:** The two are not competitors in the RFC sense — socket.io *uses* WebSocket when it can. Compare product features:

| Concern                    | Native `useWebSocket2`                         | `socket.io-client`                          |
| -------------------------- | ---------------------------------------------- | ------------------------------------------- |
| Browser API                | `WebSocket`                                    | Engine.IO + extra protocol                  |
| Fallback if WS blocked     | None (backoff on the same `wss`)               | HTTP long-polling                           |
| Reconnect                  | You (1s → 30s, no jitter in this repo)         | Built-in, configurable                      |
| Rooms / namespaces         | DIY frames                                     | Built-in                                    |
| Acks                       | DIY `seq`                                      | `emit(..., ack)`                            |
| Auth                       | Query token in this repo                       | `auth`, cookies, headers (Node)             |
| Heartbeat                  | Server ping or DIY                             | Engine.IO ping/pong                         |
| Bundle                     | ~your hook                                     | Library weight                              |
| Next.js serverless host    | Still need a long-lived WS process             | Same — plus sticky/Redis for rooms          |
| Debug                      | DevTools WS frames are JSON you invented       | Engine.IO packets, then your events         |

```ts
function chooseClient(opts: { hostileProxies: boolean; needRooms: boolean }): "native" | "io" {
  if (opts.hostileProxies || opts.needRooms) return "io";
  return "native";
}
```

TimeLens chose native + JWT query + 30s cap because the backend already spoke a JSON protocol and the audience is employees on modern browsers. That is a valid production choice — as long as someone owns Lessons 12–17.

**Tip:** Do not run *both* clients to the same feature. Pick one pipe per stream.

**Try it:** Write a one-paragraph ADR: “We will / will not use socket.io because…” using three rows from the table that matter to your app.

---

## Server-Sent Events

### Lesson 28. `EventSource` and `Last-Event-ID`

**Takeaway:** `EventSource` is the browser’s native SSE client. It auto-reconnects and automatically sends the last `id:` it saw as `Last-Event-ID`, so the server can resume the stream.

**Explain:** The server writes `text/event-stream`: fields `id`, `event`, `data`, and optional `retry` (milliseconds). Multiple `data:` lines join with `\n`. A blank line flushes one event. If you omit `id:`, resume cannot work and the client reconnects from “now.”

```ts
const source = new EventSource("/api/jobs/42/stream");

source.onopen = () => console.log("SSE open", source.readyState); // 1 = OPEN
source.onerror = () => console.log("SSE error/retry", source.readyState); // 0 CONNECTING or 2 CLOSED

source.addEventListener("token", (ev: MessageEvent<string>) => {
  appendChat(ev.data);
  // ev.lastEventId is the last id: from the wire
});

source.addEventListener("done", () => {
  source.close(); // stop auto-reconnect
});
```

```ts
// Server-shaped payload the browser parses for you
// id: 17
// event: token
// data: {"text":"Hello"}
//
// id: 18
// event: done
// data: {}
```

Unlike `useWebSocket2`, you do not write backoff. The browser uses `retry:` or a default. You *do* still `close()` on unmount or the stream continues in the background. `EventSource.readyState` is 0/1/2 — no CLOSING.

**Tip:** Always send `id:` on job streams. Support tickets that say “the answer restarted from the beginning on flaky wifi” are missing Last-Event-ID.

**Try it:** Stream numbered ids. Kill the handler mid-stream and resume. Confirm the first event after reconnect has an id greater than the last rendered id.

---

### Lesson 29. EventSource cannot set custom headers — use a fetch stream

**Takeaway:** `new EventSource(url)` cannot attach `Authorization`. If your API requires a header (not a cookie), either put a short-lived token in the query (same tradeoff as Lesson 13) or parse SSE yourself from `fetch`.

**Explain:** This is the SSE equivalent of the WebSocket constructor limitation. Cookie session on the same site is the happy path. For bearer tokens, `fetch` the stream and read `response.body` with a `TextDecoder`. You then own reconnect, `Last-Event-ID`, and abort.

```ts
async function subscribeSse(
  url: string,
  token: string,
  onEvent: (event: string, data: string) => void,
  signal: AbortSignal,
) {
  let lastId = "";

  while (!signal.aborted) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
        ...(lastId ? { "Last-Event-ID": lastId } : {}),
      },
      signal,
    });

    if (!res.ok || !res.body) throw new Error(`SSE HTTP ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const chunks = buf.split("\n\n");
      buf = chunks.pop() ?? "";
      for (const raw of chunks) {
        const fields = Object.fromEntries(
          raw
            .split("\n")
            .map((line) => {
              const i = line.indexOf(":");
              return [line.slice(0, i), line.slice(i + 1).trimStart()] as const;
            }),
        );
        if (fields.id) lastId = fields.id;
        if (fields.data) onEvent(fields.event ?? "message", fields.data);
      }
    }
  }
}
```

Abort the reader in `useEffect` cleanup (`AbortController`) the same way `isMountedRef` guards the WS hook. Do not parse SSE in a Server Component and expect the browser to stay connected — the HTTP response would have to be the streamed body of the RSC request, which is the wrong lifetime.

**Tip:** Prefer cookies for SSE in first-party apps so you can keep native `EventSource` (auto-retry, less code). Use fetch-stream when the API is a third-party bearer-only host.

**Try it:** Protect an SSE route with `Authorization`. Confirm `EventSource` gets 401. Switch to the fetch loop and confirm events parse. Unmount and assert the network request shows canceled.

---

## Next.js

### Lesson 30. App Router cannot hold sockets — run a separate WebSocket server

**Takeaway:** Server Components, Route Handlers, and Server Actions are request/response. They start, return, and (on serverless) freeze. A WebSocket needs a long-lived process. Put sockets on a dedicated server; connect from a Client Component.

**Explain:** `useWebSocket2` runs in the browser. `NEXT_PUBLIC_API_URL` points at **that** process, not at `/app/api/ws/route.ts` on Vercel. A Route Handler can *upgrade* only if you are on a Node server that supports it (custom server, or a platform that exposes raw sockets). On default serverless, the isolate is gone after the response — there is nothing left to hold the connection.

```tsx
// app/dashboard/live/page.tsx — Server Component (no socket)
import { LiveAgents } from "./live-agents";

export default function Page() {
  return <LiveAgents />;
}

// live-agents.tsx
"use client";

import { useWebSocket } from "@/hooks/useWebSocket2";

export function LiveAgents() {
  const token = useAuthToken(); // client-visible access token or a short WS ticket
  const { status } = useWebSocket("agents", token, (msg) => {
    if (msg.type === "agent") mergeAgent(msg.data);
  });
  return <p>socket {status}</p>;
}
```

The WS server can be Django Channels, a Node `ws` process, socket.io on Fastify, or a managed product (Ably, Pusher, PartyKit). The Next.js app still owns auth pages, RSC data, and the hook. Issue a **short-lived WS ticket** from a Route Handler if you do not want the long-lived access token in the query string (Lesson 13).

**Tip:** Never import `ws` or `socket.io` into a file that also exports a Server Component without isolating the import behind `import "server-only"` *and* a real long-lived host. The import is not the feature — the process lifetime is.

**Try it:** Sketch two boxes: “Next.js (RSC + hook)” and “WS process.” Draw the 101 upgrade from the browser to the WS box, not to `vercel.app/api`. If your diagram arrows into a Route Handler on serverless, redraw it.

---

### Lesson 31. Serverless, edge, idle timeouts, sticky sessions, Redis adapter

**Takeaway:** Edge and serverless functions time out. Reverse proxies close idle TCP. Multiple Node instances do not share in-memory rooms. Production WS is infra: idle timeouts, stickiness, and a pub/sub adapter.

**Explain:** Platforms impose a maximum duration. An edge worker that “upgrades” will still die. Even on a VM, nginx `proxy_read_timeout`, AWS ALB idle timeout (~60s default), and Cloudflare proxy settings will emit 1006 if no frames (including pings) cross the wire. Raise timeouts on the WS path only, and ping under that budget (Lesson 10).

```ts
// Conceptual multi-instance fan-out — not in the Next.js repo
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const io = new Server(httpServer, {
  cors: { origin: process.env.WEB_ORIGIN, credentials: true },
  pingInterval: 20_000,
  pingTimeout: 20_000,
});

const pub = createClient({ url: process.env.REDIS_URL });
const sub = pub.duplicate();
await Promise.all([pub.connect(), sub.connect()]);
io.adapter(createAdapter(pub, sub));
```

**Sticky sessions** (load balancer cookie / IP hash) send the same client to the same instance so Engine.IO’s poll+upgrade handshake stays coherent. The Redis adapter publishes events to every instance so `io.to("shift:42").emit` reaches sockets that live elsewhere. Native WS needs the same idea: publish to Redis, each process writes to its local `Set<WebSocket>`.

Without Redis, “it works on one dyno” and fails at two. Without sticky sessions, socket.io polling upgrades 400. Without ping, “random disconnects at 60s.”

**Tip:** Health-check the WS port separately from the Next.js HTTP port. A green Next.js deploy can still have a dead Channels worker.

**Try it:** Run two local socket.io processes without Redis. Join a room on process A, emit from a client on B, and observe silence. Add the Redis adapter and repeat.

---

## Testing

### Lesson 32. mock-socket, DevTools frames, `wscat`, and fake timers

**Takeaway:** Unit-test the hook with a fake `WebSocket`, watch real frames in DevTools, poke the server with `wscat`, and drive backoff with Jest fake timers. Do not require a staging cluster to assert `status` transitions.

**Explain:** `mock-socket` (or a tiny `class FakeWebSocket`) lets you `emit("open")`, `emit("message", data)`, and `emit("close", { code })` from the test. Assert `setStatus` / `onMessage` / `close` reasons. This repo’s hook is awkward to test only because `onMessage` is not a ref and `new WebSocket` is implicit — inject a factory or mock `globalThis.WebSocket`.

```ts
import { act, renderHook } from "@testing-library/react";
import { useWebSocket } from "@/hooks/useWebSocket2";

class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  readyState = 0;
  onopen: (() => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  onclose: ((ev: { code: number; reason: string }) => void) | null = null;
  url: string;
  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }
  close = jest.fn();
  send = jest.fn();
}

jest.useFakeTimers();
globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;

const onMessage = jest.fn();
const { result, unmount } = renderHook(() => useWebSocket("agents", "jwt", onMessage));

const ws = FakeWebSocket.instances.at(-1)!;
act(() => {
  ws.readyState = 1;
  ws.onopen?.();
});
expect(result.current.status).toBe("open");

act(() => {
  ws.onmessage?.({ data: JSON.stringify({ type: "ping" }) });
});
expect(onMessage).toHaveBeenCalledWith({ type: "ping" });

act(() => {
  ws.readyState = 3;
  ws.onclose?.({ code: 1006, reason: "" });
});
act(() => {
  jest.advanceTimersByTime(1_000);
});
expect(FakeWebSocket.instances.length).toBe(2);

unmount();
```

**DevTools:** Network → WS → Messages shows each frame. Use this to verify resubscribe and to catch double connections from StrictMode. **`npx wscat -c "wss://host/ws/agents/?token=..."`** is the server smoke test without React. Fake timers prove 1s / 2s / 4s / 30s without sleeping the suite.

**Tip:** Assert `close` was called with `1000` and `"Component unmounted"` on unmount — that locks Lesson 20.

**Try it:** Write the test above against your hook. Then assert that after `token: null` no second `FakeWebSocket` is constructed when you `advanceTimersByTime(60_000)`.
