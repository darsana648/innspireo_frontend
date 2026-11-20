import { SITE, DESTINATIONS } from "./constants";
import { resolveDestination, inferSalaryPeriod } from "./format";
import type { Job, JobQuery, Paginated, SortOption } from "./types";

/**
 * Data access for the live Laravel backend.
 *
 * WHY WE FETCH EVERYTHING AND FILTER LOCALLY
 * ------------------------------------------
 * Probing production showed `/api/jobs` honours exactly one query parameter:
 * `keyword`. `category`, `job_type`, `experience`, `work_mode`, `country`,
 * `sort` and `per_page` are all accepted but ignored (`total` stays at 26).
 * `per_page` is hard-pinned to 15.
 *
 * With a catalogue this size the correct trade-off is to pull the full set
 * once, cache it, and do filtering / sorting / facet counting in memory on the
 * server. That gives us exact facet counts and multi-field filtering that the
 * API cannot currently express, with one upstream request per revalidation
 * window instead of one per interaction.
 *
 * MIGRATION PATH: when the backend grows real query support, replace
 * `getJobs()`'s in-memory pipeline with a single parameterised fetch. Nothing
 * outside this module needs to change.
 */

const REVALIDATE_SECONDS = 300;

export interface JobsResult {
  jobs: Job[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  /** True when the upstream API could not be reached. */
  degraded: boolean;
}

async function fetchPage(page: number): Promise<Paginated<Job> | null> {
  const url = `${SITE.apiBase}/api/jobs?page=${page}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS, tags: ["jobs"] },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Paginated<Job>;
    if (!json || !Array.isArray(json.data)) return null;
    return json;
  } catch {
    return null;
  }
}

/**
 * Walks every page of the paginator and returns the full catalogue.
 * Returns an empty array (never throws) when the backend is unreachable so
 * pages can render a real error state instead of a 500.
 */
export async function fetchAllJobs(): Promise<{ jobs: Job[]; degraded: boolean }> {
  const first = await fetchPage(1);
  if (!first) return { jobs: [], degraded: true };

  const jobs = [...first.data];
  const lastPage = Math.min(first.last_page ?? 1, 50); // hard cap: defensive

  if (lastPage > 1) {
    const rest = await Promise.all(
      Array.from({ length: lastPage - 1 }, (_, i) => fetchPage(i + 2)),
    );
    for (const page of rest) {
      if (page) jobs.push(...page.data);
    }
  }

  // Deduplicate by id in case pagination shifts between requests.
  const seen = new Set<number>();
  const unique = jobs.filter((j) => {
    if (seen.has(j.id)) return false;
    seen.add(j.id);
    return true;
  });

  return { jobs: unique, degraded: false };
}

/** Only listings a candidate should see. */
function isLive(job: Job): boolean {
  return job.status === "active";
}

/* -------------------------------------------------------------------------- */
/*  Filtering + sorting                                                       */
/* -------------------------------------------------------------------------- */

function matchesKeyword(job: Job, keyword: string): boolean {
  const q = keyword.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    job.title,
    job.description,
    job.category?.name,
    job.location,
    job.country?.name,
    job.job_type?.name,
    job.experience_level?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  // Every term must appear somewhere: narrows "sous chef" correctly.
  return q.split(/\s+/).every((term) => haystack.includes(term));
}

function matchesLocation(job: Job, location: string): boolean {
  const q = location.trim().toLowerCase();
  if (!q) return true;
  const dest = resolveDestination(job);
  const haystack = [job.location, job.country?.name, job.state?.name, dest?.name, dest?.slug]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

/** Normalises a salary to a monthly figure so cross-currency compare is sane-ish. */
function monthlyBasis(job: Job): number {
  const min = Number(job.salary_min ?? 0);
  if (!Number.isFinite(min) || min <= 0) return 0;
  const period = inferSalaryPeriod(job.currency, min);
  return period === "year" ? min / 12 : min;
}

function sortJobs(jobs: Job[], sort: SortOption): Job[] {
  const out = [...jobs];
  switch (sort) {
    case "oldest":
      return out.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
    case "highest_salary":
      return out.sort((a, b) => monthlyBasis(b) - monthlyBasis(a));
    case "featured":
      return out.sort((a, b) => {
        const score = (j: Job) => (j.is_featured ? 2 : 0) + (j.is_urgent ? 1 : 0);
        const diff = score(b) - score(a);
        return diff !== 0 ? diff : +new Date(b.created_at) - +new Date(a.created_at);
      });
    case "newest":
    default:
      return out.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  }
}

export function applyFilters(all: Job[], query: JobQuery): Job[] {
  return all.filter((job) => {
    if (!isLive(job)) return false;
    if (query.keyword && !matchesKeyword(job, query.keyword)) return false;
    if (query.location && !matchesLocation(job, query.location)) return false;
    if (query.category && String(job.category_id) !== query.category) return false;
    if (query.job_type && String(job.job_type_id) !== query.job_type) return false;
    if (query.experience && String(job.experience_level_id) !== query.experience) return false;
    if (query.work_mode && job.work_mode !== query.work_mode) return false;
    if (query.country) {
      const dest = resolveDestination(job);
      if (!dest || dest.slug !== query.country) return false;
    }
    if (query.salary_min) {
      const floor = Number(query.salary_min);
      if (Number.isFinite(floor) && floor > 0) {
        const min = Number(job.salary_min ?? 0);
        if (!Number.isFinite(min) || min < floor) return false;
      }
    }
    return true;
  });
}

const PER_PAGE = 12;

export async function getJobs(query: JobQuery = {}): Promise<JobsResult> {
  const { jobs: all, degraded } = await fetchAllJobs();
  const filtered = applyFilters(all, query);
  const sorted = sortJobs(filtered, query.sort ?? "newest");

  const page = Math.max(1, Number(query.page) || 1);
  const lastPage = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const safePage = Math.min(page, lastPage);
  const start = (safePage - 1) * PER_PAGE;

  return {
    jobs: sorted.slice(start, start + PER_PAGE),
    total: sorted.length,
    page: safePage,
    perPage: PER_PAGE,
    lastPage,
    degraded,
  };
}

/* -------------------------------------------------------------------------- */
/*  Single job                                                                */
/* -------------------------------------------------------------------------- */

export async function getJobBySlug(slug: string): Promise<Job | null> {
  const { jobs } = await fetchAllJobs();
  return jobs.find((j) => j.slug === slug) ?? null;
}

export async function getAllJobSlugs(): Promise<string[]> {
  const { jobs } = await fetchAllJobs();
  return jobs.filter(isLive).map((j) => j.slug);
}

/** Same category first, then anything else in the same destination. */
export async function getRelatedJobs(job: Job, limit = 3): Promise<Job[]> {
  const { jobs } = await fetchAllJobs();
  const dest = resolveDestination(job);

  const pool = jobs.filter((j) => isLive(j) && j.id !== job.id);
  const scored = pool
    .map((j) => {
      let score = 0;
      if (j.category_id === job.category_id) score += 3;
      if (dest && resolveDestination(j)?.slug === dest.slug) score += 2;
      if (j.experience_level_id === job.experience_level_id) score += 1;
      return { job: j, score };
    })
    .filter((s) => s.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        +new Date(b.job.created_at) - +new Date(a.job.created_at),
    );

  return scored.slice(0, limit).map((s) => s.job);
}

/* -------------------------------------------------------------------------- */
/*  Facets + homepage data                                                    */
/* -------------------------------------------------------------------------- */

export interface Facets {
  byCategory: Record<number, number>;
  byDestination: Record<string, number>;
  byJobType: Record<number, number>;
  byExperience: Record<number, number>;
  byWorkMode: Record<string, number>;
  total: number;
  urgent: number;
  featured: number;
}

export async function getFacets(): Promise<Facets> {
  const { jobs } = await fetchAllJobs();
  const live = jobs.filter(isLive);

  const facets: Facets = {
    byCategory: {},
    byDestination: {},
    byJobType: {},
    byExperience: {},
    byWorkMode: {},
    total: live.length,
    urgent: 0,
    featured: 0,
  };

  for (const dest of DESTINATIONS) facets.byDestination[dest.slug] = 0;

  for (const job of live) {
    if (job.category_id) {
      facets.byCategory[job.category_id] = (facets.byCategory[job.category_id] ?? 0) + 1;
    }
    if (job.job_type_id) {
      facets.byJobType[job.job_type_id] = (facets.byJobType[job.job_type_id] ?? 0) + 1;
    }
    if (job.experience_level_id) {
      facets.byExperience[job.experience_level_id] =
        (facets.byExperience[job.experience_level_id] ?? 0) + 1;
    }
    if (job.work_mode) {
      facets.byWorkMode[job.work_mode] = (facets.byWorkMode[job.work_mode] ?? 0) + 1;
    }
    const dest = resolveDestination(job);
    if (dest) facets.byDestination[dest.slug] = (facets.byDestination[dest.slug] ?? 0) + 1;
    if (job.is_urgent) facets.urgent += 1;
    if (job.is_featured) facets.featured += 1;
  }

  return facets;
}

export interface HomeData {
  featured: Job[];
  urgent: Job[];
  recent: Job[];
  facets: Facets;
  degraded: boolean;
}

export async function getHomeData(): Promise<HomeData> {
  const [{ jobs, degraded }, facets] = await Promise.all([fetchAllJobs(), getFacets()]);
  const live = jobs.filter(isLive);
  const byNewest = sortJobs(live, "newest");

  // Only 2 of 26 listings carry is_featured, so fall back to the newest so the
  // section never renders near-empty.
  const flagged = live.filter((j) => j.is_featured);
  const featured =
    flagged.length >= 3 ? sortJobs(flagged, "newest").slice(0, 6) : byNewest.slice(0, 6);

  return {
    featured,
    urgent: live.filter((j) => j.is_urgent).slice(0, 6),
    recent: byNewest.slice(0, 6),
    facets,
    degraded,
  };
}

export async function getJobsByDestination(slug: string): Promise<Job[]> {
  const { jobs } = await fetchAllJobs();
  return sortJobs(
    jobs.filter((j) => isLive(j) && resolveDestination(j)?.slug === slug),
    "newest",
  );
}
