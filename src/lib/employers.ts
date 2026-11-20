/**
 * Employer profiles for job pages.
 *
 * WHAT THE DATA ACTUALLY LOOKS LIKE TODAY
 * ---------------------------------------
 * Every vacancy in the live API carries `company_id: 1`, and that record is
 * *Innspireo itself* — name "Innspireo Hospitality", website innspireo.com,
 * described as "one of the leading global hotel brands". Innspireo is a
 * recruitment LLP, not a hotel brand, so rendering `job.company` as "the
 * employer" would put a false claim on all 27 listings. `resolveEmployer()`
 * therefore refuses to treat the agency's own record as a hiring employer.
 *
 * The real employer is described in the job text by *type*, not by name —
 * "a reputed Four-Star Hotel in Oman". `inferEmployerFacts()` pulls that out,
 * which is what lets a job page say something true and useful about who is
 * hiring while the client stays unnamed.
 *
 * ADDING A NAMED EMPLOYER
 * -----------------------
 * Two steps, no backend needed:
 *   1. add an entry to EMPLOYERS, keyed by a slug of your choosing;
 *   2. map the job slugs to it in JOB_EMPLOYER.
 * The job page switches to the full profile automatically.
 *
 * NOTE ON CONTACT DETAILS: `EmployerProfile` has no email, phone or contact
 * person, by design. Candidates are never put in touch with a client directly
 * — every approach runs through the Innspireo team — so there is no field here
 * to fill in by mistake.
 *
 * NOTE ON DISCLOSURE POLICY: /faqs currently tells candidates that employer
 * names are *not* published on open listings and are disclosed at
 * shortlisting. Naming an employer here contradicts that answer, so update the
 * FAQ in `content.ts` at the same time.
 */

import type { Job } from "./types";
import { resolveDestination } from "./format";
import { CATEGORIES } from "./constants";

export interface EmployerProfile {
  /** Stable key used by JOB_EMPLOYER. */
  key: string;
  name: string;
  /** One line under the name, e.g. "Five-star city hotel · Doha". */
  tagline?: string;
  /** One to three short paragraphs. Plain text; blank lines separate them. */
  about: string;
  propertyType?: string;
  /** e.g. "320 rooms", "4 outlets". */
  scale?: string;
  locations?: string[];
  founded?: string;
  /** Public marketing site. Never a careers inbox or a booking contact. */
  website?: string;
  /** Path under /public, e.g. "/images/employers/acme.png". */
  logo?: string;
  /** Short factual bullets: awards, cuisines, notable outlets. */
  highlights?: string[];
}

/**
 * Named client employers.
 *
 * Empty on purpose — nothing here may be invented. Fill it in from what the
 * client has agreed you can publish. Worked example:
 *
 *   "grand-bellevue-doha": {
 *     key: "grand-bellevue-doha",
 *     name: "Grand Bellevue Doha",
 *     tagline: "Five-star city hotel · Doha, Qatar",
 *     propertyType: "Five-star city hotel",
 *     scale: "320 rooms · 4 F&B outlets",
 *     locations: ["Doha, Qatar"],
 *     founded: "2014",
 *     website: "https://example.com",
 *     highlights: [
 *       "Continental and Arabic fine dining",
 *       "Banqueting for up to 600 covers",
 *     ],
 *     about:
 *       "A city-centre property serving business and leisure guests...\n\n" +
 *       "The kitchen brigade runs to 40 across four outlets...",
 *   },
 */
export const EMPLOYERS: Record<string, EmployerProfile> = {};

/**
 * Which employer each vacancy belongs to: job slug -> EMPLOYERS key.
 *
 * Empty until the client agrees to be named. Example:
 *   "commi-2-1792736986-80": "grand-bellevue-doha",
 */
export const JOB_EMPLOYER: Record<string, string> = {};

/**
 * The agency's own company record. Any job pointing at this is *not* telling
 * us who the employer is — it is the default every listing was created with.
 */
const AGENCY_COMPANY_IDS = new Set([1]);
const AGENCY_NAME_PATTERN = /innspire/i;

export function resolveEmployer(job: Job): EmployerProfile | null {
  const key = JOB_EMPLOYER[job.slug];
  if (key && EMPLOYERS[key]) return EMPLOYERS[key];

  const company = job.company;
  if (!company) return null;

  // Never present the recruiter as the employer.
  if (AGENCY_COMPANY_IDS.has(company.id) || AGENCY_NAME_PATTERN.test(company.name)) {
    return null;
  }

  // A real company record from a future backend. Contact fields are dropped
  // rather than passed through, so they cannot leak into the page.
  return {
    key: company.slug,
    name: company.name,
    about: company.description ?? "",
    website: company.website ?? undefined,
    logo: company.logo ?? undefined,
  };
}

/* -------------------------------------------------------------------------- */
/*  Inferring what is known about an unnamed employer                         */
/* -------------------------------------------------------------------------- */

export interface EmployerFacts {
  /** e.g. "Four-star hotel". Null when the text does not say. */
  propertyType: string | null;
  market: string | null;
  department: string | null;
  /** What the package includes: "Food", "Accommodation", … */
  provided: string[];
  /** True when at least one fact was found. */
  known: boolean;
}

const STAR_WORDS: Record<string, string> = {
  two: "Two-star",
  three: "Three-star",
  four: "Four-star",
  five: "Five-star",
  "2": "Two-star",
  "3": "Three-star",
  "4": "Four-star",
  "5": "Five-star",
};

// Ordered: the first match wins, so the more specific terms come first.
const PROPERTY_TYPES: [RegExp, string][] = [
  [/\bcruise\b/i, "cruise line"],
  [/\bcatering\s+(company|group|service)/i, "catering group"],
  [/\bresort\b/i, "resort"],
  [/\bfine[\s-]?dining\b/i, "fine-dining restaurant"],
  [/\brestaurant\b/i, "restaurant"],
  [/\bcaf(e|é)\b/i, "café"],
  [/\bbakery\b/i, "bakery"],
  [/\bcloud\s*kitchen\b/i, "cloud kitchen"],
  [/\bbanquet(ing)?\b/i, "banqueting operation"],
  [/\bhotel\b/i, "hotel"],
  [/\bhospitality\s+group\b/i, "hospitality group"],
];

const PROVIDED_TERMS: [RegExp, string][] = [
  [/\bfood\b|\bmeals?\b|\bduty\s*meals?\b/i, "Food"],
  [/\baccom+odation\b|\bhousing\b|\bstay\b/i, "Accommodation"],
  [/\btransport(ation)?\b/i, "Transport"],
  [/\bvisa\b/i, "Visa"],
  [/\bticket\b|\bflight\b|\bair\s*fare\b/i, "Flights"],
  [/\bmedical\s*(insurance)?\b|\binsurance\b/i, "Medical cover"],
];

/**
 * Reads the job text for what it says about the employer.
 *
 * Conservative by design: a wrong guess here is a false statement about
 * someone's future workplace, so anything unclear is simply left out rather
 * than approximated.
 */
export function inferEmployerFacts(job: Job): EmployerFacts {
  const haystack = [job.description, job.responsibilities, job.benefits]
    .filter(Boolean)
    .join("\n");

  // Property type, optionally prefixed with a star rating.
  let propertyType: string | null = null;
  for (const [pattern, label] of PROPERTY_TYPES) {
    if (pattern.test(haystack)) {
      propertyType = label;
      break;
    }
  }

  if (propertyType) {
    const stars = haystack.match(/\b(two|three|four|five|[2-5])[\s-]?star\b/i);
    const word = stars ? STAR_WORDS[stars[1].toLowerCase()] : null;
    propertyType = word ? `${word} ${propertyType}` : capitalise(propertyType);
  }

  const destination = resolveDestination(job);
  const market = destination?.name ?? null;

  const department =
    job.category?.name ??
    CATEGORIES.find((c) => c.id === job.category_id)?.name ??
    null;

  // "Provided" only counts when the text actually says it is included —
  // a responsibilities list mentioning food does not mean food is provided.
  const providedScope = [job.benefits, job.description].filter(Boolean).join("\n");
  const provided: string[] = [];
  for (const [pattern, label] of PROVIDED_TERMS) {
    const line = providedScope
      .split(/\n+/)
      .find((l) => pattern.test(l) && /provid|includ|free|cover|arrang/i.test(l));
    if (line) provided.push(label);
  }

  return {
    propertyType,
    market,
    department,
    provided,
    known: Boolean(propertyType || market || department || provided.length),
  };
}

function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
