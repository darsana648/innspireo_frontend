import Link from "next/link";
import {
  MapPin,
  Briefcase,
  Users,
  Clock,
  Flame,
  Star,
  ArrowUpRight,
  BadgeCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import {
  formatLocation,
  formatSalary,
  timeAgo,
  isClosed,
  daysUntil,
  excerpt,
  resolveDestination,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Job } from "@/lib/types";

export function JobCard({
  job,
  className,
  compact = false,
}: {
  job: Job;
  className?: string;
  compact?: boolean;
}) {
  const salary = formatSalary(job);
  const location = formatLocation(job);
  const dest = resolveDestination(job);
  const closed = isClosed(job.status);
  const closing = daysUntil(job.deadline);
  const closingSoon = closing !== null && closing >= 0 && closing <= 14;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-none border border-line bg-surface p-6 shadow-soft",
        "transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift",
        "",
        className,
      )}
    >
      {/* Header: category + flags */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {job.category ? (
            <p className="truncate font-mono text-[0.625rem] uppercase tracking-[0.16em] text-content-subtle">
              {job.category.name}
            </p>
          ) : null}
          <h3 className="mt-2.5 text-lg leading-snug text-content">
            <Link
              href={`/jobs/${job.slug}`}
              className="transition-colors group-hover:text-brand-600"
            >
              <span className="absolute inset-0 z-10" aria-hidden />
              {job.title}
            </Link>
          </h3>
        </div>

        {closed ? (
          <Badge tone="outline">Closed</Badge>
        ) : job.is_featured ? (
          <Badge tone="brand">
            <Star className="fill-current" />
            Featured
          </Badge>
        ) : job.is_urgent ? (
          <Badge tone="urgent">
            <Flame />
            Urgent
          </Badge>
        ) : null}
      </div>

      {/* Meta */}
      <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-content-muted">
        <li className="inline-flex items-center gap-1.5">
          <MapPin className="size-4 shrink-0 text-brand-600" />
          {location}
        </li>
        {job.job_type ? (
          <li className="inline-flex items-center gap-1.5">
            <Briefcase className="size-4 shrink-0 text-content-subtle" />
            {job.job_type.name}
          </li>
        ) : null}
        {job.vacancies && job.vacancies > 0 ? (
          <li className="inline-flex items-center gap-1.5">
            <Users className="size-4 shrink-0 text-content-subtle" />
            {job.vacancies} {job.vacancies === 1 ? "opening" : "openings"}
          </li>
        ) : null}
      </ul>

      {/* Teaser */}
      {!compact && job.description ? (
        <p className="mt-4 text-sm leading-relaxed text-content-muted line-clamp-fade">
          {excerpt(job.description, 140)}
        </p>
      ) : null}

      {/* Footer */}
      <div className="mt-auto pt-6">
        <div className="flex items-end justify-between gap-3 border-t border-line pt-5">
          <div className="min-w-0">
            <p className="font-display text-xl font-bold tracking-tight text-content">
              {salary.label}
              {salary.disclosed ? (
                <span className="ml-1 text-xs font-medium text-content-subtle">
                  /{salary.period}
                </span>
              ) : null}
            </p>
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-content-subtle">
              {job.experience_level ? (
                <>
                  <BadgeCheck className="size-3.5" />
                  {job.experience_level.name}
                </>
              ) : (
                <>
                  <Clock className="size-3.5" />
                  Posted {timeAgo(job.created_at)}
                </>
              )}
            </p>
          </div>

          <span
            aria-hidden
            className="grid size-10 shrink-0 place-items-center rounded-none bg-brand-50 text-brand-600 transition-colors duration-300 group-hover:bg-brand-900 group-hover:text-white"
          >
            <ArrowUpRight className="size-4.5" />
          </span>
        </div>

        {!closed && closingSoon ? (
          <p className="mt-3.5 inline-flex items-center gap-1.5 rounded-none bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
            <Clock className="size-3.5" />
            {closing === 0
              ? "Closes today"
              : `Closes in ${closing} ${closing === 1 ? "day" : "days"}`}
          </p>
        ) : null}

        {dest ? (
          <p className="mt-3.5 text-xs text-content-subtle">
            Placement in {dest.name} &middot; Employer shared at shortlisting
          </p>
        ) : null}
      </div>
    </article>
  );
}

/** Skeleton used by Suspense boundaries on the listing page. */
export function JobCardSkeleton() {
  return (
    <div className="rounded-none border border-line bg-surface p-6">
      <div className="h-2.5 w-24 animate-pulse rounded-none bg-ink-200" />
      <div className="mt-3.5 h-5 w-3/4 animate-pulse rounded-none bg-ink-200" />
      <div className="mt-4 flex gap-4">
        <div className="h-3.5 w-20 animate-pulse rounded-none bg-ink-100" />
        <div className="h-3.5 w-24 animate-pulse rounded-none bg-ink-100" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full animate-pulse rounded-none bg-ink-100" />
        <div className="h-3 w-5/6 animate-pulse rounded-none bg-ink-100" />
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
        <div className="h-6 w-28 animate-pulse rounded-none bg-ink-200" />
        <div className="size-10 animate-pulse rounded-none bg-ink-100" />
      </div>
    </div>
  );
}
