import { DESTINATIONS, type Destination } from "./constants";
import type { Job } from "./types";

/* -------------------------------------------------------------------------- */
/*  Location normalisation                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The live `countries.name` column contains misspellings ("Baharin",
 * "Netharlands") and the free-text `jobs.location` column is unnormalised
 * ("kuwait", "KUWAIT", "OMAN", "MUSCUT"). We resolve both against the
 * DESTINATIONS alias table so the UI never shows a typo or a duplicate.
 *
 * NOTE for the backend team: this is display-layer triage. The real fix is to
 * correct `countries.name` and populate `state_id` consistently.
 */
export function resolveDestination(job: Job): Destination | null {
  const candidates = [job.country?.name, job.country?.code, job.location]
    .filter(Boolean)
    .map((v) => String(v).trim().toLowerCase());

  for (const dest of DESTINATIONS) {
    const match = candidates.some(
      (c) =>
        c === dest.slug ||
        c === dest.name.toLowerCase() ||
        c === dest.code.toLowerCase() ||
        (dest.aliases as readonly string[]).includes(c),
    );
    if (match) return dest;
  }
  return null;
}

export function destinationBySlug(slug: string): Destination | null {
  return DESTINATIONS.find((d) => d.slug === slug) ?? null;
}

/** Title-cases a shouty or lowercase free-text value: "MUSCUT" to "Muscut". */
function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/**
 * Human-readable location. Prefers the canonical destination name and appends
 * a city only when it adds information beyond the country.
 */
export function formatLocation(job: Job): string {
  const dest = resolveDestination(job);
  const raw = job.location?.trim();

  if (!dest) return raw ? titleCase(raw) : "Location on request";

  if (raw) {
    const rawLower = raw.toLowerCase();
    // Aliases count too, otherwise the misspelling "Netharlands" is read as a
    // city and renders "Netharlands, Netherlands".
    const isJustTheCountry =
      rawLower === dest.slug ||
      rawLower === dest.name.toLowerCase() ||
      rawLower === dest.code.toLowerCase() ||
      (dest.aliases as readonly string[]).includes(rawLower);

    if (!isJustTheCountry) {
      // A city-level value ("MUSCUT", "Berlin") renders as "City, Country".
      return `${titleCase(raw)}, ${dest.name}`;
    }
  }
  return dest.name;
}

/* -------------------------------------------------------------------------- */
/*  Salary                                                                    */
/* -------------------------------------------------------------------------- */

const GULF_CURRENCIES = new Set(["KWD", "OMR", "BHD", "QAR", "AED", "SAR"]);

/**
 * The database has no `salary_period` column, yet it mixes monthly Gulf figures
 * (e.g. 1800 KWD) with annual Indian figures (e.g. 638000 INR). We infer the
 * period from currency and magnitude rather than mislabel everything "annual"
 * the way the current site's "Min Salary (Annual)" filter does.
 *
 * NOTE for the backend team: add an explicit `salary_period` enum and this
 * heuristic can be deleted.
 */
export function inferSalaryPeriod(
  currency: string | null,
  amount: number,
): "month" | "year" {
  const c = (currency ?? "").toUpperCase();
  if (GULF_CURRENCIES.has(c)) return amount < 20_000 ? "month" : "year";
  if (c === "INR") return amount >= 100_000 ? "year" : "month";
  if (c === "EUR" || c === "USD" || c === "GBP") return amount >= 20_000 ? "year" : "month";
  return amount >= 50_000 ? "year" : "month";
}

function money(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: amount >= 1_000_000 ? 1 : 0,
      notation: amount >= 1_000_000 ? "compact" : "standard",
    }).format(amount);
  } catch {
    // Unknown or invalid ISO code: fall back to a plain grouped number.
    const n = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount);
    return `${currency} ${n}`;
  }
}

/** The upper bound of a range, without repeating the currency. */
function plain(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: amount >= 1_000_000 ? 1 : 0,
    notation: amount >= 1_000_000 ? "compact" : "standard",
  }).format(amount);
}

export interface FormattedSalary {
  label: string;
  period: "month" | "year";
  disclosed: boolean;
}

export function formatSalary(job: Job): FormattedSalary {
  const rawMin = job.salary_min ? Number(job.salary_min) : null;
  const rawMax = job.salary_max ? Number(job.salary_max) : null;
  const currency = (job.currency ?? "").toUpperCase() || "USD";

  const valid = (n: number | null): n is number =>
    n !== null && Number.isFinite(n) && n > 0;

  if (!valid(rawMin) && !valid(rawMax)) {
    return { label: "Salary on request", period: "month", disclosed: false };
  }

  const basis = valid(rawMin) ? rawMin : (rawMax as number);
  const period = inferSalaryPeriod(currency, basis);

  let label: string;
  if (valid(rawMin) && valid(rawMax) && rawMin !== rawMax) {
    const lo = money(rawMin, currency);
    const hi = money(rawMax, currency);
    // Two values can format identically (1,000,000 and 1,050,000 both compact
    // to the same string at low precision) — show one figure rather than a
    // range that reads "X - X".
    label = lo === hi ? lo : `${lo} – ${plain(rawMax)}`;
  } else {
    label = money(basis, currency);
  }

  return { label, period, disclosed: true };
}

/* -------------------------------------------------------------------------- */
/*  Dates                                                                     */
/* -------------------------------------------------------------------------- */

export function formatDate(value: string | null): string {
  if (!value) return "Not specified";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Not specified";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function timeAgo(value: string | null): string {
  if (!value) return "";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/**
 * Whether a listing is closed.
 *
 * This reads `status`, NOT `deadline`. Every one of the 26 live listings has a
 * deadline in the past while still being `status: "active"`, and the Laravel
 * site still accepts applications on them — the deadline column is simply not
 * maintained. Driving the closed state off the date would mark the entire
 * catalogue "Closed" and grey out every card on the site.
 *
 * NOTE for the backend team: either keep deadlines current or drop the column.
 */
export function isClosed(status: string | null | undefined): boolean {
  return (status ?? "active") !== "active";
}

/** True only for a deadline that is genuinely still ahead of us. */
export function isExpired(deadline: string | null): boolean {
  if (!deadline) return false;
  const d = new Date(deadline).getTime();
  return !Number.isNaN(d) && d < Date.now();
}

/**
 * What to print next to "Apply before". A stale past date contradicts an open
 * vacancy, so those fall back to a truthful, non-committal label.
 */
export function deadlineLabel(deadline: string | null): string {
  if (!deadline || isExpired(deadline)) return "Open until filled";
  return formatDate(deadline);
}

export function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null;
  const d = new Date(deadline).getTime();
  if (Number.isNaN(d)) return null;
  return Math.ceil((d - Date.now()) / 86_400_000);
}

/* -------------------------------------------------------------------------- */
/*  Text                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Job descriptions arrive as plain text with CRLF breaks and emoji bullets.
 * Split into renderable lines, dropping empties.
 */
export function toLines(value: string | null): string[] {
  if (!value) return [];
  return value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** True when a line reads like a bullet rather than a paragraph. */
export function isBulletLine(line: string): boolean {
  return /^([-*•·]|\p{Extended_Pictographic})/u.test(line);
}

export function stripBulletMarker(line: string): string {
  return line.replace(/^[-*•·]\s*/, "").trim();
}

export function excerpt(value: string | null, max = 165): string {
  const text = toLines(value).join(" ");
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Absolute URL for a logo path returned by the API (e.g. "logos/abc.png"). */
export function storageUrl(path: string | null, apiBase: string): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiBase}/storage/${path.replace(/^\/+/, "")}`;
}

/* -------------------------------------------------------------------------- */
/*  Package facts parsed out of the description                               */
/* -------------------------------------------------------------------------- */

export interface PackageFact {
  label: string;
  value: string;
}

/**
 * Recruiters write the package into the free-text description as emoji-prefixed
 * "Label: Value" lines, e.g.
 *
 *   💰 Salary: 150 KD
 *   🏠 Accommodation: Provided
 *   ⏰ Working Hours: 9 hours including break
 *
 * 8 of the 26 live listings use this shape. Pulling them out lets the detail
 * page show a real package grid instead of burying the useful part in a wall of
 * text, and `stripPackageFacts` keeps them from being repeated in the prose.
 *
 * NOTE for the backend team: these belong in structured columns. Until then
 * this parser is deliberately conservative — a short label of at most three
 * words, a non-empty value, and a line short enough not to be a sentence.
 */
const FACT_LINE =
  /^\s*(?:[^\p{L}\p{N}\s]{1,4}\s*)?([\p{L}][\p{L} /&-]{2,28}?)\s*[:\u2013-]\s*(\S.*)$/u;

function factFrom(line: string): PackageFact | null {
  if (line.length > 72) return null;
  const m = FACT_LINE.exec(line);
  if (!m) return null;
  const label = m[1].trim();
  const value = m[2].trim();
  if (!value || value.length > 48) return null;
  if (label.split(/\s+/).length > 3) return null;
  // A trailing full stop means it read as a sentence, not a field.
  if (/[.!?]$/.test(value)) return null;
  return { label, value };
}

export function extractPackageFacts(description: string | null): PackageFact[] {
  const facts: PackageFact[] = [];
  for (const line of toLines(description)) {
    const fact = factFrom(line);
    if (fact) facts.push(fact);
  }
  // One stray match is noise; a real package block has several.
  return facts.length >= 2 ? facts : [];
}

/** The description with any recognised fact lines removed. */
export function stripPackageFacts(description: string | null): string[] {
  const lines = toLines(description);
  const hasBlock = extractPackageFacts(description).length > 0;
  if (!hasBlock) return lines;
  return lines.filter((line) => factFrom(line) === null);
}
