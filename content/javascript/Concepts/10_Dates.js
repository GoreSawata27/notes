// 1. Constructing a Date
// new Date() captures "now" as a millisecond instant since the Unix epoch.
// The object stores UTC internally; console output uses the local timezone.
// Calling it as a function (Date()) returns a string, not a Date.
const now = new Date();
console.log(now instanceof Date);
console.log(typeof Date());
console.log(now.getTime());

// 2. From Unix milliseconds
// new Date(ms) treats the argument as milliseconds since 1970-01-01T00:00:00.000Z.
// Negative values are instants before the epoch.
// Passing a single number is never "year" — use the multi-argument form for that.
const epoch = new Date(0);
const later = new Date(1_774_310_400_000);
console.log(epoch.toISOString());
console.log(later.toISOString());

// 3. Component constructor is local
// new Date(y, monthIndex, day, h, min, s, ms) uses the local timezone.
// Omitted day defaults to 1; omitted time parts default to 0.
// Two-digit years are treated as 1900+year (99 => 1999), so prefer four digits.
const localNoon = new Date(2026, 2, 15, 12, 0, 0);
console.log(localNoon.toString());
console.log(new Date(99, 0, 1).getFullYear());

// 4. Date.UTC and the Date wrapper
// Date.UTC(y, monthIndex, ...) returns a millisecond timestamp in UTC.
// Wrap it with new Date(...) to get a Date for that instant.
// Component order matches the local constructor, including 0-indexed months.
const utcMs = Date.UTC(2026, 2, 15, 12, 0, 0);
const utcNoon = new Date(utcMs);
console.log(utcMs);
console.log(utcNoon.toISOString());

// 5. Parsing date strings
// new Date(string) and Date.parse(string) share the same parser.
// Only ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ) is specified by the language.
// Other formats such as "March 15, 2026" are implementation-defined — avoid them.
const iso = new Date("2026-03-15T12:00:00.000Z");
console.log(iso.toISOString());
console.log(Date.parse("2026-03-15T12:00:00.000Z"));

// 6. Date.parse pitfalls
// Date.parse returns a number (ms) or NaN — it never throws.
// Slash dates, month names, and missing timezones differ across engines.
// Prefer an explicit ISO string with Z, or build from numeric components.
console.log(Number.isNaN(Date.parse("not a date")));
console.log(Number.isFinite(Date.parse("2026-03-15T00:00:00Z")));
const risky = Date.parse("03/15/2026");
console.log(Number.isNaN(risky) ? "unparseable here" : new Date(risky).toISOString());

// 7. ISO date-only strings are UTC
// A date-only ISO string ("YYYY-MM-DD") is parsed as UTC midnight.
// In timezones west of UTC that is the previous local calendar day.
// This is the most common "off-by-one-day" bug when hydrating dates from APIs.
const dateOnly = new Date("2026-03-15");
console.log(dateOnly.toISOString());
console.log(dateOnly.getUTCDate());
console.log(dateOnly.getDate());

// 8. ISO datetime without Z is local
// "YYYY-MM-DDTHH:mm:ss" with no Z or offset is treated as local time.
// The same clock reading therefore maps to different instants per machine TZ.
// Always include Z or an offset when the instant must be unambiguous.
const noZone = new Date("2026-03-15T00:00:00");
const withZ = new Date("2026-03-15T00:00:00Z");
console.log(noZone.getTime() === withZ.getTime());
console.log(noZone.toISOString());
console.log(withZ.toISOString());

// 9. Zero-indexed months
// Months are 0–11 (January = 0, December = 11). Days of month are 1–31.
// getDay() / getUTCDay() are also 0-indexed, but from Sunday (0) to Saturday (6).
// Mixing these up is the second most common Date bug after timezone parsing.
const march = new Date(2026, 2, 15);
console.log(march.getMonth());
console.log(march.getDate());
console.log(march.getDay());
console.log(march.getFullYear());

// 10. Invalid Dates
// Failed parsing produces an Invalid Date object, not an exception.
// Its primitive value is NaN; Number(invalid) is NaN; String(invalid) is "Invalid Date".
// Most getters return NaN; toISOString() throws RangeError.
const invalid = new Date("not a date");
console.log(String(invalid));
console.log(invalid.getTime());
console.log(Number.isNaN(invalid.getFullYear()));

// 11. Detecting invalid Dates
// Number.isNaN(date.getTime()) is the reliable check (or Number.isNaN(+date)).
// Number.isNaN(date) is always false because date is an object.
// Guard before formatting, comparing, or sending a Date over the wire.
function isValidDate(value) {
  return value instanceof Date && !Number.isNaN(value.getTime());
}
console.log(isValidDate(new Date("2026-03-15T12:00:00Z")));
console.log(isValidDate(new Date("nope")));
console.log(isValidDate("2026-03-15"));

// 12. Local getters
// getFullYear, getMonth, getDate, getHours, getMinutes, getSeconds, getMilliseconds
// and getDay read the calendar/clock in the host timezone.
// getYear() is deprecated (years since 1900) — always use getFullYear().
const local = new Date("2026-03-15T18:30:45.250Z");
console.log(local.getFullYear(), local.getMonth(), local.getDate());
console.log(local.getHours(), local.getMinutes(), local.getSeconds(), local.getMilliseconds());
console.log(local.getDay());

// 13. UTC getters
// The UTC* getters read the same instant in UTC, independent of the host TZ.
// Use these when you stored a "date" as UTC midnight and must not shift the day.
// Pair UTC getters with UTC setters to stay on one calendar.
const instant = new Date("2026-03-15T18:30:45.250Z");
console.log(instant.getUTCFullYear(), instant.getUTCMonth(), instant.getUTCDate());
console.log(instant.getUTCHours(), instant.getUTCMinutes(), instant.getUTCSeconds());
console.log(instant.getUTCDay());

// 14. Local setters and overflow
// setFullYear / setMonth / setDate / setHours / ... mutate the Date in place.
// Out-of-range values overflow: setMonth(13) becomes February next year; setDate(0) is the last day of the previous month.
// They return the new getTime() value.
const overflow = new Date(2026, 0, 31);
overflow.setMonth(1);
console.log(overflow.toDateString());
const endOfJan = new Date(2026, 1, 1);
endOfJan.setDate(0);
console.log(endOfJan.toDateString());

// 15. UTC setters
// setUTCFullYear, setUTCMonth, setUTCDate, setUTCHours, and friends mutate using UTC fields.
// Overflow rules are the same as the local setters.
// Prefer UTC setters when the Date represents a civil date stored at UTC midnight.
const utcSet = new Date(Date.UTC(2026, 2, 15, 12, 0, 0));
utcSet.setUTCDate(utcSet.getUTCDate() + 1);
utcSet.setUTCHours(0, 0, 0, 0);
console.log(utcSet.toISOString());

// 16. getTime, valueOf, and Date.now
// getTime() and valueOf() both return epoch milliseconds; +date is the same via ToPrimitive.
// Date.now() is equivalent to Date.now = () => new Date().getTime() without allocating a Date.
// Use Date.now() for timestamps; use a Date object only when you need calendar fields.
const stamp = new Date("2026-03-15T00:00:00.000Z");
console.log(stamp.getTime() === stamp.valueOf());
console.log(stamp.getTime() === +stamp);
console.log(typeof Date.now() === "number");

// 17. Unix timestamps: seconds vs milliseconds
// Unix time is usually seconds; JavaScript Date is always milliseconds.
// APIs (JWT exp, many databases) send seconds — multiply by 1000 before new Date.
// Divide getTime() by 1000 and floor when you need a Unix seconds integer.
const unixSeconds = 1773532800;
const fromUnix = new Date(unixSeconds * 1000);
console.log(fromUnix.toISOString());
console.log(Math.floor(fromUnix.getTime() / 1000) === unixSeconds);

// 18. toISOString
// toISOString() always prints UTC with a trailing Z and millisecond precision.
// It is the right default for logs, JSON, and API payloads.
// Invalid Date causes a RangeError — validate first.
const isoSource = new Date("2026-03-15T12:00:00.000Z");
console.log(isoSource.toISOString());
try {
  new Date("bad").toISOString();
} catch (err) {
  console.log(err.name);
}

// 19. toJSON for APIs
// JSON.stringify calls toJSON() on Date, which delegates to toISOString().
// Nested dates therefore survive a round-trip as ISO strings, not Date objects.
// After JSON.parse you must new Date(string) yourself.
const payload = { createdAt: new Date("2026-03-15T12:00:00.000Z") };
const json = JSON.stringify(payload);
const revived = JSON.parse(json);
console.log(json);
console.log(typeof revived.createdAt);
console.log(new Date(revived.createdAt).toISOString());

// 20. Locale and UTC string methods
// toString / toDateString / toTimeString use the host locale and timezone.
// toUTCString() is an RFC 7231-style UTC string (HTTP Date). toGMTString is an alias.
// These are fine for debugging; do not parse them back with new Date in production.
const shown = new Date("2026-03-15T12:00:00.000Z");
console.log(shown.toDateString());
console.log(shown.toTimeString());
console.log(shown.toUTCString());

// 21. Comparing Dates
// < > <= >= coerce Dates to milliseconds, so they compare instants correctly.
// == and === compare object identity, so two equal instants are not ===.
// Prefer dateA.getTime() === dateB.getTime() for equality.
const a = new Date("2026-03-15T12:00:00Z");
const b = new Date("2026-03-15T12:00:00Z");
console.log(a === b);
console.log(a.getTime() === b.getTime());
console.log(a < new Date("2026-03-16T00:00:00Z"));

// 22. Sorting Dates
// sort mutates; subtract getTime() values for a numeric comparator.
// Mixing Date objects and ISO strings works if you coerce with +new Date(...) or Date.parse.
// Invalid Dates sort as NaN and produce an unstable order — filter them first.
const dates = [
  new Date("2026-12-01T00:00:00Z"),
  new Date("2026-01-01T00:00:00Z"),
  new Date("2026-06-15T00:00:00Z"),
];
dates.sort((left, right) => left.getTime() - right.getTime());
console.log(dates.map((d) => d.toISOString().slice(0, 10)));

// 23. Dates are mutable — clone first
// Every setter mutates the same object; sharing a Date across UI state is a footgun.
// Clone with new Date(original) or new Date(original.getTime()).
// structuredClone(date) also works and keeps a real Date.
const original = new Date("2026-03-15T12:00:00Z");
const clone = new Date(original.getTime());
clone.setUTCDate(20);
console.log(original.toISOString());
console.log(clone.toISOString());

// 24. Adding and subtracting milliseconds
// Instant arithmetic is just integer math on getTime().
// Adding 24 hours of milliseconds is "add 24 hours", not "add one calendar day".
// Across DST that distinction matters — see the DST cards.
const start = new Date("2026-03-15T12:00:00Z");
const plusHour = new Date(start.getTime() + 60 * 60 * 1000);
const minusDayMs = new Date(start.getTime() - 24 * 60 * 60 * 1000);
console.log(plusHour.toISOString());
console.log(minusDayMs.toISOString());

// 25. Calendar-day arithmetic
// setDate(getDate() + n) walks calendar days in the local zone and handles month/year rollover.
// Use setUTCDate(getUTCDate() + n) when the Date is a UTC civil date.
// Always clone first so the source instant stays put.
function addLocalDays(date, days) {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}
console.log(addLocalDays(new Date(2026, 2, 15), 20).toDateString());
console.log(addLocalDays(new Date(2026, 0, 31), 1).toDateString());

// 26. Diff in milliseconds
// Subtracting Dates (or their getTime()) yields the signed millisecond gap.
// Positive means the right operand is earlier when you write later - earlier.
// Math.abs if you only care about duration.
const earlier = new Date("2026-03-15T12:00:00Z");
const laterOn = new Date("2026-03-15T15:30:00Z");
const diffMs = laterOn - earlier;
console.log(diffMs);
console.log(diffMs / 1000 / 60);

// 27. Diff in days, hours, minutes
// Divide the ms delta by the unit size; floor toward zero or use trunc for signed diffs.
// This counts elapsed 24-hour periods, not "calendar midnights crossed".
// For calendar-day difference, compare UTC (or local) Y/M/D fields instead.
function elapsedParts(from, to) {
  let ms = to.getTime() - from.getTime();
  const sign = ms < 0 ? -1 : 1;
  ms = Math.abs(ms);
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return { sign, days, hours, minutes };
}
console.log(elapsedParts(new Date("2026-03-15T00:00:00Z"), new Date("2026-03-17T05:10:00Z")));

// 28. Start and end of a local day
// setHours(0, 0, 0, 0) snaps to local midnight; setHours(23, 59, 59, 999) is the last ms.
// These are local-civil, so the UTC ISO string will shift with the host offset.
// For a UTC day, use setUTCHours instead.
const day = new Date(2026, 2, 15, 14, 45);
const startOfDay = new Date(day);
startOfDay.setHours(0, 0, 0, 0);
const endOfDay = new Date(day);
endOfDay.setHours(23, 59, 59, 999);
console.log(startOfDay.toString());
console.log(endOfDay.toString());
console.log(endOfDay.getTime() - startOfDay.getTime());

// 29. Leap years
// A year is a leap year if divisible by 4, except centuries not divisible by 400.
// Date overflow gives a cheap check: Feb 29 exists iff new Date(y, 1, 29).getMonth() === 1.
// 1900 is not a leap year; 2000 is.
function isLeapYear(year) {
  return new Date(year, 1, 29).getMonth() === 1;
}
console.log(isLeapYear(2024), isLeapYear(2026));
console.log(isLeapYear(1900), isLeapYear(2000));
console.log(new Date(2024, 1, 29).toDateString());

// 30. Formatting without libraries
// Build YYYY-MM-DD yourself from UTC (or local) getters plus String#padStart.
// slice on toISOString() is a shortcut only when you want the UTC calendar date.
// Do not use toISOString().slice(0, 10) for a local "today" — it can be yesterday/tomorrow.
function formatYmdUTC(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function formatYmdLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
const fmt = new Date("2026-03-15T02:00:00Z");
console.log(formatYmdUTC(fmt), fmt.toISOString().slice(0, 10));
console.log(formatYmdLocal(fmt));

// 31. Intl.DateTimeFormat
// Intl.DateTimeFormat(locale, options) is the built-in way to format for humans.
// Default options are locale-sensitive; pass dateStyle/timeStyle or field options.
// format() returns a string; reuse one formatter when rendering lists.
const when = new Date("2026-03-15T15:30:00Z");
const us = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });
const de = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" });
console.log(us.format(when));
console.log(de.format(when));

// 32. Formatting in a specific timezone
// The timeZone option formats the same instant in any IANA zone.
// This does not convert or mutate the Date; it only changes the printed fields.
// Invalid zone names throw RangeError at formatter construction.
const meeting = new Date("2026-03-15T18:00:00Z");
const opts = { dateStyle: "full", timeStyle: "long", timeZone: "America/New_York" };
console.log(new Intl.DateTimeFormat("en-US", opts).format(meeting));
console.log(new Intl.DateTimeFormat("en-US", { ...opts, timeZone: "Asia/Kolkata" }).format(meeting));

// 33. formatToParts
// formatToParts returns [{ type, value }, ...] so you can style day vs month separately.
// Types include year, month, day, weekday, hour, minute, dayPeriod, timeZoneName, literal.
// Prefer this over regex-splitting format() output.
const parts = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "2-digit",
  timeZone: "UTC",
}).formatToParts(new Date("2026-03-15T00:00:00Z"));
const map = Object.fromEntries(parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value]));
console.log(map);
console.log(parts.map((p) => p.type).join(","));

// 34. Intl.RelativeTimeFormat
// RelativeTimeFormat(locale, { numeric, style }) formats a signed unit count.
// You supply the number and unit ("day", "hour", "month", ...); it does not diff Dates for you.
// numeric: "auto" yields "yesterday" / "tomorrow"; "always" yields "in 1 day".
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
console.log(rtf.format(-1, "day"));
console.log(rtf.format(3, "hour"));
console.log(new Intl.RelativeTimeFormat("en", { numeric: "always" }).format(1, "day"));

// 35. getTimezoneOffset
// getTimezoneOffset() is minutes to add to local time to get UTC (local + offset = UTC).
// UTC+05:30 therefore returns -330. The sign is the opposite of the zone label.
// The value can change for the same Date object across DST if you mutate it.
const offsetSample = new Date("2026-01-15T12:00:00Z");
const minutes = offsetSample.getTimezoneOffset();
console.log(minutes);
console.log(-minutes / 60);

// 36. DST spring-forward traps
// In America/New_York, 2026-03-08 local 02:00 jumps to 03:00 — that hour does not exist.
// Engines typically land on the post-gap time; do not assume 02:30 is valid.
// Construct civil times in a named zone via Temporal or a library, not new Date(y, m, d, 2).
const ny = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  timeStyle: "long",
  dateStyle: "medium",
});
console.log(ny.format(new Date("2026-03-08T06:30:00Z")));
console.log(ny.format(new Date("2026-03-08T07:30:00Z")));

// 37. DST and the 24-hour day myth
// A local calendar day can be 23 or 25 hours long.
// Adding 86_400_000 ms can miss a local date or land at the wrong clock time.
// Prefer setDate(+1) for "tomorrow" and Intl or Temporal for zone-aware clocks.
const beforeSpring = new Date("2026-03-07T12:00:00Z");
const plus24h = new Date(beforeSpring.getTime() + 86_400_000);
const plusCalDay = new Date(beforeSpring);
plusCalDay.setUTCDate(plusCalDay.getUTCDate() + 1);
console.log(plus24h.toISOString());
console.log(plusCalDay.toISOString());
console.log(plus24h.getTime() === plusCalDay.getTime());

// 38. Temporal Instant and Now
// Temporal (Stage 4) stores instants separately from calendars and timezones.
// Temporal.Now.instant() is "now"; Instant.from() parses a required-offset ISO string.
// Date.prototype.toTemporalInstant() bridges legacy Date when Temporal exists.
if (typeof Temporal === "undefined") {
  console.log("Temporal is not available in this engine");
} else {
  const instant = Temporal.Instant.from("2026-03-15T12:00:00Z");
  console.log(instant.epochMilliseconds);
  console.log(Temporal.Now.instant().toString());
}

// 39. Temporal PlainDate and ZonedDateTime
// PlainDate is a calendar date with no time and no timezone — no off-by-one parse.
// ZonedDateTime is an instant plus an IANA zone, so DST math is explicit.
// This is the model Date tried to be with one mutable object.
if (typeof Temporal === "undefined") {
  console.log("Temporal is not available in this engine");
} else {
  const plain = Temporal.PlainDate.from("2026-03-15");
  const zoned = Temporal.ZonedDateTime.from("2026-03-15T09:00:00[America/New_York]");
  console.log(plain.toString());
  console.log(zoned.toInstant().toString());
  console.log(plain.add({ days: 1 }).toString());
}

// 40. date-fns vs dayjs
// date-fns: tree-shakeable functions, always returns a new Date, format tokens like yyyy-MM-dd.
// dayjs: tiny Moment-like chain API, immutable by default, format tokens like YYYY-MM-DD.
// Native Date covers instants; use either library when you need parsing, timezones, or duration helpers.
const nativeDate = new Date("2026-03-15T12:00:00Z");
const nativePlusOne = new Date(nativeDate);
nativePlusOne.setUTCDate(nativePlusOne.getUTCDate() + 1);
console.log(nativePlusOne.toISOString());
console.log("date-fns: addDays(date, 1) / format(date, \"yyyy-MM-dd\") / differenceInDays(a, b)");
console.log("dayjs:    dayjs(date).add(1, \"day\").format(\"YYYY-MM-DD\") / dayjs(a).diff(b, \"day\")");
