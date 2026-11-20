import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Briefcase,
  Users,
  CalendarClock,
  GraduationCap,
  BadgeCheck,
  Building2,
  Globe2,
  Flame,
  Star,
  ArrowRight,
  ShieldCheck,
  Share2,
  Clock,
} from "lucide-react";
import { getJobBySlug, getAllJobSlugs, getRelatedJobs } from "@/lib/api";
import { JobCard } from "@/components/jobs/job-card";
import { Badge, Card, Divider } from "@/components/ui/primitives";
import { buttonClass } from "@/components/ui/button";
import { ApplyButton, SaveJobButton } from "@/components/jobs/job-actions";
import { EmployerProfile } from "@/components/jobs/employer-profile";
import { resolveEmployer } from "@/lib/employers";
import { SITE, EXPERIENCE_LEVELS } from "@/lib/constants";
import {
  formatLocation,
  formatSalary,
  timeAgo,
  isClosed,
  daysUntil,
  deadlineLabel,
  toLines,
  stripEmoji,
  isContactSolicitation,
  isBulletLine,
  stripBulletMarker,
  resolveDestination,
  excerpt,
  extractPackageFacts,
  stripPackageFacts,
} from "@/lib/format";
import type { Job } from "@/lib/types";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllJobSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: "Job not found" };

  const location = formatLocation(job);
  const salary = formatSalary(job);
  const title = `${job.title} — ${location}`;
  const description = job.description
    ? excerpt(job.description, 155)
    : `${job.title} vacancy in ${location}. ${salary.disclosed ? `${salary.label} per ${salary.period}.` : ""}Apply through Innspireo Careers.`;

  return {
    title,
    description,
    alternates: { canonical: `/jobs/${job.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${SITE.url}/jobs/${job.slug}`,
    },
    robots: isClosed(job.status) ? { index: false, follow: true } : undefined,
  };
}

/* -------------------------------------------------------------------------- */
/* Structured data */
/* -------------------------------------------------------------------------- */

const EMPLOYMENT_TYPE: Record<string, string> = {
  "Full-time": "FULL_TIME",
  "Part-time": "PART_TIME",
  Contract: "CONTRACTOR",
  Internship: "INTERN",
  Seasonal: "TEMPORARY",
};

function jobPostingJsonLd(job: Job) {
  const dest = resolveDestination(job);
  const salaryMin = Number(job.salary_min ?? 0);
  const salaryMax = Number(job.salary_max ?? 0);
  const salary = formatSalary(job);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description ?? job.title,
    datePosted: job.created_at,
    identifier: {
      "@type": "PropertyValue",
      name: SITE.legalName,
      value: String(job.id),
    },
    hiringOrganization: {
      "@type": "Organization",
      name: SITE.legalName,
      sameAs: SITE.parentUrl,
    },
    // Innspireo recruits on behalf of client employers, so we are the agent.
    employmentAgency: {
      "@type": "Organization",
      name: SITE.legalName,
      sameAs: SITE.url,
    },
    directApply: false,
    url: `${SITE.url}/jobs/${job.slug}`,
  };

  if (job.deadline) data.validThrough = job.deadline;
  if (job.vacancies && job.vacancies > 0) data.totalJobOpenings = job.vacancies;

  if (job.job_type?.name && EMPLOYMENT_TYPE[job.job_type.name]) {
    data.employmentType = EMPLOYMENT_TYPE[job.job_type.name];
  }

  if (dest) {
    data.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: dest.code,
        addressLocality:
          job.location && job.location.toLowerCase() !== dest.name.toLowerCase()
            ? job.location
            : dest.name,
      },
    };
  }

  if (salary.disclosed && job.currency && salaryMin > 0) {
    data.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.currency.toUpperCase(),
      value: {
        "@type": "QuantitativeValue",
        minValue: salaryMin,
        ...(salaryMax > salaryMin ? { maxValue: salaryMax } : {}),
        unitText: salary.period === "year" ? "YEAR" : "MONTH",
      },
    };
  }

  if (job.experience_level?.name) {
    data.experienceRequirements = {
      "@type": "OccupationalExperienceRequirements",
      description: job.experience_level.name,
    };
  }

  if (job.education_level_id) {
    data.educationRequirements = {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "high school",
    };
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/* Page */
/* -------------------------------------------------------------------------- */

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();

  const related = await getRelatedJobs(job, 3);
  const location = formatLocation(job);
  const salary = formatSalary(job);
  const dest = resolveDestination(job);
  const closed = isClosed(job.status);
  const closing = daysUntil(job.deadline);

  // Recruiters embed the package as "Label: Value" lines inside the free-text
  // description. Lift them into a grid and keep them out of the prose below.
  const packageFacts = extractPackageFacts(job.description);
  // Listings end with "share your CV at <address>" plus a phone number, which
  // competes with the Apply button on this very page and routes the candidate
  // somewhere nothing is tracked. Dropped here; see isContactSolicitation.
  const dropContacts = (lines: string[]) => lines.filter((l) => !isContactSolicitation(l));

  const descriptionLines = dropContacts(stripPackageFacts(job.description));
  const responsibilityLines = dropContacts(toLines(job.responsibilities));
  const benefitLines = dropContacts(toLines(job.benefits));

  // Null until a client agrees to be named — see src/lib/employers.ts.
  const employer = resolveEmployer(job);

  const experienceName =
    job.experience_level?.name ??
    EXPERIENCE_LEVELS.find((e) => e.id === job.experience_level_id)?.name ??
    null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd(job)) }}
      />

      {/* Header band */}
      <section className="border-b border-line bg-surface-muted">
        <div className="container-page py-8 sm:py-12">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-content-subtle">
              <li>
                <Link href="/" className="hover:text-content">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/jobs" className="hover:text-content">
                  Jobs
                </Link>
              </li>
              {dest ? (
                <>
                  <li aria-hidden>/</li>
                  <li>
                    <Link href={`/jobs?country=${dest.slug}`} className="hover:text-content">
                      {dest.name}
                    </Link>
                  </li>
                </>
              ) : null}
              <li aria-hidden>/</li>
              <li className="font-medium text-content">{job.title}</li>
            </ol>
          </nav>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {closed ? (
                  <Badge tone="outline">Applications closed</Badge>
                ) : (
                  <>
                    {job.is_featured ? (
                      <Badge tone="brand">
                        <Star className="fill-current" />
                        Featured
                      </Badge>
                    ) : null}
                    {job.is_urgent ? (
                      <Badge tone="urgent">
                        <Flame />
                        Urgent hiring
                      </Badge>
                    ) : null}
                  </>
                )}
                {job.category ? <Badge tone="brand">{job.category.name}</Badge> : null}
              </div>

              <h1 className="mt-4 text-3xl text-content sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                {job.title}
              </h1>

              <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-sm text-content-muted">
                <li className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-brand-600" />
                  {location}
                </li>
                {job.job_type ? (
                  <li className="inline-flex items-center gap-1.5">
                    <Briefcase className="size-4 text-brand-600" />
                    {job.job_type.name}
                  </li>
                ) : null}
                {job.vacancies && job.vacancies > 0 ? (
                  <li className="inline-flex items-center gap-1.5">
                    <Users className="size-4 text-brand-600" />
                    {job.vacancies} {job.vacancies === 1 ? "opening" : "openings"}
                  </li>
                ) : null}
                <li className="inline-flex items-center gap-1.5">
                  <Clock className="size-4 text-brand-600" />
                  Posted {timeAgo(job.created_at)}
                </li>
              </ul>

              {/* At-a-glance strip. The apply card on the right is tall, so
                  without this the left column bottoms out and the band reads
                  as empty space. These four fields are present on every job. */}
              <dl className="mt-8 grid grid-cols-2 border border-line bg-surface sm:grid-cols-4">
                <HeaderFact
                  icon={<CalendarClock />}
                  label="Apply before"
                  value={deadlineLabel(job.deadline)}
                />
                <HeaderFact
                  icon={<BadgeCheck />}
                  label="Experience"
                  value={experienceName ?? "Not specified"}
                />
                <HeaderFact
                  icon={<Globe2 />}
                  label="Work mode"
                  value={
                    job.work_mode === "on-site"
                      ? "On-site"
                      : job.work_mode === "hybrid"
                        ? "Hybrid"
                        : job.work_mode === "remote"
                          ? "Remote"
                          : "Not specified"
                  }
                />
                <HeaderFact
                  icon={<GraduationCap />}
                  label="Education"
                  value={job.education_level_id ? "High school or above" : "Not specified"}
                />
              </dl>
            </div>

            {/* Apply card */}
            <Card className="w-full shrink-0 p-5 lg:w-80">
              <p className="font-display text-2xl font-bold text-content">
                {salary.label}
                {salary.disclosed ? (
                  <span className="ml-1 text-sm font-medium text-content-subtle">
                    / {salary.period}
                  </span>
                ) : null}
              </p>
              {salary.disclosed ? (
                <p className="mt-1 text-xs text-content-subtle">
                  Quoted in {job.currency?.toUpperCase()}. Package details confirmed at offer
                  stage.
                </p>
              ) : null}

              <Divider className="my-4" />

              {closed ? (
                <>
                  <p className="text-sm text-content-muted">
                    This vacancy has closed. Similar roles open regularly — create a profile
                    and we will match you.
                  </p>
                  <Link
                    href="/register"
                    className={buttonClass("primary", "lg", "mt-4 w-full")}
                  >
                    Create your profile
                    <ArrowRight />
                  </Link>
                </>
              ) : (
                <>
                  <ApplyButton slug={job.slug} title={job.title} />
                  <SaveJobButton slug={job.slug} className="mt-2 w-full" />
                  {closing !== null && closing >= 0 && closing <= 21 ? (
                    <p className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-none bg-brand-50 px-3 py-2 text-xs font-medium text-brand-600">
                      <CalendarClock className="size-3.5" />
                      {closing === 0
                        ? "Closes today"
                        : `Closes in ${closing} ${closing === 1 ? "day" : "days"}`}
                    </p>
                  ) : null}
                </>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="container-page py-10 sm:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_20rem] lg:gap-12">
          <article className="min-w-0">
            {/* Package grid, lifted out of the description's "Label: Value"
                lines. Renders only when the recruiter wrote them that way. */}
            {packageFacts.length > 0 ? (
              <section className="mb-12">
                <h2 className="text-2xl text-content">Package at a glance</h2>
                <dl className="mt-5 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2">
                  {packageFacts.map((fact) => (
                    <div key={`${fact.label}-${fact.value}`} className="bg-surface px-5 py-4">
                      <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-content-subtle">
                        {fact.label}
                      </dt>
                      <dd className="mt-1.5 text-base font-semibold text-content">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-xs text-content-subtle">
                  As stated by the employer. Final terms are confirmed in your written
                  offer.
                </p>
              </section>
            ) : null}

            {descriptionLines.length > 0 ? (
              <section>
                <h2 className="text-2xl text-content">About this role</h2>
                <JobProse lines={descriptionLines} className="mt-4" />
              </section>
            ) : null}

            {responsibilityLines.length > 0 ? (
              <section className="mt-10">
                <h2 className="text-2xl text-content">Responsibilities</h2>
                <JobProse lines={responsibilityLines} className="mt-4" />
              </section>
            ) : null}

            {benefitLines.length > 0 ? (
              <section className="mt-10">
                <h2 className="text-2xl text-content">What is offered</h2>
                <JobProse lines={benefitLines} className="mt-4" />
              </section>
            ) : null}

            {/* Who you would be working for. Shows a full profile once the
                client agrees to be named; until then, what the job text
                actually says about them. Never contact details either way. */}
            <div className="mt-10">
              <EmployerProfile job={job} />
            </div>

            {/* How applying works — replaces the current site's silent dead end */}
            <section className="mt-12">
              <Card className="overflow-hidden">
                <div className="bg-surface-muted px-6 py-5">
                  <h2 className="inline-flex items-center gap-2 text-lg text-content">
                    <ShieldCheck className="size-5 text-brand-600" />
                    How applying works
                  </h2>
                </div>
                <ol className="divide-y divide-line">
                  {[
                    {
                      t: "You apply through this page",
                      d: "Create a profile once. Your CV and documents stay on file for every future vacancy.",
                    },
                    {
                      t: "Our team screens your application",
                      d: "We assess your experience against the client brief and come back to you either way.",
                    },
                    {
                      t: "The employer is introduced",
                      d: "If shortlisted, we disclose the hiring employer and arrange the interview or trade test.",
                    },
                    {
                      t: "Offer, visa and travel",
                      d: "We handle documentation and mobilisation through to your start date.",
                    },
                  ].map((step, i) => (
                    <li key={step.t} className="flex gap-4 px-6 py-4">
                      <span className="grid size-7 shrink-0 place-items-center rounded-none bg-brand-900 text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-content">{step.t}</p>
                        <p className="mt-1 text-sm leading-relaxed text-content-muted">
                          {step.d}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="border-t border-line bg-surface-muted px-6 py-4">
                  <p className="text-xs leading-relaxed text-content-subtle">
                    Innspireo never charges candidates a placement fee. If anyone asks you
                    for payment in our name, please{""}
                    <Link
                      href="/contact"
                      className="font-semibold text-brand-600 underline underline-offset-2"
                    >
                      report it to us
                    </Link>
                    .
                  </p>
                </div>
              </Card>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="space-y-5">
            <Card className="p-5">
              <h2 className="text-base text-content">Role overview</h2>
              <dl className="mt-4 space-y-3.5">
                <OverviewRow
                  icon={<MapPin />}
                  label="Location"
                  value={location}
                />
                {job.job_type ? (
                  <OverviewRow
                    icon={<Briefcase />}
                    label="Job type"
                    value={job.job_type.name}
                  />
                ) : null}
                {experienceName ? (
                  <OverviewRow
                    icon={<BadgeCheck />}
                    label="Experience"
                    value={experienceName}
                  />
                ) : null}
                {job.education_level_id ? (
                  <OverviewRow
                    icon={<GraduationCap />}
                    label="Education"
                    value="High school or above"
                  />
                ) : null}
                {job.vacancies && job.vacancies > 0 ? (
                  <OverviewRow
                    icon={<Users />}
                    label="Vacancies"
                    value={`${job.vacancies} ${job.vacancies === 1 ? "opening" : "openings"}`}
                  />
                ) : null}
                {job.work_mode ? (
                  <OverviewRow
                    icon={<Globe2 />}
                    label="Work mode"
                    value={
                      job.work_mode === "on-site"
                        ? "On-site"
                        : job.work_mode === "hybrid"
                          ? "Hybrid"
                          : "Remote"
                    }
                  />
                ) : null}
                <OverviewRow
                  icon={<CalendarClock />}
                  label="Apply before"
                  value={deadlineLabel(job.deadline)}
                />
              </dl>
            </Card>

            {/* Who is hiring. Names the employer when the client has agreed
                to be named, and otherwise explains the anonymity honestly. */}
            <Card className="p-5">
              <h2 className="inline-flex items-center gap-2 text-base text-content">
                <Building2 className="size-4 text-brand-600" />
                Who is hiring
              </h2>

              {employer ? (
                <>
                  <p className="mt-3 text-sm font-medium text-content">{employer.name}</p>
                  {employer.tagline ? (
                    <p className="mt-0.5 text-sm text-content-muted">{employer.tagline}</p>
                  ) : null}
                  <p className="mt-3 text-sm leading-relaxed text-content-muted">
                    Recruited and mobilised by{" "}
                    <span className="font-medium text-content">{SITE.legalName}</span>.
                    Apply here — please do not contact the employer directly.
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-content-muted">
                  This role is managed by{" "}
                  <span className="font-medium text-content">{SITE.legalName}</span> on behalf
                  of a client employer. The employer&apos;s name and the full package are
                  shared with you during shortlisting.
                </p>
              )}

              <Divider className="my-4" />
              <a
                href="#employer-heading"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
              >
                About the employer
                <ArrowRight className="size-3.5" />
              </a>
            </Card>

            {dest ? (
              <Card className="p-5">
                <h2 className="text-base text-content">Working in {dest.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-content-muted">
                  {dest.blurb}
                </p>
                <Link
                  href={`/jobs?country=${dest.slug}`}
                  className={buttonClass("outline", "sm", "mt-4 w-full")}
                >
                  All {dest.name} jobs
                  <ArrowRight />
                </Link>
              </Card>
            ) : null}

            <Card className="p-5">
              <h2 className="inline-flex items-center gap-2 text-base text-content">
                <Share2 className="size-4 text-brand-600" />
                Share this role
              </h2>
              <ShareLinks job={job} />
            </Card>
          </aside>
        </div>

        {/* Related */}
        {related.length > 0 ? (
          <section className="mt-16 border-t border-line pt-12">
            <h2 className="text-2xl text-content">Similar opportunities</h2>
            <p className="mt-2 text-sm text-content-muted">
              Roles in the same department or destination.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <JobCard key={r.id} job={r} compact />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Pieces */
/* -------------------------------------------------------------------------- */

/** One cell of the at-a-glance strip under the job title. */
function HeaderFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-r border-line px-4 py-3.5 last:border-r-0 sm:border-b-0 [&:nth-child(2)]:border-r-0 sm:[&:nth-child(2)]:border-r">
      <dt className="flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-content-subtle">
        <span className="text-brand-600 [&_svg]:size-3.5">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1.5 text-sm font-semibold text-content">{value}</dd>
    </div>
  );
}

function OverviewRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-content-subtle [&_svg]:size-4">{icon}</span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-content-subtle">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium text-content">{value}</dd>
      </div>
    </div>
  );
}

/**
 * Job copy arrives as plain text whose lines may start with an emoji or a dash.
 * Consecutive bullet-looking lines are grouped into a real list; everything
 * else renders as a paragraph.
 */
function JobProse({ lines, className }: { lines: string[]; className?: string }) {
  const blocks: { type: "p" | "ul"; items: string[] }[] = [];

  for (const line of lines) {
    const bullet = isBulletLine(line);
    const last = blocks[blocks.length - 1];
    if (bullet) {
      if (last?.type === "ul") last.items.push(line);
      else blocks.push({ type: "ul", items: [line] });
    } else {
      blocks.push({ type: "p", items: [line] });
    }
  }

  return (
    <div className={className}>
      {blocks.map((block, i) =>
        block.type === "ul" ? (
          <ul key={i} className="my-4 space-y-2.5">
            {block.items.map((item, j) => (
              <li key={j} className="flex gap-3 text-sm leading-relaxed text-content-muted">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-none bg-brand-900" />
                <span>{stripBulletMarker(item)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i} className="my-3 text-sm leading-relaxed text-content-muted sm:text-base">
            {stripEmoji(block.items[0])}
          </p>
        ),
      )}
    </div>
  );
}

function ShareLinks({ job }: { job: Job }) {
  const url = `${SITE.url}/jobs/${job.slug}`;
  const text = `${job.title} — ${formatLocation(job)}`;

  const targets = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`,
    },
  ];

  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {targets.map((t) => (
        <li key={t.label}>
          <a
            href={t.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-none border border-line-strong px-3 py-1.5 text-xs font-medium text-content-muted transition-colors hover:border-brand-700 hover:text-brand-600"
          >
            {t.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
