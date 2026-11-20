import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SearchX, Briefcase } from "lucide-react";
import { getJobs, getFacets } from "@/lib/api";
import { JobCard } from "@/components/jobs/job-card";
import { JobFilters, JobSort, ActiveFilterChips } from "@/components/jobs/job-filters";
import { Pagination } from "@/components/jobs/pagination";
import { EmptyState, Badge } from "@/components/ui/primitives";
import { buttonClass } from "@/components/ui/button";
import { DegradedBanner } from "@/components/home/sections";
import { CATEGORIES, DESTINATIONS } from "@/lib/constants";
import type { JobQuery, SortOption } from "@/lib/types";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Browse Hospitality Jobs",
  description:
    "Search live hotel, kitchen, F&B, front office and housekeeping vacancies across the Gulf and Europe. Filter by destination, department, experience level and salary.",
  alternates: { canonical: "/jobs" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function single(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

export default async function JobsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const query: JobQuery = {
    keyword: single(sp.keyword),
    location: single(sp.location),
    category: single(sp.category),
    job_type: single(sp.job_type),
    experience: single(sp.experience),
    work_mode: single(sp.work_mode),
    salary_min: single(sp.salary_min),
    country: single(sp.country),
    sort: (single(sp.sort) as SortOption) ?? "newest",
    page: single(sp.page),
  };

  const [result, facets] = await Promise.all([getJobs(query), getFacets()]);
  const { jobs, total, page, lastPage, degraded } = result;

  // A human description of the current result set, used in the heading.
  const dest = DESTINATIONS.find((d) => d.slug === query.country);
  const cat = CATEGORIES.find((c) => String(c.id) === query.category);
  const contextParts = [cat?.name, dest ? `in ${dest.name}` : null].filter(Boolean);
  const heading = contextParts.length
    ? `${contextParts.join("")} jobs`
    : "Explore opportunities";

  const paginationParams: Record<string, string | undefined> = {
    keyword: query.keyword,
    location: query.location,
    category: query.category,
    job_type: query.job_type,
    experience: query.experience,
    work_mode: query.work_mode,
    salary_min: query.salary_min,
    country: query.country,
    sort: query.sort === "newest" ? undefined : query.sort,
  };

  return (
    <>
      {degraded ? <DegradedBanner /> : null}

      {/* Page header */}
      <section className="border-b border-line bg-surface-muted">
        <div className="container-page py-10 sm:py-14">
          <Badge tone="brand">
            <Briefcase />
            {facets.total} live {facets.total === 1 ? "vacancy" : "vacancies"}
          </Badge>
          <h1 className="mt-4 text-3xl text-content sm:text-4xl">{heading}</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-content-muted">
            Every role here is a confirmed client vacancy. Filter by destination and
            department, then apply once — your profile stays on file for future openings.
          </p>
        </div>
      </section>

      <div className="container-page py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[18rem_1fr] lg:gap-10">
          <Suspense fallback={<FiltersFallback />}>
            <JobFilters facets={facets} />
          </Suspense>

          <div className="min-w-0">
            {/* Results header */}
            <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-content">
                  {total} {total === 1 ? "job" : "jobs"} found
                </p>
                {lastPage > 1 ? (
                  <p className="mt-0.5 text-xs text-content-subtle">
                    Page {page} of {lastPage}
                  </p>
                ) : null}
              </div>
              <Suspense fallback={<div className="h-10 w-40" />}>
                <JobSort />
              </Suspense>
            </div>

            <Suspense fallback={null}>
              <div className="pt-5">
                <ActiveFilterChips />
              </div>
            </Suspense>

            {/* Results */}
            {jobs.length === 0 ? (
              <EmptyState
                className="mt-8" icon={<SearchX />}
                title="No roles match these filters"
                description={
                  degraded
                    ? "We could not reach the vacancy list. Please refresh or contact our team for current openings."
                    : "Try widening your search — remove a filter, or browse by destination instead. New vacancies are added as clients confirm them."
                }
                action={
                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <Link href="/jobs" className={buttonClass("primary", "md")}>
                      Clear all filters
                    </Link>
                    <Link href="/register" className={buttonClass("outline", "md")}>
                      Get notified of new roles
                    </Link>
                  </div>
                }
              />
            ) : (
              <>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {jobs.map((job, i) => (
                    // Stagger capped at 6 so page 3 of the results does not
                    // take two seconds to finish appearing.
                    <Reveal key={job.id} delay={Math.min(i, 5) * 60}>
                      <JobCard job={job} />
                    </Reveal>
                  ))}
                </div>

                <Pagination
                  page={page}
                  lastPage={lastPage}
                  basePath="/jobs"
                  params={paginationParams}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function FiltersFallback() {
  return (
    <div className="hidden lg:block">
      <div className="sticky top-24 space-y-4 rounded-none border border-line bg-surface-raised p-5">
        <div className="h-5 w-20 animate-pulse rounded-none bg-ink-200" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-24 animate-pulse rounded-none bg-ink-100" />
            <div className="h-11 w-full animate-pulse rounded-none bg-ink-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
