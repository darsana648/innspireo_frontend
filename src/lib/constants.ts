import type { SortOption } from "./types";

export const SITE = {
  name: "Innspireo",
  legalName: "Innspire Hospitality Management LLP",
  title: "Innspireo Careers — Global Hospitality Jobs",
  description:
    "Hospitality careers in the Gulf and Europe. Chef, F&B, front office and housekeeping roles with accommodation, food and visa support — placed by Innspireo Hospitality.",
  /**
   * Canonical origin for THIS deployment. While the corporate pages and the
   * job board ship from one app this is the job-board host. When they split,
   * set NEXT_PUBLIC_SITE_URL to the apex domain on the corporate deployment so
   * canonicals, OpenGraph URLs and the sitemap stop pointing at the subdomain.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://jobs.innspireo.com",
  parentUrl: "https://innspireo.com",
  /**
   * Where the job data comes from. Defaults to the live Laravel host.
   * Override with NEXT_PUBLIC_API_BASE to point at a different backend —
   * anything serving the same payload shape works, since `src/lib/types.ts`
   * is written against this API's responses.
   */
  apiBase: process.env.NEXT_PUBLIC_API_BASE ?? "https://jobs.innspireo.com",
  email: "biju@innspirehospitality.com",
  phone: "+91 9074778300",
  phoneHref: "+919074778300",
  address: "1st Floor, Kaloor Complex, Kaloor, Kochi, Kerala 682017",
  addressParts: {
    street: "1st Floor, Kaloor Complex, Kaloor",
    locality: "Kochi",
    region: "Kerala",
    postalCode: "682017",
    country: "IN",
  },
  /**
   * Where the job board lives. The plan is to host the corporate pages on the
   * apex domain and the job board on jobs.innspireo.com. Leave
   * NEXT_PUBLIC_JOBS_BASE_URL unset while both ship from one app and every
   * jobs link stays a same-origin path; set it to the subdomain origin once
   * they are split and jobsUrl() starts emitting absolute URLs instead.
   */
  jobsBase: process.env.NEXT_PUBLIC_JOBS_BASE_URL ?? "",
  social: {
    linkedin: "https://www.linkedin.com/in/innspire-hospitality-22215b384",
    facebook: "https://www.facebook.com/innspireohospitality",
  },
} as const;

/** Taxonomies as seeded in the live database (ids are stable — used by the API). */
export const CATEGORIES = [
  { id: 1, name: "Front Office & Reception", slug: "front-office-reception" },
  { id: 2, name: "Food & Beverage (F&B) Service", slug: "food-beverage-service" },
  { id: 3, name: "Culinary / Kitchen Staff", slug: "culinary-kitchen-staff" },
  { id: 4, name: "Housekeeping & Laundry", slug: "housekeeping-laundry" },
  { id: 5, name: "Hotel Management & Operations", slug: "hotel-management-operations" },
  { id: 6, name: "Event & Banquet Planning", slug: "event-banquet-planning" },
  { id: 7, name: "Spa, Wellness & Recreation", slug: "spa-wellness-recreation" },
  { id: 8, name: "Maintenance & Facilities", slug: "maintenance-facilities" },
  { id: 9, name: "Sales, Marketing & Guest Relations", slug: "sales-marketing-guest-relations" },
  { id: 10, name: "Security & Guest Safety", slug: "security-guest-safety" },
] as const;

export const JOB_TYPES = [
  { id: 1, name: "Full-time" },
  { id: 2, name: "Part-time" },
  { id: 3, name: "Contract" },
  { id: 4, name: "Internship" },
  { id: 5, name: "Seasonal" },
] as const;

export const EXPERIENCE_LEVELS = [
  { id: 1, name: "Entry Level" },
  { id: 2, name: "Mid Level" },
  { id: 3, name: "Senior Level" },
  { id: 4, name: "Lead / Manager" },
  { id: 5, name: "Executive" },
] as const;

export const WORK_MODES = [
  { value: "on-site", name: "On-site" },
  { value: "hybrid", name: "Hybrid" },
  { value: "remote", name: "Remote" },
] as const;

export const SORT_OPTIONS: { value: SortOption; name: string }[] = [
  { value: "newest", name: "Newest first" },
  { value: "oldest", name: "Oldest first" },
  { value: "highest_salary", name: "Highest salary" },
  { value: "featured", name: "Featured" },
];

/**
 * Destination metadata for the country-led browsing experience.
 * `aliases` catch the misspellings and casing variants present in the live
 * `countries` / `location` columns (e.g. "Baharin", "Netharlands", "MUSCUT").
 */
export const DESTINATIONS = [
  {
    slug: "kuwait",
    name: "Kuwait",
    code: "KW",
    region: "Gulf",
    aliases: ["kuwait", "kw", "kuwait city"],
    blurb:
      "Kuwait's hotel and catering sector hires heavily across kitchen and F&B roles, typically with food and accommodation provided.",
  },
  {
    slug: "oman",
    name: "Oman",
    code: "OM",
    region: "Gulf",
    aliases: ["oman", "om", "muscat", "muscut"],
    blurb:
      "Resorts and business hotels across Muscat and Salalah recruit year-round, with strong demand for continental and Indian cuisine specialists.",
  },
  {
    slug: "qatar",
    name: "Qatar",
    code: "QA",
    region: "Gulf",
    aliases: ["qatar", "qa", "doha"],
    blurb:
      "Doha's luxury hospitality market offers some of the region's most competitive packages for experienced hotel professionals.",
  },
  {
    slug: "bahrain",
    name: "Bahrain",
    code: "BH",
    region: "Gulf",
    aliases: ["bahrain", "baharin", "bh", "manama"],
    blurb:
      "A compact, high-density hospitality market with steady demand for service crew and kitchen staff.",
  },
  {
    slug: "germany",
    name: "Germany",
    code: "DE",
    region: "Europe",
    aliases: ["germany", "de", "berlin", "munich"],
    blurb:
      "Structured European contracts with language-support pathways, open to candidates building a long-term career in the EU.",
  },
  {
    slug: "netherlands",
    name: "Netherlands",
    code: "NL",
    region: "Europe",
    aliases: ["netherlands", "netharlands", "nl", "amsterdam", "holland"],
    blurb:
      "Hotel and hospitality roles in a highly regulated market with strong worker protections and clear visa routes.",
  },
] as const;

export type Destination = (typeof DESTINATIONS)[number];

/**
 * Builds a link into the job board. Returns a same-origin path by default and
 * an absolute URL once SITE.jobsBase is configured, so the corporate pages can
 * move to their own domain without touching every call site.
 */
export function jobsUrl(path: string = "/jobs"): string {
  const base = SITE.jobsBase;
  if (!base) return path;
  return base.replace(/\/+$/, "") + (path.startsWith("/") ? path : "/" + path);
}
